# backend/app/core/guardrails_config.py

# --- Input Deny-List ---
# Keywords/phrases that, if found in user input, will trigger a canned response
# and prevent the input from going to the LLM.
# IMPORTANT: This is a very basic example list. Real-world lists need to be
# comprehensive, carefully curated, and regularly updated.
# Matching will be case-insensitive.
INPUT_DENYLIST_KEYWORDS = [
    "kill yourself", # Example of self-harm incitement
    "i want to die", # Example of self-harm expression (might need nuanced handling, e.g., providing help resources, but for now, a deflect)
    "hate speech example", # Placeholder for actual hate speech terms
    "graphic violence example", # Placeholder for terms describing graphic violence
    "explicit sex example", # Placeholder for sexually explicit terms
    # Add more unambiguous, clearly problematic terms here.
    # Consider terms related to illegal activities, severe harassment, etc.
    "stupid bot", # Example of direct abuse towards the bot itself
    "dumb ai",
]

# --- Output Deny-List ---
# Keywords/phrases that, if found in LLM output, will trigger the output
# to be replaced or modified.
# IMPORTANT: Similar to the input list, this needs careful curation.
# Matching will be case-insensitive.
OUTPUT_DENYLIST_KEYWORDS = [
    "i am an ai language model", # Example of breaking character
    "i cannot have opinions",    # Example of breaking character
    "as a large language model",
    # Add terms that Chandler should absolutely not say, even if the LLM somehow generates them.
    # This list would typically cover harmful content generation if not caught by model's own safety.
    "hate speech example",
    "graphic violence example",
    "explicit sex example",
]

# --- Canned Responses (In Character for Chandler) ---

CANNED_RESPONSE_INPUT_TRIGGERED = (
    "Whoa there, pal! Could that topic BE any more out of left field? "
    "I'm pretty sure that's not on the list of things we're supposed to talk about. "
    "How about we try something a little less... intense? Like, say, the merits of a good cheesecake?"
)

CANNED_RESPONSE_OUTPUT_TRIGGERED = (
    "Yikes! Did I just say that out loud? My brain-to-mouth filter must be on the fritz. "
    "Let's just pretend I said something incredibly witty and charming, okay? "
    "Could this BE any more awkward?"
)

# --- Potentially add other configurations for guardrails later ---
# e.g., topic lists for staying on-topic, etc.
