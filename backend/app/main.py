# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.endpoints import chat as chat_router_v1
from app.core.logging_config import setup_logging
from app.core.config import settings # Import settings
import logging

setup_logging()
logger = logging.getLogger(__name__)

# Log LangSmith configuration (excluding API key) for verification
logger.info("--- LangSmith Configuration Verification ---")
logger.info(f"LANGCHAIN_TRACING_V2: {settings.LANGCHAIN_TRACING_V2}")
logger.info(f"LANGCHAIN_ENDPOINT: {settings.LANGCHAIN_ENDPOINT}")
logger.info(f"LANGCHAIN_PROJECT: {settings.LANGCHAIN_PROJECT}")
if settings.LANGCHAIN_API_KEY:
    logger.info("LANGCHAIN_API_KEY is set (value not logged for security).")
else:
    logger.warning("LANGCHAIN_API_KEY is NOT set.")
logger.info("--- End LangSmith Configuration Verification ---")
# Also verify Google API Key presence
if settings.GOOGLE_API_KEY:
    logger.info("GOOGLE_API_KEY is set (value not logged for security).")
else:
    logger.warning("GOOGLE_API_KEY is NOT set. LLM calls will fail.")


app = FastAPI(title="Chatterbox API", version="0.1.0")
logger.info("FastAPI application starting up...")

# CORS Middleware
# Adjust origins as needed for your development and production environments
origins = [
    "http://localhost:3000",  # Next.js frontend
    # Add other origins like your production frontend URL
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Include API routers
app.include_router(chat_router_v1.router, prefix="/api/v1", tags=["v1_chat"])
# Add other routers here

@app.get("/")
async def read_root():
    logger.info("Root endpoint '/' was called.")
    return {"message": "Welcome to the Chatterbox API!"}

logger.info("FastAPI application configured and ready.")
# Placeholder for core/config.py content (will be created/used more in next steps)
# from .core.config import settings
# print(f"Settings loaded: {settings.APP_NAME}") # Example of using settings
