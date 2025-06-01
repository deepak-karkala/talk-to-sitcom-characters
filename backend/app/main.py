# backend/app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.api.v1.endpoints import chat as chat_router_v1
# Import other routers as you create them

app = FastAPI(title="Chatterbox API", version="0.1.0")

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
    return {"message": "Welcome to the Chatterbox API!"}

# Placeholder for core/config.py content (will be created/used more in next steps)
# from .core.config import settings
# print(f"Settings loaded: {settings.APP_NAME}") # Example of using settings
