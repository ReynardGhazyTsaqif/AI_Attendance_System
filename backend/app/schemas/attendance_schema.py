from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class CheckInRequest(BaseModel):
    user_id: int
    latitude: float
    longitude: float

class CheckOutRequest(BaseModel):
    user_id: int
    latitude: float
    longitude: float

class AttendanceResponse(BaseModel):
    id: int
    user_id: int
    check_in_time: Optional[datetime]
    check_out_time: Optional[datetime]
    status: str
    late_minutes: int
    location_lat: Optional[float]
    location_lng: Optional[float]
    confidence_score: Optional[float]
    created_at: datetime

    class Config:
        from_attributes = True

class CheckInResponse(BaseModel):
    message: str
    attendance_id: int
    user_id: int
    name: str
    status: str
    late_minutes: int
    check_in_time: datetime
    confidence_score: float
    distance_meter: float

class CheckOutResponse(BaseModel):
    message: str
    attendance_id: int
    user_id: int
    name: str
    check_out_time: datetime
    confidence_score: float