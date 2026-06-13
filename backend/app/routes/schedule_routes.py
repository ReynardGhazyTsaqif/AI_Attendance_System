from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from datetime import time

from app.database import get_db
from app.models.schedule_model import WorkSchedule
from app.models.department_model import Department
from app.schemas.schedule_schema import WorkScheduleCreate, WorkScheduleUpdate, WorkScheduleResponse
from app.utils.dependencies import get_current_user, require_admin
from app.models.user_model import User

router = APIRouter(prefix="/schedules", tags=["Work Schedules"])


@router.get("/", response_model=List[WorkScheduleResponse])
def get_all_schedules(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schedules = db.query(WorkSchedule).all()
    result = []
    for s in schedules:
        dept = db.query(Department).filter(Department.id == s.department_id).first()
        item = WorkScheduleResponse(
            id=s.id,
            department_id=s.department_id,
            department_name=dept.name if dept else None,
            name=s.name,
            work_start=s.work_start,
            work_end=s.work_end,
            late_tolerance=s.late_tolerance,
            early_leave_tolerance=s.early_leave_tolerance,
            is_active=s.is_active,
            created_at=s.created_at,
            updated_at=s.updated_at
        )
        result.append(item)
    return result


@router.get("/my", response_model=WorkScheduleResponse)
def get_my_schedule(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """User lihat jadwal departemennya sendiri."""
    if not current_user.department_id:
        raise HTTPException(status_code=400, detail="User belum memiliki departemen.")

    schedule = db.query(WorkSchedule).filter(
        WorkSchedule.department_id == current_user.department_id,
        WorkSchedule.is_active == True
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal belum diatur untuk departemenmu")

    dept = db.query(Department).filter(Department.id == schedule.department_id).first()
    return WorkScheduleResponse(
        id=schedule.id,
        department_id=schedule.department_id,
        department_name=dept.name if dept else None,
        name=schedule.name,
        work_start=schedule.work_start,
        work_end=schedule.work_end,
        late_tolerance=schedule.late_tolerance,
        early_leave_tolerance=schedule.early_leave_tolerance,
        is_active=schedule.is_active,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at
    )


@router.get("/department/{department_id}", response_model=WorkScheduleResponse)
def get_schedule_by_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    schedule = db.query(WorkSchedule).filter(
        WorkSchedule.department_id == department_id
    ).first()

    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan untuk departemen ini")

    dept = db.query(Department).filter(Department.id == department_id).first()
    return WorkScheduleResponse(
        id=schedule.id,
        department_id=schedule.department_id,
        department_name=dept.name if dept else None,
        name=schedule.name,
        work_start=schedule.work_start,
        work_end=schedule.work_end,
        late_tolerance=schedule.late_tolerance,
        early_leave_tolerance=schedule.early_leave_tolerance,
        is_active=schedule.is_active,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at
    )


@router.post("/", response_model=WorkScheduleResponse)
def create_schedule(
    data: WorkScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    # Cek departemen ada
    dept = db.query(Department).filter(Department.id == data.department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Departemen tidak ditemukan")

    # Cek jadwal untuk dept ini sudah ada belum
    existing = db.query(WorkSchedule).filter(
        WorkSchedule.department_id == data.department_id
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Departemen {dept.name} sudah memiliki jadwal. Gunakan PUT untuk mengupdate."
        )

    schedule = WorkSchedule(
        department_id=data.department_id,
        name=data.name,
        work_start=time.fromisoformat(data.work_start),
        work_end=time.fromisoformat(data.work_end),
        late_tolerance=data.late_tolerance,
        early_leave_tolerance=data.early_leave_tolerance
    )
    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    return WorkScheduleResponse(
        id=schedule.id,
        department_id=schedule.department_id,
        department_name=dept.name,
        name=schedule.name,
        work_start=schedule.work_start,
        work_end=schedule.work_end,
        late_tolerance=schedule.late_tolerance,
        early_leave_tolerance=schedule.early_leave_tolerance,
        is_active=schedule.is_active,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at
    )


@router.put("/{schedule_id}", response_model=WorkScheduleResponse)
def update_schedule(
    schedule_id: int,
    data: WorkScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    schedule = db.query(WorkSchedule).filter(WorkSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    if data.name is not None:
        schedule.name = data.name
    if data.work_start is not None:
        schedule.work_start = time.fromisoformat(data.work_start)
    if data.work_end is not None:
        schedule.work_end = time.fromisoformat(data.work_end)
    if data.late_tolerance is not None:
        schedule.late_tolerance = data.late_tolerance
    if data.early_leave_tolerance is not None:
        schedule.early_leave_tolerance = data.early_leave_tolerance
    if data.is_active is not None:
        schedule.is_active = data.is_active

    db.commit()
    db.refresh(schedule)

    dept = db.query(Department).filter(Department.id == schedule.department_id).first()
    return WorkScheduleResponse(
        id=schedule.id,
        department_id=schedule.department_id,
        department_name=dept.name if dept else None,
        name=schedule.name,
        work_start=schedule.work_start,
        work_end=schedule.work_end,
        late_tolerance=schedule.late_tolerance,
        early_leave_tolerance=schedule.early_leave_tolerance,
        is_active=schedule.is_active,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at
    )


@router.delete("/{schedule_id}")
def delete_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    schedule = db.query(WorkSchedule).filter(WorkSchedule.id == schedule_id).first()
    if not schedule:
        raise HTTPException(status_code=404, detail="Jadwal tidak ditemukan")

    db.delete(schedule)
    db.commit()
    return {"message": "Jadwal berhasil dihapus"}
