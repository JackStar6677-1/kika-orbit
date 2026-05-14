from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from google_auth_oauthlib.flow import Flow

from kika_orbit.settings import Settings

GOOGLE_AUTH_URI = "https://accounts.google.com/o/oauth2/auth"
GOOGLE_TOKEN_URI = "https://oauth2.googleapis.com/token"


class GoogleOAuthNotConfiguredError(RuntimeError):
    pass


def is_google_oauth_configured(settings: Settings) -> bool:
    return bool(settings.google_client_id and settings.google_client_secret)


def google_client_config(settings: Settings) -> dict[str, Any]:
    if not is_google_oauth_configured(settings):
        raise GoogleOAuthNotConfiguredError("Google OAuth client id/secret are missing.")

    return {
        "web": {
            "client_id": settings.google_client_id,
            "client_secret": settings.google_client_secret,
            "auth_uri": GOOGLE_AUTH_URI,
            "token_uri": GOOGLE_TOKEN_URI,
            "redirect_uris": [
                settings.google_redirect_uri,
                "http://127.0.0.1:8000/api/integrations/google/callback",
            ],
        }
    }


def oauth_scopes(settings: Settings, include_gmail: bool = False) -> list[str]:
    scopes = [settings.google_calendar_scopes]
    if include_gmail:
        scopes.append(settings.google_gmail_scopes)
    return [scope for scope in scopes if scope]


def make_flow(settings: Settings, include_gmail: bool = False) -> Flow:
    if settings.is_local:
        os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")

    return Flow.from_client_config(
        google_client_config(settings),
        scopes=oauth_scopes(settings, include_gmail=include_gmail),
        redirect_uri=settings.google_redirect_uri,
    )


def write_json(path: str | Path, payload: dict[str, Any]) -> None:
    target = Path(path)
    target.parent.mkdir(parents=True, exist_ok=True)
    target.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def read_json(path: str | Path) -> dict[str, Any]:
    target = Path(path)
    if not target.exists():
        return {}
    return json.loads(target.read_text(encoding="utf-8"))
