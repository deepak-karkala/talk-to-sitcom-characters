# backend/app/core/config.py
from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Chatterbox Backend"
    # Gemini API Key
    GOOGLE_API_KEY: Optional[str] = None

    # LangSmith Configuration
    LANGCHAIN_API_KEY: Optional[str] = None
    LANGCHAIN_TRACING_V2: str = "true"
    LANGCHAIN_ENDPOINT: str = "https://api.smith.langchain.com"
    LANGCHAIN_PROJECT: Optional[str] = "Chatterbox-Dev" # Default project name

    # LLM Service Provider: "GEMINI" or "LLAMA" (for future use)
    LLM_SERVICE_PROVIDER: str = "GEMINI"

    class Config:
        env_file = ".env"
        env_file_encoding = 'utf-8'
        extra = 'ignore' # Ignore extra fields from .env

settings = Settings()

# To verify loading (optional, can be removed)
if __name__ == "__main__":
    print(f"App Name: {settings.APP_NAME}")
    print(f"Google API Key Loaded: {'Yes' if settings.GOOGLE_API_KEY else 'No'}")
    print(f"LangSmith API Key Loaded: {'Yes' if settings.LANGCHAIN_API_KEY else 'No'}")
    print(f"LangSmith Project: {settings.LANGCHAIN_PROJECT}")
