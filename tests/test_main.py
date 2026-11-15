from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_health_check_returns_200():
    """Verify that the GET /health endpoint returns HTTP 200 and {'status': 'ok'}."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_invalid_hours_remaining_returns_422():
    """Verify that submitting hours_remaining = -1 fails validation with HTTP 422 Unprocessable Entity."""
    invalid_payload = {
        "hours_remaining": -1.0,
        "team_size": 3,
        "skill_level": "intermediate",
        "tone": "fun",
        "demo_style": "live_app",
        "risk_appetite": "balanced",
    }
    response = client.post("/api/ideas", json=invalid_payload)
    assert response.status_code == 422
