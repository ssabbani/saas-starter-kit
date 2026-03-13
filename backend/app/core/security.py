import secrets
from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext

from .config import get_settings

settings = get_settings()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(user_id: int, role: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return jwt.encode(
        {"sub": str(user_id), "role": role, "exp": expire, "type": "access"},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def create_refresh_token(user_id: int) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return jwt.encode(
        {"sub": str(user_id), "exp": expire, "type": "refresh"},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
    except JWTError:
        return None


def generate_api_key() -> str:
    return "sk_" + secrets.token_urlsafe(32)


def create_email_token(email: str, purpose: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)
    return jwt.encode(
        {"sub": email, "purpose": purpose, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )


def decode_email_token(token: str, expected_purpose: str) -> str | None:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.JWT_ALGORITHM])
        if payload.get("purpose") != expected_purpose:
            return None
        return payload.get("sub")
    except JWTError:
        return None
