from fastapi import APIRouter
from api.v1.endpoints import auth, dashboard, dsa, onboarding, ai, applications, resumes, jobs, admin, subjects, habits, notifications

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
api_router.include_router(dsa.router, prefix="/dsa", tags=["dsa"])
api_router.include_router(onboarding.router, prefix="/onboarding", tags=["onboarding"])
api_router.include_router(ai.router, prefix="/ai", tags=["ai"])
api_router.include_router(applications.router, prefix="/applications", tags=["applications"])
api_router.include_router(resumes.router, prefix="/resumes", tags=["resumes"])
api_router.include_router(jobs.router, prefix="/jobs", tags=["jobs"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(subjects.router, prefix="/subjects", tags=["subjects"])
api_router.include_router(habits.router, prefix="/habits", tags=["habits"])
api_router.include_router(notifications.router, prefix="/notifications", tags=["notifications"])
# Add other routers here as they are built...

