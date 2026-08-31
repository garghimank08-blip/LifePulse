import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

class Settings:
    PROJECT_NAME: str = "Life Pulse Emergency Care & Verified Donor Network"
    VERSION: str = "2.0.0"
    API_V1_STR: str = "/api"
    
    # SQLite Database (or PostgreSQL via environment variable)
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{BASE_DIR}/life_pulse.db")
    
    # Secret Key for JWT Session tokens
    SECRET_KEY: str = os.getenv("SECRET_KEY", "life-pulse-super-secure-secret-key-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # ML Model weights path
    ML_MODEL_PATH: str = os.path.join(BASE_DIR, "app", "ml", "model_weights.joblib")
    
    # Storage for uploaded prescriptions
    UPLOAD_DIR: str = os.path.join(BASE_DIR, "uploads")

settings = Settings()

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
