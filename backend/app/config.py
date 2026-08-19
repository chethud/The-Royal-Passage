from pathlib import Path

from dotenv import load_dotenv
from pydantic_settings import BaseSettings, SettingsConfigDict

_BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(_BACKEND_DIR / ".env", override=True)


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(_BACKEND_DIR / ".env"),
        env_file_encoding="utf-8",
        env_ignore_empty=True,
        extra="ignore",
    )

    supabase_url: str = ""
    supabase_service_role_key: str = ""
    cors_origins: str = (
        "http://localhost:5173,http://localhost:8080,http://localhost:8081,"
        "https://the-royal-passage.vercel.app"
    )
    rate_limit_per_minute: int = 120
    enable_api_docs: bool = False
    resend_api_key: str = ""
    resend_from_email: str = "noreplay@theroyalpassage.com"
    resend_from_name: str = "The Royal Passage"
    site_url: str = "https://the-royal-passage.vercel.app"
    email_logo_url: str = ""
    cron_secret: str = ""

    @property
    def email_configured(self) -> bool:
        return bool(self.resend_api_key.strip() and self.resend_from_email.strip())

    @property
    def supabase_configured(self) -> bool:
        return bool(self.supabase_url.strip() and self.supabase_service_role_key.strip())

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
