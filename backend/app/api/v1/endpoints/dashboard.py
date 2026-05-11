from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.schemas.dashboard import DashboardSnapshot
from app.services.dashboard_service import build_dashboard_snapshot
from app.services.user_context import get_demo_user

router = APIRouter()


@router.get("/snapshot", response_model=DashboardSnapshot)
async def get_dashboard_snapshot(db: Session = Depends(get_db)) -> DashboardSnapshot:
    user = get_demo_user(db)
    return build_dashboard_snapshot(db, user.id)
