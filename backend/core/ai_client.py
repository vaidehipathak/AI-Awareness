"""
LM Studio client helper for OpenAI-compatible API calls.
"""
import requests
import logging
from typing import List, Dict

logger = logging.getLogger(__name__)

# Configuration constants
LM_STUDIO_URL = "http://localhost:1234/v1/chat/completions"
MODEL_NAME = "google/gemma-3-12b"


def lmstudio_chat(
    messages: List[Dict[str, str]], 
    temperature: float = 0.1, 
    max_tokens: int = 512
) -> str:
    """
    Call LM Studio's chat completions endpoint.
    
    Args:
        messages: List of message dicts with 'role' and 'content' keys
        temperature: Sampling temperature (0.0-1.0)
        max_tokens: Maximum tokens to generate
        
    Returns:
        Assistant's response as a string
        
    Raises:
        requests.exceptions.RequestException: On connection/HTTP errors
        ValueError: If response format is invalid
    """
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
        "stream": False
    }
    
    try:
        logger.debug(f"Calling LM Studio with {len(messages)} messages, temp={temperature}")
        response = requests.post(LM_STUDIO_URL, json=payload, timeout=60)
        response.raise_for_status()
    except requests.exceptions.ConnectionError as e:
        logger.error(f"Connection error to LM Studio: {e}")
        raise requests.exceptions.ConnectionError(
            f"Cannot connect to LM Studio at {LM_STUDIO_URL}. "
            "Ensure LM Studio is running with the model loaded on port 1234."
        )
    except requests.exceptions.Timeout as e:
        logger.error(f"Timeout calling LM Studio: {e}")
        raise requests.exceptions.Timeout(
            "LM Studio request timed out (60s). Model may be busy or overloaded. "
            "Try again or increase timeout."
        )
    except requests.exceptions.HTTPError as e:
        logger.error(f"HTTP error from LM Studio: {response.status_code} - {response.text}")
        raise requests.exceptions.HTTPError(
            f"LM Studio returned HTTP {response.status_code}. "
            f"Response: {response.text[:200]}"
        )
    except Exception as e:
        logger.error(f"Unexpected error calling LM Studio: {e}")
        raise
    
    try:
        data = response.json()
        content = data["choices"][0]["message"]["content"]
        logger.debug(f"LM Studio response: {content[:100]}...")
        return content.strip()
    except (KeyError, IndexError) as e:
        logger.error(f"Unexpected LM Studio response format: {data}")
        raise ValueError(f"Unexpected LM Studio response format: {e}")

