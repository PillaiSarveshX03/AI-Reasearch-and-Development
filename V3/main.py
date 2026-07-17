import os
from dotenv import load_dotenv
from groq import Groq

load_dotenv()

client = Groq(
    api_key=os.getenv("GROQ_API_KEY")
)


from fastapi import FastAPI
from pydantic import BaseModel
import joblib

app = FastAPI(title="Student Predictor")

# Load the trained model once
model = joblib.load("model.pkl")


class Student(BaseModel):
    name: str
    marks: int


@app.get("/")
def home():
    return {
        "message": "Student Predictor API is Running 🚀"
    }


@app.post("/predict")
def predict(student: Student):

    prediction = model.predict([[student.marks]])[0]

    ai = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {
                "role": "user",
                "content": f"""
    Student: {student.name}

    Marks: {student.marks}

    Prediction: {prediction}

    Explain this result in simple English in 2 lines.
    """
            }
        ]
    )
    

    return {
    "student": student.name,
    "marks": student.marks,
    "prediction": prediction,
    "explanation": ai.choices[0].message.content
    }   