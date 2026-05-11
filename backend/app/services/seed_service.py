from datetime import date, timedelta

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database.models import (
    ApplicationStatus,
    DsaDifficulty,
    DsaProblem,
    InternshipApplication,
    StudySession,
    Task,
    TaskPriority,
    TaskStatus,
)
from app.services.user_context import get_demo_user


def seed_demo_data(db: Session) -> None:
    user = get_demo_user(db)
    has_tasks = db.scalar(select(Task.id).where(Task.user_id == user.id).limit(1))
    if has_tasks is not None:
        return

    today = date.today()
    db.add_all(
        [
            Task(
                user_id=user.id,
                title="Revise DBMS indexing",
                category="CS Core",
                priority=TaskPriority.HIGH,
                due_date=today,
            ),
            Task(
                user_id=user.id,
                title="Solve 3 graph problems",
                category="DSA",
                priority=TaskPriority.HIGH,
                due_date=today,
            ),
            Task(
                user_id=user.id,
                title="Follow up with two recruiters",
                category="Internships",
                priority=TaskPriority.MEDIUM,
                due_date=today + timedelta(days=1),
            ),
            Task(
                user_id=user.id,
                title="Improve project impact bullets",
                category="Resume",
                priority=TaskPriority.MEDIUM,
                due_date=today + timedelta(days=5),
            ),
            Task(
                user_id=user.id,
                title="Complete OS synchronization flashcards",
                category="CS Core",
                status=TaskStatus.DONE,
                priority=TaskPriority.MEDIUM,
                due_date=today - timedelta(days=1),
            ),
        ]
    )

    db.add_all(
        [
            StudySession(user_id=user.id, subject="DSA", minutes=120, studied_on=today),
            StudySession(user_id=user.id, subject="DBMS", minutes=80, studied_on=today - timedelta(days=1)),
            StudySession(user_id=user.id, subject="OS", minutes=70, studied_on=today - timedelta(days=2)),
            StudySession(user_id=user.id, subject="DSA", minutes=150, studied_on=today - timedelta(days=3)),
            StudySession(user_id=user.id, subject="CN", minutes=60, studied_on=today - timedelta(days=5)),
            StudySession(user_id=user.id, subject="Resume", minutes=45, studied_on=today - timedelta(days=6)),
        ]
    )

    problems = [
        ("Two Sum", "Arrays", DsaDifficulty.EASY, 0.9, 0),
        ("Product of Array Except Self", "Arrays", DsaDifficulty.MEDIUM, 0.8, 0),
        ("Longest Substring Without Repeating Characters", "Strings", DsaDifficulty.MEDIUM, 0.75, 0),
        ("Number of Islands", "Graphs", DsaDifficulty.MEDIUM, 0.45, 1),
        ("Course Schedule", "Graphs", DsaDifficulty.MEDIUM, 0.4, 1),
        ("Climbing Stairs", "Dynamic Programming", DsaDifficulty.EASY, 0.7, 0),
        ("Coin Change", "Dynamic Programming", DsaDifficulty.MEDIUM, 0.35, 1),
        ("Kth Largest Element", "Heaps", DsaDifficulty.MEDIUM, 0.5, 1),
        ("Binary Tree Level Order Traversal", "Trees", DsaDifficulty.MEDIUM, 0.8, 0),
    ]
    db.add_all(
        [
            DsaProblem(
                user_id=user.id,
                title=title,
                topic=topic,
                difficulty=difficulty,
                confidence=confidence,
                needs_revision=needs_revision,
                solved_on=today - timedelta(days=index),
            )
            for index, (title, topic, difficulty, confidence, needs_revision) in enumerate(problems)
        ]
    )

    db.add_all(
        [
            InternshipApplication(
                user_id=user.id,
                company="NovaStack",
                role="Backend Intern",
                status=ApplicationStatus.INTERVIEWING,
                applied_on=today - timedelta(days=9),
                source="Referral",
            ),
            InternshipApplication(
                user_id=user.id,
                company="Cloudlane",
                role="AI Engineering Intern",
                status=ApplicationStatus.SCREENING,
                applied_on=today - timedelta(days=5),
                source="LinkedIn",
            ),
            InternshipApplication(
                user_id=user.id,
                company="DataForge",
                role="Software Intern",
                status=ApplicationStatus.APPLIED,
                applied_on=today - timedelta(days=2),
                source="Careers page",
            ),
            InternshipApplication(
                user_id=user.id,
                company="BuildBase",
                role="Platform Intern",
                status=ApplicationStatus.OFFER,
                applied_on=today - timedelta(days=21),
                source="Campus",
            ),
        ]
    )

    db.commit()
