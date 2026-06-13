from sqlalchemy.orm import Session
from sqlalchemy import func, distinct
from datetime import date, datetime, timedelta
from app.models.attendance_model import Attendance
from app.models.user_model import User

ATTENDANCE_USER_ROLES = ("user", "staff")


def get_daily_attendance_stats(db: Session, target_date: date | None = None) -> dict:
    """Ringkasan absensi harian untuk dashboard dan email."""
    target_date = target_date or date.today()
    start = datetime.combine(target_date, datetime.min.time())
    end = datetime.combine(target_date, datetime.max.time())

    active_user_filter = (
        User.is_active == True,
        User.role.in_(ATTENDANCE_USER_ROLES),
    )
    today_filter = Attendance.check_in_time.between(start, end)

    total_users = db.query(User).filter(*active_user_filter).count()
    total_checkin = db.query(func.count(distinct(Attendance.user_id))).join(
        User, Attendance.user_id == User.id
    ).filter(
        today_filter,
        *active_user_filter,
    ).scalar() or 0

    hadir = db.query(func.count(distinct(Attendance.user_id))).join(
        User, Attendance.user_id == User.id
    ).filter(
        today_filter,
        Attendance.status == "hadir",
        *active_user_filter,
    ).scalar() or 0

    terlambat = db.query(func.count(distinct(Attendance.user_id))).join(
        User, Attendance.user_id == User.id
    ).filter(
        today_filter,
        Attendance.status == "terlambat",
        *active_user_filter,
    ).scalar() or 0

    pulang_cepat = db.query(func.count(distinct(Attendance.user_id))).join(
        User, Attendance.user_id == User.id
    ).filter(
        today_filter,
        Attendance.status == "pulang_cepat",
        *active_user_filter,
    ).scalar() or 0

    tidak_hadir = max(total_users - total_checkin, 0)

    return {
        "date": str(target_date),
        "total_users": total_users,
        "hadir": hadir,
        "terlambat": terlambat,
        "pulang_cepat": pulang_cepat,
        "tidak_hadir": tidak_hadir,
        "total_checkin": total_checkin,
        "attendance_rate": round((total_checkin / total_users * 100), 1) if total_users > 0 else 0
    }


def get_today_summary(db: Session) -> dict:
    """Ringkasan absensi hari ini."""
    return get_daily_attendance_stats(db)


def get_image_processing_stats(db: Session) -> dict:
    """Statistik sederhana dari proses face verification yang tersimpan."""
    total_tested = db.query(Attendance).count()
    average_confidence = db.query(func.avg(Attendance.confidence_score)).filter(
        Attendance.confidence_score.isnot(None)
    ).scalar()

    return {
        "total_tested": total_tested,
        "average_confidence": round(float(average_confidence), 1) if average_confidence is not None else None,
        "average_inference_time_ms": None,
    }


def get_weekly_trend(db: Session) -> list:
    """Tren absensi 7 hari terakhir."""
    result = []
    for i in range(6, -1, -1):
        day = date.today() - timedelta(days=i)
        start = datetime.combine(day, datetime.min.time())
        end = datetime.combine(day, datetime.max.time())

        active_user_filter = (
            User.is_active == True,
            User.role.in_(ATTENDANCE_USER_ROLES),
        )
        hadir = db.query(func.count(distinct(Attendance.user_id))).join(
            User, Attendance.user_id == User.id
        ).filter(
            Attendance.check_in_time.between(start, end),
            Attendance.status == "hadir",
            *active_user_filter,
        ).scalar() or 0
        terlambat = db.query(func.count(distinct(Attendance.user_id))).join(
            User, Attendance.user_id == User.id
        ).filter(
            Attendance.check_in_time.between(start, end),
            Attendance.status == "terlambat",
            *active_user_filter,
        ).scalar() or 0

        result.append({
            "date": str(day),
            "day": day.strftime("%a"),
            "hadir": hadir,
            "terlambat": terlambat,
            "total": hadir + terlambat
        })
    return result

def get_user_monthly_summary(db: Session, user_id: int, year: int, month: int) -> dict:
    """Ringkasan absensi user per bulan."""
    from calendar import monthrange
    _, days_in_month = monthrange(year, month)

    start = datetime(year, month, 1)
    end = datetime(year, month, days_in_month, 23, 59, 59)

    records = db.query(Attendance).filter(
        Attendance.user_id == user_id,
        Attendance.check_in_time.between(start, end)
    ).all()

    hadir = sum(1 for r in records if r.status == "hadir")
    terlambat = sum(1 for r in records if r.status == "terlambat")
    izin = sum(1 for r in records if r.status == "izin")
    sakit = sum(1 for r in records if r.status == "sakit")
    total_late_minutes = sum(r.late_minutes for r in records if r.late_minutes)

    return {
        "user_id": user_id,
        "year": year,
        "month": month,
        "total_days": days_in_month,
        "hadir": hadir,
        "terlambat": terlambat,
        "izin": izin,
        "sakit": sakit,
        "tidak_hadir": days_in_month - (hadir + terlambat + izin + sakit),
        "total_late_minutes": total_late_minutes,
        "attendance_rate": round(((hadir + terlambat) / days_in_month * 100), 1)
    }
