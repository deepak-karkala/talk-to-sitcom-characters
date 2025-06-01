# backend/app/services/llm_service.py
# (Imports and other parts of the class remain largely the same)
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain.chains import LLMChain
from langchain.memory import ConversationBufferMemory
from backend.app.core.config import settings
from typing import AsyncGenerator, Optional # Added Optional

def load_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'chandler_bing.txt')
    try:
        with open(prompt_path, 'r') as f:
            return f.read()
    except FileNotFoundError:
        print(f"Warning: Prompt file not found at {prompt_path}. Using default prompt.")
        return "You are a helpful assistant. Please respond in a sarcastic tone."

SYSTEM_PROMPT = load_system_prompt()
# Global memory for now, acknowledge this needs to be session-specific in multi-user env
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

class LLMService:
    def __init__(self):
        if not settings.GOOGLE_API_KEY:
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")

        self.llm = ChatGoogleGenerativeAI(
            model="gemini-pro",
            api_key=settings.GOOGLE_API_KEY,
            temperature=0.7,
            convert_system_message_to_human=True
        )

        self.prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{user_input_combined}") # Changed from user_input
        ])

        self.chain = LLMChain(
            llm=self.llm,
            prompt=self.prompt,
            memory=memory,
            verbose=True
        )

    def _prepare_input_with_image_context(self, user_input: str, image_notes: Optional[str]) -> str:
        if image_notes:
            return f"{user_input} [User has provided an image with the following context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        try:
            # Ensure the key matches the one in HumanMessagePromptTemplate.from_template
            result = self.chain.invoke({"user_input_combined": combined_input})
            response_text = result.get('text', "I seem to be at a loss for words... could this BE any more awkward?")
            return response_text
        except Exception as e:
            print(f"Error during LLMChain invocation: {e}")
            return "Uh oh, it seems my sarcasm circuits are a bit fried. Try again?"

    async def async_generate_streaming_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv") -> AsyncGenerator[str, None]:
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        try:
            # Ensure the key matches the one in HumanMessagePromptTemplate.from_template
            async for chunk in self.chain.astream(input={"user_input_combined": combined_input}):
                token = chunk.get("text")
                if token:
                    yield token
        except Exception as e:
            print(f"Error during LLMChain astream: {e}")
            yield "Oh, wow. My stream of consciousness just... stopped. Could this BE a server hiccup?"

# Test functions (main_test, stream_test) would be here, commented out for brevity
# if __name__ == "__main__":
#     import asyncio
#     # Define and run test functions if needed, ensuring they pass image_notes=None or some value.
#     pass
