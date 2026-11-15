"""
Scoring and ranking module for Hackathon Idea Assistant.

IMPORTANT:
Scores and weighted totals are heuristic estimates, NOT objective measurements or guarantees.
The LLM assigns criterion-level scores (1-5) and explanations, but all mathematical weighting
and final ranking are performed deterministically in this code to ensure transparency and auditability.
"""

from typing import Dict, List
from app.schemas import IdeaCard

# ==============================================================================
# Fixed Rubric Weights
# ==============================================================================
# - time_fit: how well minimum_version fits hours_remaining (25%)
# - feasibility: how realistic it is for the skill_level and stack (25%)
# - team_fit: how well the scope fits team_size (20%)
# - demo_fit: how well it fits the demo_style (15%)
# - theme_fit: how directly it addresses the theme (15%) (defaults to 3 if no theme given)
#
# Rule: These weights MUST sum to exactly 1.0.
# ==============================================================================
TIME_FIT_WEIGHT = 0.25
FEASIBILITY_WEIGHT = 0.25
TEAM_FIT_WEIGHT = 0.20
DEMO_FIT_WEIGHT = 0.15
THEME_FIT_WEIGHT = 0.15

RUBRIC_WEIGHTS: Dict[str, float] = {
    "time_fit": TIME_FIT_WEIGHT,
    "feasibility": FEASIBILITY_WEIGHT,
    "team_fit": TEAM_FIT_WEIGHT,
    "demo_fit": DEMO_FIT_WEIGHT,
    "theme_fit": THEME_FIT_WEIGHT,
}


def calculate_total_score(scores: Dict[str, int]) -> float:
    """
    Computes a weighted total score from criterion scores (1 to 5).
    Falls back to a neutral 3 if a criterion is missing from the dictionary.
    Returns a rounded float between 1.0 and 5.0.
    """
    total = sum(
        scores.get(criterion, 3) * weight
        for criterion, weight in RUBRIC_WEIGHTS.items()
    )
    return round(total, 2)


def rank_ideas(ideas: List[IdeaCard]) -> List[IdeaCard]:
    """
    Calculates the total_score for each IdeaCard and sorts them in descending order.

    Python's Timsort algorithm is stable: if two ideas produce an identical
    total_score, their relative original order is preserved.
    """
    for idea in ideas:
        idea.total_score = calculate_total_score(idea.scores)

    return sorted(
        ideas,
        key=lambda idea: idea.total_score if idea.total_score is not None else 0.0,
        reverse=True,
    )
