import sys
from pathlib import Path

# Add project root to sys.path so app modules can be imported
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import USE_MOCK_LLM, LLM_MODEL, ENABLE_DUPLICATE_CHECK

app = FastAPI(
    title="Hackpixel Status API",
    description="Dedicated serverless endpoint for system status",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
@app.get("/api/status")
@app.get("/status")
def handle_status():
    return {
        "status": "ok",
        "mock_mode": USE_MOCK_LLM,
        "mode": "Live Gemini",
        "model": LLM_MODEL,
        "duplicate_check_enabled": ENABLE_DUPLICATE_CHECK,
    }
