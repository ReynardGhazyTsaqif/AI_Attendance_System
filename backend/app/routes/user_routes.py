from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.user_model import User
from app.models.department_model import Department
from app.models.location_model import Location
from app.schemas.user_schema import UserCreate, UserUpdate, UserResponse
from app.utils.password_handler import hash_password
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/users", tags=["Users"])

def get_provided_fields(data) -> set:
    return getattr(data, "model_fields_set", getattr(data, "__fields_set__", set()))

def validate_department(db: Session, department_id: int) -> None:
    if not db.query(Department).filter(Department.id == department_id).first():
        raise HTTPException(status_code=404, detail="Departemen tidak ditemukan")

def validate_location(db: Session, location_id: int) -> None:
    if not db.query(Location).filter(Location.id == location_id).first():
        raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan")

def build_response(user: User, db: Session) -> UserResponse:
    department_name = None
    if user.department_id:
        dept = db.query(Department).filter(Department.id == user.department_id).first()
        department_name = dept.name if dept else None
    return UserResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department_id=user.department_id,
        department_name=department_name,
        location_id=user.location_id,
        is_active=user.is_active,
        created_at=user.created_at,
    )

@router.get("/", response_model=List[UserResponse])
def get_all_users(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    users = db.query(User).all()
    return [build_response(user, db) for user in users]

@router.get("/me", response_model=UserResponse)
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return build_response(current_user, db)

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # User biasa hanya bisa lihat profil sendiri
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")
    return build_response(user, db)

@router.post("/", response_model=UserResponse)
def create_user(
    data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    if data.department_id is not None:
        validate_department(db, data.department_id)
    if data.location_id is not None:
        validate_location(db, data.location_id)

    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password),
        role=data.role,
        department_id=data.department_id,
        location_id=data.location_id
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_response(user, db)

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # User biasa hanya bisa update profil sendiri
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if data.name is not None:
        user.name = data.name
    if data.email is not None:
        user.email = data.email
    if data.role is not None and current_user.role == "admin":
        user.role = data.role

    provided_fields = get_provided_fields(data)
    if "department_id" in provided_fields:
        if data.department_id is None:
            user.department_id = None
        else:
            validate_department(db, data.department_id)
            user.department_id = data.department_id
    if "location_id" in provided_fields:
        if data.location_id is None:
            user.location_id = None
        else:
            validate_location(db, data.location_id)
            user.location_id = data.location_id
    if data.is_active is not None and current_user.role == "admin":
        user.is_active = data.is_active

    db.commit()
    db.refresh(user)
    return build_response(user, db)

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    db.delete(user)
    db.commit()
    return {"message": f"User {user.name} berhasil dihapus"}
