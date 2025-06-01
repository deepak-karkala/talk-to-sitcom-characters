# Project Challenges & Learnings

This document logs some of the key technical challenges encountered during the development of the "Chatterbox" application and how they were addressed.

## 1. Frontend Streaming Appearance (User Feedback Driven)

*   **Challenge:** AI responses were appearing on the frontend all at once, instead of streaming token-by-token, despite using FastAPI's `StreamingResponse` and Langchain's `astream()`.
*   **Initial Attempts:**
    *   Added a small `asyncio.sleep(0.01)` between yielding tokens in the backend service. This did not resolve the visual issue.
*   **Resolution / Key Learning:**
    *   The Vercel AI SDK's `useChat` hook, when consuming streams from an external backend, can be particular about the stream format.
    *   Explicitly formatting each yielded chunk from FastAPI as `0:"<JSON_stringified_token>\n"` (where the token itself is JSON stringified) proved effective. This aligns with a protocol the AI SDK uses for streaming text data.
    *   Refactoring to Langchain Expression Language (LCEL) was done in parallel for modernization, which also inherently improved clarity of the streaming pipeline. The visual streaming started working after the LCEL refactor *and* the correct Vercel AI SDK stream formatting was in place.

## 2. LangSmith Integration (User Feedback Driven)

*   **Challenge:** LangSmith traces were not appearing in the dashboard despite setting the required `LANGCHAIN_...` environment variables in the `.env` file and `pydantic-settings` confirming they were loaded into the application's `settings` object.
*   **Initial Attempts:**
    *   Code reviews confirmed no explicit disabling of LangSmith.
    *   Logging confirmed `settings` object in FastAPI had the correct LangSmith config values.
*   **Resolution / Key Learning:**
    *   Langchain's automatic pickup of environment variables for global features like LangSmith tracing can depend on `os.environ` being populated *before* Langchain modules are first imported (as they might read `os.environ` at import time).
    *   Explicitly calling `load_dotenv()` from the `python-dotenv` package at the very beginning of `backend/app/main.py` (before other key imports like FastAPI, settings, or Langchain-related modules) resolved this. This ensured `os.environ` was populated early enough for Langchain's global state to initialize correctly with tracing enabled.

## 3. Python Import Paths (User Feedback Driven)

*   **Challenge:** When running the FastAPI server using `uvicorn app.main:app` from the `backend/` directory, `ModuleNotFoundError` occurred due to import paths like `from backend.app.services...`.
*   **Resolution / Key Learning:**
    *   Corrected all internal application imports within the `backend/app/` directory to be relative to the `app` package (e.g., `from app.services...`, `from app.core...`). This is standard practice when structuring a Python application that will be run with its root directory in `PYTHONPATH` or when using an entry point like `app.main:app`.

## 4. Deprecated Langchain Features (Ongoing)

*   **Challenge:** Encountered deprecation warnings for:
    *   `LLMChain`: Indicated a shift towards Langchain Expression Language (LCEL).
    *   `ConversationBufferMemory` (when used with LCEL in a specific way): Pointed to new patterns for integrating memory with LCEL runnables.
    *   `convert_system_message_to_human` parameter in `ChatGoogleGenerativeAI`.
*   **Resolution / Actions:**
    *   `convert_system_message_to_human`: Addressed by removing the parameter and ensuring the system prompt was correctly positioned for the updated `ChatGoogleGenerativeAI` model (`gemini-1.5-flash-latest`).
    *   `LLMChain`: Successfully refactored the core logic in `LLMService` to use LCEL (`prompt | llm | StrOutputParser()`).
    *   `ConversationBufferMemory`: This is the next item to be addressed by refactoring to use `RunnableWithMessageHistory` as per Langchain's latest guidelines.

---
*This log will be updated as new challenges arise and are addressed.*
