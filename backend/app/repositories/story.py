from app.db.models import Passage, Story
from app.db.session import SessionLocal
from sqlalchemy import func, select


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
        return new_story


async def get_one_story(id: int):
    """
    Retrieve a single story's title and description
    """

    async with SessionLocal() as db:
        query = (select(Story).where(Story.id == id))

        result = await db.execute(query)
        return result.scalar_one_or_none()


async def get_all_stories(skip: int = 0, limit: int = 10):
    async with SessionLocal() as db:
        query = (
            select(Story).offset(skip).limit(limit).order_by(Story.created_at.desc())
        )
        result = await db.execute(query)
        return result.scalars().all()


async def search_stories_by_title(query: str, limit: int = 5):
    async with SessionLocal() as db:
        stmt = (
            select(Story)
            .where(Story.title.ilike(f"%{query}%"))
            .order_by(
                func.similarity(Story.title, query).desc()
            )  # Use similarity function from pg_trgm postgres extension
            .limit(limit)
        )

        result = await db.execute(stmt)
        return result.scalars().all()
