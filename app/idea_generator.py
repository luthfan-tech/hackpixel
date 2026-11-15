import json
import re
from typing import Optional
import httpx
from pydantic import ValidationError

from app.config import USE_MOCK_LLM
from app.duplicates import attach_duplicate_warnings
from app.llm_client import LLMClient
from app.mock_data import get_mock_idea_response
from app.prompts import build_idea_prompt, build_retry_prompt
from app.schemas import HackathonInput, IdeaResponse
from app.scoring import RUBRIC_WEIGHTS, rank_ideas


class IdeaGenerationError(Exception):
    """Raised when idea generation fails due to invalid JSON or schema violations."""
    pass


def _clean_json_string(text: str) -> str:
    """Strips markdown code fences and extraneous leading/trailing whitespace."""
    cleaned = text.strip()
    if cleaned.startswith("```"):
        cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned, flags=re.IGNORECASE)
        cleaned = re.sub(r"\s*```$", "", cleaned)
        cleaned = cleaned.strip()
    return cleaned


def _parse_and_validate(raw_text: str) -> IdeaResponse:
    """Parses raw text into JSON and validates it against IdeaResponse."""
    cleaned = _clean_json_string(raw_text)

    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as err:
        # Fallback attempt to find substring containing outermost JSON object
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1 and end > start:
            try:
                data = json.loads(cleaned[start : end + 1])
            except json.JSONDecodeError:
                raise err
        else:
            raise err

    if not isinstance(data, dict):
        raise ValueError(f"Expected a JSON object (dict), but got {type(data).__name__}")

    return IdeaResponse.model_validate(data)


def generate_ideas(
    user_input: HackathonInput,
    client: Optional[LLMClient] = None,
    http_client: Optional[httpx.Client] = None,
    enable_duplicate_check: Optional[bool] = None,
) -> IdeaResponse:
    """
    Generates 10 idea cards from user constraints.
    - If USE_MOCK_LLM is True (and no custom client is injected), returns 10 mock IdeaCards.
    - Otherwise, prompts the LLM, validates output with IdeaResponse, and retries once on failure.
    - Evaluates total_score via the fixed scoring rubric and ranks cards (stable sort).
    - Attaches duplicate check warnings (skipped if disabled or on error).
    - Populates rubric weights in the response.
    """
    # Use mock data if enabled and no custom client is explicitly injected
    if client is None and USE_MOCK_LLM:
        response = get_mock_idea_response(user_input)
    else:
        active_client = client or LLMClient()
        prompt = build_idea_prompt(user_input)

        # First attempt
        try:
            raw_response = active_client.complete(prompt)
        except RuntimeError as err:
            raise IdeaGenerationError(str(err)) from err

        try:
            response = _parse_and_validate(raw_response)
        except (json.JSONDecodeError, ValidationError, ValueError) as first_error:
            # Retry once with error feedback
            retry_prompt = build_retry_prompt(prompt, raw_response, str(first_error))
            try:
                retry_response = active_client.complete(retry_prompt)
            except RuntimeError as err:
                raise IdeaGenerationError(str(err)) from err

            try:
                response = _parse_and_validate(retry_response)
            except (json.JSONDecodeError, ValidationError, ValueError) as second_error:
                raise IdeaGenerationError(
                    f"Failed to generate valid ideas after retry. Error: {second_error}"
                )

    # Compute weighted total score and rank ideas (highest score first, preserving ties)
    ranked_ideas = rank_ideas(response.ideas)

    # Attach duplicate warnings (optional, graceful fallback on failure)
    attach_duplicate_warnings(
        ranked_ideas,
        http_client=http_client,
        enable_check=enable_duplicate_check,
    )

    response.ideas = ranked_ideas
    response.rubric_weights = RUBRIC_WEIGHTS

    return response
