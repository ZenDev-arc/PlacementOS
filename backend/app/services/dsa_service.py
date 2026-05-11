from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.database.models import DsaProblem
from app.schemas.dsa import DsaInsight, TopicProgress


def build_dsa_insight(db: Session, user_id: int) -> DsaInsight:
    topic_rows = list(
        db.execute(
            select(
                DsaProblem.topic,
                func.count(DsaProblem.id),
                func.avg(DsaProblem.confidence),
                func.sum(DsaProblem.needs_revision),
            )
            .where(DsaProblem.user_id == user_id)
            .group_by(DsaProblem.topic)
            .order_by(DsaProblem.topic)
        )
    )
    solved_total = sum(row[1] for row in topic_rows)
    weak_topics = [row[0] for row in sorted(topic_rows, key=lambda row: (row[2] or 0, -(row[3] or 0)))[:3]]
    topic_progress = [
        TopicProgress(
            topic=row[0],
            solved=row[1],
            target=max(10, row[1] + (row[3] or 0) + 4),
            mastery=round((row[2] or 0) * 100),
        )
        for row in topic_rows
    ]
    recommendations = [f"Revise {topic} interview patterns" for topic in weak_topics]
    if not recommendations:
        recommendations = ["Add your first solved DSA problem"]

    return DsaInsight(
        solved_total=solved_total,
        weekly_target=18,
        recommended_next=recommendations,
        weak_topics=weak_topics,
        topic_progress=topic_progress,
    )
