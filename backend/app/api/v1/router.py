from fastapi import APIRouter

from app.api.v1.endpoints import ai, dashboard, dsa, health, internships, study_sessions, tasks

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(dsa.router, prefix="/dsa", tags=["dsa"])
api_router.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
api_router.include_router(study_sessions.router, prefix="/study-sessions", tags=["study sessions"])
api_router.include_router(internships.router, prefix="/internships", tags=["internships"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
