"""
GitHub repository duplicate checking module for Hackathon Idea Assistant.

CRITICAL NOTICE:
A match flagged by this module is purely a heuristic warning for the user to review
prior work, NOT proof of duplication, unoriginality, or copyright infringement. Many
hackathon projects share common names or themes with existing open-source experiments.
"""

import difflib
import logging
from typing import List, Optional
import httpx

from app.config import ENABLE_DUPLICATE_CHECK
from app.schemas import IdeaCard

logger = logging.getLogger(__name__)

# ==============================================================================
# Similarity Threshold Constant
# ==============================================================================
# Ratio between 0.0 and 1.0 calculated using difflib.SequenceMatcher.
# If the similarity between an idea's title and the top search result's name or
# description meets or exceeds this threshold, a warning is raised.
# ==============================================================================
SIMILARITY_THRESHOLD: float = 0.70

GITHUB_SEARCH_URL: str = "https://api.github.com/search/repositories"


def check_duplicate(
    title: str,
    http_client: Optional[httpx.Client] = None,
    enable_check: Optional[bool] = None,
) -> str:
    """
    Searches GitHub repositories for existing projects with similar titles.

    Returns one of:
      - "check skipped": Check is disabled or the GitHub API request failed/timed out/rate-limited.
      - "none found": Search completed and no repositories closely match the title.
      - "possible match: <url>": A repository name or description closely matches the title.
    """
    is_enabled = ENABLE_DUPLICATE_CHECK if enable_check is None else enable_check
    if not is_enabled:
        return "check skipped"

    clean_title = title.strip()
    if not clean_title:
        return "check skipped"

    headers = {
        "User-Agent": "Deadline-Decoder-Assistant/1.0",
        "Accept": "application/vnd.github.v3+json",
    }
    params = {
        "q": f'"{clean_title}" in:name,description',
        "per_page": 1,
    }

    try:
        # Use provided client or instantiate a temporary one
        if http_client is not None:
            response = http_client.get(GITHUB_SEARCH_URL, headers=headers, params=params)
        else:
            with httpx.Client(timeout=4.0) as client:
                response = client.get(GITHUB_SEARCH_URL, headers=headers, params=params)

        # Handle rate limits (HTTP 403/429) or remote server errors gracefully
        if response.status_code != 200:
            logger.warning(
                f"GitHub API search returned status {response.status_code}. Skipping duplicate check."
            )
            return "check skipped"

        data = response.json()
        items = data.get("items", [])
        if not items:
            return "none found"

        top_result = items[0]
        repo_name = top_result.get("name", "").replace("-", " ").replace("_", " ")
        repo_desc = top_result.get("description") or ""
        repo_url = top_result.get("html_url", "")

        target = clean_title.lower()
        name_sim = difflib.SequenceMatcher(None, target, repo_name.lower()).ratio()
        desc_sim = (
            difflib.SequenceMatcher(None, target, repo_desc.lower()).ratio()
            if repo_desc
            else 0.0
        )

        if max(name_sim, desc_sim) >= SIMILARITY_THRESHOLD:
            # Note: This is an advisory warning for the user, not definitive proof of duplication.
            return f"possible match: {repo_url}"

        return "none found"

    except Exception as exc:
        # Network timeouts, DNS issues, or connection failures must never break the main user flow
        logger.warning(f"GitHub search request failed for '{clean_title}': {exc}")
        return "check skipped"


def attach_duplicate_warnings(
    ideas: List[IdeaCard],
    http_client: Optional[httpx.Client] = None,
    enable_check: Optional[bool] = None,
) -> None:
    """
    Populates the duplicate_warning field for each idea card in-place.
    """
    for idea in ideas:
        idea.duplicate_warning = check_duplicate(
            idea.title,
            http_client=http_client,
            enable_check=enable_check,
        )
