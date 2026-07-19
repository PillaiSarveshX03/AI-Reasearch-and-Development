import streamlit as st
import requests

# -----------------------------
# Configuration
# -----------------------------
API_URL = "http://127.0.0.1:8000/chat"

st.set_page_config(
    page_title="AI Education & Research Chatbot",
    page_icon="🧠",
    layout="wide"
)

# -----------------------------
# Session State
# -----------------------------
if "messages" not in st.session_state:
    st.session_state.messages = []

if "level" not in st.session_state:
    st.session_state.level = "Beginner"

# -----------------------------
# Sidebar
# -----------------------------
with st.sidebar:

    st.title("🧠 AI Tutor")

    if st.button("➕ New Chat", use_container_width=True):
        st.session_state.messages = []
        st.rerun()

    st.divider()

    st.session_state.level = st.selectbox(
        "Explanation Level",
        ["Beginner", "Intermediate", "Advanced"]
    )

    st.divider()

    st.caption(
        "⚠️ Educational chatbot powered by FastAPI.\n\n"
        "Answers are generated only from the approved learning resources."
    )





# -----------------------------
# Header
# -----------------------------





st.title("🎓 AI Education & Research Chatbot")

st.caption(
    "Ask about Machine Learning, Deep Learning, Transformers, RAG, "
    "Generative AI, Responsible AI and more."
)

st.divider()

# -----------------------------
# Previous Messages
# -----------------------------
for message in st.session_state.messages:

    with st.chat_message(message["role"]):

        st.markdown(message["content"])

        if message["role"] == "assistant":

            if "confidence" in message:

                st.progress(message["confidence"])

                st.caption(
                    f"Confidence : {message['confidence']:.2f}"
                )

            if message.get("sources"):

                with st.expander("📚 Sources Used"):

                    for source in message["sources"]:

                        st.markdown(
                            f"**{source['title']}**"
                        )

                        st.caption(
                            source["reference"]
                        )

# -----------------------------
# Chat Input
# -----------------------------
question = st.chat_input("Ask your question...")

if question:

    st.session_state.messages.append({
        "role": "user",
        "content": question
    })

    with st.chat_message("user"):
        st.markdown(question)

    with st.chat_message("assistant"):

        with st.spinner("Thinking..."):

            try:

                response = requests.post(
                    API_URL,
                    json={
                        "question": question,
                        "level": st.session_state.level
                    },
                    timeout=60
                )

                response.raise_for_status()

                data = response.json()

                st.markdown(data["answer"])

                st.progress(data["confidence"])

                st.caption(
                    f"Confidence : {data['confidence']:.2f}"
                )

                with st.expander("📚 Sources Used"):

                    for source in data["sources"]:

                        st.markdown(
                            f"**{source['title']}**"
                        )

                        st.caption(
                            source["reference"]
                        )

                st.session_state.messages.append(
                    {
                        "role": "assistant",
                        "content": data["answer"],
                        "confidence": data["confidence"],
                        "sources": data["sources"]
                    }
                )

            except requests.exceptions.ConnectionError:

                st.error(
                    "❌ Cannot connect to FastAPI.\n\n"
                    "Start the backend first:\n\n"
                    "python -m uvicorn app.main:app --reload"
                )

            except Exception as e:

                st.error(str(e))