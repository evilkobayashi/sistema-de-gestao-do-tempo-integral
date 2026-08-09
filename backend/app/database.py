import os
from supabase import create_client, Client
from app.config import settings

def get_supabase_client() -> Client:
    url = settings.supabase_url
    key = settings.supabase_service_key
    return create_client(url, key)

def get_db():
    try:
        db = get_supabase_client()
        yield db
    except Exception:
        # Fallback for dev / mock execution
        yield None
