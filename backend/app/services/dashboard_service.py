from datetime import date, timedelta

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.models import ApplicationStatus, DsaProblem, InternshipApplication, StudySession, Task, TaskStatus
from app.schemas.dashboard import DashboardSnapshot, FocusItem, MetricCard


def build_dashboard_snapshot(db: Session, user_id: int) -> DashboardSnapshot:
    today = date.today()
    week_start = today - timedelta(days=6)

    solved_total = db.scalar(select(func.count(DsaProblem.id)).where(DsaProblem.user_id == user_id)) or 0
    study_minutes_week = (
        db.scalar(
            select(func.coalesce(func.sum(StudySession.minutes), 0)).where(
                StudySession.user_id == user_id,
                StudySession.studied_on >= week_start,
            )
        )
        or 0
    )
    pending_revisions = (
        db.scalar(
            select(func.count(DsaProblem.id)).where(DsaProblem.user_id == user_id, DsaProblem.needs_revision == 1)
        )
        or 0
    )
    application_count = (
        db.scalar(select(func.count(InternshipApplication.id)).where(InternshipApplication.user_id == user_id)) or 0
    )
    active_interviews = (
        db.scalar(
            select(func.count(InternshipApplication.id)).where(
                InternshipApplication.user_id == user_id,
                InternshipApplication.status == ApplicationStatus.INTERVIEWING,
            )
        )
        or 0
    )
    pending_tasks = (
        db.scalar(select(func.count(Task.id)).where(Task.user_id == user_id, Task.status != TaskStatus.DONE)) or 0
    )

    focus_tasks = list(
        db.scalars(
            select(Task)
            .where(Task.user_id == user_id, Task.status != TaskStatus.DONE)
            .order_by(Task.due_date, Task.priority.desc(), Task.id)
            .limit(5)
        )
    )
    weak_topics = [
        row[0]
        for row in db.execute(
            select(DsaProblem.topic)
            .where(DsaProblem.user_id == user_id, DsaProblem.needs_revision == 1)
            .group_by(DsaProblem.topic)
            .order_by(func.avg(DsaProblem.confidence))
            .limit(3)
        )
    ]
    pipeline = {
        status.value: count
        for status, count in db.execute(
            select(InternshipApplication.status, func.count(InternshipApplication.id))
            .where(InternshipApplication.user_id == user_id)
            .group_by(InternshipApplication.status)
        )
    }
    for status in ["applied", "screening", "interviewing", "offer"]:
        pipeline.setdefault(status, 0)

    readiness_score = min(
        100,
        round((min(solved_total, 150) / 150 * 40) + (min(study_minutes_week, 1200) / 1200 * 35) + min(application_count, 20)),
    )

    return DashboardSnapshot(
        user_name="Student",
        readiness_score=readiness_score,
        streak_days=_calculate_streak(db, user_id, today),
        study_hours_week=round(study_minutes_week / 60, 1),
        metrics=[
            MetricCard(label="DSA solved", value=str(solved_total), delta=f"{pending_revisions} need revision", tone="positive"),
            MetricCard(label="Study hours", value=f"{round(study_minutes_week / 60, 1)}h", delta="last 7 days", tone="positive"),
            MetricCard(label="Applications", value=str(application_count), delta=f"{active_interviews} active interviews", tone="positive"),
            MetricCard(label="Pending tasks", value=str(pending_tasks), delta="open preparation items", tone="warning"),
        ],
        focus_queue=[
            FocusItem(
                title=task.title,
                category=task.category,
                priority=task.priority.value.title(),
                due=_format_due(task.due_date, today),
            )
            for task in focus_tasks
        ],
        weak_topics=weak_topics,
        application_pipeline=pipeline,
    )


def _calculate_streak(db: Session, user_id: int, today: date) -> int:
    studied_dates = {
        row[0]
        for row in db.execute(
            select(StudySession.studied_on)
            .where(StudySession.user_id == user_id)
            .group_by(StudySession.studied_on)
            .order_by(StudySession.studied_on.desc())
        )
    }
    streak = 0
    cursor = today
    while cursor in studied_dates:
        streak += 1
        cursor -= timedelta(days=1)
    return streak


def _format_due(due_date: date | None, today: date) -> str:
    if due_date is None:
        return "Unscheduled"
    if due_date == today:
        return "Today"
    if due_date == today + timedelta(days=1):
        return "Tomorrow"
    if due_date < today:
        return "Overdue"
    return due_date.isoformat()
