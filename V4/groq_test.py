from groq import Groq

client = Groq(
    api_key="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"
)

chat_completion = client.chat.completions.create(
    messages=[
        {
            "role": "user",
            "content": "Explain Artificial Intelligence in one sentence."
        }
    ],
    model="llama-3.3-70b-versatile",
)

print(chat_completion.choices[0].message.content)