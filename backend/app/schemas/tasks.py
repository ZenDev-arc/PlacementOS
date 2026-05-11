from datetime import date

from pydantic import BaseModel, Field

from app.database.models import TaskPriority, TaskStatus


class TaskBase(BaseModel):
    title: str = Field(min_length=2, max_length=180)
    category: str = Field(default="General", max_length=80)
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    due_date: date | None = None


class TaskCreate(TaskBase):
    pass


class TaskRead(TaskBase):
    id: int

    model_config = {"from_attributes": True}
