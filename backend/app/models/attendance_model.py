from sqlalchemy import Column, Integer, Float, Double, String, Enum, ForeignKey, TIMESTAMP, DateTime, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Attendance(Base):
    __tablename__ = "attendances"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    check_in_time = Column(DateTime, nullable=True)
    check_out_time = Column(DateTime, nullable=True)
    status = Column(Enum('hadir', 'terlambat', 'tidak_hadir', 'izin', 'sakit', 'pulang_cepat'), default='hadir')
    late_minutes = Column(Integer, default=0)
    location_lat = Column(Double, nullable=True)
    location_lng = Column(Double, nullable=True)
    confidence_score = Column(Float, nullable=True)
    liveness_score = Column(Float, nullable=True)
    check_in_image_path = Column(String(255), nullable=True)
    check_out_image_path = Column(String(255), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="attendances")


class AttendanceLog(Base):
    __tablename__ = "attendance_logs"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='SET NULL'), nullable=True)
    action = Column(String(50), nullable=False)
    status = Column(String(50), nullable=False)
    message = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())