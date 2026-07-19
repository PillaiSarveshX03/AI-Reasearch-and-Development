from google import genai
from app.config import settings
from app.prompts import SYSTEM_RULES, LEVEL_PROMPTS

client = genai.Client(api_key=settings.GOOGLE_API_KEY)

GREETING_RESPONSE = (
    "Hi there! I'm your AI tutor. Ask me a question about your course "
    "material and I'll help you understand it."
)


def generate_response(question, context, level, is_greeting=False):

    # Return greeting without calling the LLM
    if is_greeting:
        return GREETING_RESPONSE

    level_prompt = LEVEL_PROMPTS.get(level, LEVEL_PROMPTS["intermediate"])
    system_prompt = SYSTEM_RULES + "\n" + level_prompt

    prompt = f"""
{system_prompt}

Knowledge Base:
{context}

Student Question:
{question}

Explain naturally.

Do NOT copy the context word-for-word.
"""

    response = client.models.generate_content(
        model=settings.MODEL_NAME,  # Example: "gemini-2.5-flash"
        contents=prompt,
        config={
            "temperature": 0.5,
            "max_output_tokens": 500,
        },
    )

    return response.text