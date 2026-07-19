import logging

from fastapi import FastAPI

from app.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)

app = FastAPI(
    title="AI Research Chatbot"
)

app.include_router(router)


@app.get("/")
def home():
    return {
        "message": "AI Research Chatbot API Running 🚀"
    }