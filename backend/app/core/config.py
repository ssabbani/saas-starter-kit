from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "SaaS Starter Kit"
    ENVIRONMENT: str = "development"
    FRONTEND_URL: str = "http://localhost:3000"
    BACKEND_URL: str = "http://localhost:8000"

    # Database
    POSTGRES_USER: str = "saas_user"
    POSTGRES_PASSWORD: str = "saas_secret_2024"
    POSTGRES_DB: str = "saas_db"
    POSTGRES_HOST: str = "db"
    POSTGRES_PORT: int = 5432
    DATABASE_URL: str = "postgresql+asyncpg://saas_user:saas_secret_2024@db:5432/saas_db"

    # Auth
    SECRET_KEY: str = "change-me-to-a-random-secret-key"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Stripe
    STRIPE_SECRET_KEY: str = ""
    STRIPE_PUBLISHABLE_KEY: str = ""
    STRIPE_WEBHOOK_SECRET: str = ""
    STRIPE_STARTER_PRICE_ID: str = ""
    STRIPE_PRO_PRICE_ID: str = ""
    STRIPE_ENTERPRISE_PRICE_ID: str = ""
    STRIPE_STARTER_ANNUAL_PRICE_ID: str = ""
    STRIPE_PRO_ANNUAL_PRICE_ID: str = ""
    STRIPE_ENTERPRISE_ANNUAL_PRICE_ID: str = ""

    # Email
    RESEND_API_KEY: str = ""
    FROM_EMAIL: str = "noreply@example.com"

    # Google OAuth
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""

    # Frontend
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: str = ""
    NEXT_PUBLIC_APP_NAME: str = "SaaS Starter Kit"

    model_config = {"env_file": ".env", "extra": "ignore"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
