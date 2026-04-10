from typing import List
from datetime import datetime
from pydantic import BaseModel, ConfigDict
from app.schemas.story import StoryRead
from app.schemas.passage import PassageRead


class UserRegister(BaseModel):
    username: str
    email: str
    password: str


class UserView(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    username: str
    email: str


class UserAdminView(UserView):
    id: int
    role: str
    active: bool
    created_at: datetime


class UserContentView(UserView):
    stories: List[StoryRead] = []
    passages: List[PassageRead] = []
