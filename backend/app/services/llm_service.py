# backend/app/services/llm_service.py
import os
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate, SystemMessagePromptTemplate, HumanMessagePromptTemplate, MessagesPlaceholder
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_community.chat_message_histories import ChatMessageHistory
from app.core.config import settings
from app.core.guardrails_config import OUTPUT_DENYLIST_KEYWORDS, CANNED_RESPONSE_OUTPUT_TRIGGERED # New Guardrail imports
from typing import AsyncGenerator, Optional, Dict, List

logger = logging.getLogger(__name__)

# load_system_prompt and SYSTEM_PROMPT remain the same
def load_system_prompt():
    prompt_path = os.path.join(os.path.dirname(__file__), '..', 'prompts', 'chandler_bing.txt')
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

module_level_session_histories: Dict[str, ChatMessageHistory] = {}

# Helper for checking output
def check_output_for_violations(text_chunk: str) -> bool:
    lower_text_chunk = text_chunk.lower()
    for keyword in OUTPUT_DENYLIST_KEYWORDS:
        if keyword.lower() in lower_text_chunk:
            logger.warning("Output Guardrail triggered due to denied keyword: '%s' in chunk: '%.50s...'", keyword, text_chunk)
            return True
    # Add checks for common "AI self-reference" phrases
    ai_phrases = ["as an ai language model", "as a large language model", "i am an ai", "i'm an ai", "i am a language model"]
    for phrase in ai_phrases:
        if phrase in lower_text_chunk: # These are usually specific enough not to need broader search
            logger.warning("Output Guardrail triggered due to AI self-reference: '%s' in chunk: '%.50s...'", phrase, text_chunk)
            return True
    return False

class LLMService:
    def __init__(self):
        # ... (initialization remains the same)
        if not settings.GOOGLE_API_KEY:
            logger.error("GOOGLE_API_KEY not found in environment variables.")
            raise ValueError("GOOGLE_API_KEY not found in environment variables.")
        logger.info("Initializing ChatGoogleGenerativeAI with model: %s", "gemini-1.5-flash-latest")
        self.llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", api_key=settings.GOOGLE_API_KEY, temperature=0.7)
        self.prompt = ChatPromptTemplate.from_messages([
            SystemMessagePromptTemplate.from_template(SYSTEM_PROMPT),
            MessagesPlaceholder(variable_name="chat_history"),
            HumanMessagePromptTemplate.from_template("{user_input_combined}")
        ])
        core_runnable = self.prompt | self.llm | StrOutputParser()
        self.runnable_with_history = RunnableWithMessageHistory(
            core_runnable, self.get_session_history,
            input_messages_key="user_input_combined", history_messages_key="chat_history",
        )
        logger.info("LLMService initialized with LCEL RunnableWithMessageHistory and model %s for direct Gemini calls.", "gemini-1.5-flash-latest")


    def get_session_history(self, session_id: str) -> ChatMessageHistory:
        # ... (remains the same)
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
        # ... (remains the same)
        if image_notes:
            logger.debug("Adding image context notes: %s", image_notes)
            return f"{user_input} [Image context: {image_notes}]"
        return user_input

    async def generate_response(self, user_input: str, image_notes: Optional[str] = None, conversation_id: str = "default_conv"):
        combined_input = self._prepare_input_with_image_context(user_input, image_notes)
        logger.info("Generating non-streaming LCEL response for input: %.100s... (session: %s)", combined_input, conversation_id)

        try:
            response_text = await self.runnable_with_history.ainvoke(
                {"user_input_combined": combined_input},
                config={"configurable": {"session_id": conversation_id}}
            )

            # --- Output Guardrail Check for non-streaming ---
            if check_output_for_violations(response_text):
                logger.warning("Output Guardrail (non-streaming) triggered for session %s. Original response: '%.50s...'", conversation_id, response_text)
                # Note: RunnableWithMessageHistory will save the *original* LLM response here.
                # We are returning the canned response to the user, but the history will contain the violation.
                # This is acceptable for auditing/logging. If we wanted to save the canned response to history,
                # we would need to modify how RWMH saves, or do it manually after this call.
                return CANNED_RESPONSE_OUTPUT_TRIGGERED
            # --- End Output Guardrail Check ---

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

        stream_buffer = ""
        max_buffer_len = 50 # Increased buffer for better phrase matching
        guardrail_triggered_and_canned_response_sent = False

        try:
            async for token in self.runnable_with_history.astream(
                {"user_input_combined": combined_input},
                config={"configurable": {"session_id": conversation_id}}
            ):
                if guardrail_triggered_and_canned_response_sent:
                    # If guardrail already triggered, we stop processing original tokens.
                    # We need to ensure the history is correctly updated by RWMH,
                    # which saves the *original* stream. If we want to save the canned response
                    # to history instead, that's a more complex change involving how RWMH handles saving.
                    # For now, history will contain the original (violating) LLM output.
                    continue

                if token:
                    stream_buffer += token
                    if len(stream_buffer) > max_buffer_len:
                        stream_buffer = stream_buffer[-max_buffer_len:]

                    if check_output_for_violations(stream_buffer):
                        logger.warning("Output Guardrail (streaming) triggered for session %s. Buffer: '%.50s...'", conversation_id, stream_buffer)
                        stream_buffer = ""
                        guardrail_triggered_and_canned_response_sent = True
                        yield CANNED_RESPONSE_OUTPUT_TRIGGERED
                        # Important: We must break the loop to stop any further original tokens.
                        # The history will reflect the original (violating) response up to this point + subsequent tokens if not broken.
                        # RWMH saves the actual LLM output. By breaking, we ensure user sees canned response,
                        # but history will have partial original + full canned if not handled carefully.
                        # For simplicity now: user sees canned, history saves original partial + subsequent tokens.
                        # A more robust solution might involve a flag to RWMH or manual history update *after* this loop.
                        break

                    yield token

            if not guardrail_triggered_and_canned_response_sent:
                logger.info("Streaming LCEL response completed. (session: %s)", conversation_id)
            else:
                logger.info("Streaming LCEL response guardrailed and replaced with canned response. (session: %s)", conversation_id)

            # Log history state *after* the call by checking the module-level store
            # This will show the state after RWMH has processed the (potentially partial if guardrailed) stream.
            if conversation_id in module_level_session_histories:
                 history_obj_after = module_level_session_histories[conversation_id]
                 logger.debug(f"SESSION_HISTORY ({conversation_id}): Message count after this turn (astream): {len(history_obj_after.messages)}")

        except Exception as e:
            logger.error("Error during LCEL runnable_with_history.astream: %s (session: %s)", e, conversation_id, exc_info=True)
            if not guardrail_triggered_and_canned_response_sent:
                yield "Oh, wow. My LCEL (with History!) stream of consciousness just... stopped. Could this BE a server hiccup?"
