# backend/app/services/llm_service.py
import os
import logging
import asyncio # New import
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from app.core.config import settings # Corrected import
from typing import AsyncGenerator, Optional

logger = logging.getLogger(__name__) # New logger instance

def load_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'chandler_bing.txt')
    try:
        with open(prompt_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        logger.warning(f"Prompt file not found at {prompt_path}. Using default prompt.") # Logging
        return "You are a helpful assistant. Please respond in a sarcastic tone."

SYSTEM_PROMPT = load_system_prompt()
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

class LLMService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            logger.error("GOOGLE_API_KEY not found in environment variables.") # Logging
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")

        logger.info("Initializing ChatGoogleGenerativeAI with model: %s", "gemini-pro") # Logging
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            api_key=settings.GOOGLE_API_KEY,
            temperature=0.7,
            convert_system_message_to_human=True
        )

        self.prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{user_input_combined}")
        ])

        self.chain = LLMChain(
            llm=self.llm,
            prompt=self.prompt,
            memory=memory,
            verbose=settings.LANGCHAIN_VERBOSE # Use a setting for verbose, default to False if not set
        )
        logger.info("LLMService initialized successfully.") # Logging

    def _prepare_input_with_image_context(self, user_input: str, image_notes: Optional[str]) -> str:
        if image_notes:
            # Note: f-string evaluated immediately, so no sensitive data leak if image_notes is complex.
            logger.debug("Adding image context notes: %s", image_notes) # Logging with %s
            return f"{user_input} [Image context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        # Limiting logged input length
        logger.info("Generating non-streaming response for input (post-image context): %.100s...", combined_input) # Logging
        try:
            result = self.chain.invoke({"user_input_combined": combined_input})
            response_text = result.get('text', "I seem to be at a loss for words... could this BE any more awkward?")
            logger.info("Non-streaming response generated: %.100s...", response_text) # Logging
            return response_text
        except Exception as e:
            logger.error("Error during LLMChain invocation: %s", e, exc_info=True) # Logging with exc_info
            return "Uh oh, it seems my sarcasm circuits are a bit fried. Try again?"

    async def async_generate_streaming_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv") -> AsyncGenerator[str, None]:
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating streaming response for input (post-image context): %.100s...", combined_input) # Logging
        try:
            async for chunk in self.chain.astream(input={"user_input_combined": combined_input}):
                token = chunk.get("text")
                if token:
                    await asyncio.sleep(0.01) # Added small delay for debugging streaming
                    # logger.debug("Streamed token: %s", token) # Can be too verbose
                    yield token
            logger.info("Streaming response completed.") # Logging
        except Exception as e:
            logger.error("Error during LLMChain astream: %s", e, exc_info=True) # Logging with exc_info
            yield "Oh, wow. My stream of consciousness just... stopped. Could this BE a server hiccup?"
