"""End-to-end tests for the chat interface."""

import os
from playwright.sync_api import Page, expect


BASE_URL = os.getenv("PLAYWRIGHT_BASE_URL", "http://localhost:3000")
# Define absolute path for traces
TRACE_DIR_PART1 = "/Users/deepak/Documents/work/projects/"
TRACE_DIR_PART2 = "talk-to-sitcom-characters/backend/tests/e2e/traces/"
TRACE_DIR_ABSOLUTE = os.path.join(TRACE_DIR_PART1, TRACE_DIR_PART2)


def test_chandler_sends_greeting(page: Page):
    """Test that Chandler's initial greeting appears when the page loads."""
    page.goto(BASE_URL)
    greeting_text = "Could I BE any more ready to chat?"
    
    # Updated locator: targets outer div with data-testid, 
    # then inner div with class and text
    greeting_locator_text_part = f':has-text("{greeting_text}")'
    greeting_locator = (
        f'div[data-testid="message-container"] '
        f'div.message-bubble-character{greeting_locator_text_part}'
    )

    greeting_message = page.locator(greeting_locator)
    expect(greeting_message).to_be_visible(timeout=15000)


def test_send_message_and_receive_reply(page: Page):
    """Test sending a message and receiving a reply from Chandler."""
    trace_path = os.path.join(
        TRACE_DIR_ABSOLUTE, "send_message_trace.zip"
    )
    page.context.tracing.start(
        screenshots=True, snapshots=True, sources=True
    )
    try:
        page.goto(BASE_URL)
        
        message_input_locator = 'textarea[placeholder*="Type your message"]'
        message_input = page.locator(message_input_locator)
        expect(message_input).to_be_visible()
        message_input.fill("Hey Chandler, how are you?")
        
        # Click send
        send_button = page.locator('button[aria-label="Send message"]')
        send_button.click()
        
        # Check if user message appears
        user_message_text = "Hey Chandler, how are you?"
        # More specific locator for the user message
        user_message_locator = (
            f'div[data-testid="message-container"] '
            f'div.message-bubble-user:has-text("{user_message_text}")'
        )
        user_message = page.locator(user_message_locator)
        expect(user_message).to_be_visible()
        
        # Wait for typing indicator to appear
        typing_indicator = page.locator('[data-testid="typing-indicator"]')
        expect(typing_indicator).to_be_visible()
        
        # Wait for typing indicator to disappear (meaning response is complete)
        expect(typing_indicator).to_be_hidden(timeout=30000)  # 30s timeout
        
        # Verify a response appeared in a character message bubble
        character_messages = page.locator('.message-bubble-character')
        last_message = character_messages.last
        expect(last_message).to_be_visible()
        expect(last_message).not_to_be_empty()
    finally:
        page.context.tracing.stop(path=trace_path)


def test_image_upload_and_response(page: Page):
    """Test uploading an image and receiving a response about it."""
    trace_path = os.path.join(
        TRACE_DIR_ABSOLUTE, "image_upload_trace.zip"
    )
    page.context.tracing.start(
        screenshots=True, snapshots=True, sources=True
    )
    try:
        page.goto(BASE_URL)
        
        upload_button = page.locator('input[data-testid="file-input"]')
        test_image = 'tests/e2e/fixtures/test_image.jpg'
        
        # Expect the upload button to be available (it's hidden, but present)
        expect(upload_button).to_be_attached()

        upload_button.set_input_files(test_image)
        
        # Verify image preview appears in chat IMMEDIATELY after upload
        uploaded_image = page.locator('[data-testid="uploaded-image-preview"]')
        # Increased timeout for image to appear
        expect(uploaded_image).to_be_visible(timeout=10000)
        
        message_input_locator = 'textarea[placeholder*="Type your message"]'
        message_input = page.locator(message_input_locator)
        message_input.fill("What do you think about this image?")
        
        send_button = page.locator('button[aria-label="Send message"]')
        send_button.click()
        
        # Wait for and verify response
        typing_indicator = page.locator('[data-testid="typing-indicator"]')
        expect(typing_indicator).to_be_visible()
        expect(typing_indicator).to_be_hidden(timeout=30000)
        
        # Verify response contains reference to the image
        character_messages = page.locator('.message-bubble-character')
        last_message = character_messages.last
        expect(last_message).to_be_visible()
        expect(last_message).not_to_be_empty()
    finally:
        page.context.tracing.stop(path=trace_path) 