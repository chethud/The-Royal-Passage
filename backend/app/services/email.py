from __future__ import annotations

import logging

import httpx

from app.config import settings

logger = logging.getLogger(__name__)


def email_configured() -> bool:
    return bool(settings.resend_api_key.strip() and settings.resend_from_email.strip())


def send_email(*, to: str, subject: str, html: str, text: str | None = None) -> bool:
    """Send a transactional email via Resend. Returns False when email is not configured."""
    to_address = (to or "").strip()
    if not to_address:
        return False
    if not email_configured():
        logger.error("Resend not configured; skipping email to %s (%s)", to_address, subject)
        return False

    payload: dict = {
        "from": f"{settings.resend_from_name} <{settings.resend_from_email}>",
        "to": [to_address],
        "subject": subject,
        "html": html,
    }
    if text:
        payload["text"] = text

    try:
        response = httpx.post(
            "https://api.resend.com/emails",
            headers={
                "Authorization": f"Bearer {settings.resend_api_key}",
                "Content-Type": "application/json",
                "User-Agent": "the-royal-passage-api/1.0",
            },
            json=payload,
            timeout=15.0,
        )
        if response.status_code >= 400:
            logger.error(
                "Resend failed for %s (%s): %s",
                to_address,
                subject,
                response.text[:500],
            )
            return False
        return True
    except Exception:
        logger.exception("Resend request failed for %s (%s)", to_address, subject)
        return False
