from typing import List

from pydantic import BaseModel


class RecentStats(BaseModel):
    stories_created: int
    passages_created: int
    user_registrations: int
    total_contributions: int


class TopContributor(BaseModel):
    user_id: int
    username: str
    story_count: int
    passage_count: int
    total_contributions: int


class StatsSummary(BaseModel):
    total_stories: int
    total_passages: int
    active_users: int
    recent_stats: RecentStats
    top_contributors: List[TopContributor]
