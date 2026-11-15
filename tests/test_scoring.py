import pytest
from app.scoring import RUBRIC_WEIGHTS, calculate_total_score, rank_ideas
from app.schemas import IdeaCard


def test_rubric_weights_sum_to_one():
    """Verify that all criterion weights in the rubric sum to exactly 1.0."""
    total_weight = sum(RUBRIC_WEIGHTS.values())
    assert total_weight == pytest.approx(1.0, rel=1e-5), f"Weights sum to {total_weight}, expected 1.0"


def test_sorting_puts_highest_weighted_total_first_and_preserves_ties():
    """
    Verify that:
    1. Higher weighted total scores are sorted before lower ones.
    2. Ties in total_score preserve the LLM's original list order (stable sort).
    """
    card_first = IdeaCard(
        title="Card 1 (Medium)",
        one_line_pitch="First pitch",
        minimum_version="MVP 1",
        stack=["FastAPI"],
        estimated_hours=8.0,
        data_sources=["none"],
        scores={"time_fit": 4, "feasibility": 4, "team_fit": 4, "demo_fit": 4, "theme_fit": 4},
        score_explanations={k: "Reason" for k in RUBRIC_WEIGHTS},
    )
    # Card 2 has identical scores to Card 1, but comes after Card 1
    card_second_tied = IdeaCard(
        title="Card 2 (Medium - Tied)",
        one_line_pitch="Second pitch",
        minimum_version="MVP 2",
        stack=["FastAPI"],
        estimated_hours=8.0,
        data_sources=["none"],
        scores={"time_fit": 4, "feasibility": 4, "team_fit": 4, "demo_fit": 4, "theme_fit": 4},
        score_explanations={k: "Reason" for k in RUBRIC_WEIGHTS},
    )
    card_highest = IdeaCard(
        title="Card 3 (Highest)",
        one_line_pitch="Third pitch",
        minimum_version="MVP 3",
        stack=["FastAPI"],
        estimated_hours=4.0,
        data_sources=["none"],
        scores={"time_fit": 5, "feasibility": 5, "team_fit": 5, "demo_fit": 5, "theme_fit": 5},
        score_explanations={k: "Reason" for k in RUBRIC_WEIGHTS},
    )
    card_lowest = IdeaCard(
        title="Card 4 (Lowest)",
        one_line_pitch="Fourth pitch",
        minimum_version="MVP 4",
        stack=["FastAPI"],
        estimated_hours=20.0,
        data_sources=["none"],
        scores={"time_fit": 2, "feasibility": 2, "team_fit": 2, "demo_fit": 2, "theme_fit": 2},
        score_explanations={k: "Reason" for k in RUBRIC_WEIGHTS},
    )

    # Initial order: [Card 1, Card 2 (tied with 1), Card 3 (high), Card 4 (low)]
    input_list = [card_first, card_second_tied, card_highest, card_lowest]
    ranked = rank_ideas(input_list)

    # 1. Highest card must come first (Card 3 with 5.0)
    assert ranked[0].title == "Card 3 (Highest)"
    assert ranked[0].total_score == 5.0

    # 2. Tied cards (Card 1 and Card 2 with 4.0) must preserve original relative order
    assert ranked[1].title == "Card 1 (Medium)"
    assert ranked[2].title == "Card 2 (Medium - Tied)"
    assert ranked[1].total_score == ranked[2].total_score == 4.0

    # 3. Lowest card must come last (Card 4 with 2.0)
    assert ranked[3].title == "Card 4 (Lowest)"
    assert ranked[3].total_score == 2.0


def test_calculate_total_score_math():
    """Verify weighted calculation math matches formula."""
    scores = {
        "time_fit": 5,      # 5 * 0.25 = 1.25
        "feasibility": 3,   # 3 * 0.25 = 0.75
        "team_fit": 4,      # 4 * 0.20 = 0.80
        "demo_fit": 2,      # 2 * 0.15 = 0.30
        "theme_fit": 3,     # 3 * 0.15 = 0.45
    }
    # Expected: 1.25 + 0.75 + 0.80 + 0.30 + 0.45 = 3.55
    total = calculate_total_score(scores)
    assert total == 3.55
