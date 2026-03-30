from sqlalchemy import or_, select

from ..db.models import User
from ..db.session import SessionLocal


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


async def create_user(user_data: dict) -> User:
    async with SessionLocal() as db:
        new_user = User(**user_data)
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user
