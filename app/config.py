import os
from dotenv import load_dotenv

load_dotenv()

# Active Gemini API Key (reads from GEMINI_API_KEY, LLM_API_KEY, or GOOGLE_API_KEY)
GEMINI_API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("LLM_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
    or ""
).strip()
LLM_API_KEY = GEMINI_API_KEY

# Google Gemini Model (gemini-3.5-flash is current and active)
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.5-flash")

# If an API key is present, live LLM is active by default; otherwise fallback to dynamic mock generator
explicit_mock = os.getenv("USE_MOCK_LLM")
if explicit_mock is not None:
    USE_MOCK_LLM = explicit_mock.lower() == "true"
else:
    USE_MOCK_LLM = not bool(GEMINI_API_KEY)

ENABLE_DUPLICATE_CHECK = os.getenv("ENABLE_DUPLICATE_CHECK", "false").lower() == "true"
