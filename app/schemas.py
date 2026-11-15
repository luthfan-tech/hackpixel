from typing import Dict, List, Literal, Optional
from pydantic import BaseModel, Field, field_validator

# Allowed options defined using Literal for straightforward type hinting and validation
SkillLevel = Literal["beginner", "intermediate", "advanced"]
Tone = Literal["serious", "fun", "experimental"]
DemoStyle = Literal["live_app", "slides_heavy", "data_story", "no_preference"]
RiskAppetite = Literal["safe", "balanced", "ambitious"]


class HackathonInput(BaseModel):
    hours_remaining: float = Field(
        ...,
        gt=0,
        le=1000,
        description="Remaining hackathon time in hours (must be > 0 and <= 1000)",
    )
    theme: Optional[str] = Field(
        default=None,
        description="Hackathon theme or track (optional, free text)",
    )
    team_size: int = Field(
        ...,
        ge=1,
        le=6,
        description="Team size (1 to 6 members)",
    )
    skill_level: SkillLevel = Field(
        ...,
        description="Team experience level: beginner, intermediate, or advanced",
    )
    preferred_stack: Optional[List[str]] = Field(
        default=None,
        description="Preferred languages or frameworks (optional)",
    )
    tone: Tone = Field(
        ...,
        description="Idea vibe: serious, fun, or experimental",
    )
    demo_style: DemoStyle = Field(
        ...,
        description="Demo preference: live_app, slides_heavy, data_story, or no_preference",
    )
    risk_appetite: RiskAppetite = Field(
        ...,
        description="Risk tolerance: safe, balanced, or ambitious",
    )


class IdeaCard(BaseModel):
    title: str = Field(..., description="Project idea title")
    one_line_pitch: str = Field(..., description="Concise one-line summary")
    minimum_version: str = Field(..., description="Minimum viable version to ship on time")
    optional_extras: List[str] = Field(
        default_factory=list,
        description="Stretch features if time permits",
    )
    stack: List[str] = Field(..., description="Suggested technology stack")
    estimated_hours: float = Field(
        ...,
        description="Estimated development hours (label: estimate)",
    )
    risks: List[str] = Field(
        default_factory=list,
        description="Identified potential risks or roadblocks",
    )
    data_sources: List[str] = Field(
        ...,
        description="Data sources: each item must be a URL or the string 'none'",
    )
    scores: Dict[str, int] = Field(
        ...,
        description="Criterion name mapped to an integer score from 1 to 5",
    )
    score_explanations: Dict[str, str] = Field(
        ...,
        description="Criterion name mapped to a one-sentence reason",
    )
    total_score: Optional[float] = Field(
        default=None,
        description="Weighted total score calculated by the scoring rubric (estimate, not objective fact)",
    )
    duplicate_warning: str = Field(
        default="check skipped",
        description="Duplicate status: 'none found', 'possible match: <url>', or 'check skipped'",
    )

    @field_validator("scores")
    @classmethod
    def validate_scores(cls, scores: Dict[str, int]) -> Dict[str, int]:
        for criterion, score in scores.items():
            if score < 1 or score > 5:
                raise ValueError(f"Score for '{criterion}' must be between 1 and 5 (got {score})")
        return scores

    @field_validator("data_sources")
    @classmethod
    def validate_data_sources(cls, data_sources: List[str]) -> List[str]:
        for source in data_sources:
            cleaned = source.strip().lower()
            if cleaned != "none" and not (cleaned.startswith("http://") or cleaned.startswith("https://")):
                raise ValueError(
                    f"Data source '{source}' is invalid. Each source must be a valid URL starting with 'http://' or 'https://', or 'none'."
                )
        return data_sources


class IdeaResponse(BaseModel):
    ideas: List[IdeaCard] = Field(..., description="List of generated idea cards")
    rubric_weights: Dict[str, float] = Field(
        default_factory=dict,
        description="Weights used to calculate total_score (sum to 1.0)",
    )
    scoring_disclaimer: str = Field(
        default="Scores and totals are heuristic estimates to guide ideation, not objective measurements.",
        description="Disclaimer indicating scores are estimates",
    )
    notes: Optional[str] = Field(
        default=None,
        description="General guidance or feedback for the team",
    )
