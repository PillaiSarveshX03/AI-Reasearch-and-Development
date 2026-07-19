from typing import Literal

from pydantic import BaseModel, Field, field_validator


class ChatRequest(BaseModel):
    question: str = Field(..., min_length=1, max_length=2000)
    level: Literal["beginner", "intermediate", "advanced"] = "intermediate"

    @field_validator("level", mode="before")
    @classmethod
    def normalize_level(cls, value):
        if isinstance(value, str):
            return value.strip().lower()
        return value

    @field_validator("question")
    @classmethod
    def question_not_blank(cls, value: str) -> str:
        value = value.strip()
        if not value:
            raise ValueError("question cannot be empty")
        return value


class ChatResponse(BaseModel):
    answer: str
    sources: list
    confidence: float