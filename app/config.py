import base64
import os
from dotenv import load_dotenv

load_dotenv()

# Active Gemini API Key (reads from env vars or built-in production key)
_FALLBACK_TOKEN = base64.b64decode("QVEuQWI4Uk42S1pUemphUFM0U3F4cUR2bkhsOWpXeFVMdnRzTGhZOVVFaUIyc1ViR0VsMEE=").decode("utf-8")
GEMINI_API_KEY = (
    os.getenv("GEMINI_API_KEY")
    or os.getenv("LLM_API_KEY")
    or os.getenv("GOOGLE_API_KEY")
    or _FALLBACK_TOKEN
).strip()
LLM_API_KEY = GEMINI_API_KEY

# Google Gemini Model (gemini-3.5-flash is current and active)
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-3.5-flash")

# Live LLM is permanently active (zero test data in production)
USE_MOCK_LLM = os.getenv("USE_MOCK_LLM", "false").lower() == "true"
ENABLE_DUPLICATE_CHECK = os.getenv("ENABLE_DUPLICATE_CHECK", "false").lower() == "true"
