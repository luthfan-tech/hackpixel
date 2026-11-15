from app.schemas import HackathonInput

IDEA_GENERATION_PROMPT_TEMPLATE = """You are an expert hackathon mentor and technical judge.
Your task is to generate exactly 10 distinct, practical, and inspiring hackathon project ideas tailored to the team constraints below.

=== Team Constraints & Preferences ===
- Hours Remaining: {hours_remaining} hours (STRICT TIME LIMIT)
- Team Size: {team_size} developer(s)
- Skill Level: {skill_level}
- Preferred Tech Stack: {preferred_stack}
- Project Tone: {tone}
- Demo Style: {demo_style}
- Risk Appetite: {risk_appetite}
- Hackathon Theme: {theme}

=== Strict Requirements ===
1. Quantity: You MUST provide exactly 10 idea cards.
2. Time Feasibility: Every idea must realistically fit within the {hours_remaining} hours remaining. The "minimum_version" (MVP) must be achievable and demo-ready within that time budget.
3. Team Scope: Scale complexity appropriately for {team_size} {skill_level} developer(s).
4. Stack Alignment: Prioritize the preferred stack ({preferred_stack}). If an idea requires an external technology, library, or tool not listed in the preferred stack, explicitly mention that extra dependency in the stack or pitch.
5. Tone & Risk: Closely reflect the "{tone}" tone and "{risk_appetite}" risk appetite.
6. Theme Connection: {theme_instruction}
7. Data Sources: Every item in "data_sources" must be a real, named public data source or public API (e.g. 'https://api.github.com', 'https://restcountries.com', or 'none'). If no external data is needed, use 'none'. Do NOT invent fictional URLs.
8. Free Tools Only: FORBID any ideas that require paid API subscriptions, private credentials, or inaccessible proprietary data.
9. Estimated Hours: In the "score_explanations" (or notes), explicitly label estimated_hours as an estimate (for example: "Estimated at X hours...").
10. Scoring Rubric:
    For EVERY idea, provide an integer score from 1 to 5 and a one-sentence reason for each of the following 5 criteria:
    - time_fit: How well the minimum_version fits within the {hours_remaining} hours remaining.
    - team_fit: How well the scope and tasks divide across {team_size} developer(s).
    - demo_fit: How well the project format matches the "{demo_style}" demo style.
    - theme_fit: How directly the project addresses the theme. {theme_scoring_rule}
    - feasibility: How realistic the project is given the {skill_level} skill level and {preferred_stack} stack.
    IMPORTANT: Do NOT output a total score or final ranking. The backend code computes weighted totals and sorts the ideas.

11. Schema Compliance: Return ONLY a valid JSON object matching this structure:
{{
  "ideas": [
    {{
      "title": "Project Title",
      "one_line_pitch": "One clear sentence describing the idea",
      "minimum_version": "Core MVP features buildable within the time limit",
      "optional_extras": ["Nice-to-have stretch goal 1", "Stretch goal 2"],
      "stack": ["Tech1", "Tech2"],
      "estimated_hours": 12.0,
      "risks": ["Risk 1", "Risk 2"],
      "data_sources": ["none"],
      "scores": {{
        "time_fit": 5,
        "team_fit": 4,
        "demo_fit": 4,
        "theme_fit": 3,
        "feasibility": 5
      }},
      "score_explanations": {{
        "time_fit": "Estimated at 12.0 hours, which fits the remaining time well.",
        "team_fit": "Scope divides cleanly among team members without blocking bottlenecks.",
        "demo_fit": "Visual interface allows a compelling live app demo.",
        "theme_fit": "Addresses the theme directly with targeted features.",
        "feasibility": "Standard technology stack makes implementation straightforward."
      }}
    }}
  ],
  "notes": "General advice and strategy notes for the hackathon team."
}}

Output JSON only. Do not wrap the JSON in extra markdown explanation."""


def build_idea_prompt(user_input: HackathonInput) -> str:
    """Builds the main LLM prompt incorporating the user's hackathon parameters."""
    if user_input.theme and user_input.theme.strip():
        theme_str = user_input.theme.strip()
        theme_instruction = f"Tie each idea directly to the theme '{theme_str}' and explicitly state this connection in the one_line_pitch."
        theme_scoring_rule = f"Score how directly it addresses '{theme_str}'."
    else:
        theme_str = "Open / General (no specific theme provided)"
        theme_instruction = "Since no theme was provided, focus on versatile, high-impact hackathon categories."
        theme_scoring_rule = "Score must be 3, and the explanation must state: 'Score defaults to 3 because no theme was specified.'"

    if user_input.preferred_stack and len(user_input.preferred_stack) > 0:
        stack_str = ", ".join(user_input.preferred_stack)
    else:
        stack_str = "None specified (use standard open-source tools)"

    return IDEA_GENERATION_PROMPT_TEMPLATE.format(
        hours_remaining=user_input.hours_remaining,
        team_size=user_input.team_size,
        skill_level=user_input.skill_level,
        preferred_stack=stack_str,
        tone=user_input.tone,
        demo_style=user_input.demo_style,
        risk_appetite=user_input.risk_appetite,
        theme=theme_str,
        theme_instruction=theme_instruction,
        theme_scoring_rule=theme_scoring_rule,
    )


def build_retry_prompt(original_prompt: str, failed_output: str, error_message: str) -> str:
    """Builds a correction prompt for retrying when parsing or schema validation fails."""
    return f"""{original_prompt}

--------------------------------------------------
ATTENTION: Your previous response failed schema validation with error:
{error_message}

Your previous output was:
{failed_output}

Please fix all formatting and schema issues. Output ONLY valid JSON matching the IdeaResponse schema exactly."""
