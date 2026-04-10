from datetime import datetime
from typing import List

from app.schemas.passage import PassageRead
from app.schemas.story import StoryRead
from pydantic import BaseModel, ConfigDict


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


class UserContentView(UserAdminView):
    stories: List[StoryRead] = []
    passages: List[PassageRead] = []


class UserActiveUpdate(BaseModel):
    active: bool


class UserRoleUpdate(BaseModel):
    role: str
