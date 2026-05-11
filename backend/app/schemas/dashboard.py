from pydantic import BaseModel, Field


class MetricCard(BaseModel):
    label: str
    value: str
    delta: str
    tone: str = Field(pattern="^(positive|warning|neutral)$")


class FocusItem(BaseModel):
    title: str
    category: str
    priority: str
    due: str


class DashboardSnapshot(BaseModel):
    user_name: str
    readiness_score: int = Field(ge=0, le=100)
    streak_days: int = Field(ge=0)
    study_hours_week: float = Field(ge=0)
    metrics: list[MetricCard]
    focus_queue: list[FocusItem]
    weak_topics: list[str]
    application_pipeline: dict[str, int]
