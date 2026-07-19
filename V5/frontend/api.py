import requests

BASE_URL = "http://127.0.0.1:8000"


def ask_question(question, level):
    response = requests.post(
        f"{BASE_URL}/chat",
        json={
            "question": question,
            "level": level
        }
    )

    return response.json()