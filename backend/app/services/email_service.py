import os
import smtplib
from email.message import EmailMessage


def get_smtp_config() -> dict:
    return {
        "smtp_email": os.getenv("SMTP_EMAIL"),
        "smtp_password": os.getenv("SMTP_PASSWORD"),
        "admin_email": os.getenv("ADMIN_EMAIL"),
        "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": int(os.getenv("SMTP_PORT", "587")),
    }


def send_email(subject: str, body: str, recipient: str | None = None) -> None:
    config = get_smtp_config()
    sender = config["smtp_email"]
    password = config["smtp_password"]
    recipient = recipient or config["admin_email"]

    missing = [
        name
        for name, value in {
            "SMTP_EMAIL": sender,
            "SMTP_PASSWORD": password,
            "ADMIN_EMAIL": recipient,
        }.items()
        if not value
    ]
    if missing:
        raise ValueError(f"Konfigurasi email belum lengkap: {', '.join(missing)}")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = sender
    message["To"] = recipient
    message.set_content(body)

    with smtplib.SMTP(config["smtp_host"], config["smtp_port"]) as smtp:
        smtp.starttls()
        smtp.login(sender, password)
        smtp.send_message(message)


def build_daily_summary_email(stats: dict) -> str:
    date_parts = stats["date"].split("-")
    formatted_date = (
        f"{date_parts[2]}-{date_parts[1]}-{date_parts[0]}"
        if len(date_parts) == 3
        else stats["date"]
    )

    return (
        "Daily Attendance Summary\n"
        f"Tanggal: {formatted_date}\n\n"
        f"Total User Aktif: {stats['total_users']}\n"
        f"Hadir: {stats['hadir']}\n"
        f"Terlambat: {stats['terlambat']}\n"
        f"Pulang Cepat: {stats['pulang_cepat']}\n"
        f"Tidak Hadir: {stats['tidak_hadir']}\n\n"
        "Sistem AI Attendance"
    )
