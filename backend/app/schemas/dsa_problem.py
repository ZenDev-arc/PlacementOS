from datetime import date

from pydantic import BaseModel, Field

from app.database.models import DsaDifficulty


class DsaProblemBase(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    topic: str = Field(min_length=2, max_length=80)
    difficulty: DsaDifficulty = DsaDifficulty.MEDIUM
    platform: str = Field(default="LeetCode", max_length=80)
    solved_on: date | None = None
    confidence: float = Field(default=0.5, ge=0, le=1)
    needs_revision: int = Field(default=1, ge=0, le=1)


class DsaProblemCreate(DsaProblemBase):
    pass


class DsaProblemRead(DsaProblemBase):
    id: int

    model_config = {"from_attributes": True}
