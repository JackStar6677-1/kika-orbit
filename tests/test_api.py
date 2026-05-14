from fastapi.testclient import TestClient
from kika_orbit.domain.admin_roster import load_admin_roster
from kika_orbit.domain.rut import is_valid_rut, mask_rut, normalize_rut
from kika_orbit.main import app


def test_healthcheck() -> None:
    with TestClient(app) as client:
        response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_web_home_loads() -> None:
    with TestClient(app) as client:
        response = client.get("/")
        styles_response = client.get("/assets/styles.css")
        manifest_response = client.get("/manifest.webmanifest")

    assert response.status_code == 200
    assert "Kika Orbit" in response.text
    assert styles_response.status_code == 200
    assert manifest_response.status_code == 200


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


def test_chile_holidays_include_irrenunciables() -> None:
    with TestClient(app) as client:
        response = client.get("/api/holidays?year=2026")

    assert response.status_code == 200
    holidays = response.json()
    labels = {item["label"] for item in holidays if item["is_irrenunciable"]}
    assert {"Anio Nuevo", "Dia del Trabajador", "Independencia Nacional", "Navidad"} <= labels


def test_google_integration_status_shape() -> None:
    with TestClient(app) as client:
        response = client.get("/api/integrations/google/status")

    assert response.status_code == 200
    payload = response.json()
    assert payload["provider"] == "google"
    assert "configured" in payload
    assert payload["calendar_scope"] == "https://www.googleapis.com/auth/calendar.events"


def test_rut_validation_and_masking() -> None:
    assert normalize_rut("21.452.686-7") == "21452686-7"
    assert is_valid_rut("21452686-7")
    assert not is_valid_rut("21248704-2")
    assert mask_rut("21452686-7") == "***686-7"


def test_admin_roster_flags_invalid_ruts(tmp_path) -> None:
    roster = tmp_path / "admins.json"
    roster.write_text(
        """
        {
          "admins": [
            {
              "rut": "21452686-7",
              "email": "demo@example.com",
              "display_name": "Demo",
              "role": "admin"
            },
            {
              "rut": "21248704-2",
              "email": "invalid@example.com",
              "display_name": "Invalid",
              "role": "editor"
            }
          ]
        }
        """,
        encoding="utf-8",
    )

    entries = load_admin_roster(roster, pepper="test-pepper")

    assert entries[0].can_login
    assert entries[1].status == "needs_rut_confirmation"
    assert not entries[1].can_login
