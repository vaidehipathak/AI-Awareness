"""
Groq API client helper for AI Shield chatbot.
"""
import os
import logging
from typing import List, Dict
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Initialize Groq client
api_key = os.getenv("GROQ_API_KEY")
if not api_key:
    logger.warning("GROQ_API_KEY not found in environment")

client = Groq(api_key=api_key)
MODEL_NAME = "llama-3.3-70b-versatile" # Premium Llama 3 model

def lmstudio_chat(
    messages: List[Dict[str, str]], 
    temperature: float = 0.3, 
    max_tokens: int = 800
) -> str:
    """
    Call Groq API for chatbot responses.
    """
    try:
        completion = client.chat.completions.create(
            model=MODEL_NAME,
            messages=messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return completion.choices[0].message.content.strip()
    except Exception as e:
        logger.error(f"Groq API Error: {e}")
        raise
