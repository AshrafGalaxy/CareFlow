import os
import time
import logging
from typing import List, Optional, AsyncGenerator, Any
import httpx
from langchain_groq import ChatGroq

logger = logging.getLogger(__name__)

# Cached available models list
_MODELS_CACHE: dict = {
    "timestamp": 0.0,
    "models": []
}
CACHE_TTL_SECONDS = 900.0  # 15 minutes

# Primary: Qwen 3.8 27B, Fallbacks: GPT OSS 120B and GPT OSS 20B
DEFAULT_TEXT_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
    "openai/gpt-oss-20b",
]

DEFAULT_VISION_MODELS = [
    "qwen/qwen3.8-27b",
    "openai/gpt-oss-120b",
]

async def fetch_active_groq_models(api_key: str) -> List[str]:
    """
    Programmatically queries Groq's /openai/v1/models endpoint to discover
    active models in real time, with an in-memory TTL cache.
    """
    global _MODELS_CACHE
    now = time.time()

    if _MODELS_CACHE["models"] and (now - _MODELS_CACHE["timestamp"]) < CACHE_TTL_SECONDS:
        return _MODELS_CACHE["models"]

    if not api_key:
        return []

    try:
        async with httpx.AsyncClient(timeout=3.0) as client:
            resp = await client.get(
                "https://api.groq.com/openai/v1/models",
                headers={"Authorization": f"Bearer {api_key}"}
            )
            if resp.status_code == 200:
                data = resp.json()
                raw_models = data.get("data", [])
                active_ids = [
                    m["id"] for m in raw_models 
                    if m.get("active", True) and not m["id"].startswith("whisper") and "prompt-guard" not in m["id"]
                ]
                if active_ids:
                    _MODELS_CACHE["models"] = active_ids
                    _MODELS_CACHE["timestamp"] = now
                    logger.info(f"Discovered active Groq chat models: {active_ids}")
                    return active_ids
    except Exception as e:
        logger.warning(f"Could not dynamically query Groq models endpoint: {e}. Using configured fallback lists.")

    return _MODELS_CACHE.get("models") or []


async def get_model_candidates(is_vision: bool = False, api_key: Optional[str] = None) -> List[str]:
    """
    Returns an ordered list of candidate models with qwen/qwen3.8-27b as primary,
    followed by openai/gpt-oss-120b and openai/gpt-oss-20b as fallbacks.
    """
    key = api_key or os.getenv("GROQ_API_KEY", "")
    discovered = await fetch_active_groq_models(key) if key else []

    defaults = DEFAULT_VISION_MODELS if is_vision else DEFAULT_TEXT_MODELS

    candidates: List[str] = []

    # 1. Add configured defaults that are confirmed present in discovered models
    for m in defaults:
        if m in discovered and m not in candidates:
            candidates.append(m)

    # 2. Add remaining defaults (in case discovery timed out)
    for m in defaults:
        if m not in candidates:
            candidates.append(m)

    # 3. Add any other discovered active models as auxiliary fallbacks
    for m in discovered:
        if m not in candidates:
            candidates.append(m)

    return candidates


async def astream_with_model_fallback(
    messages: List[Any],
    is_vision: bool = False,
    temperature: float = 0.3,
    max_retries: int = 0
) -> AsyncGenerator[Any, None]:
    """
    Streams chunks from Groq with automated multi-model fallback.
    Yields LangChain AIMessageChunk objects.
    If the primary model (qwen/qwen3.8-27b) fails before emitting tokens,
    it automatically falls back to the next candidate model (e.g. gpt-oss-120b, then 20b).
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key.strip() == "":
        raise ValueError("GROQ_API_KEY is missing. Chat cannot function.")

    candidates = await get_model_candidates(is_vision=is_vision, api_key=groq_api_key)
    last_error: Optional[Exception] = None

    for model_name in candidates:
        tokens_yielded = 0
        try:
            logger.info(f"Attempting chat streaming with Groq model: {model_name}")
            llm = ChatGroq(
                model=model_name,
                api_key=groq_api_key,
                temperature=temperature,
                max_retries=max_retries
            )

            async for chunk in llm.astream(messages):
                tokens_yielded += 1
                yield chunk

            # Successfully completed full stream
            return

        except Exception as e:
            last_error = e
            logger.warning(
                f"Groq model '{model_name}' failed during stream (tokens_yielded={tokens_yielded}): {e}. "
                f"Checking fallback candidate..."
            )
            if tokens_yielded > 0:
                # Mid-stream error: cannot seamlessly restart without duplicate output
                raise e

    if last_error:
        raise last_error
    raise RuntimeError("No Groq model candidates available.")


async def ainvoke_with_model_fallback(
    messages: List[Any],
    is_vision: bool = False,
    temperature: float = 0.1,
    max_retries: int = 0
) -> Any:
    """
    Executes a non-streaming invocation with automated multi-model fallback.
    """
    groq_api_key = os.getenv("GROQ_API_KEY")
    if not groq_api_key or groq_api_key.strip() == "":
        raise ValueError("GROQ_API_KEY is missing.")

    candidates = await get_model_candidates(is_vision=is_vision, api_key=groq_api_key)
    last_error: Optional[Exception] = None

    for model_name in candidates:
        try:
            logger.info(f"Attempting invocation with Groq model: {model_name}")
            llm = ChatGroq(
                model=model_name,
                api_key=groq_api_key,
                temperature=temperature,
                max_retries=max_retries
            )
            response = await llm.ainvoke(messages)
            return response
        except Exception as e:
            last_error = e
            logger.warning(
                f"Groq model '{model_name}' failed invocation: {e}. "
                f"Trying next fallback candidate..."
            )

    if last_error:
        raise last_error
    raise RuntimeError("All Groq model candidates failed invocation.")
