from sqlalchemy import Column, Integer, String, Time, Boolean, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class WorkSchedule(Base):
    __tablename__ = "work_schedules"

    id = Column(Integer, primary_key=True, index=True)
    department_id = Column(Integer, ForeignKey('departments.id', ondelete='CASCADE'), nullable=False, unique=True)
    name = Column(String(100), nullable=False)           # contoh: "Shift Pagi"
    work_start = Column(Time, nullable=False)            # jam masuk
    work_end = Column(Time, nullable=False)              # jam pulang
    late_tolerance = Column(Integer, default=15)         # toleransi terlambat (menit)
    early_leave_tolerance = Column(Integer, default=15)  # toleransi pulang cepat (menit)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    department = relationship("Department", foreign_keys=[department_id])