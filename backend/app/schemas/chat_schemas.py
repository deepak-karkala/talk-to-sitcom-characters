# backend/app/schemas/chat_schemas.py
from pydantic import BaseModel
from typing import List, Optional

class Message(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[Message]
    image_context_notes: Optional[str] = None # New field

# ChatResponse is not strictly needed anymore if all chat interactions are streaming
# but can be kept for non-streaming endpoints or other purposes.
class ChatResponse(BaseModel):
    reply: str
