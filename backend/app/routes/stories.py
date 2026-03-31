from typing import Annotated, List

from app.db.models import User
from app.repositories import story as story_repo
from app.repositories.auth import get_current_user
from app.schemas.story import StoryCreate, StoryRead
from fastapi import APIRouter, Depends, status

story_router = APIRouter(prefix="/stories", tags=["stories"])


@story_router.post("/", response_model=StoryRead, status_code=status.HTTP_201_CREATED)
async def create_new_story(
    story_in: StoryCreate, current_user: Annotated[User, Depends(get_current_user)]
):
    return await story_repo.create_story_with_first_passage(
        title=story_in.title,
        description=story_in.description,
        first_passage_content=story_in.first_passage_content,
        creator_id=current_user.id,
    )


@story_router.get("/", response_model=List[StoryRead])
async def list_stories(skip: int = 0, limit: int = 10):
    return await story_repo.get_all_stories(skip=skip, limit=limit)
