from fastapi.testclient import TestClient
from kika_orbit.main import app


def test_healthcheck() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_create_organization_and_event() -> None:
    with TestClient(app) as client:
        organization_response = client.post(
            "/api/organizations",
            json={
                "name": "Universidad Demo",
                "slug": "universidad-demo",
                "domain_hint": "demo.edu",
            },
        )

        assert organization_response.status_code in {201, 409}
        organizations = client.get("/api/organizations").json()
        organization = next(item for item in organizations if item["slug"] == "universidad-demo")

        event_response = client.post(
            "/api/events",
            json={
                "organization_id": organization["id"],
                "title": "Reunion centro de estudiantes",
                "category": "reunion",
                "visibility": "organization",
                "starts_at": "2026-05-26T14:00:00-04:00",
                "ends_at": "2026-05-26T16:00:00-04:00",
            },
        )

    assert event_response.status_code == 201
    assert event_response.json()["title"] == "Reunion centro de estudiantes"
