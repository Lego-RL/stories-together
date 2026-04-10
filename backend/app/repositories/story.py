from app.db.models import Passage, Story, User
from app.db.session import SessionLocal
from sqlalchemy import delete, func, select

# CREATE functionality


async def create_story_with_first_passage(
    title: str, description: str | None, first_passage_content: str, creator_id: int
) -> Story:
    async with SessionLocal() as db:
        new_story = Story(title=title, description=description, creator_id=creator_id)
        db.add(new_story)

        # flush to populate new_story.id
        await db.flush()

        initial_passage = Passage(
            content=first_passage_content,
            story_id=new_story.id,
            author_id=creator_id,
            parent_passage_id=None,  # first passage, no parent
        )
        db.add(initial_passage)

        await db.commit()
        await db.refresh(new_story)

        # Set creator_username for the response
        creator = await db.execute(select(User.username).where(User.id == creator_id))
        new_story.creator_username = creator.scalar_one()

        return new_story


# READ functionality


async def get_one_story(id: int):
    """
    Retrieve a single story's title and description
    """

    async with SessionLocal() as db:
        query = (
            select(Story, User.username.label("creator_username"))
            .join(User, Story.creator_id == User.id)
            .where(Story.id == id)
        )

        result = await db.execute(query)
        row = result.first()
        if row:
            story, creator_username = row
            story.creator_username = creator_username
            return story
        return None


async def get_all_stories(skip: int = 0, limit: int = 10):
    async with SessionLocal() as db:
        query = (
            select(Story, User.username.label("creator_username"))
            .join(User, Story.creator_id == User.id)
            .offset(skip)
            .limit(limit)
            .order_by(Story.created_at.desc())
        )
        result = await db.execute(query)
        rows = result.all()
        stories = []
        for row in rows:
            story, creator_username = row
            story.creator_username = creator_username
            stories.append(story)
        return stories


async def search_stories_by_title(query: str, limit: int = 5):
    async with SessionLocal() as db:
        stmt = (
            select(Story, User.username.label("creator_username"))
            .join(User, Story.creator_id == User.id)
            .where(Story.title.ilike(f"%{query}%"))
            .order_by(
                func.similarity(Story.title, query).desc()
            )  # Use similarity function from pg_trgm postgres extension
            .limit(limit)
        )

        result = await db.execute(stmt)
        rows = result.all()
        stories = []
        for row in rows:
            story, creator_username = row
            story.creator_username = creator_username
            stories.append(story)
        return stories


# DELETE functionality
async def delete_story_by_id(id: int) -> int:
    """
    Delete story with matching `id`.
    Due to "ON DELETE CASCADE" constraint, associated passages will also be deleted.
    """
    async with SessionLocal() as db:
        stmt = delete(Story).where(Story.id == id)
        result = await db.execute(stmt)

        await db.commit()
        return result.rowcount
