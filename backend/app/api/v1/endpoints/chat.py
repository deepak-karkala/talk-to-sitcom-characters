# backend/app/api/v1/endpoints/chat.py
import logging
import json # New import
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.chat_schemas import ChatRequest
from app.services.llm_service import LLMService

logger = logging.getLogger(__name__)
router = APIRouter()

def get_llm_service():
    return LLMService()

@router.post("/chat")
async def handle_chat_streaming(
    request: ChatRequest,
    llm_service: LLMService = Depends(get_llm_service)
):
    logger.info("Received chat request. Message count: %d", len(request.messages))
    if not request.messages:
        logger.warning("Chat request received with no messages.")
        async def empty_response_stream():
            # Format even empty/error messages according to the protocol if expected client-side
            # For consistency, let's format it.
            error_payload = json.dumps("Could I BE any more confused? You didn't say anything!")
            yield f"0:{error_payload}\n" # Protocol for text chunk
        return StreamingResponse(empty_response_stream(), media_type="text/plain")

    current_user_input = request.messages[-1].content
    image_notes = request.image_context_notes

    logger.debug("Current user input: '%.100s...', Image notes: '%s'", current_user_input, image_notes)

    raw_token_generator = llm_service.async_generate_streaming_response(
        user_input=current_user_input,
        image_notes=image_notes
    )

    async def sdk_formatted_stream_generator():
        """Wraps the raw token generator to format tokens for Vercel AI SDK."""
        idx = 0 # Keep track of message index for potential future use, though 0 is for text stream
        async for token in raw_token_generator:
            if token is not None: # Ensure token is not None (can be empty string)
                # JSON stringify the token itself to handle special characters within the token
                json_stringified_token = json.dumps(token)
                # Format according to Vercel AI SDK protocol for text chunks: 0:"<json_stringified_token_content>"
                # The prefix '0:' indicates a text chunk. Other prefixes are for other data types.
                formatted_chunk = f"0:{json_stringified_token}\n"
                # Using %r for formatted_chunk to see escape sequences if any, strip for cleaner log
                logger.debug("Yielding formatted chunk: %r", formatted_chunk.strip())
                yield formatted_chunk
                idx +=1
            else:
                logger.debug("Skipping None token from raw_token_generator")

    return StreamingResponse(sdk_formatted_stream_generator(), media_type="text/plain")
