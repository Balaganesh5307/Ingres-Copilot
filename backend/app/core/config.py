from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List
import json

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "ingres_copilot"
    
    JWT_SECRET: str = "secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    
    CORS_ORIGINS: str = '["http://localhost:3000"]'
    
    GROQ_API_KEY: str = ""
    GEMINI_API_KEY: str = ""
    
    CHROMA_DB_PATH: str = "./chroma_db"
    EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    @property
    def cors_origins_list(self) -> List[str]:
        return json.loads(self.CORS_ORIGINS)

    model_config = SettingsConfigDict(env_file="../.env", env_file_encoding="utf-8")

settings = Settings()
