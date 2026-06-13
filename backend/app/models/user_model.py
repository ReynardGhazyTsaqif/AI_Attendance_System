from sqlalchemy import Column, Integer, String, Boolean, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum('admin', 'staff', 'user'), default='user')
    department_id = Column(Integer, ForeignKey('departments.id', ondelete='SET NULL'), nullable=True)
    location_id = Column(Integer, ForeignKey('locations.id', ondelete='SET NULL'), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    department = relationship("Department", foreign_keys=[department_id])
    location = relationship("Location", foreign_keys=[location_id])
    face_profile = relationship("FaceProfile", back_populates="user", uselist=False)
    attendances = relationship("Attendance", back_populates="user")