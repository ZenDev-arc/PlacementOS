from pydantic import BaseModel, Field


class TopicProgress(BaseModel):
    topic: str
    solved: int = Field(ge=0)
    target: int = Field(gt=0)
    mastery: int = Field(ge=0, le=100)


class DsaInsight(BaseModel):
    solved_total: int = Field(ge=0)
    weekly_target: int = Field(gt=0)
    recommended_next: list[str]
    weak_topics: list[str]
    topic_progress: list[TopicProgress]
