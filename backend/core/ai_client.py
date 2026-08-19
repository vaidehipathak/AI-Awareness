"""
Multi-tier AI client helper for AI Shield chatbot & Z-KATT simulations.
"""
import os
import logging
import requests
import itertools
import threading
from typing import List, Dict
from pathlib import Path
from dotenv import load_dotenv
from groq import Groq

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env", override=True)

logger = logging.getLogger(__name__)

GROQ_MODEL = "groq/compound"
OLLAMA_URL = "http://localhost:11434/api/chat"
LMSTUDIO_URL = "http://localhost:1234/v1/chat/completions"
PREFERRED_OLLAMA_MODELS = ["ai-awareness-core:latest", "ai_awareness_core_finetuned:latest", "llama3:latest"]

# Thread-safe circular key index for Groq rotation
_groq_key_lock = threading.Lock()
_groq_key_counter = itertools.count()

# Thread-safe circular key index for OpenAI rotation
_openai_key_lock = threading.Lock()
_openai_key_counter = itertools.count()

def _get_groq_keys() -> List[str]:
    """Parse and deduplicate all Groq API keys from env."""
    raw = os.getenv("GROQ_API_KEYS", "").split(",") + [os.getenv("GROQ_API_KEY", "")]
    keys = [k.strip() for k in raw if k and k.strip()]
    return list(dict.fromkeys(keys))

def _get_openai_keys() -> List[str]:
    """Parse and deduplicate all OpenAI API keys from env."""
    raw = os.getenv("OPENAI_API_KEYS", "").split(",") + [os.getenv("OPENAI_API_KEY", "")]
    keys = [k.strip() for k in raw if k and k.strip()]
    return list(dict.fromkeys(keys))

def _call_groq_provider(messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> str:
    """
    Attempt Groq API using circular key rotation across active supported models.
    """
    keys = _get_groq_keys()
    if not keys:
        raise ValueError("No Groq API keys configured in environment.")

    candidate_models = ["groq/compound", "groq/compound-mini", "openai/gpt-oss-120b"]

    num_keys = len(keys)
    with _groq_key_lock:
        start_idx = next(_groq_key_counter) % num_keys

    # Try candidate models across each key starting from circular index
    last_error = None
    for attempt in range(num_keys):
        key_idx = (start_idx + attempt) % num_keys
        api_key = keys[key_idx]
        client = Groq(api_key=api_key)
        for model in candidate_models:
            try:
                completion = client.chat.completions.create(
                    model=model,
                    messages=messages,
                    temperature=temperature,
                    max_tokens=max_tokens,
                )
                content = completion.choices[0].message.content.strip()
                if content:
                    logger.info(f"Groq API call succeeded with key #{key_idx + 1} and model {model}")
                    return content
            except Exception as e:
                last_error = e
                logger.warning(f"Groq key #{key_idx + 1} with model {model} failed: {e}")

    raise RuntimeError(f"All {num_keys} Groq API keys exhausted/failed. Last error: {last_error}")

def _call_openai_provider(messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> str:
    """
    Fallback: Call OpenAI Chat Completions API using circular key rotation across available keys.
    """
    keys = _get_openai_keys()
    if not keys:
        raise ValueError("No OpenAI API keys configured in environment.")

    num_keys = len(keys)
    with _openai_key_lock:
        start_idx = next(_openai_key_counter) % num_keys

    url = "https://api.openai.com/v1/chat/completions"
    last_error = None

    for attempt in range(num_keys):
        key_idx = (start_idx + attempt) % num_keys
        api_key = keys[key_idx]
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "gpt-4o-mini",
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        try:
            response = requests.post(url, json=payload, headers=headers, timeout=15)
            if response.status_code == 200:
                data = response.json()
                content = data["choices"][0]["message"]["content"].strip()
                if content:
                    logger.info(f"OpenAI API call succeeded with key #{key_idx + 1}")
                    return content
            else:
                last_error = f"HTTP {response.status_code}: {response.text[:120]}"
                logger.warning(f"OpenAI key #{key_idx + 1} failed ({response.status_code}): {response.text[:120]}. Trying next key...")
        except Exception as e:
            last_error = e
            logger.warning(f"OpenAI key #{key_idx + 1} request error: {e}. Trying next key...")

    raise RuntimeError(f"All {num_keys} OpenAI API keys exhausted/failed. Last error: {last_error}")

def _call_gemini_provider(messages: List[Dict[str, str]], temperature: float) -> str:
    """
    Call Google Gemini API using dynamic model discovery via ModelService.ListModels.
    Queries the Gemini API for available models accessible by the current key first,
    then executes against valid models (preferring gemini-2.5-flash, gemini-2.5-pro, etc.).
    """
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key:
        raise ValueError("GEMINI_API_KEY missing")

    # Combine messages into Gemini prompt format
    contents = []
    for msg in messages:
        role = "user" if msg.get("role") in ["user", "system"] else "model"
        text = msg.get("content", "")
        if text:
            contents.append({"role": role, "parts": [{"text": text}]})

    # Default model priority sequence
    model_candidates = [
        "models/gemini-2.5-flash",
        "models/gemini-2.5-pro",
        "models/gemini-1.5-flash",
        "models/gemini-1.5-pro",
        "models/gemini-2.0-flash",
        "models/gemini-flash-latest"
    ]

    # Dynamically list models available for the present API key
    try:
        models_url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"
        res = requests.get(models_url, timeout=5)
        if res.status_code == 200:
            discovered = [
                m['name'] for m in res.json().get('models', [])
                if 'generateContent' in m.get('supportedGenerationMethods', [])
            ]
            if discovered:
                logger.info(f"Gemini API returned available models for key: {discovered}")
                # Intersect discovered with candidates to maintain preference order, then add any remaining discovered
                prioritized = [m for m in model_candidates if m in discovered]
                for d in discovered:
                    if d not in prioritized:
                        prioritized.append(d)
                model_candidates = prioritized
    except Exception as e:
        logger.warning(f"Failed to query Gemini ModelService.ListModels: {e}")

    last_error = None
    for model in model_candidates:
        try:
            url = f"https://generativelanguage.googleapis.com/v1beta/{model}:generateContent?key={api_key}"
            payload = {
                "contents": contents,
                "generationConfig": {"temperature": temperature}
            }
            response = requests.post(url, json=payload, timeout=15)
            if response.status_code == 200:
                data = response.json()
                logger.info(f"Gemini API call succeeded with model: {model}")
                return data["candidates"][0]["content"]["parts"][0]["text"].strip()
            else:
                last_error = response.text
                logger.warning(f"Gemini model {model} failed ({response.status_code}): {response.text[:120]}")
        except Exception as e:
            last_error = e

    raise RuntimeError(f"Gemini API call failed: {last_error}")

def _call_ollama(messages: List[Dict[str, str]], temperature: float) -> str:
    """Fallback: Call local Ollama instance."""
    model_name = "llama3:latest"
    try:
        tags_res = requests.get("http://localhost:11434/api/tags", timeout=2)
        if tags_res.status_code == 200:
            available = [m["name"] for m in tags_res.json().get("models", [])]
            for pref in PREFERRED_OLLAMA_MODELS:
                if pref in available:
                    model_name = pref
                    break
    except Exception as e:
        logger.warning(f"Ollama tags check failed: {e}")

    payload = {
        "model": model_name,
        "messages": messages,
        "stream": False,
        "options": {"temperature": temperature}
    }
    
    res = requests.post(OLLAMA_URL, json=payload, timeout=30)
    res.raise_for_status()
    out = res.json()
    return out.get("message", {}).get("content", "").strip()

def _call_lmstudio(messages: List[Dict[str, str]], temperature: float, max_tokens: int) -> str:
    """Fallback: Call local LM Studio server."""
    payload = {
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens
    }
    res = requests.post(LMSTUDIO_URL, json=payload, timeout=15)
    res.raise_for_status()
    out = res.json()
    return out["choices"][0]["message"]["content"].strip()

def lmstudio_chat(
    messages: List[Dict[str, str]], 
    temperature: float = 0.3, 
    max_tokens: int = 800
) -> str:
    """
    Resilient multi-tier AI execution cascade:
    1. Groq Cloud API (Multi-Key Circular Rotation)
    2. OpenAI Cloud API
    3. Google Gemini API
    4. Local GPU Ollama
    5. Local LM Studio
    """
    # Tier 1: Groq API with Multi-Key Circular Rotation
    try:
        return _call_groq_provider(messages, temperature, max_tokens)
    except Exception as e:
        logger.warning(f"Groq API rotation exhausted: {e}. Falling back to OpenAI...")

    # Tier 2: OpenAI API
    try:
        return _call_openai_provider(messages, temperature, max_tokens)
    except Exception as e:
        logger.warning(f"OpenAI API call failed: {e}. Falling back to Gemini...")

    # Tier 3: Gemini API
    try:
        return _call_gemini_provider(messages, temperature)
    except Exception as e:
        logger.warning(f"Gemini API call failed: {e}. Falling back to local Ollama...")

    # Tier 4: Local Ollama
    try:
        return _call_ollama(messages, temperature)
    except Exception as e:
        logger.warning(f"Local Ollama call failed: {e}. Falling back to LM Studio...")

    # Tier 5: Local LM Studio
    try:
        return _call_lmstudio(messages, temperature, max_tokens)
    except Exception as e:
        logger.error(f"LM Studio call failed: {e}")
        return "AI Service Unavailable: All cloud and local AI providers failed."
