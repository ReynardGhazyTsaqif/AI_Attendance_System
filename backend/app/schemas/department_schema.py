from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class DepartmentCreate(BaseModel):
    name: str
    location_id: Optional[int] = None

class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    location_id: Optional[int] = None

class DepartmentResponse(BaseModel):
    id: int
    name: str
    location_id: Optional[int] = None
    location_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True