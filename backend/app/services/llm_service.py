# backend/app/services/llm_service.py
import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory # Ensure this is the correct import
from app.core.config import settings
from typing import AsyncGenerator, Optional, Dict

logger = logging.getLogger(__name__)

def load_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'chandler_bing.txt')
    try:
        with open(prompt_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        logger.warning("Prompt file not found at %s. Using default prompt.", prompt_path)
        return "You are a helpful assistant. Please respond in a sarcastic tone."
SYSTEM_PROMPT = load_system_prompt()

# Module-level store for session histories
# This dictionary will persist across different LLMService instances created by FastAPI's Depends
module_level_session_histories: Dict[str, ChatMessageHistory] = {}

class LLMService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            logger.error("GOOGLE_API_KEY not found in environment variables.")
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")

        logger.info("Initializing ChatGoogleGenerativeAI with model: %s", "gemini-1.5-flash-latest")
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-1.5-flash-latest",
            api_key=settings.GOOGLE_API_KEY,
            temperature=0.7
        )

        self.prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{user_input_combined}")
        ])

        core_runnable = self.prompt | self.llm | StrOutputParser()

        # self.session_histories removed from here

        self.runnable_with_history = RunnableWithMessageHistory(
            core_runnable,
            self.get_session_history, # This method will now use module_level_session_histories
            input_messages_key="user_input_combined",
            history_messages_key="chat_history",
        )
        logger.info("LLMService initialized with LCEL RunnableWithMessageHistory and model %s.", "gemini-1.5-flash-latest")

    # This method now accesses the module-level session_histories
    def get_session_history(self, session_id: str) -> ChatMessageHistory:
        # No need for 'global module_level_session_histories' if only accessing/mutating its items,
        # but it would be needed if reassigning the 'module_level_session_histories' variable itself.
        if session_id not in module_level_session_histories:
            logger.info(f"SESSION_HISTORY ({session_id}): Creating new ChatMessageHistory at module level.")
            module_level_session_histories[session_id] = ChatMessageHistory()
        else:
            logger.info(f"SESSION_HISTORY ({session_id}): Using existing ChatMessageHistory from module level.")

        history_obj = module_level_session_histories[session_id]
        logger.debug(f"SESSION_HISTORY ({session_id}): History retrieved. Message count: {len(history_obj.messages)}")
        return history_obj

    def _prepare_input_with_image_context(self, user_input: str, image_notes: Optional[str]) -> str:
        if image_notes:
            logger.debug("Adding image context notes: %s", image_notes)
            return f"{user_input} [Image context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating non-streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)
        # The get_session_history method (called by RunnableWithMessageHistory) will log the state of history *before* this turn.
        logger.debug(f"SESSION_HISTORY ({conversation_id}): Invoking runnable_with_history.ainvoke.")
        try:
            response_text = await self.runnable_with_history.ainvoke(
                {"user_input_combined": combined_input},
                config={"configurable": {"session_id": conversation_id}}
            )
            logger.info("Non-streaming LCEL response generated: %.100s... (session: %s)", response_text, conversation_id)
            # After the invoke, RunnableWithMessageHistory will have called get_session_history again to save the new messages.
            # The logging in get_session_history will show the updated message count for the *next* turn if it's called for the same session_id.
            # For an immediate view of the updated history for *this* turn:
            if conversation_id in module_level_session_histories: # Check module-level store
                 history_obj_after = module_level_session_histories[conversation_id]
                 logger.debug(f"SESSION_HISTORY ({conversation_id}): Message count after this turn: {len(history_obj_after.messages)}")
            return response_text
        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.ainvoke: %s (session: %s)", e, conversation_id, exc_info=True)
            return "Uh oh, it seems my sarcasm circuits (LCEL+History edition) are a bit fried. Try again?"


    async def async_generate_streaming_response(
        self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"
    ) -> AsyncGenerator[str, None]:
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)
        # The get_session_history method (called by RunnableWithMessageHistory) will log the state of history *before* this turn.
        logger.debug(f"SESSION_HISTORY ({conversation_id}): Invoking runnable_with_history.astream.")
        try:
            async for token in self.runnable_with_history.astream(
                {"user_input_combined": combined_input},
                config={"configurable": {"session_id": conversation_id}}
            ):
                if token:
                    yield token
            logger.info("Streaming LCEL response completed. (session: %s)", conversation_id)
            # After the stream, RunnableWithMessageHistory will have called get_session_history again to save the new messages.
            # For an immediate view of the updated history for *this* turn:
            if conversation_id in module_level_session_histories: # Check module-level store
                 history_obj_after = module_level_session_histories[conversation_id]
                 logger.debug(f"SESSION_HISTORY ({conversation_id}): Message count after this turn: {len(history_obj_after.messages)}")
        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.astream: %s (session: %s)", e, conversation_id, exc_info=True)
            yield "Oh, wow. My LCEL (with History!) stream of consciousness just... stopped. Could this BE a server hiccup?"
