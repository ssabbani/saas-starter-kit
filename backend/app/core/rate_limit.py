import time
from collections import defaultdict

from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.responses import JSONResponse

from .security import decode_token

# Requests per minute by plan
PLAN_RATE_LIMITS = {
    "free": 10,
    "starter": 60,
    "pro": 200,
    "enterprise": 1000,
}
UNAUTH_RATE_LIMIT = 20

SKIP_PATHS = {"/api/billing/webhooks/stripe", "/health"}


class RateLimitEntry:
    __slots__ = ("tokens", "last_refill")

    def __init__(self, limit: int):
        self.tokens = limit
        self.last_refill = time.monotonic()


class RateLimiter:
    def __init__(self):
        self._buckets: dict[str, RateLimitEntry] = defaultdict(lambda: RateLimitEntry(UNAUTH_RATE_LIMIT))
        self._limits: dict[str, int] = {}

    def _refill(self, key: str, limit: int) -> RateLimitEntry:
        bucket = self._buckets[key]
        now = time.monotonic()
        elapsed = now - bucket.last_refill
        if elapsed >= 60:
            bucket.tokens = limit
            bucket.last_refill = now
        elif bucket.tokens < limit:
            refill = int(elapsed / 60 * limit)
            if refill > 0:
                bucket.tokens = min(limit, bucket.tokens + refill)
                bucket.last_refill = now
        self._limits[key] = limit
        return bucket

    def check(self, key: str, limit: int) -> tuple[bool, int, int, int]:
        """Returns (allowed, limit, remaining, reset_seconds)."""
        bucket = self._refill(key, limit)
        remaining = max(bucket.tokens - 1, 0)
        reset = max(0, int(60 - (time.monotonic() - bucket.last_refill)))

        if bucket.tokens <= 0:
            return False, limit, 0, reset

        bucket.tokens -= 1
        return True, limit, remaining, reset


rate_limiter = RateLimiter()


class RateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        if request.url.path in SKIP_PATHS:
            return await call_next(request)

        # Determine identity and plan
        key, plan = self._identify(request)
        limit = PLAN_RATE_LIMITS.get(plan, UNAUTH_RATE_LIMIT) if plan else UNAUTH_RATE_LIMIT

        allowed, limit_val, remaining, reset = rate_limiter.check(key, limit)

        if not allowed:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded"},
                headers={
                    "Retry-After": str(reset),
                    "X-RateLimit-Limit": str(limit_val),
                    "X-RateLimit-Remaining": "0",
                    "X-RateLimit-Reset": str(reset),
                },
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(limit_val)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        response.headers["X-RateLimit-Reset"] = str(reset)
        return response

    def _identify(self, request: Request) -> tuple[str, str | None]:
        # Try API key first
        api_key = request.headers.get("X-API-Key")
        if api_key:
            return f"apikey:{api_key}", None  # plan resolved below

        # Try Bearer token
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
            payload = decode_token(token)
            if payload and payload.get("sub"):
                role = payload.get("role", "")
                # Store user_id as key; plan will be fetched from token role
                # We use a simple heuristic: role is in the token but plan isn't,
                # so we fall back to default. The usage_middleware sets the plan.
                return f"user:{payload['sub']}", request.state.user_plan if hasattr(request.state, "user_plan") else None

        # Fall back to IP
        client_ip = request.client.host if request.client else "unknown"
        return f"ip:{client_ip}", None
