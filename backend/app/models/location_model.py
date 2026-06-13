from sqlalchemy import Column, Integer, String, Double, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    latitude = Column(Double, nullable=False)
    longitude = Column(Double, nullable=False)
    radius_meter = Column(Integer, default=100)
    created_at = Column(TIMESTAMP, server_default=func.now())