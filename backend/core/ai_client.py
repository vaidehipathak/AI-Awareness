"""
LM Studio client helper for OpenAI-compatible API calls.
Optimized for Gemma-3-4B on CPU.
"""
import requests
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Configuration constants
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"

# EXACT MATCH from your LM Studio screenshot
MODEL_NAME = "gemma-3-4b-it" 

def lmstudio_chat(
    messages: List[Dict[str, str]], 
    temperature: float = 0.7, 
    max_tokens: int = 800
) -> str:
    """
    Call LM Studio's chat completions endpoint.
    """
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }
    
    try:
        logger.debug(f"Calling LM Studio with {len(messages)} messages")
        # 120 seconds is perfect for 4B model on CPU
        response = requests.post(LM_STUDIO_URL, json=payload, timeout=120) 
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        raise requests.exceptions.ConnectionError(
            "Cannot connect to LM Studio. Make sure the toggle switch in LM Studio is 'ON'."
        )
    except requests.exceptions.Timeout:
        raise requests.exceptions.Timeout(
            "The model is taking too long. Try setting 'CPU Threads' to 8 in LM Studio."
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise
    
    try:
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except (KeyError, IndexError) as e:
        raise ValueError(f"Unexpected response format from LM Studio: {e}")