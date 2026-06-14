import os
import smtplib
import logging
from email.message import EmailMessage

logger = logging.getLogger(__name__)


def get_smtp_config() -> dict:
    return {
        "smtp_email": os.getenv("SMTP_EMAIL"),
        "smtp_password": os.getenv("SMTP_PASSWORD"),
        "admin_email": os.getenv("ADMIN_EMAIL"),
        "smtp_host": os.getenv("SMTP_HOST", "smtp.gmail.com"),
        "smtp_port": int(os.getenv("SMTP_PORT", "465")),
        "smtp_timeout": int(os.getenv("SMTP_TIMEOUT", "30")),
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

    logger.info("Sending email to %s via %s:%s", recipient, config["smtp_host"], config["smtp_port"])
    try:
        if config["smtp_port"] == 465:
            with smtplib.SMTP_SSL(
                config["smtp_host"],
                config["smtp_port"],
                timeout=config["smtp_timeout"],
            ) as smtp:
                smtp.login(sender, password)
                smtp.send_message(message)
        else:
            with smtplib.SMTP(
                config["smtp_host"],
                config["smtp_port"],
                timeout=config["smtp_timeout"],
            ) as smtp:
                smtp.starttls()
                smtp.login(sender, password)
                smtp.send_message(message)
    except Exception:
        logger.exception("Failed sending email to %s", recipient)
        raise

    logger.info("Email sent successfully to %s", recipient)


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
