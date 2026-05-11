from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from db.session import get_db
from models.user import User, OnboardingProfile
from models.log import DSALog, SubjectLog
from models.ai import AISession
from models.resume import ResumeVersion
from models.roadmap import DailyPlan
from middleware.auth import get_current_user
from datetime import date, timedelta

router = APIRouter()

from services.plan_service import PlanService

@router.get("/snapshot")
async def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # 1. DSA Solved Count
    dsa_solved = db.query(DSALog).filter(DSALog.user_id == current_user.id).count()
    
    # 2. Check for Resume
    has_resume = db.query(ResumeVersion).filter(ResumeVersion.user_id == current_user.id).first() is not None
    
    # 3. Calculate Streak (Simplified: check last 7 days activity)
    active_days = db.query(func.count(func.distinct(DSALog.date))).filter(
        DSALog.user_id == current_user.id,
        DSALog.date >= date.today() - timedelta(days=7)
    ).scalar() or 0
    
    # 4. AI Session Hours (Sum of sessions)
    ai_sessions_count = db.query(AISession).filter(AISession.user_id == current_user.id).count()
    # Heuristic: 0.5 hours per session
    ai_hours = round(ai_sessions_count * 0.5, 1)

    # 5. Activity Chart Data (Last 7 days)
    activity_data = []
    for i in range(6, -1, -1):
        target_date = date.today() - timedelta(days=i)
        count = db.query(DSALog).filter(
            DSALog.user_id == current_user.id,
            DSALog.date == target_date
        ).count()
        # Scale count to 0-100 for the frontend chart (e.g., 5 problems = 100%)
        activity_data.append(min(100, count * 20))

    # 6. Readiness Score Calculation
    score = 10 # Base for onboarding
    if has_resume: score += 20
    score += min(dsa_solved, 100) * 0.4
    score += min(active_days, 7) * 4 # Up to 28% from weekly activity
    readiness_score = min(100, int(score))

    # 7. Today's Plan
    today_plan = db.query(DailyPlan).filter(
        DailyPlan.user_id == current_user.id,
        DailyPlan.date == date.today()
    ).first()
    
    if not today_plan:
        try:
            today_plan = await PlanService.generate_daily_plan(db, current_user.id)
        except:
            today_plan = None
    
    # 8. Recent Activity Logs
    recent_logs = []
    dsa_entries = db.query(DSALog).filter(DSALog.user_id == current_user.id).order_by(DSALog.date.desc()).limit(3).all()
    for entry in dsa_entries:
        recent_logs.append({
            "time": entry.date.strftime("%H:%M") if hasattr(entry, "created_at") else "Today",
            "msg": f"Solved {entry.problem_name} ({entry.platform.value if entry.platform else 'DSA'})",
            "type": "success"
        })

    # 9. Pulse Metrics Calculation
    logic_score = min(100, dsa_solved)
    theory_score = db.query(SubjectLog).filter(SubjectLog.user_id == current_user.id).count() * 10
    theory_score = min(100, theory_score)
    # Forge (Builds/Repos) - For now just 0 as we don't have project models yet, or use Resume
    forge_score = 40 if has_resume else 0
    # Rituals (Habits/Consistency)
    rituals_score = active_days * 14 # 7 days * 14 = 98
    # Strategy (Applications)
    from models.application import InternshipApplication
    apps_count = db.query(InternshipApplication).filter(InternshipApplication.user_id == current_user.id).count()
    strategy_score = min(100, apps_count * 15)

    pulse_metrics = [
        {"id": "logic", "label": "Logic (DSA)", "value": logic_score},
        {"id": "theory", "label": "Theory (Core)", "value": theory_score},
        {"id": "projects", "label": "Forge (Builds)", "value": forge_score},
        {"id": "habits", "label": "Rituals (Consistency)", "value": rituals_score},
        {"id": "strategy", "label": "Strategy (Apps)", "value": strategy_score},
    ]

    return {
        "user": current_user.name,
        "readiness_score": readiness_score,
        "today_plan": today_plan.plan if today_plan else None,
        "activity_chart": activity_data,
        "stats": {
            "dsa_solved": dsa_solved,
            "streak": active_days,
            "ai_hours": ai_hours,
            "github_repos": 0 
        },
        "recent_logs": recent_logs,
        "pulse_metrics": pulse_metrics
    }
