from app.db.models import Passage, Story, User
from app.db.session import SessionLocal
from sqlalchemy import delete, func, select


def _hydrate_story_read_fields(
    story: Story,
    creator_username: str,
    first_passage_content: str | None,
    passage_count: int | None,
) -> Story:
    story.creator_username = creator_username
    story.first_passage_content = first_passage_content
    story.passage_count = int(passage_count or 0)
    return story


def _story_read_select():
    first_passage_content = (
        select(Passage.content)
        .where(Passage.story_id == Story.id, Passage.parent_passage_id.is_(None))
        .order_by(Passage.created_at.asc(), Passage.id.asc())
        .limit(1)
        .scalar_subquery()
    )

    passage_count = (
        select(func.count(Passage.id))
        .where(Passage.story_id == Story.id)
        .scalar_subquery()
    )

    return select(
        Story,
        User.username.label("creator_username"),
        first_passage_content.label("first_passage_content"),
        passage_count.label("passage_count"),
    ).join(User, Story.creator_id == User.id)


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
        new_story.first_passage_content = first_passage_content
        new_story.passage_count = 1

        return new_story


# READ functionality


async def get_one_story(id: int):
    """
    Retrieve a single story's title and description
    """

    async with SessionLocal() as db:
        query = _story_read_select().where(Story.id == id)

        result = await db.execute(query)
        row = result.first()
        if row:
            story, creator_username, first_passage_content, passage_count = row
            return _hydrate_story_read_fields(
                story,
                creator_username,
                first_passage_content,
                passage_count,
            )
        return None


async def get_all_stories(skip: int = 0, limit: int = 10):
    async with SessionLocal() as db:
        query = (
            _story_read_select()
            .offset(skip)
            .limit(limit)
            .order_by(Story.created_at.desc())
        )
        result = await db.execute(query)
        rows = result.all()
        stories = []
        for row in rows:
            story, creator_username, first_passage_content, passage_count = row
            stories.append(
                _hydrate_story_read_fields(
                    story,
                    creator_username,
                    first_passage_content,
                    passage_count,
                )
            )
        return stories


async def search_stories_by_title(query: str, skip: int = 0, limit: int = 20):
    async with SessionLocal() as db:
        stmt = (
            _story_read_select()
            .where(Story.title.ilike(f"%{query}%"))
            .order_by(
                func.similarity(Story.title, query).desc()
            )  # Use similarity function from pg_trgm postgres extension
            .offset(skip)
            .limit(limit)
        )

        result = await db.execute(stmt)
        rows = result.all()
        stories = []
        for row in rows:
            story, creator_username, first_passage_content, passage_count = row
            stories.append(
                _hydrate_story_read_fields(
                    story,
                    creator_username,
                    first_passage_content,
                    passage_count,
                )
            )
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
