from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict


class StoryBase(BaseModel):
    """
    Represents basic information every story requires.
    Fields:
    - title
    - description
    """

    title: str
    description: Optional[str] = None


class StoryCreate(StoryBase):
    """
    Represents story data (no metadata.)
    Fields:
    - title
    - description
    - first_passage_content
    """

    first_passage_content: str


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


# info needed to read a story's passage
class PassageRead(BaseModel):
    """
    Represents a passage's complete metadata & data.
    Fields:
    - id
    - content
    - author_id
    - story_id
    - parent_passage_id
    - created_at
    """

    model_config = ConfigDict(from_attributes=True)
    id: int
    content: str
    author_id: int
    story_id: int
    parent_passage_id: Optional[int] = None
    created_at: datetime
