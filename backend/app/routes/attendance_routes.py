from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from datetime import datetime, date
from typing import List, Optional
import logging
import json
import os

from app.database import get_db
from app.models.user_model import User
from app.models.face_model import FaceProfile
from app.models.attendance_model import Attendance, AttendanceLog
from app.models.location_model import Location
from app.schemas.attendance_schema import (
    AttendanceResponse, CheckInResponse, CheckOutResponse
)
from app.services.face_service import (
    extract_embedding, compare_embeddings, save_face_image
)
from app.services.attendance_service import (
    validate_location,
    determine_status,
    determine_checkout_status,
    get_user_schedule
)
from app.services.dashboard_service import get_daily_attendance_stats
from app.services.resend_email_service import get_resend_config, send_daily_summary_email
from app.models.department_model import Department
from app.utils.dependencies import get_current_user, require_admin


router = APIRouter(prefix="/attendance", tags=["Attendance"])
logger = logging.getLogger(__name__)

ATTENDANCE_FOLDER = "uploads/attendances"
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]
MIN_CONFIDENCE = 75.0  # minimum confidence score untuk diterima


@router.post("/send-daily-summary")
def send_daily_summary(
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    stats = get_daily_attendance_stats(db)
    email_provider = os.getenv("EMAIL_PROVIDER", "resend").lower()
    resend_config = get_resend_config()

    if email_provider != "resend":
        logger.warning(
            "Daily summary email provider is '%s', but this endpoint now uses Resend.",
            email_provider,
        )

    if not resend_config.get("api_key"):
        raise HTTPException(status_code=400, detail="RESEND_API_KEY belum dikonfigurasi.")
    if not resend_config.get("admin_email"):
        raise HTTPException(status_code=400, detail="ADMIN_EMAIL belum dikonfigurasi.")

    logger.info(
        "Daily summary queued via Resend by user_id=%s role=%s admin_email=%s resend_from=%s resend_key_configured=%s",
        current_user.id,
        current_user.role,
        resend_config.get("admin_email"),
        resend_config.get("from_email"),
        bool(resend_config.get("api_key")),
    )
    background_tasks.add_task(run_resend_daily_summary_email, stats, current_user.id)

    return {
        "message": "Daily attendance summary sedang diproses dan akan dikirim ke email",
        "summary": stats,
    }


def run_resend_daily_summary_email(summary: dict, requested_by_user_id: int) -> None:
    resend_config = get_resend_config()
    admin_email = resend_config.get("admin_email")

    logger.info(
        "Starting Resend daily summary email background task user_id=%s admin_email=%s resend_from=%s",
        requested_by_user_id,
        admin_email,
        resend_config.get("from_email"),
    )

    try:
        result = send_daily_summary_email(summary)
        logger.info(
            "Resend daily summary email sent successfully to %s response=%s",
            admin_email,
            result,
        )
    except Exception as exc:
        logger.exception(
            "Resend daily summary email failed for user_id=%s admin_email=%s error=%s",
            requested_by_user_id,
            admin_email,
            exc,
        )


def get_user_department(db: Session, user: User) -> Department:
    if not user.department_id:
        raise HTTPException(status_code=400, detail="User belum memiliki departemen.")

    dept = db.query(Department).filter(Department.id == user.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Departemen user tidak ditemukan")
    return dept


def get_department_location(db: Session, dept: Department):
    if not dept.location_id:
        raise HTTPException(status_code=400, detail="Lokasi absensi departemen belum diset.")

    location = db.query(Location).filter(Location.id == dept.location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Lokasi absensi departemen tidak ditemukan.")
    return location


@router.post("/check-in", response_model=CheckInResponse)
async def check_in(
    user_id: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Validasi akses
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    # Cek user ada dan aktif
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    dept = get_user_department(db, user)

    # Cek sudah check-in hari ini belum
    today = date.today()
    existing = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.check_in_time >= datetime.combine(today, datetime.min.time()),
        Attendance.check_in_time <= datetime.combine(today, datetime.max.time())
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Sudah check-in hari ini")

    # Validasi tipe file
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Format file harus JPG atau PNG")

    # Cek user punya face profile
    face_profile = db.query(FaceProfile).filter(
        FaceProfile.user_id == user_id,
        FaceProfile.is_active == True
    ).first()
    if not face_profile:
        raise HTTPException(status_code=400, detail="Wajah belum didaftarkan. Lakukan enrollment dulu")

    # Validasi lokasi
    # Validasi lokasi — prioritas: lokasi departemen > lokasi user
    location = get_department_location(db, dept)

    if location:
        loc_check = validate_location(
            latitude,
            longitude,
            location.latitude,
            location.longitude,
            location.radius_meter
        )

        if not loc_check["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Anda berada di luar radius absensi. Jarak Anda {loc_check['distance_meter']} meter dari lokasi yang diizinkan."
            )

        distance_meter = loc_check["distance_meter"]
    else:
        distance_meter = 0.0

    # Simpan foto check-in sementara
    image_bytes = await file.read()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"checkin_{user_id}_{timestamp}.jpg"
    temp_path = save_face_image(image_bytes, ATTENDANCE_FOLDER, filename)

    # Ekstrak dan bandingkan embedding
    try:
        input_embedding = extract_embedding(temp_path)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"Wajah tidak terdeteksi: {str(e)}")

    stored_embedding = json.loads(face_profile.face_embedding)
    result = compare_embeddings(input_embedding, stored_embedding)

    if not result["match"] or result["confidence"] < MIN_CONFIDENCE:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=422,
            detail=f"Wajah tidak cocok. Confidence: {result['confidence']}%"
        )

    # Tentukan status absensi
    schedule = get_user_schedule(db, user)
    
    now = datetime.now()
    status, late_minutes = determine_status(now, schedule)

    # Simpan attendance
    attendance = Attendance(
        user_id=user_id,
        check_in_time=now,
        status=status,
        late_minutes=late_minutes,
        location_lat=latitude,
        location_lng=longitude,
        confidence_score=result["confidence"],
        check_in_image_path=temp_path
    )
    db.add(attendance)

    # Simpan log
    log = AttendanceLog(
        user_id=user_id,
        action="check_in",
        status="success",
        message=f"Check-in berhasil. Confidence: {result['confidence']}%, Status: {status}"
    )
    db.add(log)
    db.commit()
    db.refresh(attendance)

    return CheckInResponse(
        message="Check-in berhasil",
        attendance_id=attendance.id,
        user_id=user_id,
        name=user.name,
        status=status,
        late_minutes=late_minutes,
        check_in_time=now,
        confidence_score=result["confidence"],
        distance_meter=distance_meter
    )


@router.post("/check-out", response_model=CheckOutResponse)
async def check_out(
    user_id: int = Form(...),
    latitude: float = Form(...),
    longitude: float = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    dept = get_user_department(db, user)

    # Cek sudah check-in hari ini
    today = date.today()
    attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.check_in_time >= datetime.combine(today, datetime.min.time()),
        Attendance.check_in_time <= datetime.combine(today, datetime.max.time())
    ).first()
    if not attendance:
        raise HTTPException(status_code=400, detail="Belum check-in hari ini")
    if attendance.check_out_time:
        raise HTTPException(status_code=400, detail="Sudah check-out hari ini")

    # Validasi tipe file
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Format file harus JPG atau PNG")

    # Cek face profile
    face_profile = db.query(FaceProfile).filter(
        FaceProfile.user_id == user_id,
        FaceProfile.is_active == True
    ).first()
    if not face_profile:
        raise HTTPException(status_code=400, detail="Wajah belum didaftarkan")

    # Validasi lokasi — prioritas: lokasi departemen > lokasi user
    location = get_department_location(db, dept)

    if location:
        loc_check = validate_location(
            latitude,
            longitude,
            location.latitude,
            location.longitude,
            location.radius_meter
        )

        if not loc_check["valid"]:
            raise HTTPException(
                status_code=400,
                detail=f"Anda berada di luar radius absensi. Jarak Anda {loc_check['distance_meter']} meter dari lokasi yang diizinkan."
            )

        distance_meter = loc_check["distance_meter"]
    else:
        distance_meter = 0.0

    # Simpan foto check-out
    image_bytes = await file.read()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"checkout_{user_id}_{timestamp}.jpg"
    temp_path = save_face_image(image_bytes, ATTENDANCE_FOLDER, filename)

    # Ekstrak dan bandingkan embedding
    try:
        input_embedding = extract_embedding(temp_path)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"Wajah tidak terdeteksi: {str(e)}")

    stored_embedding = json.loads(face_profile.face_embedding)
    result = compare_embeddings(input_embedding, stored_embedding)

    if not result["match"] or result["confidence"] < MIN_CONFIDENCE:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(
            status_code=422,
            detail=f"Wajah tidak cocok. Confidence: {result['confidence']}%"
        )

    # Update attendance
    now = datetime.now()
    attendance.check_out_time = now
    # Cek apakah pulang cepat
    schedule = get_user_schedule(db, user)
    checkout_status = determine_checkout_status(now, attendance.check_in_time, schedule)
    if checkout_status == "pulang_cepat":
        attendance.status = "pulang_cepat"
        
    attendance.liveness_score = result["confidence"]
    attendance.check_out_image_path = temp_path

    # Log
    log = AttendanceLog(
        user_id=user_id,
        action="check_out",
        status="success",
        message=f"Check-out berhasil. Confidence: {result['confidence']}%"
    )
    db.add(log)
    db.commit()
    db.refresh(attendance)

    return CheckOutResponse(
        message="Check-out berhasil",
        attendance_id=attendance.id,
        user_id=user_id,
        name=user.name,
        check_out_time=now,
        confidence_score=result["confidence"]
    )


@router.get("/today/{user_id}", response_model=AttendanceResponse)
def get_today_attendance(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    today = date.today()
    attendance = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.check_in_time >= datetime.combine(today, datetime.min.time()),
        Attendance.check_in_time <= datetime.combine(today, datetime.max.time())
    ).first()

    if not attendance:
        raise HTTPException(status_code=404, detail="Belum ada absensi hari ini")
    return attendance


@router.get("/history/{user_id}", response_model=List[AttendanceResponse])
def get_attendance_history(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    records = db.query(Attendance).filter(
        Attendance.user_id == user_id
    ).order_by(Attendance.check_in_time.desc()).limit(30).all()

    return records


@router.get("/all", response_model=List[AttendanceResponse])
def get_all_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin only — lihat semua absensi hari ini."""
    today = date.today()
    records = db.query(Attendance).filter(
        Attendance.check_in_time >= datetime.combine(today, datetime.min.time()),
        Attendance.check_in_time <= datetime.combine(today, datetime.max.time())
    ).order_by(Attendance.check_in_time.desc()).all()
    return records
