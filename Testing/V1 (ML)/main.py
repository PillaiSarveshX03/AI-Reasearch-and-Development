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

    return {
        "student": student.name,
        "marks": student.marks,
        "prediction": prediction
    }