import logging
import uuid

import stripe
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import NoResultFound
from starlette.middleware.base import BaseHTTPMiddleware

logger = logging.getLogger("uvicorn.error")


class RequestIdMiddleware(BaseHTTPMiddleware):
    """Adds X-Request-ID header to every response."""

    async def dispatch(self, request: Request, call_next):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.state.request_id = request_id
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        return response


def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(ValueError)
    async def value_error_handler(request: Request, exc: ValueError):
        return JSONResponse(
            status_code=400,
            content={
                "detail": str(exc),
                "code": "BAD_REQUEST",
            },
            headers=_request_id_header(request),
        )

    @app.exception_handler(PermissionError)
    async def permission_error_handler(request: Request, exc: PermissionError):
        return JSONResponse(
            status_code=403,
            content={
                "detail": str(exc) or "Forbidden",
                "code": "FORBIDDEN",
            },
            headers=_request_id_header(request),
        )

    @app.exception_handler(NoResultFound)
    async def not_found_handler(request: Request, exc: NoResultFound):
        return JSONResponse(
            status_code=404,
            content={
                "detail": "Resource not found",
                "code": "NOT_FOUND",
            },
            headers=_request_id_header(request),
        )

    @app.exception_handler(stripe.StripeError)
    async def stripe_error_handler(request: Request, exc: stripe.StripeError):
        logger.error("Stripe error: %s", exc, exc_info=True)
        status = 502
        if isinstance(exc, stripe.InvalidRequestError):
            status = 400
        elif isinstance(exc, stripe.AuthenticationError):
            status = 401
        elif isinstance(exc, stripe.PermissionError):
            status = 403
        elif isinstance(exc, stripe.RateLimitError):
            status = 429
        return JSONResponse(
            status_code=status,
            content={
                "detail": str(exc.user_message or "Payment service error"),
                "code": "STRIPE_ERROR",
            },
            headers=_request_id_header(request),
        )

    @app.exception_handler(Exception)
    async def generic_error_handler(request: Request, exc: Exception):
        request_id = getattr(request.state, "request_id", "unknown")
        logger.error(
            "Unhandled exception [request_id=%s]: %s",
            request_id,
            exc,
            exc_info=True,
        )
        return JSONResponse(
            status_code=500,
            content={
                "detail": "An internal error occurred. Please try again later.",
                "code": "INTERNAL_ERROR",
            },
            headers=_request_id_header(request),
        )


def _request_id_header(request: Request) -> dict[str, str]:
    rid = getattr(request.state, "request_id", None)
    return {"X-Request-ID": rid} if rid else {}
