import sys
from pathlib import Path

root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from app.config import USE_MOCK_LLM, LLM_MODEL, ENABLE_DUPLICATE_CHECK

app = FastAPI(title="Hackpixel Status API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/{full_path:path}", methods=["GET", "POST"])
def catch_all_status(full_path: str, request: Request):
    return {
        "status": "ok",
        "mock_mode": USE_MOCK_LLM,
        "mode": "Live Gemini",
        "model": LLM_MODEL,
        "duplicate_check_enabled": ENABLE_DUPLICATE_CHECK,
        "debug_path": full_path,
        "raw_path": request.scope.get("path"),
    }
