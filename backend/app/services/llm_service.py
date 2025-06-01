# backend/app/services/llm_service.py
import os
import logging
import asyncio
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.memory import ConversationBufferMemory
from langchain_core.output_parsers import StrOutputParser # New import
# from langchain_core.runnables import RunnablePassthrough # If needed later

from app.core.config import settings
from typing import AsyncGenerator, Optional, Dict, Any, List
from langchain_core.messages import BaseMessage, AIMessage, HumanMessage


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

# Global memory instance. This needs to be session-specific in a real multi-user app.
# conversation_memory_store = {} # Example for session-specific, not implemented in this step

# def get_session_memory(session_id: str) -> ConversationBufferMemory:
#     if session_id not in conversation_memory_store:
#         conversation_memory_store[session_id] = ConversationBufferMemory(
#             memory_key="chat_history", return_messages=True
#         )
#     return conversation_memory_store[session_id]


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

        # LCEL Runnable
        self.runnable = self.prompt | self.llm | StrOutputParser()

        # Global memory for this example. Refactor for session memory in production.
        # For LCEL, memory management is often handled by composing runnables or explicitly passing history.
        # This instance memory is for explicit loading/saving.
        self.memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

        logger.info("LLMService initialized with LCEL runnable and model %s.", "gemini-1.5-flash-latest")

    def _prepare_input_with_image_context(self, user_input: str, image_notes: Optional[str]) -> str:
        if image_notes:
            logger.debug("Adding image context notes: %s", image_notes)
            return f"{user_input} [Image context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        # session_memory = get_session_memory(conversation_id) # Future session-specific memory
        session_memory = self.memory # Using global memory for now

        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating non-streaming LCEL response for input: %.100s...", combined_input)

        loaded_memory = await asyncio.to_thread(session_memory.load_memory_variables, {})
        chat_history_messages = loaded_memory.get("chat_history", [])

        try:
            response_text = await self.runnable.ainvoke({
                "user_input_combined": combined_input,
                "chat_history": chat_history_messages
            })

            await asyncio.to_thread(session_memory.save_context, {"input": combined_input}, {"output": response_text})

            logger.info("Non-streaming LCEL response generated: %.100s...", response_text)
            return response_text
        except Exception as e:
            logger.error("Error during LCEL runnable.ainvoke: %s", e, exc_info=True)
            return "Uh oh, it seems my sarcasm circuits (LCEL edition) are a bit fried. Try again?"

    async def async_generate_streaming_response(
        self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"
    ) -> AsyncGenerator[str, None]:
        # session_memory = get_session_memory(conversation_id) # Future session-specific memory
        session_memory = self.memory # Using global memory for now

        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating streaming LCEL response for input: %.100s...", combined_input)

        loaded_memory = await asyncio.to_thread(session_memory.load_memory_variables, {})
        chat_history_messages = loaded_memory.get("chat_history", [])

        full_response_for_memory = []
        try:
            async for token in self.runnable.astream({
                "user_input_combined": combined_input,
                "chat_history": chat_history_messages
            }):
                if token:
                    # await asyncio.sleep(0.01) # Removed for now, was for debugging
                    full_response_for_memory.append(token)
                    yield token

            ai_response_str = "".join(full_response_for_memory)
            await asyncio.to_thread(session_memory.save_context, {"input": combined_input}, {"output": ai_response_str})

            logger.info("Streaming LCEL response completed.")
        except Exception as e:
            logger.error("Error during LCEL runnable.astream: %s", e, exc_info=True)
            yield "Oh, wow. My LCEL stream of consciousness just... stopped. Could this BE a server hiccup?"
