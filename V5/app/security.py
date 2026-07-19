import re

BLOCKED_PHRASES = [
    "ignore previous instructions",
    "ignore all previous instructions",
    "disregard previous instructions",
    "reveal system prompt",
    "show system prompt",
    "forget your instructions",
    "act as root",
    "act as dan",
    "bypass safety",
    "jailbreak",
    "new instructions:",
]


def is_safe_prompt(question: str) -> bool:
    # Collapse repeated whitespace so spacing tricks like
    # "ignore   previous  instructions" don't slip past a plain substring check.
    normalized = re.sub(r"\s+", " ", question.lower()).strip()

    for phrase in BLOCKED_PHRASES:
        if phrase in normalized:
            return False

    return True