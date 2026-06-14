FROM python:3.11-slim-bookworm

WORKDIR /app

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PIP_NO_CACHE_DIR=1

RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender1 \
    libxcb1 \
    libx11-6 \
    libxcb-xinerama0 \
    libxkbcommon-x11-0 \
    libgomp1 \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN python -m pip install --upgrade pip setuptools wheel

# Install headless DULU sebelum requirements.txt
RUN python -m pip install opencv-python-headless==4.13.0.92

RUN python -m pip install -r requirements.txt

# Paksa hapus jika deepface/retina-face menarik versi GUI
RUN python -m pip uninstall -y opencv-python opencv-contrib-python || true
RUN python -m pip install --force-reinstall opencv-python-headless==4.13.0.92

COPY . .

CMD ["sh", "-c", "python -m uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]