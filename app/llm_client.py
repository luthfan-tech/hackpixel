import json
import ssl
import time
from typing import Optional
import urllib.error
import urllib.request

from app.config import LLM_API_KEY, LLM_MODEL


class LLMClient:
    """
    Client wrapper for interacting with an LLM provider.
    All provider-specific communication is isolated in this module.
    Supports Google Gemini models natively.
    """

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        self.api_key = api_key if api_key is not None else LLM_API_KEY
        self.model = model if model is not None else LLM_MODEL

    def complete(self, prompt: str) -> str:
        """
        Sends the prompt to the LLM and returns the raw response string.
        """
        if not self.api_key:
            raise ValueError(
                "LLM_API_KEY is not configured. Please set LLM_API_KEY in .env or set USE_MOCK_LLM=true."
            )

        model_name = (self.model or "").lower()

        # Google Gemini provider integration
        if "gemini" in model_name:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {
                    "responseMimeType": "application/json",
                    "temperature": 0.7,
                },
            }

            data_bytes = json.dumps(payload).encode("utf-8")
            req = urllib.request.Request(
                url,
                data=data_bytes,
                headers={"Content-Type": "application/json"},
            )
            ctx = ssl.create_default_context()

            max_attempts = 2
            for attempt in range(1, max_attempts + 1):
                try:
                    with urllib.request.urlopen(req, context=ctx, timeout=75.0) as resp:
                        body = resp.read().decode("utf-8")
                        result_json = json.loads(body)
                        candidates = result_json.get("candidates", [])
                        if not candidates:
                            raise ValueError("No candidates returned from Gemini API.")
                        return candidates[0]["content"]["parts"][0]["text"]
                except urllib.error.HTTPError as err:
                    err_body = err.read().decode("utf-8", errors="ignore")
                    clean_err = err_body.replace(self.api_key, "[REDACTED]") if self.api_key else err_body
                    raise RuntimeError(f"Gemini API returned HTTP {err.code}: {clean_err}") from err
                except urllib.error.URLError as err:
                    clean_err = str(err).replace(self.api_key, "[REDACTED]") if self.api_key else str(err)
                    if attempt < max_attempts:
                        time.sleep(1.0)
                        continue
                    if "getaddrinfo" in clean_err or "11001" in clean_err:
                        raise RuntimeError(
                            f"Network error connecting to Gemini API: DNS resolution failed ({clean_err}). "
                            "Please check your internet connection or set USE_MOCK_LLM=true in .env to develop offline."
                        ) from err
                    raise RuntimeError(f"Network error connecting to Gemini API: {clean_err}") from err
                except Exception as err:
                    clean_err = str(err).replace(self.api_key, "[REDACTED]") if self.api_key else str(err)
                    raise RuntimeError(f"Failed to communicate with Gemini API: {clean_err}") from err

        # Fallback for unconfigured or custom provider models (tested by unit tests)
        raise NotImplementedError(
            f"Live API calls for model '{self.model}' are not implemented yet. "
            "Configure your provider inside app/llm_client.py or set USE_MOCK_LLM=true."
        )
