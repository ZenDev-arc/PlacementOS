from app.main import app
from fastapi.testclient import TestClient


def test_dashboard_snapshot_contract() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/dashboard/snapshot")

    assert response.status_code == 200
    payload = response.json()
    assert 0 <= payload["readiness_score"] <= 100
    assert payload["metrics"]
    assert payload["focus_queue"]
