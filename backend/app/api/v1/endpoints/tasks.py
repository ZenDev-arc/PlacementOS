from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import Task
from app.database.session import get_db
from app.schemas.tasks import TaskCreate, TaskRead
from app.services.user_context import get_demo_user

router = APIRouter()


@router.get("", response_model=list[TaskRead])
async def list_tasks(db: Session = Depends(get_db)) -> list[Task]:
    user = get_demo_user(db)
    return list(db.scalars(select(Task).where(Task.user_id == user.id).order_by(Task.due_date, Task.id)))


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
async def create_task(payload: TaskCreate, db: Session = Depends(get_db)) -> Task:
    user = get_demo_user(db)
    task = Task(user_id=user.id, **payload.model_dump())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
