from pydantic import BaseModel, validator
from typing import Optional
from datetime import time, datetime

class WorkScheduleCreate(BaseModel):
    department_id: int
    name: str
    work_start: str      # format "HH:MM"
    work_end: str        # format "HH:MM"
    late_tolerance: Optional[int] = 15
    early_leave_tolerance: Optional[int] = 15

    @validator('work_start', 'work_end')
    def validate_time_format(cls, v):
        try:
            time.fromisoformat(v)
        except ValueError:
            raise ValueError('Format waktu harus HH:MM, contoh: 08:00')
        return v

class WorkScheduleUpdate(BaseModel):
    name: Optional[str] = None
    work_start: Optional[str] = None
    work_end: Optional[str] = None
    late_tolerance: Optional[int] = None
    early_leave_tolerance: Optional[int] = None
    is_active: Optional[bool] = None

    @validator('work_start', 'work_end', pre=True, always=False)
    def validate_time_format(cls, v):
        if v is None:
            return v
        try:
            time.fromisoformat(v)
        except ValueError:
            raise ValueError('Format waktu harus HH:MM, contoh: 08:00')
        return v

class WorkScheduleResponse(BaseModel):
    id: int
    department_id: int
    department_name: Optional[str] = None
    name: str
    work_start: time
    work_end: time
    late_tolerance: int
    early_leave_tolerance: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True