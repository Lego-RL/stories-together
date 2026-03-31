from app.db.models import Passage
from app.db.session import SessionLocal
from app.schemas.passage import PassageRead
from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import aliased


async def create_passage(
    story_id: int, content: str, parent_passage_id: int, author_id: int
) -> Passage:
    """
    Uses passage information to create new passage & add to the database.
    """
    async with SessionLocal() as db:
        # ensure parent passage exists, is tied to same story
        query = select(Passage).where(
            Passage.id == parent_passage_id, Passage.story_id == story_id
        )
        result = await db.execute(query)
        parent = result.scalar_one_or_none()

        if not parent:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Parent passage not found or does not belong to this story.",
            )

        # create new passage
        new_passage = Passage(
            content=content,
            story_id=story_id,
            parent_passage_id=parent_passage_id,
            author_id=author_id,
        )
        db.add(new_passage)
        await db.commit()
        await db.refresh(new_passage)

        # convert to pydantic model while db session is active
        return PassageRead.model_validate(new_passage)


async def get_passage_path(passage_id: int) -> list[PassageRead]:
    """
    Return a list of passages in linear, chronological order.
    """
    async with SessionLocal() as db:
        # use recursive CTE to construct entire passage path
        # start with the specific passage requested
        recursive_cte = (
            select(Passage)
            .where(Passage.id == passage_id)
            .cte(name="passage_path", recursive=True)
        )

        # join the CTE with the Passage table to find parent passages
        recursive_cte = recursive_cte.union_all(
            select(Passage).join(
                recursive_cte, Passage.id == recursive_cte.c.parent_passage_id
            )
        )

        # map CTE to the Passage model
        passage_alias = aliased(Passage, recursive_cte)

        # order by created_at so the list is in chronological order
        query = select(passage_alias).order_by(passage_alias.created_at.asc())
        result = await db.execute(query)

        passages = result.scalars().all()

        return [PassageRead.model_validate(p) for p in passages]


async def get_story_tree(story_id: int) -> list[PassageRead]:
    """
    Return a list of passages representing the entire tree-structured story.
    """
    async with SessionLocal() as db:
        # retrieve all passages for this story
        query = (
            select(Passage)
            .where(Passage.story_id == story_id)
            .order_by(Passage.created_at.asc())
        )
        result = await db.execute(query)
        passages = result.scalars().all()

        if not passages:
            return []

        passage_map = {p.id: PassageRead.model_validate(p) for p in passages}
        root_nodes = []

        # build tree of passages for this story
        for p_id, p_schema in passage_map.items():
            if p_schema.parent_passage_id is None:
                root_nodes.append(p_schema)
            else:
                # retrieve parent passage
                parent = passage_map.get(p_schema.parent_passage_id)
                if parent:
                    # add this passage to child list of its parent
                    parent.children.append(p_schema)

        return root_nodes
