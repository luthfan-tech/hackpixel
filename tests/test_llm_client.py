import pytest
from app.llm_client import LLMClient


def test_llm_client_missing_api_key_raises_value_error():
    """Verify that calling complete without an API key raises ValueError."""
    client = LLMClient(api_key="")
    with pytest.raises(ValueError) as exc:
        client.complete("Test prompt")
    assert "LLM_API_KEY is not configured" in str(exc.value)


def test_llm_client_placeholder_raises_not_implemented():
    """Verify that the unconfigured live provider raises NotImplementedError with a TODO reminder."""
    client = LLMClient(api_key="mock-api-key", model="test-model")
    with pytest.raises(NotImplementedError) as exc:
        client.complete("Test prompt")
    assert "Live API calls for model 'test-model' are not implemented yet" in str(exc.value)
