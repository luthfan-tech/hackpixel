import sys
from pathlib import Path

# Add project root to sys.path so app modules can be imported
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from app.idea_generator import generate_ideas, IdeaGenerationError
from app.schemas import HackathonInput, IdeaResponse

app = FastAPI(
    title="Hackpixel Ideas API",
    description="Dedicated serverless endpoint for generating hackathon ideas",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/", response_model=IdeaResponse)
@app.post("/api/ideas", response_model=IdeaResponse)
@app.post("/ideas", response_model=IdeaResponse)
def handle_ideas(payload: HackathonInput):
    try:
        return generate_ideas(payload)
    except (IdeaGenerationError, RuntimeError) as err:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err),
        )
    except ValueError as err:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(err),
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Internal server error: {str(err)}",
        )


@app.get("/")
@app.get("/api/ideas")
@app.get("/ideas")
def get_ideas_info():
    return {
        "status": "ready",
        "endpoint": "/api/ideas",
        "method": "POST",
        "description": "Send JSON payload with HackathonInput to generate AI ideas.",
    }
