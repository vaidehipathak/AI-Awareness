"""
Groq API client helper for OpenAI-compatible API calls.
Switching from local LM Studio to Groq for better performance and reasoning.
"""
import os
import requests
import logging
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configuration constants
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"
# Using Llama 3.3 70B for high intelligence and strict adherence to safety rules
MODEL_NAME = "llama-3.3-70b-versatile" 

def get_groq_api_key():
    return os.getenv("GROQ_API_KEY")

def lmstudio_chat(
    messages: List[Dict[str, str]], 
    temperature: float = 0.7, 
    max_tokens: int = 800
) -> str:
    """
    Call Groq's chat completions endpoint.
    Function kept as 'lmstudio_chat' for backward compatibility with safety.py,
    but internally calls Groq.
    """
    api_key = get_groq_api_key()
    if not api_key:
        logger.error("GROQ_API_KEY not found in .env")
        raise ValueError("Missing Groq API Key. Please add GROQ_API_KEY to backend/.env")

    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }
    
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    
    try:
        logger.debug(f"Calling Groq API with {len(messages)} messages")
        response = requests.post(GROQ_API_URL, json=payload, headers=headers, timeout=10) 
        response.raise_for_status()
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 401:
            logger.error("Invalid Groq API Key")
            raise ValueError("Invalid Groq API Key. Please check your credentials.")
        logger.error(f"Groq API Error: {e}")
        raise
    except requests.exceptions.ConnectionError:
        raise requests.exceptions.ConnectionError(
            "Cannot connect to Groq API. Please check your internet connection."
        )
    except requests.exceptions.Timeout:
        raise requests.exceptions.Timeout(
            "Groq API request timed out."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
    
    try:
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected response format from Groq: {e}")
