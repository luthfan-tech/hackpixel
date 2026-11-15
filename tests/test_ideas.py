import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.schemas import HackathonInput
from app.idea_generator import generate_ideas, IdeaGenerationError
from app.mock_data import get_mock_idea_response
from app.scoring import RUBRIC_WEIGHTS

client = TestClient(app)

SAMPLE_INPUT = {
    "hours_remaining": 24.0,
    "theme": "AI for Education",
    "team_size": 3,
    "skill_level": "intermediate",
    "preferred_stack": ["FastAPI", "React"],
    "tone": "fun",
    "demo_style": "live_app",
    "risk_appetite": "balanced",
}


def test_post_ideas_mock_mode_returns_exactly_10_cards(monkeypatch):
    """With mock mode on, POST /api/ideas must return exactly 10 cards, weights, disclaimer, and total scores."""
    monkeypatch.setattr("app.idea_generator.USE_MOCK_LLM", True)
    response = client.post("/api/ideas", json=SAMPLE_INPUT)
    assert response.status_code == 200

    data = response.json()
    assert "ideas" in data
    assert len(data["ideas"]) == 10
    assert "notes" in data
    assert "MOCK DATA" in data["notes"]
    assert "rubric_weights" in data
    assert len(data["rubric_weights"]) == 5
    assert "scoring_disclaimer" in data

    previous_score = 5.01
    # Verify structure and sorted order of the cards
    for card in data["ideas"]:
        assert "title" in card
        assert "one_line_pitch" in card
        assert "minimum_version" in card
        assert "stack" in card
        assert "estimated_hours" in card
        assert "data_sources" in card
        assert "scores" in card
        assert "score_explanations" in card
        assert card["estimated_hours"] > 0
        assert "total_score" in card
        assert card["total_score"] is not None
        assert "duplicate_warning" in card
        assert card["duplicate_warning"] in ("none found", "check skipped") or card["duplicate_warning"].startswith("possible match: ")

        # Check descending order
        assert card["total_score"] <= previous_score, "Cards should be sorted in descending order of total_score"
        previous_score = card["total_score"]


def test_fake_llm_client_triggers_retry_then_error():
    """
    A bad JSON response from a fake LLM client must trigger the retry path
    with the error message, and then the error path if the retry also fails.
    """
    class FakeFailingLLMClient:
        def __init__(self):
            self.prompts_received = []

        def complete(self, prompt: str) -> str:
            self.prompts_received.append(prompt)
            # Always return broken JSON
            return "This is completely invalid raw text, not JSON."

    fake_client = FakeFailingLLMClient()
    user_input = HackathonInput(**SAMPLE_INPUT)

    # Calling generate_ideas with the failing client should fail after 1 retry (2 total calls)
    with pytest.raises(IdeaGenerationError) as exc_info:
        generate_ideas(user_input, client=fake_client)

    # Verify both attempts were made
    assert len(fake_client.prompts_received) == 2, "Expected exactly 1 initial call and 1 retry call"
    
    # Verify the retry prompt includes the error context
    retry_prompt = fake_client.prompts_received[1]
    assert "ATTENTION: Your previous response failed schema validation" in retry_prompt
    assert "JSONDecodeError" in retry_prompt or "Expecting value" in retry_prompt

    # Verify error message contains context
    assert "Failed to generate valid ideas after retry" in str(exc_info.value)


def test_fake_llm_client_succeeds_on_retry():
    """Verify that if the first attempt returns bad JSON, the retry can successfully recover."""
    valid_mock = get_mock_idea_response()
    valid_json_text = valid_mock.model_dump_json()

    class FakeRecoveringLLMClient:
        def __init__(self):
            self.prompts_received = []

        def complete(self, prompt: str) -> str:
            self.prompts_received.append(prompt)
            if len(self.prompts_received) == 1:
                return "```json { invalid json ... } ```"
            return valid_json_text

    recovering_client = FakeRecoveringLLMClient()
    user_input = HackathonInput(**SAMPLE_INPUT)

    result = generate_ideas(user_input, client=recovering_client)
    assert len(recovering_client.prompts_received) == 2
    assert len(result.ideas) == 10
    # Ranked ideas must have total_score computed
    assert result.ideas[0].total_score is not None
    assert result.rubric_weights == RUBRIC_WEIGHTS


def test_api_ideas_returns_502_when_generator_fails(monkeypatch):
    """Verify that an IdeaGenerationError turns into a 502 Bad Gateway response on the endpoint."""
    def fake_generate_ideas(_payload):
        raise IdeaGenerationError("Simulated LLM validation failure after retry")

    monkeypatch.setattr("app.main.generate_ideas", fake_generate_ideas)

    response = client.post("/api/ideas", json=SAMPLE_INPUT)
    assert response.status_code == 502
    assert "Simulated LLM validation failure after retry" in response.json()["detail"]
