from app.db.models import Passage, User
from app.db.session import SessionLocal
from app.schemas.passage import PassageRead, PassageTree
from fastapi import HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import aliased

# CREATE functionality


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

        # Set author_username for the response
        author = await db.execute(select(User.username).where(User.id == author_id))
        new_passage.author_username = author.scalar_one()

        # convert to pydantic model while db session is active
        return PassageRead.model_validate(new_passage)


# READ functionality


async def get_passage_path(passage_id: int) -> list[PassageRead]:
    """
    Return a list of passages in linear, chronological order.
    """
    async with SessionLocal() as db:
        # use recursive CTE to construct entire passage path
        # start with the specific passage requested
        recursive_cte = (
            select(Passage, User.username.label("author_username"))
            .join(User, Passage.author_id == User.id)
            .where(Passage.id == passage_id)
            .cte(name="passage_path", recursive=True)
        )

        # join the CTE with the Passage table to find parent passages
        recursive_cte = recursive_cte.union_all(
            select(Passage, User.username.label("author_username"))
            .join(User, Passage.author_id == User.id)
            .join(recursive_cte, Passage.id == recursive_cte.c.parent_passage_id)
        )

        # map CTE to the Passage model
        passage_alias = aliased(Passage, recursive_cte)

        # order by created_at so the list is in chronological order
        query = select(passage_alias, recursive_cte.c.author_username).order_by(
            passage_alias.created_at.asc()
        )
        result = await db.execute(query)

        rows = result.all()
        passages = []
        for row in rows:
            passage, author_username = row
            passage.author_username = author_username
            passages.append(PassageRead.model_validate(passage))

        return passages


async def get_story_tree(story_id: int) -> list[PassageTree]:
    """
    Return a list of passages representing the entire tree-structured story.
    """
    async with SessionLocal() as db:
        # retrieve all passages for this story
        query = (
            select(Passage, User.username.label("author_username"))
            .join(User, Passage.author_id == User.id)
            .where(Passage.story_id == story_id)
            .order_by(Passage.created_at.asc())
        )
        result = await db.execute(query)
        rows = result.all()

        passages = []
        for row in rows:
            passage, author_username = row
            passage.author_username = author_username
            passages.append(passage)

        if not passages:
            return []

        # initially validate as `PassageRead` so that SQLAlchemy doesn't
        # attempt to lazy-load `PassageTree`'s `children` attribute
        passage_map = {
            p.id: PassageTree(**PassageRead.model_validate(p).model_dump())
            for p in passages
        }

        root_nodes = []

        # build tree of passages for this story
        for p_id, p_schema in passage_map.items():
            if p_schema.parent_passage_id is None:
                root_nodes.append(p_schema)
            else:
                # retrieve parent passage from the map
                parent = passage_map.get(p_schema.parent_passage_id)
                if parent:
                    # add this passage to child list of its parent
                    parent.children.append(p_schema)

        return root_nodes


# DELETE functionality


async def delete_passage_by_id(id: int) -> int:
    """
    Delete story with matching `id`.
    Due to "ON DELETE CASCADE" constraint, associated passages will also be deleted.
    """
    async with SessionLocal() as db:
        stmt = delete(Passage).where(Passage.id == id)
        result = await db.execute(stmt)

        await db.commit()
        return result.rowcount
