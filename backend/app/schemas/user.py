from typing import List
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


class UserContentView(UserView):
    stories: List[StoryRead] = []
    passages: List[PassageRead] = []
