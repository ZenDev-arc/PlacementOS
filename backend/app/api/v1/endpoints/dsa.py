from datetime import date

from fastapi import APIRouter, Depends, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import DsaProblem
from app.database.session import get_db
from app.schemas.dsa import DsaInsight
from app.schemas.dsa_problem import DsaProblemCreate, DsaProblemRead
from app.services.dsa_service import build_dsa_insight
from app.services.user_context import get_demo_user

router = APIRouter()


@router.get("/insight", response_model=DsaInsight)
async def get_dsa_insight(db: Session = Depends(get_db)) -> DsaInsight:
    user = get_demo_user(db)
    return build_dsa_insight(db, user.id)


@router.get("/problems", response_model=list[DsaProblemRead])
async def list_dsa_problems(db: Session = Depends(get_db)) -> list[DsaProblem]:
    user = get_demo_user(db)
    return list(
        db.scalars(
            select(DsaProblem).where(DsaProblem.user_id == user.id).order_by(DsaProblem.solved_on.desc(), DsaProblem.id)
        )
    )


@router.post("/problems", response_model=DsaProblemRead, status_code=status.HTTP_201_CREATED)
async def create_dsa_problem(payload: DsaProblemCreate, db: Session = Depends(get_db)) -> DsaProblem:
    user = get_demo_user(db)
    data = payload.model_dump()
    if data["solved_on"] is None:
        data["solved_on"] = date.today()
    problem = DsaProblem(user_id=user.id, **data)
    db.add(problem)
    db.commit()
    db.refresh(problem)
    return problem
