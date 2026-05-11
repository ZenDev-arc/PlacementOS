from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import StudySession
from app.database.session import get_db
from app.schemas.study_sessions import StudySessionCreate, StudySessionRead
from app.services.user_context import get_demo_user

router = APIRouter()


@router.get("", response_model=list[StudySessionRead])
async def list_study_sessions(db: Session = Depends(get_db)) -> list[StudySession]:
    user = get_demo_user(db)
    return list(
        db.scalars(
            select(StudySession)
            .where(StudySession.user_id == user.id)
            .order_by(StudySession.studied_on.desc(), StudySession.id.desc())
        )
    )


@router.post("", response_model=StudySessionRead, status_code=status.HTTP_201_CREATED)
async def create_study_session(payload: StudySessionCreate, db: Session = Depends(get_db)) -> StudySession:
    user = get_demo_user(db)
    data = payload.model_dump()
    if data["studied_on"] is None:
        data["studied_on"] = date.today()
    session = StudySession(user_id=user.id, **data)
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
