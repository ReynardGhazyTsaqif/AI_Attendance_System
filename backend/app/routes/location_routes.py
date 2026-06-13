from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.location_model import Location
from app.schemas.location_schema import LocationCreate, LocationUpdate, LocationResponse
from app.utils.dependencies import get_current_user, require_admin
from app.models.user_model import User

router = APIRouter(prefix="/locations", tags=["Locations"])

@router.get("/", response_model=List[LocationResponse])
def get_all_locations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Location).all()

@router.get("/{location_id}", response_model=LocationResponse)
def get_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan")
    return location

@router.post("/", response_model=LocationResponse)
def create_location(
    data: LocationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    location = Location(
        name=data.name,
        latitude=data.latitude,
        longitude=data.longitude,
        radius_meter=data.radius_meter
    )
    db.add(location)
    db.commit()
    db.refresh(location)
    return location

@router.put("/{location_id}", response_model=LocationResponse)
def update_location(
    location_id: int,
    data: LocationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan")

    if data.name is not None:
        location.name = data.name
    if data.latitude is not None:
        location.latitude = data.latitude
    if data.longitude is not None:
        location.longitude = data.longitude
    if data.radius_meter is not None:
        location.radius_meter = data.radius_meter

    db.commit()
    db.refresh(location)
    return location

@router.delete("/{location_id}")
def delete_location(
    location_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    location = db.query(Location).filter(Location.id == location_id).first()
    if not location:
        raise HTTPException(status_code=404, detail="Lokasi tidak ditemukan")

    db.delete(location)
    db.commit()
    return {"message": f"Lokasi {location.name} berhasil dihapus"}