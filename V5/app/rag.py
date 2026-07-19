import json
import re

with open("data/resources.json", "r", encoding="utf-8") as file:
    resources = json.load(file)


STOP_WORDS = {
    "what", "is", "the", "a", "an", "of",
    "to", "in", "on", "for", "and", "how",
    "does", "do", "are", "explain"
}

greetings = {
    "hi",
    "hello",
    "hey",
    "good morning",
    "good afternoon",
    "good evening"
}

# Matches things like "hi", "hi!", "hii", "hey there", "good morning!" etc.
GREETING_PATTERN = re.compile(
    r"^\s*(hi+|hello+|hey+|good\s+(morning|afternoon|evening))\b[\s!.,]*$"
)


def is_greeting(question: str) -> bool:
    normalized = question.strip().lower()
    return normalized in greetings or bool(GREETING_PATTERN.match(normalized))


def retrieve_documents(question: str, level: str):

    question = question.lower()

    if is_greeting(question):
        return {
            "context": "",
            "sources": [],
            "confidence": 1.0,
            "is_greeting": True
        } 

    results = []

    for resource in resources:

        
        text = (
            resource["content_text"]
            + " "
            + resource["topic"]
            + " "
            + resource["key_terms"]
        ).lower()

        score = 0

 
   

        text_words = set(re.findall(r"\b\w+\b", text))

        for word in question.split():

            if word in STOP_WORDS:
                continue

            if word in resource["resource_title"].lower():
                score += 5

            elif word in resource["topic"].lower():
                score += 3

            elif word in text_words:
                score += 1



        if score > 0:
            results.append((score, resource))

    results.sort(reverse=True, key=lambda x: x[0])

    top_results = [item[1] for item in results[:4]]

    context = "\n\n".join(
        r["content_text"] for r in top_results
    )


    sources = [
    {
        "title": r["resource_title"],
        "reference": r["source_reference"]
    }
    for r in top_results
    ]

    if results:
        confidence = min(results[0][0] / 10, 1.0)
    else:
        confidence = 0.0

    return {
    "context": context,
    "sources": sources,
    "confidence": confidence,
    "is_greeting": False
    }