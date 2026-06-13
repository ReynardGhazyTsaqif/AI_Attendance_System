from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.utils.schema_migrations import ensure_schema
from dotenv import load_dotenv

load_dotenv()

from app.models.department_model import Department
from app.models.location_model import Location
from app.models.user_model import User
from app.models.attendance_model import Attendance, AttendanceLog
from app.models.schedule_model import WorkSchedule


Base.metadata.create_all(bind=engine)
ensure_schema(engine)

app = FastAPI(
    title="PresenAI API",
    description="AI Attendance System with Face Recognition",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
from app.routes.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.location_routes import router as location_router
from app.routes.department_routes import router as department_router
from app.routes.face_routes import router as face_router
from app.routes.attendance_routes import router as attendance_router
from app.routes.dashboard_routes import router as dashboard_router
from app.routes.export_routes import router as export_router
from app.routes.schedule_routes import router as schedule_router


app.include_router(auth_router)
app.include_router(user_router)
app.include_router(location_router)
app.include_router(department_router)
app.include_router(face_router)
app.include_router(attendance_router)
app.include_router(dashboard_router)
app.include_router(export_router)
app.include_router(schedule_router)


@app.get("/")
def root():
    return {"message": "PresenAI API is running", "status": "ok"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
