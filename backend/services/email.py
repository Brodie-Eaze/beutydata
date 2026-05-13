"""Resend wrapper. No-op when RESEND_API_KEY is not configured (logs to stdout)."""
import logging

from core.config import settings

log = logging.getLogger("email")


async def send_email(to: str, subject: str, html: str) -> bool:
    if not to:
        return False
    if not settings.RESEND_API_KEY:
        log.warning("[email stub] to=%s subject=%s", to, subject)
        return True
    try:
        import resend  # type: ignore
        resend.api_key = settings.RESEND_API_KEY
        resend.Emails.send({
            "from": settings.EMAIL_FROM,
            "to": [to],
            "subject": subject,
            "html": html,
        })
        return True
    except Exception as e:
        log.exception("resend send failed: %s", e)
        return False


def listing_notice_html(salon_name: str | None, incident_type: str, dispute_url: str) -> str:
    salon = salon_name or "A member business"
    return f"""
    <p>Hi,</p>
    <p>{salon} has logged an incident ({incident_type.replace('_', ' ')})
    against a contact detail (phone or email) belonging to you, on a private
    information-sharing network used by Australian beauty businesses.</p>
    <p>This is <strong>not</strong> a credit report and does <strong>not</strong> affect your credit file.</p>
    <p>If you believe this is incorrect, you can review and dispute it here:
    <a href="{dispute_url}">{dispute_url}</a></p>
    <p>Entries expire automatically after 12 months.</p>
    """
