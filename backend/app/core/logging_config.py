# backend/app/core/logging_config.py
import logging
import sys

def setup_logging(log_level=logging.INFO):
    """Configures basic logging for the application."""

    # Define a basic log format
    log_format = "%(asctime)s - %(name)s - %(levelname)s - %(message)s"

    # Get the root logger
    logger = logging.getLogger()

    # Remove any existing handlers to avoid duplicate logs if reconfigured
    if logger.hasHandlers():
        logger.handlers.clear()

    # Configure the root logger
    logging.basicConfig(
        level=log_level,
        format=log_format,
        handlers=[
            logging.StreamHandler(sys.stdout) # Log to stdout
            # You can add FileHandler here if you want to log to a file
            # logging.FileHandler("app.log"),
        ]
    )

    # You might want to set different levels for specific loggers, e.g.:
    # logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    # logging.getLogger("langchain").setLevel(logging.INFO)

# To test the logging setup (optional)
if __name__ == "__main__":
    setup_logging(logging.DEBUG)
    logging.debug("Debug message from logging_config")
    logging.info("Info message from logging_config")
    logging.warning("Warning message from logging_config")
    logging.error("Error message from logging_config")
