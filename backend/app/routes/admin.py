from typing import List

from app.repositories import statistics as stats_repo
from app.repositories import user as user_repo
from app.repositories.auth import require_role
from app.schemas.statistics import StatsSummary
from app.schemas.user import (
    UserActiveUpdate,
    UserAdminView,
    UserContentView,
    UserRoleUpdate,
)
from fastapi import APIRouter, Depends, HTTPException, status

# admin only endpoints
admin_router = APIRouter(
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_role("admin"))],
)


@admin_router.get(
    "/users",
    response_model=List[UserAdminView],
)
async def get_users():
    """
    Lists all registered users.
    """
    return await user_repo.get_all_users()


@admin_router.get(
    "/users/{id}",
    response_model=UserContentView,
)
async def view_user_content(id: int):
    """
    View a user's created stories and passages.
    """
    user = await user_repo.get_user_with_content(id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


@admin_router.get(
    "/stats",
    response_model=StatsSummary,
)
async def get_stats():
    """
    Get application statistics summary.
    """
    return await stats_repo.get_stats_summary()


@admin_router.put(
    "/users/{id}/active",
)
async def update_user_active(id: int, update: UserActiveUpdate):
    """
    Update a user's active status.
    """
    user = await user_repo.update_user_active(id, update.active)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return {"message": "User active status updated"}


@admin_router.put(
    "/users/{id}/role",
)
async def update_user_role(id: int, update: UserRoleUpdate):
    """
    Update a user's role.
    """
    user = await user_repo.update_user_role(id, update.role)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return {"message": "User role updated"}
