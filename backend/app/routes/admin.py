from typing import List
from fastapi import APIRouter, HTTPException, status

from app.repositories import user as user_repo
from app.schemas.user import UserView, UserContentView

admin_router = APIRouter(prefix="/admin", tags=["admin"])


@admin_router.get("/users", response_model=List[UserView])
async def get_users():
    """
    Lists all registered users.
    """
    return await user_repo.get_all_users()


@admin_router.get("/users/{id}", response_model=UserContentView)
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
