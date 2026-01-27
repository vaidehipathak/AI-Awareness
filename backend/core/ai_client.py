"""
Ollama API client helper.
Replaces Groq with local 'fine-tuned' Mistral model via Ollama.
"""
import os
import requests
import logging
from typing import List, Dict
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Configuration constants
OLLAMA_API_URL = "http://localhost:11434/api/chat"
# Using our custom "fine-tuned" model created via Modelfile
MODEL_NAME = "ai-awareness-core"

def lmstudio_chat(
    messages: List[Dict[str, str]], 
    temperature: float = 0.3, 
    max_tokens: int = 800
) -> str:
    """
    Call local Ollama chat completions endpoint.
    """
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "temperature": temperature,
        "stream": False,
        "options": {
            "num_predict": max_tokens
        }
    }
    
    try:
        logger.debug(f"Calling Ollama API ({MODEL_NAME}) with {len(messages)} messages")
        response = requests.post(OLLAMA_API_URL, json=payload, timeout=60) 
        response.raise_for_status()
    except requests.exceptions.ConnectionError:
        error_msg = (
            "Cannot connect to Ollama at localhost:11434. "
            "Please ensure Ollama is running and the model is created "
            "(run 'ollama create ai-awareness-core -f backend/Modelfile')."
        )
        logger.error(error_msg)
        raise requests.exceptions.ConnectionError(error_msg)
    except Exception as e:
        logger.error(f"Ollama API Error: {e}")
        raise
    
    try:
        data = response.json()
        # Ollama response format for /api/chat
        if "message" in data:
            return data["message"]["content"].strip()
        # Fallback or error check
        raise ValueError(f"Unexpected response format: {data}")
    except (KeyError, IndexError, ValueError) as e:
        logger.error(f"Parsing error: {e}")
        raise ValueError(f"Failed to parse Ollama response: {e}")
