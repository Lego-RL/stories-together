from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class StoryBase(BaseModel):
    """
    Represents basic information every story requires.
    Fields:
    - title
    - description
    """

    title: str = Field(
        ...,
        min_length=5,
        max_length=100,
        description="Give your story a good title or else",
    )
    description: Optional[str] = Field(None, max_length=500)


class StoryCreate(StoryBase):
    """
    Represents story data (no metadata.)
    Fields:
    - title
    - description
    - first_passage_content
    """

    first_passage_content: str = Field(..., min_length=30, max_length=5000)


class StoryRead(StoryBase):
    """
    Represents a story's complete metadata & data.
    Fields:
    - id
    - creator_id
    - created_at
    - title
    - description
    """

    model_config = ConfigDict(from_attributes=True)
    id: int
    creator_id: int
    created_at: datetime
