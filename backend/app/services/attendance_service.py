from math import radians, cos, sin, asin, sqrt
from datetime import datetime, time, timedelta
from sqlalchemy.orm import Session
from app.models.schedule_model import WorkSchedule
from app.models.user_model import User

# Jadwal default — dipakai kalau departemen user belum punya jadwal
DEFAULT_WORK_START = time(8, 0, 0)
DEFAULT_WORK_END = time(17, 0, 0)
DEFAULT_LATE_TOLERANCE = 15
DEFAULT_EARLY_LEAVE_TOLERANCE = 15


def get_user_schedule(db: Session, user: User) -> dict:
    """Ambil jadwal kerja user berdasarkan departemennya."""
    if user.department_id:
        schedule = db.query(WorkSchedule).filter(
            WorkSchedule.department_id == user.department_id,
            WorkSchedule.is_active == True
        ).first()

        if schedule:
            return {
                "work_start": schedule.work_start,
                "work_end": schedule.work_end,
                "late_tolerance": schedule.late_tolerance,
                "early_leave_tolerance": schedule.early_leave_tolerance,
                "schedule_name": schedule.name,
                "from_db": True
            }

    # Fallback ke default
    return {
        "work_start": DEFAULT_WORK_START,
        "work_end": DEFAULT_WORK_END,
        "late_tolerance": DEFAULT_LATE_TOLERANCE,
        "early_leave_tolerance": DEFAULT_EARLY_LEAVE_TOLERANCE,
        "schedule_name": "Default",
        "from_db": False
    }


def calculate_distance_meter(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Hitung jarak antara dua koordinat GPS dalam meter (Haversine formula)."""
    R = 6371000
    lat1, lng1, lat2, lng2 = map(radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlng/2)**2
    c = 2 * asin(sqrt(a))
    return R * c


def validate_location(
    user_lat: float,
    user_lng: float,
    location_lat: float,
    location_lng: float,
    radius_meter: int
) -> dict:
    distance = calculate_distance_meter(user_lat, user_lng, location_lat, location_lng)
    return {
        "valid": distance <= radius_meter,
        "distance_meter": round(distance, 2),
        "radius_meter": radius_meter
    }


def determine_status(check_in_time: datetime, schedule: dict) -> tuple:
    """
    Tentukan status absensi berdasarkan jadwal departemen.
    Return: (status, late_minutes)
    """
    work_start = schedule["work_start"]
    late_tolerance = schedule["late_tolerance"]

    # Jam batas terlambat = jam masuk + toleransi
    late_threshold = (
        datetime.combine(check_in_time.date(), work_start) +
        timedelta(minutes=late_tolerance)
    ).time()

    check_in = check_in_time.time()

    if check_in <= late_threshold:
        return "hadir", 0
    else:
        late_minutes = int(
            (datetime.combine(check_in_time.date(), check_in) -
             datetime.combine(check_in_time.date(), late_threshold)).seconds / 60
        )
        return "terlambat", late_minutes


def determine_checkout_status(
    check_out_time: datetime,
    check_in_time: datetime,
    schedule: dict
) -> str:
    """
    Tentukan status checkout — apakah pulang cepat atau normal.
    """
    work_end = schedule["work_end"]
    early_tolerance = schedule["early_leave_tolerance"]

    # Jam batas pulang cepat = jam pulang - toleransi
    early_threshold = (
        datetime.combine(check_out_time.date(), work_end) -
        timedelta(minutes=early_tolerance)
    ).time()

    check_out = check_out_time.time()

    if check_out < early_threshold:
        return "pulang_cepat"
    return "normal"