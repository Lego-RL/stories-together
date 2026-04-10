from sqlalchemy import or_, select
from sqlalchemy.orm import selectinload

from ..db.models import User
from ..db.session import SessionLocal


async def create_user(user_data: dict) -> User:
    async with SessionLocal() as db:
        new_user = User(**user_data)
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user


async def get_user_by_username_or_email(username: str, email: str) -> User | None:
    async with SessionLocal() as db:
        query = select(User).where(or_(User.username == username, User.email == email))
        result = await db.execute(query)
        return result.scalar_one_or_none()


async def get_user_by_username(username: str) -> User | None:
    async with SessionLocal() as db:
        query = select(User).where(User.username == username)
        result = await db.execute(query)
        return result.scalar_one_or_none()


async def get_all_users() -> list[User]:
    async with SessionLocal() as db:
        result = await db.execute(select(User))
        return result.scalars().all()


async def get_user_with_content(user_id: int) -> User | None:
    async with SessionLocal() as db:
        result = await db.execute(
            select(User)
            .options(selectinload(User.stories), selectinload(User.passages))
            .where(User.id == user_id)
        )
        return result.scalar_one_or_none()


async def update_user_active(user_id: int, active: bool) -> User | None:
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.active = active
            await db.commit()
            await db.refresh(user)
        return user


async def update_user_role(user_id: int, role: str) -> User | None:
    async with SessionLocal() as db:
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalar_one_or_none()
        if user:
            user.role = role
            await db.commit()
            await db.refresh(user)
        return user
