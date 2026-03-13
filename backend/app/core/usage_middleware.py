import asyncio
import logging

from fastapi import Request, Response
from sqlalchemy import select
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from .database import async_session
from .security import decode_token

logger = logging.getLogger("uvicorn.error")

SKIP_PATHS = {"/health", "/api/billing/webhooks/stripe"}


class UsageTrackingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Extract user plan before response (for rate limiter)
        user_id, plan = self._extract_user(request)
        if plan:
            request.state.user_plan = plan

        response = await call_next(request)

        # Track API usage in background for authenticated, successful requests
        if (
            user_id
            and response.status_code < 400
            and request.url.path not in SKIP_PATHS
        ):
            asyncio.create_task(self._increment_usage(user_id))

        return response

    def _extract_user(self, request: Request) -> tuple[int | None, str | None]:
        auth = request.headers.get("Authorization", "")
        if not auth.startswith("Bearer "):
            return None, None
        payload = decode_token(auth[7:])
        if not payload or not payload.get("sub"):
            return None, None
        # We need the plan from the DB, but we don't want to block.
        # The role is in the token; we'll look up the plan in the bg task.
        return int(payload["sub"]), None

    @staticmethod
    async def _increment_usage(user_id: int) -> None:
        from app.models.tracking import UsageRecord
        from app.models.user import User

        try:
            async with async_session() as db:
                # Also set the plan on the request state for rate limiting
                user_result = await db.execute(select(User.plan).where(User.id == user_id))
                row = user_result.first()

                result = await db.execute(
                    select(UsageRecord).where(
                        UsageRecord.user_id == user_id,
                        UsageRecord.metric_name == "api_calls",
                    )
                )
                record = result.scalar_one_or_none()
                if record:
                    record.count += 1
                    await db.commit()
        except Exception:
            logger.debug("Failed to increment usage for user %s", user_id)
