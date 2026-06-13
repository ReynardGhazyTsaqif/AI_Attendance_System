from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.services.dashboard_service import (
    get_today_summary,
    get_image_processing_stats,
    get_weekly_trend,
    get_user_monthly_summary
)
from app.utils.dependencies import get_current_user, require_admin
from app.models.user_model import User
from app.models.attendance_model import Attendance
from datetime import datetime

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary")
def today_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return get_today_summary(db)

@router.get("/image-processing-stats")
def image_processing_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return get_image_processing_stats(db)

@router.get("/trend")
def weekly_trend(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return get_weekly_trend(db)

@router.get("/my-summary")
def my_monthly_summary(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return get_user_monthly_summary(db, current_user.id, year, month)

@router.get("/user-summary/{user_id}")
def user_monthly_summary(
    user_id: int,
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    return get_user_monthly_summary(db, user_id, year, month)

@router.get("/recent-logs")
def recent_attendance(
    limit: int = Query(default=10, le=50),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """10 absensi terbaru hari ini untuk live feed dashboard."""
    today = date.today()
    records = db.query(Attendance, User).join(
        User, Attendance.user_id == User.id
    ).filter(
        Attendance.check_in_time >= datetime.combine(today, datetime.min.time()),
        Attendance.check_in_time <= datetime.combine(today, datetime.max.time()),
        User.is_active == True,
        User.role.in_(("user", "staff"))
    ).order_by(Attendance.check_in_time.desc()).limit(limit).all()

    return [
        {
            "attendance_id": a.id,
            "user_id": a.user_id,
            "name": u.name,
            "status": a.status,
            "check_in_time": a.check_in_time,
            "check_out_time": a.check_out_time,
            "confidence_score": a.confidence_score,
            "late_minutes": a.late_minutes
        }
        for a, u in records
    ]
