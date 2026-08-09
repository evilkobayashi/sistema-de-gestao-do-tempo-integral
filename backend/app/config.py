from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_name: str = "GTI Educação - Gestão de Tempo Integral"
    supabase_url: str = "https://ueybwjekfxxoyqjisfsj.supabase.co"

    supabase_service_key: str = "mock-service-key"
    max_weekly_hours: float = 40.0
    frontend_url: str = "http://localhost:3000"

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
