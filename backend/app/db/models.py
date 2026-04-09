import datetime
from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import (
    Boolean,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.orm import Mapped, declarative_base, mapped_column, relationship
from sqlalchemy.sql import expression

Base = declarative_base()


class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str


class TokenData(BaseModel):
    username: str | None = None


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    username: Mapped[str] = mapped_column(String(50), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    hashed_password: Mapped[str] = mapped_column(String(255))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    active: Mapped[bool] = mapped_column(
        Boolean, server_default=expression.true(), default=True, nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), server_default=text("user"), default="user", nullable=False
    )

    # relationships
    stories: Mapped[List["Story"]] = relationship(back_populates="creator")
    passages: Mapped[List["Passage"]] = relationship(back_populates="author")


class Story(Base):
    __tablename__ = "stories"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    description: Mapped[Optional[str]] = mapped_column(String(500))
    creator_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    # relationships
    creator: Mapped["User"] = relationship(back_populates="stories")
    passages: Mapped[List["Passage"]] = relationship(
        back_populates="story", cascade="all, delete-orphan"
    )

    __table_args__ = (
        Index(
            "idx_stories_title_trgm",
            "title",
            postgresql_using="gin",
            postgresql_ops={"title": "gin_trgm_ops"},
        ),
    )


class Passage(Base):
    __tablename__ = "passages"

    id: Mapped[int] = mapped_column(primary_key=True)
    content: Mapped[str] = mapped_column(Text)

    story_id: Mapped[int] = mapped_column(ForeignKey("stories.id"), index=True)
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # self-referencing foreign Key for story having branching paths
    parent_passage_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("passages.id"), index=True
    )

    created_at: Mapped[datetime.datetime] = mapped_column(
        DateTime, server_default=func.now()
    )

    # relationships
    story: Mapped["Story"] = relationship(back_populates="passages")
    author: Mapped["User"] = relationship(back_populates="passages")

    # self-referencing relationships
    # 'children' are all passages that directly follow this one
    children: Mapped[List["Passage"]] = relationship("Passage", back_populates="parent")
    parent: Mapped[Optional["Passage"]] = relationship(
        "Passage", back_populates="children", remote_side=[id]
    )
