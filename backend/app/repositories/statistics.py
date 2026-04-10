import datetime
from typing import Any

from sqlalchemy import desc, func, select

from ..db.models import Passage, Story, User
from ..db.session import SessionLocal


async def get_total_stories() -> int:
    """
    Return a count of the total number of stories.
    """
    async with SessionLocal() as db:
        query = select(func.count()).select_from(Story)
        result = await db.execute(query)
        return result.scalar_one()


async def get_total_passages() -> int:
    """
    Return a count of the total number of passages.
    """
    async with SessionLocal() as db:
        query = select(func.count()).select_from(Passage)
        result = await db.execute(query)
        return result.scalar_one()


async def get_total_users(active_only: bool = True) -> int:
    """
    Return a count of the total number of *active* users.
    """
    async with SessionLocal() as db:
        query = select(func.count()).select_from(User)
        if active_only:
            query = query.where(User.active.is_(True))
        result = await db.execute(query)
        return result.scalar_one()


async def get_story_creations_since(cutoff: datetime.datetime) -> int:
    async with SessionLocal() as db:
        query = select(func.count()).select_from(Story).where(Story.created_at >= cutoff)
        result = await db.execute(query)
        return result.scalar_one()


async def get_passage_creations_since(cutoff: datetime.datetime) -> int:
    async with SessionLocal() as db:
        query = select(func.count()).select_from(Passage).where(Passage.created_at >= cutoff)
        result = await db.execute(query)
        return result.scalar_one()


async def get_user_registrations_since(cutoff: datetime.datetime) -> int:
    async with SessionLocal() as db:
        query = select(func.count()).select_from(User).where(User.created_at >= cutoff)
        result = await db.execute(query)
        return result.scalar_one()


async def get_contributions_last_24_hours() -> dict[str, int]:
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=24)
    stories_created = await get_story_creations_since(cutoff)
    passages_created = await get_passage_creations_since(cutoff)
    return {
        "stories_created": stories_created,
        "passages_created": passages_created,
        "user_registrations": await get_user_registrations_since(cutoff),
        "total_contributions": stories_created + passages_created,
    }


async def get_top_contributors(limit: int = 10) -> list[dict[str, Any]]:
    story_counts = (
        select(Story.creator_id.label("user_id"), func.count(Story.id).label("story_count"))
        .group_by(Story.creator_id)
        .subquery()
    )

    passage_counts = (
        select(Passage.author_id.label("user_id"), func.count(Passage.id).label("passage_count"))
        .group_by(Passage.author_id)
        .subquery()
    )

    total_contributions = (
        func.coalesce(story_counts.c.story_count, 0) + func.coalesce(passage_counts.c.passage_count, 0)
    ).label("total_contributions")

    query = (
        select(
            User.id.label("user_id"),
            User.username,
            func.coalesce(story_counts.c.story_count, 0).label("story_count"),
            func.coalesce(passage_counts.c.passage_count, 0).label("passage_count"),
            total_contributions,
        )
        .outerjoin(story_counts, story_counts.c.user_id == User.id)
        .outerjoin(passage_counts, passage_counts.c.user_id == User.id)
        .order_by(desc(total_contributions))
        .limit(limit)
    )

    async with SessionLocal() as db:
        result = await db.execute(query)
        rows = result.all()

    return [
        {
            "user_id": row.user_id,
            "username": row.username,
            "story_count": int(row.story_count or 0),
            "passage_count": int(row.passage_count or 0),
            "total_contributions": int(row.total_contributions or 0),
        }
        for row in rows
    ]


async def get_stats_summary(last_hours: int = 24) -> dict[str, Any]:
    cutoff = datetime.datetime.utcnow() - datetime.timedelta(hours=last_hours)
    story_count = await get_total_stories()
    passage_count = await get_total_passages()
    active_user_count = await get_total_users(active_only=True)
    recent_stories = await get_story_creations_since(cutoff)
    recent_passages = await get_passage_creations_since(cutoff)
    recent_registrations = await get_user_registrations_since(cutoff)
    top_contributors = await get_top_contributors(limit=10)

    return {
        "total_stories": story_count,
        "total_passages": passage_count,
        "active_users": active_user_count,
        "recent_stats": {
            "stories_created": recent_stories,
            "passages_created": recent_passages,
            "user_registrations": recent_registrations,
            "total_contributions": recent_stories + recent_passages,
        },
        "top_contributors": top_contributors,
    }
