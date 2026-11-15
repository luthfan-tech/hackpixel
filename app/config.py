import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("LLM_API_KEY")
LLM_API_KEY = GEMINI_API_KEY
LLM_MODEL = os.getenv("LLM_MODEL", "gemini-1.5-flash")
USE_MOCK_LLM = os.getenv("USE_MOCK_LLM", "true").lower() == "true"
ENABLE_DUPLICATE_CHECK = os.getenv("ENABLE_DUPLICATE_CHECK", "false").lower() == "true"
