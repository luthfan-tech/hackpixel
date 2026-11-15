import sys
from pathlib import Path

# Add project root to sys.path so app modules can be imported
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hackpixel Health Check")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.api_route("/{full_path:path}", methods=["GET"])
def handle_health_catchall(full_path: str):
    return {"status": "ok", "path": full_path}
