from datetime import date

from pydantic import BaseModel, Field


class StudySessionBase(BaseModel):
    subject: str = Field(min_length=2, max_length=80)
    minutes: int = Field(gt=0, le=1440)
    studied_on: date | None = None
    notes: str = ""


class StudySessionCreate(StudySessionBase):
    pass


class StudySessionRead(BaseModel):
    id: int
    subject: str
    minutes: int
    studied_on: date
    notes: str

    model_config = {"from_attributes": True}
