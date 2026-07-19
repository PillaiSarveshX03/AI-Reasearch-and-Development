from google import genai

client = genai.Client(api_key="AIzaSyBdlVa-wjgtr8LtM69eoYMA9xEA4L9fVWs")

response = client.models.generate_content(
    model="gemini-2.5-flash-lite",
    contents="Explain Artificial Intelligence in one sentence."
)

print(response.text)
