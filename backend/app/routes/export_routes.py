from fastapi import APIRouter, Depends, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session
from datetime import date
from app.database import get_db
from app.services.export_service import export_attendance_excel, export_attendance_pdf
from app.utils.dependencies import require_admin
from app.models.user_model import User

router = APIRouter(prefix="/export", tags=["Export"])

@router.get("/excel")
def download_excel(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    file_bytes = export_attendance_excel(db, year, month)
    filename = f"absensi_{year}_{month:02d}.xlsx"
    return Response(
        content=file_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

@router.get("/pdf")
def download_pdf(
    year: int = Query(default=date.today().year),
    month: int = Query(default=date.today().month),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    file_bytes = export_attendance_pdf(db, year, month)
    filename = f"absensi_{year}_{month:02d}.pdf"
    return Response(
        content=file_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )