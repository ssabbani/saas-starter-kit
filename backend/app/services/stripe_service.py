import stripe

from app.core.config import get_settings

settings = get_settings()
stripe.api_key = settings.STRIPE_SECRET_KEY
