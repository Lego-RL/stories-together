from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, ConfigDict


class PassageCreate(BaseModel):
    """
    Represents passage data (no metadata.)
    Fields:
    - content
    - parent_passage_id
    """

    content: str
    parent_passage_id: int


class PassageRead(BaseModel):
    """
    Represents a passage's metadata & data.
    Fields:
    - id
    - content
    - author_id
    - story_id
    - parent_passage_id
    - created_at
    """
    id: int
    content: str
    author_id: int
    story_id: int
    parent_passage_id: Optional[int]
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)

class PassageTree(PassageRead):
    """
    Represents not only a single passage, but all attached sub-passages as well.
    """
    children: List["PassageTree"] = []