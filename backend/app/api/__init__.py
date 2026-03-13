from fastapi import APIRouter

from . import auth, users, billing, admin

api_router = APIRouter()
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(billing.router, prefix="/billing", tags=["billing"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
