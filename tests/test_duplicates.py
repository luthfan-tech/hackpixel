import httpx
from app.duplicates import check_duplicate, attach_duplicate_warnings
from app.schemas import IdeaCard


def test_duplicate_check_skipped_when_disabled():
    """Verify that when duplicate check is disabled, it immediately returns 'check skipped' without network calls."""
    result = check_duplicate("Any Project Title", enable_check=False)
    assert result == "check skipped"


def test_duplicate_check_skipped_when_title_is_empty():
    """Verify that empty or whitespace titles return 'check skipped'."""
    assert check_duplicate("", enable_check=True) == "check skipped"
    assert check_duplicate("   ", enable_check=True) == "check skipped"


def test_duplicate_check_returns_check_skipped_on_http_failure():
    """
    Verify that if the GitHub API HTTP request fails (e.g. network error, connection refused, 403 rate limit),
    the duplicate check gracefully returns 'check skipped' rather than failing.
    """
    # Simulate a network transport failure
    def failing_handler(request: httpx.Request) -> httpx.Response:
        raise httpx.ConnectError("Simulated network outage / connection error", request=request)

    mock_client = httpx.Client(transport=httpx.MockTransport(failing_handler))
    result = check_duplicate("Tabagotchi Pet", http_client=mock_client, enable_check=True)
    assert result == "check skipped"


def test_duplicate_check_returns_check_skipped_on_rate_limit_or_server_error():
    """Verify that HTTP 403 (rate limit) or 500 status codes return 'check skipped'."""
    def rate_limit_handler(request: httpx.Request) -> httpx.Response:
        return httpx.Response(status_code=403, json={"message": "API rate limit exceeded"})

    mock_client = httpx.Client(transport=httpx.MockTransport(rate_limit_handler))
    result = check_duplicate("Tabagotchi Pet", http_client=mock_client, enable_check=True)
    assert result == "check skipped"


def test_duplicate_check_flags_possible_match_when_similar():
    """Verify that when a repository with a very similar title is found, it returns a warning with the URL."""
    def match_handler(request: httpx.Request) -> httpx.Response:
        mock_response = {
            "total_count": 1,
            "items": [
                {
                    "name": "tabagotchi-pet",
                    "description": "A fun virtual tabagotchi pet that complains when you open too many tabs.",
                    "html_url": "https://github.com/example-user/tabagotchi-pet",
                }
            ],
        }
        return httpx.Response(status_code=200, json=mock_response)

    mock_client = httpx.Client(transport=httpx.MockTransport(match_handler))
    result = check_duplicate("Tabagotchi Pet", http_client=mock_client, enable_check=True)
    assert result == "possible match: https://github.com/example-user/tabagotchi-pet"


def test_duplicate_check_returns_none_found_when_no_match():
    """Verify that when results exist but are completely dissimilar, it returns 'none found'."""
    def no_match_handler(request: httpx.Request) -> httpx.Response:
        mock_response = {
            "total_count": 1,
            "items": [
                {
                    "name": "completely-unrelated-database",
                    "description": "High performance low latency distributed storage engine in Rust.",
                    "html_url": "https://github.com/example-user/unrelated-db",
                }
            ],
        }
        return httpx.Response(status_code=200, json=mock_response)

    mock_client = httpx.Client(transport=httpx.MockTransport(no_match_handler))
    result = check_duplicate("Tabagotchi Pet", http_client=mock_client, enable_check=True)
    assert result == "none found"


def test_duplicate_check_with_default_client_context_manager(monkeypatch):
    """Verify check_duplicate instantiates a client via context manager without network call."""
    def fake_get(self, url, headers=None, params=None):
        return httpx.Response(status_code=200, json={"items": []})

    monkeypatch.setattr(httpx.Client, "get", fake_get)
    result = check_duplicate("Tabagotchi Pet", http_client=None, enable_check=True)
    assert result == "none found"


def test_attach_duplicate_warnings_modifies_cards_in_place():
    """Verify attach_duplicate_warnings sets duplicate_warning on each IdeaCard."""
    card = IdeaCard(
        title="SyncShelf",
        one_line_pitch="Clipboard",
        minimum_version="MVP",
        stack=["FastAPI"],
        estimated_hours=4.0,
        data_sources=["none"],
        scores={"time_fit": 5, "feasibility": 5, "team_fit": 5, "demo_fit": 5, "theme_fit": 3},
        score_explanations={
            "time_fit": "Reason",
            "feasibility": "Reason",
            "team_fit": "Reason",
            "demo_fit": "Reason",
            "theme_fit": "Reason",
        },
    )
    attach_duplicate_warnings([card], enable_check=False)
    assert card.duplicate_warning == "check skipped"
