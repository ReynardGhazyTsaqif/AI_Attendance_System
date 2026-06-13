from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class FaceEnrollResponse(BaseModel):
    message: str
    user_id: int
    face_profile_id: int
    face_image_path: str

class FaceRecognizeResponse(BaseModel):
    match: bool
    confidence: float
    distance: float
    user_id: Optional[int] = None
    name: Optional[str] = None
    message: str