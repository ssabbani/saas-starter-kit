import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import api_router
from app.core.config import get_settings
from app.core.error_handlers import RequestIdMiddleware, register_error_handlers
from app.core.rate_limit import RateLimitMiddleware
from app.core.usage_middleware import UsageTrackingMiddleware

settings = get_settings()
logger = logging.getLogger("uvicorn.error")


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("Starting %s in %s mode", settings.APP_NAME, settings.ENVIRONMENT)
    yield
    logger.info("Shutting down %s", settings.APP_NAME)


app = FastAPI(
    title=settings.APP_NAME,
    description="Production-ready SaaS backend with auth, billing, admin, and API key management.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# Register global exception handlers
register_error_handlers(app)

# Middleware ordering: last added = outermost.
# We want: CORS (outermost) → RequestId → RateLimit → UsageTracking → routes

# 1. Usage tracking (innermost middleware, closest to route handlers)
app.add_middleware(UsageTrackingMiddleware)

# 2. Rate limiting
app.add_middleware(RateLimitMiddleware)

# 3. Request ID
app.add_middleware(RequestIdMiddleware)

# 4. CORS (outermost — must see all response headers)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=[
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
        "X-Request-ID",
    ],
)

app.include_router(api_router, prefix="/api")


@app.get("/health", tags=["system"], summary="Health check")
async def health_check():
    """Returns 200 if the service is running. Use for uptime monitoring."""
    return {"status": "healthy", "app": settings.APP_NAME}
