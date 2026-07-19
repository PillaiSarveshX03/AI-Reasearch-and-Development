import logging

from fastapi import APIRouter, HTTPException

from app.schemas import ChatRequest, ChatResponse
from app.security import is_safe_prompt
from app.rag import retrieve_documents
from app.ai import generate_response

logger = logging.getLogger("chatbot")

router = APIRouter()


@router.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):

    # Security check
    if not is_safe_prompt(request.question):
        raise HTTPException(
            status_code=400,
            detail="Unsafe prompt detected."
        )

    # Retrieve relevant documents (or detect a plain greeting)
    retrieval = retrieve_documents(request.question, request.level)

    # Generate the tutor's response
    try:
        answer = generate_response(
            request.question,
            retrieval["context"],
            request.level,
            retrieval["is_greeting"]
        )
    except Exception:
        # Log the FULL traceback to the server console so we can see what's
        # actually failing (bad token, wrong model name, network issue,
        # etc.) — the client only ever sees the generic 502 message.
        logger.exception("generate_response failed for question=%r level=%r",
                          request.question, request.level)
        raise HTTPException(
            status_code=502,
            detail="The AI service is currently unavailable. Please try again shortly."
        )

    # TODO
    # teammate will save chat here

    return ChatResponse(
        answer=answer,
        sources=retrieval["sources"],
        confidence=retrieval["confidence"]
    )