from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from db.session import get_db
from models.user import User, UserRole
from models.log import DSALog
from models.internship import InternshipApplication
from middleware.auth import get_current_user
from sqlalchemy import func

router = APIRouter()

def verify_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.admin:
        raise HTTPException(status_code=403, detail="Admin access required")
    return True

@router.get("/stats")
async def get_platform_stats(
    db: Session = Depends(get_db),
    authorized: bool = Depends(verify_admin)
):
    # 1. User Metrics
    total_users = db.query(User).count()
    
    # 2. Activity Metrics
    total_dsa_problems = db.query(DSALog).count()
    total_applications = db.query(InternshipApplication).count()
    
    # 3. Trending Weak Topics (Aggregate from DSA Logs)
    # This is a simple aggregate, in production you might use more complex analysis
    weak_topics = db.query(DSALog.topic, func.count(DSALog.id)).group_by(DSALog.topic).all()
    
    return {
        "platform_metrics": {
            "total_users": total_users,
            "total_dsa_problems": total_dsa_problems,
            "total_applications": total_applications
        },
        "activity_data": [
            {"name": "Jan", "users": 10},
            {"name": "Feb", "users": 25},
            {"name": "Mar", "users": total_users}
        ],
        "top_weak_topics": [
            {"topic": t[0], "count": t[1]} for t in weak_topics[:5]
        ]
    }

