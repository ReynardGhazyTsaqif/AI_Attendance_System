import os
from html import escape

import resend


DEFAULT_RESEND_FROM = "onboarding@resend.dev"


def get_resend_config() -> dict:
    return {
        "api_key": os.getenv("RESEND_API_KEY"),
        "from_email": os.getenv("RESEND_FROM") or DEFAULT_RESEND_FROM,
        "admin_email": os.getenv("ADMIN_EMAIL"),
    }


def format_date(value: str) -> str:
    parts = str(value).split("-")
    if len(parts) == 3:
        return f"{parts[2]}-{parts[1]}-{parts[0]}"
    return str(value)


def render_summary_html(summary: dict) -> str:
    rows = [
        ("Total Users", summary.get("total_users", 0)),
        ("Hadir", summary.get("hadir", 0)),
        ("Terlambat", summary.get("terlambat", 0)),
        ("Pulang Cepat", summary.get("pulang_cepat", 0)),
        ("Tidak Hadir", summary.get("tidak_hadir", 0)),
        ("Total Check-in", summary.get("total_checkin", 0)),
        ("Attendance Rate", f"{summary.get('attendance_rate', 0)}%"),
    ]
    table_rows = "\n".join(
        f"""
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #ede9fe;color:#6b7280;">{escape(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #ede9fe;text-align:right;font-weight:700;color:#111827;">{escape(str(value))}</td>
        </tr>
        """
        for label, value in rows
    )

    return f"""
    <div style="font-family:Inter,Arial,sans-serif;background:#f8fafc;padding:24px;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #ede9fe;border-radius:16px;overflow:hidden;">
        <div style="background:#7c3aed;padding:20px 24px;color:#ffffff;">
          <h1 style="font-size:22px;line-height:1.3;margin:0;">Daily Attendance Summary</h1>
          <p style="font-size:14px;margin:8px 0 0;color:#ddd6fe;">Tanggal: {escape(format_date(summary.get("date", "-")))}</p>
        </div>
        <div style="padding:18px 24px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            <tbody>
              {table_rows}
            </tbody>
          </table>
          <p style="font-size:12px;color:#9ca3af;margin:18px 0 0;">Sistem AI Attendance</p>
        </div>
      </div>
    </div>
    """


def send_daily_summary_email(summary: dict):
    config = get_resend_config()
    if not config["api_key"]:
        raise ValueError("RESEND_API_KEY belum dikonfigurasi.")
    if not config["admin_email"]:
        raise ValueError("ADMIN_EMAIL belum dikonfigurasi.")

    resend.api_key = config["api_key"]
    subject = f"Daily Attendance Summary - {format_date(summary.get('date', '-'))}"

    return resend.Emails.send(
        {
            "from": config["from_email"],
            "to": [config["admin_email"]],
            "subject": subject,
            "html": render_summary_html(summary),
        }
    )
