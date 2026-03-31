from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional


class StoryBase(BaseModel):
    title: str
    description: Optional[str] = None

class StoryCreate(StoryBase):
    first_passage_content: str

# info needed to show a user a story
class StoryRead(StoryBase):
    model_config = ConfigDict(from_attributes=True)
    id: int
    creator_id: int
    created_at: datetime

# info needed to read a story's passage
class PassageRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: int
    content: str
    author_id: int
    story_id: int
    parent_passage_id: Optional[int] = None
    created_at: datetime