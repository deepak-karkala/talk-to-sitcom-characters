# backend/app/api/v1/endpoints/chat.py
import logging
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.chat_schemas import ChatRequest
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)
router = APIRouter()

DEFAULT_SESSION_ID = "default_frontend_session" # Define a default session ID

def get_llm_service():
    return LLMService()

@router.post("/chat")
async def handle_chat_streaming(
    request: ChatRequest, 
    llm_service: LLMService = Depends(get_llm_service)
):
    # Use session_id from request, or default if not provided or null
    session_id_to_use = request.session_id if request.session_id is not None else DEFAULT_SESSION_ID
    
    logger.info("Received chat request. Message count: %d. Session ID: %s", len(request.messages), session_id_to_use)

    if not request.messages:
        logger.warning("Chat request received with no messages. (Session: %s)", session_id_to_use)
        async def empty_response_stream():
            error_payload = json.dumps("Could I BE any more confused? You didn't say anything!")
            yield f"0:{error_payload}\n"
        return StreamingResponse(empty_response_stream(), media_type="text/plain")

    current_user_input = request.messages[-1].content
    image_notes = request.image_context_notes
    
    logger.debug("Current user input: '%.100s...', Image notes: '%s' (Session: %s)", current_user_input, image_notes, session_id_to_use)
    
    raw_token_generator = llm_service.async_generate_streaming_response(
        user_input=current_user_input,
        image_notes=image_notes,
        conversation_id=session_id_to_use # Pass the determined session_id
    )

    async def sdk_formatted_stream_generator():
        async for token in raw_token_generator:
            if token is not None: # Ensure token is not None
                json_stringified_token = json.dumps(token)
                formatted_chunk = f"0:{json_stringified_token}\n"
                # logger.debug("Yielding formatted chunk: %r", formatted_chunk.strip()) # Can be too verbose
                yield formatted_chunk
    
    return StreamingResponse(sdk_formatted_stream_generator(), media_type="text/plain")
