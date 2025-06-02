# backend/app/services/llm_service.py
import os
import logging
import httpx # New import
import json # New import

# Keep Langchain imports for message types and history management
from langchain_google_genai import ChatGoogleGenerativeAI # Still needed for type hints if constructing messages
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory # Will be used differently or removed
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.messages import SystemMessage, HumanMessage, AIMessage, BaseMessage

from app.core.config import settings
from typing import AsyncGenerator, Optional, Dict, List, Any, cast


logger = logging.getLogger(__name__)

module_level_session_histories: Dict[str, ChatMessageHistory] = {}

# Default to localhost:8000, but make it configurable via environment variable if needed
NEMO_GUARDRAILS_SERVER_URL = os.getenv("NEMO_GUARDRAILS_SERVER_URL", "http://localhost:8000/v1/chat/completions") 
# Note: The default NeMo server port is 8000, which conflicts with our FastAPI app's default.
# The user will need to run one of them on a different port.

class LLMService:
    def __init__(self):
        # The primary LLM interaction is now with the NeMo Guardrails server.
        # Direct LLM initialization (self.llm, self.prompt, self.runnable) is removed.
        # ChatMessageHistory is still managed by this service for now.
        logger.info("LLMService initialized. All calls will be routed to NeMo Guardrails server at %s", NEMO_GUARDRAILS_SERVER_URL)
        if NEMO_GUARDRAILS_SERVER_URL == "http://localhost:8000/v1/chat/completions": # Default value check
             logger.warning("LLMService is configured to use NeMo Guardrails at default http://localhost:8000.")
             logger.warning("Ensure your FastAPI application (this service) is running on a DIFFERENT port if NeMo is on 8000.")


    def get_session_history(self, session_id: str) -> ChatMessageHistory:
        global module_level_session_histories
        if session_id not in module_level_session_histories:
            logger.info(f"SESSION_HISTORY ({session_id}): Creating new ChatMessageHistory at module level.")
            module_level_session_histories[session_id] = ChatMessageHistory()
        else:
            logger.info(f"SESSION_HISTORY ({session_id}): Using existing ChatMessageHistory from module level.")
        history_obj = module_level_session_histories[session_id]
        logger.debug(f"SESSION_HISTORY ({session_id}): History retrieved. Message count: {len(history_obj.messages)}")
        return history_obj

    def _prepare_input_with_image_context(self, user_input: str, image_notes: Optional[str]) -> str:
        if image_notes: # This context will be part of the user_input sent to NeMo
            return f"{user_input} [Image context: {image_notes}]"
        return user_input
    
    def _convert_lc_messages_to_nemo_request_format(self, messages: List[BaseMessage]) -> List[Dict[str, str]]:
        """Converts Langchain BaseMessage objects to NeMo's expected list of dicts."""
        nemo_messages = []
        for msg in messages:
            role = "user" 
            if isinstance(msg, AIMessage):
                role = "assistant"
            elif isinstance(msg, HumanMessage):
                role = "user"
            # System messages are typically handled by NeMo's own configuration,
            # not passed directly in the 'messages' array to /v1/chat/completions.
            # So, we might filter them out or handle them as per NeMo's specific API for this endpoint.
            elif isinstance(msg, SystemMessage):
                logger.info(f"System message encountered in history for NeMo: '{msg.content[:100]}...'. It might be ignored by NeMo endpoint.")
                # Continue to include it for now, but it's often configured in NeMo's own setup.
                role = "system" 
            nemo_messages.append({"role": role, "content": str(msg.content)})
        return nemo_messages

    async def _prepare_messages_for_nemo(self, user_input_combined: str, conversation_id: str) -> List[Dict[str, str]]:
        """
        Prepares the list of messages in the format expected by NeMo,
        including history and the current user input.
        """
        chat_history_obj = self.get_session_history(conversation_id)
        
        # Convert Langchain message history to NeMo's list of dicts format
        nemo_history_messages = self._convert_lc_messages_to_nemo_request_format(chat_history_obj.messages)
        
        # Current user input
        current_user_nemo_message = {"role": "user", "content": user_input_combined}
        
        # Combine history with current message
        all_messages_for_nemo = nemo_history_messages + [current_user_nemo_message]
        
        logger.debug(f"Messages being sent to NeMo for session {conversation_id}: {all_messages_for_nemo}")
        return all_messages_for_nemo

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Routing to NeMo Guardrails for non-streaming response (session: %s)", conversation_id)

        messages_for_nemo = await self._prepare_messages_for_nemo(combined_input, conversation_id)
        
        # Placeholder for actual NeMo user ID if needed by rails, for now, session_id is for history
        # user_id_for_nemo = conversation_id 
        
        payload = {
            "messages": messages_for_nemo,
            # "user": user_id_for_nemo, # If NeMo uses a top-level 'user' field for user ID in rails
            # "config_id": "some_config", # If you have multiple NeMo configs
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(NEMO_GUARDRAILS_SERVER_URL, json=payload, timeout=60.0)
                response.raise_for_status()
                nemo_response_data = response.json()
                
                # Parse NeMo's response. This is speculative and needs to match NeMo's actual output.
                # Common format is a list of messages, with the last one being the assistant's reply.
                ai_content = "Error: Could not parse NeMo response."
                if isinstance(nemo_response_data, list) and len(nemo_response_data) > 0:
                    # Find the last message from assistant
                    for msg_data in reversed(nemo_response_data):
                        if msg_data.get("role") == "assistant":
                            ai_content = str(msg_data.get("content", ai_content))
                            break
                elif isinstance(nemo_response_data, dict) and nemo_response_data.get("role") == "assistant": # if single message
                     ai_content = str(nemo_response_data.get("content", ai_content))

                # Save context to our history store
                chat_history_obj = self.get_session_history(conversation_id)
                chat_history_obj.add_user_message(combined_input)
                chat_history_obj.add_ai_message(ai_content)
                
                return ai_content
            except httpx.RequestError as e:
                logger.error(f"HTTPX RequestError to NeMo Guardrails: {e}", exc_info=True)
                return "Uh oh, couldn't talk to my, uh, supervisor (NeMo). Try again?"
            except Exception as e:
                logger.error(f"Error processing NeMo Guardrails response: {e}", exc_info=True)
                return "Something went wrong with the NeMo Guardrails response processing."

    async def async_generate_streaming_response(
        self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"
    ) -> AsyncGenerator[str, None]:
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Routing to NeMo Guardrails for streaming response (session: %s)", conversation_id)

        messages_for_nemo = await self._prepare_messages_for_nemo(combined_input, conversation_id)
        
        payload = {
            "messages": messages_for_nemo,
            "stream": True 
        }

        full_ai_response_for_memory = []
        try:
            async with httpx.AsyncClient() as client:
                async with client.stream("POST", NEMO_GUARDRAILS_SERVER_URL, json=payload, timeout=60.0) as response:
                    response.raise_for_status()
                    logger.debug(f"NeMo stream response headers: {response.headers}")
                    
                    async for line in response.aiter_lines():
                        if not line: continue
                        if line.startswith("data: "):
                            json_data = line[len("data: "):]
                            if json_data.strip() == "[DONE]":
                                logger.info("NeMo stream [DONE] received.")
                                break
                            try:
                                chunk = json.loads(json_data)
                                # This parsing is based on OpenAI's streaming format.
                                # Verify NeMo's actual streaming chunk structure.
                                delta_content = chunk.get("choices", [{}])[0].get("delta", {}).get("content")
                                if delta_content:
                                    full_ai_response_for_memory.append(delta_content)
                                    yield delta_content
                            except json.JSONDecodeError:
                                logger.warning(f"Could not JSON decode NeMo stream line: {json_data}")
                        else: # If not SSE, maybe it's just raw text chunks?
                             logger.debug(f"NeMo raw stream line (not SSE): {line}")
                             full_ai_response_for_memory.append(line)
                             yield line


            ai_response_str = "".join(full_ai_response_for_memory)
            if ai_response_str:
                chat_history_obj = self.get_session_history(conversation_id)
                chat_history_obj.add_user_message(combined_input)
                chat_history_obj.add_ai_message(ai_response_str)
                logger.info("Saved context to history after NeMo stream. (session: %s)", conversation_id)
            else:
                logger.warning("No content received from NeMo stream to save to history. (session: %s)", conversation_id)

        except httpx.RequestError as e:
            logger.error(f"HTTPX RequestError to NeMo Guardrails (streaming): {e}", exc_info=True)
            yield "Uh oh, couldn't talk to my, uh, supervisor (NeMo) for a stream. Try again?"
        except Exception as e:
            logger.error(f"Error processing NeMo Guardrails stream: {e}", exc_info=True)
            yield "Something went wrong with the NeMo Guardrails stream response."
