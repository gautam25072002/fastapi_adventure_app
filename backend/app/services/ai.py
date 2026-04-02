from groq import Groq
from app.config import settings
import re
import json

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "groq/compound"

SYSTEM_PROMPT = """You are a storytelling engine for a Choose Your Own Adventure game.

You must ALWAYS respond in this exact JSON format, nothing else:

{
  "story": "your 80-100 word story here",
  "is_ended": false
}

Rules:
- "story" is 80-100 words of vivid narrative
- "choices" is always exactly 3 short options UNLESS is_ended is true
- "is_ended" is true only when the story reaches a natural conclusion or after turn 8
- When "is_ended" is true, "story" is a satisfying conclusion and "choices" is an empty array []
- Never include anything outside the JSON
- Never mention you are an AI"""


def call_ai(messages: list) -> dict:
    """Single API call that returns story, choices and end state together."""
    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.8,
        max_tokens=1024
    )

    raw = response.choices[0].message.content.strip()
    print("=== RAW RESPONSE ===")
    print(raw)
    print("====================")

    # Strip markdown code blocks if model wraps in ```json
    raw = re.sub(r'^```json\s*', '', raw)
    raw = re.sub(r'^```\s*', '', raw)
    raw = re.sub(r'\s*```$', '', raw)

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        # Fallback if JSON parsing fails
        print("=== JSON PARSE FAILED, using fallback ===")
        return {
            "story": raw,
            "choices": ["Continue forward", "Look around carefully", "Turn back"],
            "is_ended": False
        }


def generate_opening(
    genre: str,
    setting: str,
    character_name: str,
    character_class: str
) -> tuple[str, list[str], bool]:

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {
            "role": "user",
            "content": f"""Genre: {genre}
Setting: {setting}
Character: {character_name}, a {character_class}

Begin the adventure. This is turn 1. is_ended must be false.
Respond only in the required JSON format."""
        }
    ]

    result = call_ai(messages)
    return result["story"], result.get("choices", []), result.get("is_ended", False)


def generate_next_scene(
    genre: str,
    setting: str,
    character_name: str,
    character_class: str,
    history: list[dict],
    latest_choice: str,
    turn_number: int
) -> tuple[str, list[str], bool]:

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Opening message
    messages.append({
        "role": "user",
        "content": f"""Genre: {genre}
Setting: {setting}
Character: {character_name}, a {character_class}
Begin the adventure."""
    })

    # Full conversation history
    for turn in history:
        messages.append({"role": "assistant", "content": json.dumps({
            "story": turn["story"],
            "choices": [],
            "is_ended": False
        })})
        messages.append({"role": "user", "content": f"I choose: {turn['choice']}"})

    # Current choice
    end_hint = "Consider ending the story naturally." if turn_number >= 7 else "is_ended must be false."
    messages.append({
        "role": "user",
        "content": f"I choose: {latest_choice}. This is turn {turn_number}. {end_hint} Respond only in the required JSON format."
    })

    result = call_ai(messages)
    return result["story"], result.get("choices", []), result.get("is_ended", False)