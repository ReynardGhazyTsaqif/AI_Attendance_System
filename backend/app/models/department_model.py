from sqlalchemy import Column, Integer, String, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class Department(Base):
    __tablename__ = "departments"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    location_id = Column(Integer, ForeignKey('locations.id', ondelete='SET NULL'), nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    location = relationship("Location", foreign_keys=[location_id])