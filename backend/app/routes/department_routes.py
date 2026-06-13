from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.department_model import Department
from app.models.location_model import Location
from app.schemas.department_schema import DepartmentCreate, DepartmentUpdate, DepartmentResponse
from app.utils.dependencies import get_current_user, require_admin
from app.models.user_model import User

router = APIRouter(prefix="/departments", tags=["Departments"])

def build_response(dept: Department, db: Session) -> DepartmentResponse:
    location_name = None
    if dept.location_id:
        loc = db.query(Location).filter(Location.id == dept.location_id).first()
        location_name = loc.name if loc else None
    return DepartmentResponse(
        id=dept.id,
        name=dept.name,
        location_id=dept.location_id,
        location_name=location_name,
        created_at=dept.created_at
    )

def get_provided_fields(data) -> set:
    return getattr(data, "model_fields_set", getattr(data, "__fields_set__", set()))

@router.get("/", response_model=List[DepartmentResponse])
def get_all_departments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    departments = db.query(Department).all()
    return [build_response(d, db) for d in departments]

@router.get("/{department_id}", response_model=DepartmentResponse)
def get_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department tidak ditemukan")
    return build_response(dept, db)

@router.post("/", response_model=DepartmentResponse)
def create_department(
    data: DepartmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    if data.location_id is not None:
        loc = db.query(Location).filter(Location.id == data.location_id).first()
        if not loc:
            raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan")

    dept = Department(name=data.name, location_id=data.location_id)
    db.add(dept)
    db.commit()
    db.refresh(dept)
    return build_response(dept, db)

@router.put("/{department_id}", response_model=DepartmentResponse)
def update_department(
    department_id: int,
    data: DepartmentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department tidak ditemukan")

    if data.name is not None:
        dept.name = data.name
    provided_fields = get_provided_fields(data)
    if "location_id" in provided_fields:
        if data.location_id is None:
            dept.location_id = None
        else:
            loc = db.query(Location).filter(Location.id == data.location_id).first()
            if not loc:
                raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan")
            dept.location_id = data.location_id

    db.commit()
    db.refresh(dept)
    return build_response(dept, db)

@router.delete("/{department_id}")
def delete_department(
    department_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    dept = db.query(Department).filter(Department.id == department_id).first()
    if not dept:
        raise HTTPException(status_code=404, detail="Department tidak ditemukan")
    db.delete(dept)
    db.commit()
    return {"message": f"Department {dept.name} berhasil dihapus"}
