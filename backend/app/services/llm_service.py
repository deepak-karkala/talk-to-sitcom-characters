# backend/app/services/llm_service.py
import os
import logging
# No longer need asyncio here directly unless for other async utilities not part of this core change
# import asyncio

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
# Remove ConversationBufferMemory import
# from langchain.memory import ConversationBufferMemory

from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
# Prefer in_memory from langchain_community if available as per common examples,
# otherwise langchain_core.chat_history might be the path.
# Let's assume langchain_community.chat_message_histories.in_memory.ChatMessageHistory for now.
# If this specific path is an issue, the worker will try alternatives like `from langchain_core.chat_history import BaseChatMessageHistory, InMemoryChatMessageHistory`
# and use InMemoryChatMessageHistory. For now, trying with the direct path often seen in examples.
from langchain_community.chat_message_histories import ChatMessageHistory # New import

from app.core.config import settings
from typing import AsyncGenerator, Optional, Dict, Any, List
# BaseMessage, AIMessage, HumanMessage might not be directly needed here anymore if RunnableWithMessageHistory handles types

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
            MessagesPlaceholder(variable_name="chat_history"), # For RunnableWithMessageHistory
            HumanMessagePromptTemplate.from_template("{user_input_combined}") # Input key for user message
        ])

        core_runnable = self.prompt | self.llm | StrOutputParser()

        # In-memory store for session histories
        self.session_histories: Dict[str, ChatMessageHistory] = {}

        self.runnable_with_history = RunnableWithMessageHistory(
            core_runnable,
            self.get_session_history, # Method to load/store session history
            input_messages_key="user_input_combined", # Key for the user's current input
            history_messages_key="chat_history", # Key for where history messages are injected into the prompt
        )
        logger.info("LLMService initialized with LCEL RunnableWithMessageHistory and model %s.", "gemini-1.5-flash-latest")

    def get_session_history(self, session_id: str) -> ChatMessageHistory:
        """Retrieves or creates an in-memory chat message history for a given session ID."""
        if session_id not in self.session_histories:
            logger.info(f"Creating new chat history for session_id: {session_id}")
            self.session_histories[session_id] = ChatMessageHistory()
        else:
            logger.info(f"Using existing chat history for session_id: {session_id}")
        return self.session_histories[session_id]

    def _prepare_input_with_image_context(self, user_input: str, image_notes: Optional[str]) -> str:
        if image_notes:
            logger.debug("Adding image context notes: %s", image_notes)
            return f"{user_input} [Image context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating non-streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)

        try:
            # RunnableWithMessageHistory handles history internally based on session_id in config
            response_text = await self.runnable_with_history.ainvoke(
                {"user_input_combined": combined_input},
                config={"configurable": {"session_id": conversation_id}}
            )
            logger.info("Non-streaming LCEL response generated: %.100s... (session: %s)", response_text, conversation_id)
            return response_text
        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.ainvoke: %s (session: %s)", e, conversation_id, exc_info=True)
            return "Uh oh, it seems my sarcasm circuits (LCEL+History edition) are a bit fried. Try again?"

    async def async_generate_streaming_response(
        self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"
    ) -> AsyncGenerator[str, None]:
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)

        try:
            # RunnableWithMessageHistory handles history internally based on session_id in config
            async for token in self.runnable_with_history.astream(
                {"user_input_combined": combined_input},
                config={"configurable": {"session_id": conversation_id}}
            ):
                # token here is already a string due to StrOutputParser
                if token:
                    yield token
            logger.info("Streaming LCEL response completed. (session: %s)", conversation_id)
        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.astream: %s (session: %s)", e, conversation_id, exc_info=True)
            yield "Oh, wow. My LCEL (with History!) stream of consciousness just... stopped. Could this BE a server hiccup?"
