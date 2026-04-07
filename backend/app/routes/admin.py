from fastapi import APIRouter
from ..schemas.user import UserView

admin_router = APIRouter(prefix="/admin", tags=["admin"])



@admin_router.get("/", response_model=UserView)
async def get_users():
    """
    Lists all registered users
    """

    
    

@admin_router.get("/users/{id}")
async def view_user_content(id: int):
    """
    View a user's created stories and passages
    """