# Chatterbox - Chat with AI Characters

Chatterbox is a GenAI application that allows users to converse with interactive, AI-powered versions of famous Sitcom, TV show, or Movie characters. The initial character is Chandler Bing from "Friends."

## Prerequisites

Before you begin, ensure you have the following installed:
*   [Node.js](https://nodejs.org/) (LTS version recommended, includes npm)
*   [Python](https://www.python.org/downloads/) (version 3.9+ recommended)
*   `pip` (Python package installer)
*   `git` (for cloning, if you haven't already)

## Project Structure

*   `frontend/`: Contains the Next.js application.
*   `backend/`: Contains the Python FastAPI application.

## Backend Setup (FastAPI)

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    ```
    Activate the virtual environment:
    *   On Windows:
        ```bash
        .\venv\Scripts\activate
        ```
    *   On macOS/Linux:
        ```bash
        source venv/bin/activate
        ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up environment variables:**
    *   Copy the example environment file:
        ```bash
        cp .env.example .env
        ```
    *   Edit the `.env` file and add your API keys (e.g., `GOOGLE_API_KEY`, `LANGCHAIN_API_KEY`). For local development without actual LLM calls yet, placeholder values are fine, but the keys will be needed for Phase 2.

5.  **Run the FastAPI development server:**
    ```bash
    uvicorn app.main:app --reload --port 8000
    ```
    The backend API will be available at `http://localhost:8000`. You can access the OpenAPI documentation at `http://localhost:8000/docs`.

## Frontend Setup (Next.js)

1.  **Navigate to the frontend directory:**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```
    _If you encounter issues, try `npm install --legacy-peer-deps` or ensure your Node.js version is compatible._

3.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    The frontend application will be available at `http://localhost:3000`.

## Running the Application

For the full application experience (once backend and frontend are connected):
1.  Start the backend server as described above.
2.  Start the frontend server as described above.
3.  Open your browser and go to `http://localhost:3000`.

---
_This README will be updated as the project progresses with more features and deployment instructions._