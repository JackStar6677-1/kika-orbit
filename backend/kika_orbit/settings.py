from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Kika Orbit"
    public_brand_name: str = "Kika Orbit"
    environment: str = "local"
    database_url: str = "sqlite:///./.local/kika_orbit.db"
    allowed_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://localhost:8000/api/integrations/google/callback"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.allowed_origins.split(",") if origin.strip()]

    @property
    def is_local(self) -> bool:
        return self.environment.lower() in {"local", "dev", "development"}


@lru_cache
def get_settings() -> Settings:
    return Settings()
