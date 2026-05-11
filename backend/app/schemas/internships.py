from datetime import date

from pydantic import BaseModel, Field

from app.database.models import ApplicationStatus


class InternshipApplicationBase(BaseModel):
    company: str = Field(min_length=2, max_length=140)
    role: str = Field(min_length=2, max_length=140)
    status: ApplicationStatus = ApplicationStatus.APPLIED
    applied_on: date | None = None
    source: str = Field(default="Manual", max_length=120)
    notes: str = ""


class InternshipApplicationCreate(InternshipApplicationBase):
    pass


class InternshipApplicationRead(InternshipApplicationBase):
    id: int

    model_config = {"from_attributes": True}
