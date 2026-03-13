import resend

from app.core.config import get_settings

settings = get_settings()
resend.api_key = settings.RESEND_API_KEY
