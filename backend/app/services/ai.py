from groq import Groq
from app.config import settings

client = Groq(api_key=settings.GROQ_API_KEY)
MODEL = "groq/compound"

SYSTEM_PROMPT = """You are a storytelling engine for a Choose Your Own Adventure game.

You must ALWAYS follow this exact output format, every single time:

[Your 100-150 word story here]

Choice 1: [first option]
Choice 2: [second option]
Choice 3: [third option]

Rules:
- Always end with exactly 3 choices in that exact format
- Never skip the choices
- Make choices meaningfully different
- Keep the story consistent with previous events
- Never mention you are an AI"""


def parse_choices(story_text: str) -> tuple[str, list[str]]:
    import re
    choices = []
    story_lines = []

    for line in story_text.strip().split("\n"):
        match = re.match(r'Choice\s*\d+:\s*(.+)', line.strip(), re.IGNORECASE)
        if match:
            choices.append(match.group(1).strip())
        else:
            story_lines.append(line)

    story = "\n".join(story_lines).strip()

    print("=== PARSED CHOICES ===")
    print(choices)
    print("======================")

    return story, choices


def generate_opening(
    genre: str,
    setting: str,
    character_name: str,
    character_class: str
) -> tuple[str, list[str]]:

    prompt = f"""Genre: {genre}
Setting: {setting}
Character: {character_name}, a {character_class}

Begin the adventure. Set the scene and introduce an immediate challenge.
Remember to end with Choice 1, Choice 2, Choice 3."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt}
        ],
        temperature=0.8,
        max_tokens=1024
    )

    raw = response.choices[0].message.content
    print("=== RAW RESPONSE ===")
    print(raw)
    print("====================")
    return parse_choices(raw)


def generate_next_scene(
    genre: str,
    setting: str,
    character_name: str,
    character_class: str,
    history: list[dict],
    latest_choice: str
) -> tuple[str, list[str]]:

    messages = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Opening message
    messages.append({
        "role": "user",
        "content": f"""Genre: {genre}
Setting: {setting}
Character: {character_name}, a {character_class}
Begin the adventure."""
    })

    # Full history as alternating messages
    for turn in history:
        messages.append({"role": "assistant", "content": turn["story"]})
        messages.append({"role": "user", "content": f"I choose: {turn['choice']}"})

    # Current choice
    messages.append({
        "role": "user",
        "content": f"I choose: {latest_choice}. Continue the story and end with Choice 1, Choice 2, Choice 3."
    })

    response = client.chat.completions.create(
        model=MODEL,
        messages=messages,
        temperature=0.8,
        max_tokens=1024
    )

    raw = response.choices[0].message.content
    print("=== RAW RESPONSE ===")
    print(raw)
    print("====================")
    return parse_choices(raw)


def should_story_end(story_text: str, turn_number: int) -> bool:
    if turn_number >= 10:
        return True

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You are a story progression judge. Answer only YES or NO, nothing else."
            },
            {
                "role": "user",
                "content": f"""This is turn {turn_number} of a Choose Your Own Adventure game.

{story_text}

Has this story reached a natural conclusion where it would make sense to end? Answer only YES or NO."""
            }
        ],
        temperature=0,
        max_tokens=5
    )

    answer = response.choices[0].message.content.strip().upper()
    print(f"=== END CHECK (turn {turn_number}): {answer} ===")
    return answer.startswith("YES")


def generate_ending(story_text: str, character_name: str) -> str:
    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {
                "role": "system",
                "content": "You write satisfying conclusions to adventure stories. Write only the conclusion paragraph, no choices."
            },
            {
                "role": "user",
                "content": f"""Write a satisfying 80-100 word conclusion for {character_name}'s adventure.
This was the final scene:

{story_text}"""
            }
        ],
        temperature=0.7,
        max_tokens=512
    )

    return response.choices[0].message.content.strip()