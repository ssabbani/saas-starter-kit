import logging

import resend

from app.core.config import get_settings

settings = get_settings()
resend.api_key = settings.RESEND_API_KEY
logger = logging.getLogger("uvicorn.error")

BASE_STYLE = """
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    max-width: 560px; margin: 0 auto; padding: 40px 24px;
    background-color: #ffffff; color: #1a1a1a;
"""
BTN_STYLE = """
    display: inline-block; padding: 12px 32px; background-color: #2563eb;
    color: #ffffff; text-decoration: none; border-radius: 6px;
    font-weight: 600; font-size: 14px;
"""


def _send(to: str, subject: str, html: str) -> None:
    try:
        resend.Emails.send({
            "from": settings.FROM_EMAIL,
            "to": [to],
            "subject": subject,
            "html": html,
        })
    except Exception:
        logger.warning("Failed to send email to %s (subject: %s)", to, subject)


def send_verification_email(to_email: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/auth/verify?token={token}"
    html = f"""
    <div style="{BASE_STYLE}">
        <h2 style="margin: 0 0 8px;">Verify your email</h2>
        <p style="color: #555; line-height: 1.6;">
            Thanks for signing up for <strong>{settings.APP_NAME}</strong>.
            Click the button below to verify your email address.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{link}" style="{BTN_STYLE}">Verify Email</a>
        </div>
        <p style="color: #999; font-size: 13px;">
            If you didn't create an account, you can safely ignore this email.
        </p>
    </div>
    """
    _send(to_email, f"Verify your email — {settings.APP_NAME}", html)


def send_password_reset_email(to_email: str, token: str) -> None:
    link = f"{settings.FRONTEND_URL}/auth/reset-password?token={token}"
    html = f"""
    <div style="{BASE_STYLE}">
        <h2 style="margin: 0 0 8px;">Reset your password</h2>
        <p style="color: #555; line-height: 1.6;">
            We received a password reset request for your <strong>{settings.APP_NAME}</strong> account.
            Click the button below to choose a new password.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{link}" style="{BTN_STYLE}">Reset Password</a>
        </div>
        <p style="color: #999; font-size: 13px;">
            This link expires in 24 hours. If you didn't request a reset, ignore this email.
        </p>
    </div>
    """
    _send(to_email, f"Reset your password — {settings.APP_NAME}", html)


def send_welcome_email(to_email: str, name: str) -> None:
    dashboard = f"{settings.FRONTEND_URL}/dashboard"
    html = f"""
    <div style="{BASE_STYLE}">
        <h2 style="margin: 0 0 8px;">Welcome, {name}!</h2>
        <p style="color: #555; line-height: 1.6;">
            Your email is verified and your <strong>{settings.APP_NAME}</strong> account is ready to go.
        </p>
        <div style="text-align: center; margin: 32px 0;">
            <a href="{dashboard}" style="{BTN_STYLE}">Go to Dashboard</a>
        </div>
    </div>
    """
    _send(to_email, f"Welcome to {settings.APP_NAME}!", html)
