# backend/app/api/v1/endpoints/chat.py
import logging
import json
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from app.schemas.chat_schemas import ChatRequest
from app.services.llm_service import LLMService
from app.core.guardrails_config import (
    INPUT_DENYLIST_KEYWORDS, CANNED_RESPONSE_INPUT_TRIGGERED
)

logger = logging.getLogger(__name__)
router = APIRouter()

DEFAULT_SESSION_ID = "default_frontend_session"


def get_llm_service():
    return LLMService()


async def create_canned_stream(response_text: str):
    """Helper to stream a canned response in the SDK-expected format."""
    json_stringified_token = json.dumps(response_text)
    formatted_chunk = f"0:{json_stringified_token}\n"
    yield formatted_chunk


@router.post("/chat")
async def handle_chat_streaming(
    request: ChatRequest,
    llm_service: LLMService = Depends(get_llm_service)
):
    session_id_to_use = (
        request.session_id if request.session_id is not None 
        else DEFAULT_SESSION_ID
    )

    logger.info(
        "Received chat request. Message count: %d. Session ID: %s",
        len(request.messages), session_id_to_use
    )

    if not request.messages:
        logger.warning(
            "Chat request received with no messages. (Session: %s)",
            session_id_to_use
        )
        canned_response = (
            "Could I BE any more confused? You didn't say anything!"
        )
        return StreamingResponse(
            create_canned_stream(canned_response),
            media_type="text/plain"
        )

    current_user_input = request.messages[-1].content
    image_notes = request.image_context_notes

    lower_user_input = current_user_input.lower()
    for keyword in INPUT_DENYLIST_KEYWORDS:
        if keyword.lower() in lower_user_input:
            log_msg_part1 = (
                "Input Guardrail triggered for session %s "
                "due to keyword: '%s'. "
            )
            log_msg_part2 = "User input: '%.50s...'"
            logger.warning(
                log_msg_part1 + log_msg_part2,
                session_id_to_use, keyword, current_user_input
            )
            return StreamingResponse(
                create_canned_stream(CANNED_RESPONSE_INPUT_TRIGGERED),
                media_type="text/plain"
            )

    logger.debug(
        "Current user input: '%.100s...', Image notes: '%s' (Session: %s)",
        current_user_input, image_notes, session_id_to_use
    )

    raw_token_generator = llm_service.async_generate_streaming_response(
        user_input=current_user_input,
        image_notes=image_notes,
        conversation_id=session_id_to_use
    )

    async def sdk_formatted_stream_generator():  # Main LLM response stream
        async for token in raw_token_generator:
            if token is not None:
                json_stringified_token = json.dumps(token)
                formatted_chunk = f"0:{json_stringified_token}\n"
                yield formatted_chunk

    return StreamingResponse(
        sdk_formatted_stream_generator(), media_type="text/plain"
    )
