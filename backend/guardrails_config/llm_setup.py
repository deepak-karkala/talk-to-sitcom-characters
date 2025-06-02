# backend/guardrails_config/llm_setup.py
from langchain_google_genai import ChatGoogleGenerativeAI
import os
import logging

# Attempt to load .env from the parent 'backend' directory.
# This is crucial if NeMo server starts with guardrails_config as CWD.
try:
    from dotenv import load_dotenv
    # Assuming .env is in the parent directory relative to this guardrails_config dir
    dotenv_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(dotenv_path):
        load_dotenv(dotenv_path)
        logging.info(f"llm_setup.py: Loaded .env from {dotenv_path}")
    else:
        logging.warning(f"llm_setup.py: .env file not found at {dotenv_path}")
except ImportError:
    logging.warning("llm_setup.py: python-dotenv not installed, relying on pre-set environment variables.")
except Exception as e:
    logging.error(f"llm_setup.py: Error loading .env: {e}")


def get_llm_instance_for_nemo():
    # Configure logging for this module if it's run separately or for clarity
    logger_llm_setup = logging.getLogger(__name__)
    logger_llm_setup.info("get_llm_instance_for_nemo called")

    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        logger_llm_setup.error("GOOGLE_API_KEY not found in environment for NeMo LLM setup.")
        # NeMo might handle this more gracefully, but good to log
        raise ValueError("GOOGLE_API_KEY not found in environment for NeMo LLM setup.") 
    
    logger_llm_setup.info(f"Found GOOGLE_API_KEY, length: {len(api_key) if api_key else 0}")
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-1.5-flash-latest", 
        api_key=api_key,
        temperature=0.7
        # Ensure no deprecated params here
    )
    logger_llm_setup.info(f"ChatGoogleGenerativeAI instance created with model gemini-1.5-flash-latest: {llm}")
    return llm

# This is what NeMo's config.yml will try to import.
# It must be an actual instance.
try:
    # Set up basic logging for this script to see if it executes during NeMo startup
    logging.basicConfig(level=logging.INFO)
    langchain_llm_instance = get_llm_instance_for_nemo()
    logging.info("llm_setup.py: langchain_llm_instance created successfully.")
except Exception as e:
    logging.error(f"llm_setup.py: Failed to create langchain_llm_instance: {e}", exc_info=True)
    langchain_llm_instance = None # Ensure it exists but is None if creation fails
