from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from datetime import datetime
from typing import List
import numpy as np
import json
import os

from app.database import get_db
from app.models.user_model import User
from app.models.face_model import FaceProfile
from app.schemas.face_schema import FaceEnrollResponse, FaceRecognizeResponse
from app.services.face_service import (
    extract_embedding,
    extract_embedding_multi_detector,
    compare_embeddings,
    save_face_image,
    validate_face_in_image
)
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/face", tags=["Face Recognition"])

ENROLLMENT_FOLDER = "uploads/enrollments"
ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]


@router.post("/enroll/{user_id}", response_model=FaceEnrollResponse)
async def enroll_face(
    user_id: int,
    files: List[UploadFile] = File(...),  # support multiple files
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    if len(files) > 5:
        raise HTTPException(status_code=400, detail="Maksimal 5 foto untuk enrollment")

    embeddings = []
    saved_paths = []
    first_path = None

    for i, file in enumerate(files):
        if file.content_type not in ALLOWED_TYPES:
            raise HTTPException(status_code=400, detail=f"File {i+1}: format harus JPG atau PNG")

        image_bytes = await file.read()
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"user_{user_id}_{timestamp}_{i}.jpg"
        filepath = save_face_image(image_bytes, ENROLLMENT_FOLDER, filename)
        saved_paths.append(filepath)

        if i == 0:
            first_path = filepath

        if not validate_face_in_image(filepath):
            for p in saved_paths:
                if os.path.exists(p):
                    os.remove(p)
            raise HTTPException(status_code=400, detail=f"Foto {i+1}: wajah tidak terdeteksi")

        try:
            emb = extract_embedding_multi_detector(filepath)
            embeddings.append(emb)
        except Exception as e:
            for p in saved_paths:
                if os.path.exists(p):
                    os.remove(p)
            raise HTTPException(status_code=400, detail=f"Foto {i+1}: gagal ekstrak wajah — {str(e)}")

    # Rata-rata semua embedding → lebih robust
    avg_embedding = np.mean(embeddings, axis=0).tolist()

    # Hapus foto tambahan, simpan hanya foto pertama
    for p in saved_paths[1:]:
        if os.path.exists(p):
            os.remove(p)

    # Simpan atau update face profile
    face_profile = db.query(FaceProfile).filter(FaceProfile.user_id == user_id).first()
    if face_profile:
        if face_profile.face_image_path and os.path.exists(face_profile.face_image_path):
            os.remove(face_profile.face_image_path)
        face_profile.face_embedding = json.dumps(avg_embedding)
        face_profile.face_image_path = first_path
    else:
        face_profile = FaceProfile(
            user_id=user_id,
            face_embedding=json.dumps(avg_embedding),
            face_image_path=first_path
        )
        db.add(face_profile)

    db.commit()
    db.refresh(face_profile)

    return FaceEnrollResponse(
        message=f"Wajah berhasil didaftarkan ({len(embeddings)} foto)",
        user_id=user_id,
        face_profile_id=face_profile.id,
        face_image_path=first_path
    )

@router.post("/recognize", response_model=FaceRecognizeResponse)
async def recognize_face(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Kenali wajah dari gambar — cocokkan dengan semua face profile aktif."""

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Format file harus JPG atau PNG")

    # Simpan gambar sementara
    image_bytes = await file.read()
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    temp_path = f"uploads/temp_recognize_{timestamp}.jpg"
    save_face_image(image_bytes, "uploads", f"temp_recognize_{timestamp}.jpg")

    # Ekstrak embedding dari gambar input
    try:
        input_embedding = extract_embedding(temp_path)
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"Wajah tidak terdeteksi: {str(e)}")

    # Ambil semua face profile aktif
    face_profiles = db.query(FaceProfile).filter(FaceProfile.is_active == True).all()

    best_match = None
    best_confidence = 0

    for profile in face_profiles:
        stored_embedding = json.loads(profile.face_embedding)
        result = compare_embeddings(input_embedding, stored_embedding)

        if result["match"] and result["confidence"] > best_confidence:
            best_confidence = result["confidence"]
            best_match = {
                "user_id": profile.user_id,
                "confidence": result["confidence"],
                "distance": result["distance"]
            }

    # Hapus file temp
    if os.path.exists(temp_path):
        os.remove(temp_path)

    if best_match:
        user = db.query(User).filter(User.id == best_match["user_id"]).first()
        return FaceRecognizeResponse(
            match=True,
            confidence=best_match["confidence"],
            distance=best_match["distance"],
            user_id=user.id,
            name=user.name,
            message=f"Wajah dikenali: {user.name}"
        )

    return FaceRecognizeResponse(
        match=False,
        confidence=0,
        distance=1,
        message="Wajah tidak dikenali"
    )


@router.delete("/enroll/{user_id}")
def delete_face(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    if current_user.role != "admin" and current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Akses ditolak")

    face_profile = db.query(FaceProfile).filter(FaceProfile.user_id == user_id).first()
    if not face_profile:
        raise HTTPException(status_code=404, detail="Face profile tidak ditemukan")

    if face_profile.face_image_path and os.path.exists(face_profile.face_image_path):
        os.remove(face_profile.face_image_path)

    db.delete(face_profile)
    db.commit()
    return {"message": "Face profile berhasil dihapus"}


@router.get("/status/{user_id}")
def face_status(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    profile = db.query(FaceProfile).filter(FaceProfile.user_id == user_id).first()
    return {
        "user_id": user_id,
        "enrolled": profile is not None,
        "is_active": profile.is_active if profile else False,
        "enrolled_at": profile.created_at if profile else None
    }