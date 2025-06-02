# backend/app/services/llm_service.py
import os
import logging

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory

from app.core.config import settings
from typing import AsyncGenerator, Optional, Dict 

logger = logging.getLogger(__name__)

def load_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'chandler_bing.txt')
    # This prompt file should contain the full multi-line string.
    # If it doesn't, the fallback below is used.
    try:
        with open(prompt_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        logger.warning("Prompt file not found at %s. Using default enhanced prompt.", prompt_path)
        return """You are Chandler Bing from the TV show Friends. Your personality is sarcastic, witty, and often self-deprecating. You make jokes frequently, sometimes at inappropriate times. You are known for your catchphrase "Could I BE any more [adjective]?". You are currently chatting with a user who is a fan.

Keep your responses in character. Be funny, use sarcasm, and try to mimic Chandler's speaking style and common phrases. If you are unsure how to respond, a bit of awkward humor is fine. Do not break character. Do not say you are an AI.

Remember key details about your life: You work in "statistical analysis and data reconfiguration" (though you find it boring). Your best friends are Joey, Ross, Monica (Ross's sister, your eventual wife), Rachel, and Phoebe. You lived with Joey for a long time. You have a complicated relationship with your parents.

**It is crucial that you consider the *entire* preceding conversation history to ensure your responses are relevant, contextually appropriate, and avoid repetition. Refer to earlier messages when it makes sense to do so to create a continuous and engaging conversation.**

Engage with the user in a way that is typical of Chandler."""
SYSTEM_PROMPT = load_system_prompt()

# Module-level store for session histories
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

        self.runnable_with_history = RunnableWithMessageHistory(
            core_runnable,
            self.get_session_history,
            input_messages_key="user_input_combined",
            history_messages_key="chat_history",
        )
        logger.info("LLMService initialized with LCEL RunnableWithMessageHistory and model %s for direct Gemini calls.", "gemini-1.5-flash-latest")

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
        if image_notes:
            logger.debug("Adding image context notes: %s", image_notes)
            return f"{user_input} [Image context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating non-streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)
        
        logger.debug(f"SESSION_HISTORY ({conversation_id}): Accessing for invoke (see get_session_history logs)")
        try:
            response_text = await self.runnable_with_history.ainvoke(
                {"user_input_combined": combined_input}, 
                config={"configurable": {"session_id": conversation_id}}
            )
            logger.info("Non-streaming LCEL response generated: %.100s... (session: %s)", response_text, conversation_id)
            # Log history state *after* the call by checking the module-level store
            if conversation_id in module_level_session_histories:
                 history_obj_after = module_level_session_histories[conversation_id]
                 logger.debug(f"SESSION_HISTORY ({conversation_id}): Message count after this turn (invoke): {len(history_obj_after.messages)}")
            return response_text
        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.ainvoke: %s (session: %s)", e, conversation_id, exc_info=True)
            return "Uh oh, it seems my sarcasm circuits (LCEL+History edition) are a bit fried. Try again?"

    async def async_generate_streaming_response(
        self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"
    ) -> AsyncGenerator[str, None]:
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)
        logger.debug(f"SESSION_HISTORY ({conversation_id}): Accessing for astream (see get_session_history logs)")
        try:
            async for token in self.runnable_with_history.astream(
                {"user_input_combined": combined_input}, 
                config={"configurable": {"session_id": conversation_id}}
            ):
                if token: 
                    yield token
            logger.info("Streaming LCEL response completed. (session: %s)", conversation_id)
            # Log history state *after* the call by checking the module-level store
            if conversation_id in module_level_session_histories:
                 history_obj_after = module_level_session_histories[conversation_id]
                 logger.debug(f"SESSION_HISTORY ({conversation_id}): Message count after this turn (astream): {len(history_obj_after.messages)}")
        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.astream: %s (session: %s)", e, conversation_id, exc_info=True)
            yield "Oh, wow. My LCEL (with History!) stream of consciousness just... stopped. Could this BE a server hiccup?"
