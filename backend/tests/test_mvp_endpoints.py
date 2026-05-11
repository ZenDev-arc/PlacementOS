from app.main import app
from fastapi.testclient import TestClient


def test_task_create_and_list() -> None:
    with TestClient(app) as client:
        created = client.post(
            "/api/v1/tasks",
            json={"title": "Practice SQL joins", "category": "DBMS", "priority": "high"},
        )

        assert created.status_code == 201
        assert created.json()["title"] == "Practice SQL joins"

        listed = client.get("/api/v1/tasks")
        assert listed.status_code == 200
        assert any(task["title"] == "Practice SQL joins" for task in listed.json())


def test_dsa_problem_create_and_insight() -> None:
    with TestClient(app) as client:
        created = client.post(
            "/api/v1/dsa/problems",
            json={
                "title": "Rotting Oranges",
                "topic": "Graphs",
                "difficulty": "medium",
                "confidence": 0.4,
                "needs_revision": 1,
            },
        )

        assert created.status_code == 201
        assert created.json()["topic"] == "Graphs"

        insight = client.get("/api/v1/dsa/insight")
        assert insight.status_code == 200
        assert "Graphs" in insight.json()["weak_topics"]


def test_study_session_and_internship_create() -> None:
    with TestClient(app) as client:
        study = client.post("/api/v1/study-sessions", json={"subject": "OS", "minutes": 45})
        assert study.status_code == 201
        assert study.json()["minutes"] == 45

        application = client.post(
            "/api/v1/internships",
            json={"company": "Acme Labs", "role": "Backend Intern", "status": "applied"},
        )
        assert application.status_code == 201
        assert application.json()["company"] == "Acme Labs"
