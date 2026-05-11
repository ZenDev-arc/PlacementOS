from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import InternshipApplication
from app.database.session import get_db
from app.schemas.internships import InternshipApplicationCreate, InternshipApplicationRead
from app.services.user_context import get_demo_user

router = APIRouter()


@router.get("", response_model=list[InternshipApplicationRead])
async def list_applications(db: Session = Depends(get_db)) -> list[InternshipApplication]:
    user = get_demo_user(db)
    return list(
        db.scalars(
            select(InternshipApplication)
            .where(InternshipApplication.user_id == user.id)
            .order_by(InternshipApplication.applied_on.desc(), InternshipApplication.id.desc())
        )
    )


@router.post("", response_model=InternshipApplicationRead, status_code=status.HTTP_201_CREATED)
async def create_application(
    payload: InternshipApplicationCreate, db: Session = Depends(get_db)
) -> InternshipApplication:
    user = get_demo_user(db)
    application = InternshipApplication(user_id=user.id, **payload.model_dump())
    db.add(application)
    db.commit()
    db.refresh(application)
    return application
