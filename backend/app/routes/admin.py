from typing import List

from app.repositories import user as user_repo
from app.repositories.auth import require_role
from app.schemas.user import UserAdminView, UserContentView, UserView
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
