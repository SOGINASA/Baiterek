"""Shared Groq API client for text-based chat completions."""

import os
import time
import logging

import requests as http_requests

logger = logging.getLogger(__name__)

_groq_key = os.environ.get("GROQ_API_KEY", "")

GROQ_TEXT_MODELS = [
    "llama-3.3-70b-versatile",
    "llama-3.1-8b-instant",
]

GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"


def call_groq_chat(
    messages: list[dict],
    models: list[str] | None = None,
    max_retries: int = 3,
    temperature: float = 0.7,
    max_tokens: int = 4096,
) -> str:
    """Send chat messages to Groq and return the assistant's reply.

    Tries each model in order; retries on transient errors (429, 5xx)
    with exponential backoff before falling through to the next model.
    """
    if not _groq_key:
        raise RuntimeError("GROQ_API_KEY not set")

    if models is None:
        models = GROQ_TEXT_MODELS

    last_error = None

    for model in models:
        delay = 1.0
        for attempt in range(max_retries):
            try:
                resp = http_requests.post(
                    GROQ_API_URL,
                    headers={
                        "Authorization": f"Bearer {_groq_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "model": model,
                        "messages": messages,
                        "temperature": temperature,
                        "max_tokens": max_tokens,
                    },
                    timeout=60,
                )

                if resp.status_code == 200:
                    text = resp.json()["choices"][0]["message"]["content"]
                    if text and text.strip():
                        return text
                    last_error = "Empty response from Groq"
                    break  # empty response — try next model

                if resp.status_code == 429 or resp.status_code >= 500:
                    last_error = f"Groq {model}: {resp.status_code} {resp.text[:200]}"
                    logger.warning(f"{last_error} (attempt {attempt + 1}/{max_retries})")
                    time.sleep(delay)
                    delay = min(delay * 2, 8.0)
                    continue

                # Non-retryable error (4xx other than 429)
                last_error = f"Groq {model}: {resp.status_code} {resp.text[:200]}"
                logger.warning(last_error)
                break  # skip to next model

            except http_requests.exceptions.RequestException as e:
                last_error = f"Groq {model} request error: {e}"
                logger.warning(f"{last_error} (attempt {attempt + 1}/{max_retries})")
                time.sleep(delay)
                delay = min(delay * 2, 8.0)

    raise RuntimeError(f"All Groq models failed. Last error: {last_error}")
