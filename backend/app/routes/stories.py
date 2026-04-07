from typing import Annotated, List

from app.db.models import User
from app.exceptions import EntityNotFoundException
from app.repositories import passage as passage_repo
from app.repositories import story as story_repo
from app.repositories.auth import get_current_user
from app.schemas.passage import PassageCreate, PassageRead, PassageTree
from app.schemas.story import StoryCreate, StoryRead
from fastapi import APIRouter, Depends, HTTPException, status

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


@story_router.get("/search", response_model=List[StoryRead])
async def search_stories(q: str):
    if len(q) < 3:
        return []
    return await story_repo.search_stories_by_title(query=q)


@story_router.get("/{id}", response_model=StoryRead)
async def get_story_details(id: int):
    """
    Returns the metadata (title, description) for a specific story.
    """
    story = await story_repo.get_one_story(id)

    if not story:
        raise EntityNotFoundException(entity_name="Story", entity_id=id)

    return story


@story_router.get("/", response_model=List[StoryRead])
async def list_stories(skip: int = 0, limit: int = 10):
    return await story_repo.get_all_stories(skip=skip, limit=limit)


@story_router.post(
    "/{id}/passages", response_model=PassageRead, status_code=status.HTTP_201_CREATED
)
async def add_passage_to_story(
    id: int,
    passage_in: PassageCreate,
    current_user: Annotated[User, Depends(get_current_user)],
):
    return await passage_repo.create_passage(
        story_id=id,
        content=passage_in.content,
        parent_passage_id=passage_in.parent_passage_id,
        author_id=current_user.id,
    )


@story_router.get("/passages/{passage_id}/path", response_model=List[PassageRead])
async def get_passage_linear_path(passage_id: int):
    """
    Returns the chronological list of passages leading up to (and including)
    the specified passage_id.
    """
    path = await passage_repo.get_passage_path(passage_id=passage_id)
    if not path:
        raise HTTPException(status_code=404, detail="Passage path not found")
    return path


@story_router.get("/{id}/tree", response_model=List[PassageTree])
async def get_story_narrative_tree(id: int):
    return await passage_repo.get_story_tree(story_id=id)
