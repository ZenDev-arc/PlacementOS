from fastapi import APIRouter, Header, HTTPException, Depends
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User
from models.internship import InternshipApplication, ApplicationStatus
from services.plan_service import PlanService
from services.email_service import email_service
from datetime import date, timedelta
import os

router = APIRouter()

def verify_job_secret(x_job_secret: str = Header(None)):
    if x_job_secret != os.getenv("JOB_SECRET"):
        raise HTTPException(status_code=403, detail="Invalid job secret")
    return True

@router.post("/generate-daily-plans")
async def job_generate_daily_plans(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_job_secret)
):
    users = db.query(User).all()
    count = 0
    for user in users:
        # Check if plan already exists for today
        from models.roadmap import DailyPlan
        exists = db.query(DailyPlan).filter(DailyPlan.user_id == user.id, DailyPlan.date == date.today()).first()
        if not exists:
            await PlanService.generate_daily_plan(db, user.id)
            count += 1
    return {"message": f"Generated {count} daily plans"}

@router.post("/send-followup-reminders")
async def job_send_followup_reminders(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_job_secret)
):
    # Find applications in 'applied' status older than 7 days
    seven_days_ago = date.today() - timedelta(days=7)
    # Using a simple string date check if stored as Text, or date comparison if Date type
    # For now, let's assume InternshipApplication.date_applied is a Date object
    apps = db.query(InternshipApplication).filter(
        InternshipApplication.status == ApplicationStatus.applied,
        InternshipApplication.date_applied <= seven_days_ago
    ).all()
    
    count = 0
    for app in apps:
        user = db.query(User).filter(User.id == app.user_id).first()
        if user:
            await email_service.send_followup_reminder(user.email, app.company_name)
            count += 1
            
    return {"message": f"Sent {count} follow-up reminders"}

