from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class LocationCreate(BaseModel):
    name: str
    latitude: float
    longitude: float
    radius_meter: Optional[int] = 100

class LocationUpdate(BaseModel):
    name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    radius_meter: Optional[int] = None

class LocationResponse(BaseModel):
    id: int
    name: str
    latitude: float
    longitude: float
    radius_meter: int
    created_at: datetime

    class Config:
        from_attributes = True