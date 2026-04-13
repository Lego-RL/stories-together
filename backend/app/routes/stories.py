from typing import Annotated, List

from app.db.models import User
from app.exceptions import EntityNotFoundException
from app.repositories import passage as passage_repo
from app.repositories import story as story_repo
from app.repositories.auth import get_current_user
from app.schemas.passage import PassageCreate, PassageRead, PassageTree
from app.schemas.story import StoryCreate, StoryRead
from app.services.activity_log import log_activity
from app.services.rate_limiter import rate_limiter
from fastapi import APIRouter, Depends, HTTPException, Request, status

story_router = APIRouter(prefix="/stories", tags=["stories"])


@story_router.post("/", response_model=StoryRead, status_code=status.HTTP_201_CREATED)
async def create_new_story(
    story_in: StoryCreate,
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
):
    ip_address = rate_limiter.get_client_ip(request)
    allowed, retry_after = await rate_limiter.check_story_creation_limit(
        current_user.id
    )
    if not allowed:
        log_activity(
            action="story_creation",
            ip_address=ip_address,
            user_id=current_user.id,
            success=False,
            detail="story_limit_exceeded",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Story creation limit reached. You can create up to 3 stories per day.",
            headers={"Retry-After": str(retry_after)},
        )

    story = await story_repo.create_story_with_first_passage(
        title=story_in.title,
        description=story_in.description,
        first_passage_content=story_in.first_passage_content,
        creator_id=current_user.id,
    )
    log_activity(
        action="story_creation",
        ip_address=ip_address,
        user_id=current_user.id,
        success=True,
    )
    return story


@story_router.get("/search", response_model=List[StoryRead])
async def search_stories(q: str, skip: int = 0, limit: int = 20):
    if len(q) < 3:
        return []
    return await story_repo.search_stories_by_title(query=q, skip=skip, limit=limit)


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
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)],
):
    ip_address = rate_limiter.get_client_ip(request)
    allowed, retry_after = await rate_limiter.check_passage_creation_limit(
        current_user.id
    )
    if not allowed:
        log_activity(
            action="passage_creation",
            ip_address=ip_address,
            user_id=current_user.id,
            success=False,
            detail="passage_limit_exceeded",
        )
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Passage creation limit reached. You can create up to 30 passages per day.",
            headers={"Retry-After": str(retry_after)},
        )

    passage = await passage_repo.create_passage(
        story_id=id,
        content=passage_in.content,
        parent_passage_id=passage_in.parent_passage_id,
        author_id=current_user.id,
    )
    log_activity(
        action="passage_creation",
        ip_address=ip_address,
        user_id=current_user.id,
        success=True,
    )
    return passage


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
