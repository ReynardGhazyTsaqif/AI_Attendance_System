import numpy as np
import json
import os
import cv2
from deepface import DeepFace
from datetime import datetime

MODEL_NAME = "Facenet512"
DETECTOR = "opencv"
THRESHOLD = 0.50  # Dinaikkan dari 0.40 → lebih toleran variasi kualitas

def preprocess_image(image_path: str) -> str:
    """Normalisasi gambar: sharpen, denoise, equalize histogram."""
    img = cv2.imread(image_path)
    if img is None:
        return image_path

    # 1. Denoise — kurangi noise dari kamera buram
    img = cv2.fastNlMeansDenoisingColored(img, None, 10, 10, 7, 21)

    # 2. Sharpen — perjelas tepi wajah
    kernel = np.array([[0, -1, 0], [-1, 5, -1], [0, -1, 0]])
    img = cv2.filter2D(img, -1, kernel)

    # 3. CLAHE — normalisasi pencahayaan (Contrast Limited Adaptive Histogram Equalization)
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB)
    l, a, b = cv2.split(lab)
    clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
    l = clahe.apply(l)
    lab = cv2.merge((l, a, b))
    img = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

    # Simpan ke path baru
    processed_path = image_path.replace('.jpg', '_processed.jpg')
    cv2.imwrite(processed_path, img)
    return processed_path

def extract_embedding(image_path: str) -> list:
    """Ekstrak face embedding dari gambar dengan preprocessing."""
    processed_path = preprocess_image(image_path)

    try:
        result = DeepFace.represent(
            img_path=processed_path,
            model_name=MODEL_NAME,
            detector_backend=DETECTOR,
            enforce_detection=True
        )
        embedding = result[0]["embedding"]
    finally:
        # Hapus file processed sementara
        if processed_path != image_path and os.path.exists(processed_path):
            os.remove(processed_path)

    return embedding

def extract_embedding_multi_detector(image_path: str) -> list:
    """
    Coba beberapa detector — fallback jika satu gagal.
    opencv → ssd → mtcnn (makin akurat tapi makin lambat)
    """
    processed_path = preprocess_image(image_path)
    detectors = ["opencv", "ssd", "mtcnn"]
    last_error = None

    try:
        for detector in detectors:
            try:
                result = DeepFace.represent(
                    img_path=processed_path,
                    model_name=MODEL_NAME,
                    detector_backend=detector,
                    enforce_detection=True
                )
                return result[0]["embedding"]
            except Exception as e:
                last_error = e
                continue
    finally:
        if processed_path != image_path and os.path.exists(processed_path):
            os.remove(processed_path)

    raise Exception(f"Semua detector gagal: {last_error}")

def compare_embeddings(embedding1: list, embedding2: list) -> dict:
    """Bandingkan dua embedding dengan cosine similarity."""
    vec1 = np.array(embedding1)
    vec2 = np.array(embedding2)

    cosine_sim = np.dot(vec1, vec2) / (np.linalg.norm(vec1) * np.linalg.norm(vec2))
    cosine_distance = 1 - cosine_sim
    confidence = float(round(cosine_sim * 100, 2))

    return {
        "match": cosine_distance < THRESHOLD,
        "confidence": confidence,
        "distance": float(round(cosine_distance, 4))
    }

def save_face_image(image_bytes: bytes, folder: str, filename: str) -> str:
    """Simpan gambar wajah ke disk."""
    os.makedirs(folder, exist_ok=True)
    filepath = os.path.join(folder, filename)
    with open(filepath, "wb") as f:
        f.write(image_bytes)
    return filepath

def validate_face_in_image(image_path: str) -> bool:
    """Cek apakah gambar mengandung wajah."""
    try:
        processed_path = preprocess_image(image_path)
        DeepFace.detectFace(
            img_path=processed_path,
            detector_backend=DETECTOR,
            enforce_detection=True
        )
        if processed_path != image_path and os.path.exists(processed_path):
            os.remove(processed_path)
        return True
    except:
        return False