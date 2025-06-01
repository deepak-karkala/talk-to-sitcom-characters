# backend/app/api/v1/endpoints/chat.py
from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from backend.app.schemas.chat_schemas import ChatRequest
from backend.app.services.llm_service import LLMService
# typing.AsyncGenerator is not needed here anymore for Python 3.9+

router = APIRouter()

def get_llm_service():
    return LLMService()

@router.post("/chat")
async def handle_chat_streaming(
    request: ChatRequest,
    llm_service: LLMService = Depends(get_llm_service)
):
    if not request.messages:
        async def empty_response_stream():
            yield "Could I BE any more confused? You didn't say anything!"
        return StreamingResponse(empty_response_stream(), media_type="text/plain")

    current_user_input = request.messages[-1].content
    image_notes = request.image_context_notes # Extract image_context_notes

    response_generator = llm_service.async_generate_streaming_response(
        user_input=current_user_input,
        image_notes=image_notes # Pass it to the service
    )

    return StreamingResponse(response_generator, media_type="text/plain")
