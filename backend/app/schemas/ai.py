from pydantic import BaseModel, Field


class MentorRequest(BaseModel):
    question: str = Field(min_length=3, max_length=1000)
    context: dict[str, str] = Field(default_factory=dict)


class MentorResponse(BaseModel):
    answer: str
    recommended_actions: list[str]
    routed_agents: list[str]
