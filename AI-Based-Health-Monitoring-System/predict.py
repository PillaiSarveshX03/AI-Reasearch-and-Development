import joblib
import pandas as pd


model = joblib.load("health_model.pkl")


FEATURES = [
    "Heart_Rate",
    "Systolic_BP",
    "Diastolic_BP",
    "SpO2",
    "Body_Temperature",
    "White_Blood_Cell_Count",
    "Urine_pH",
    "Respiratory_Rate"
]


def predict_health_status(vitals):

    try:

        data = pd.DataFrame([{
            "Heart_Rate": vitals["heart_rate"],
            "Systolic_BP": vitals["blood_pressure_sys"],
            "Diastolic_BP": vitals["blood_pressure_dia"],
            "SpO2": vitals["oxygen_level"],
            "Body_Temperature": vitals["body_temperature"],
            "White_Blood_Cell_Count": vitals["white_blood_cell_count"],
            "Urine_pH": vitals["urine_ph"],
            "Respiratory_Rate": vitals["respiratory_rate"]
        }])

        data = data[FEATURES]

        prediction = model.predict(data)[0]

        probabilities = model.predict_proba(data)[0]

        confidence = max(probabilities) * 100

        return {
            "status": prediction,
            "confidence": round(float(confidence), 2)
        }

    except Exception as e:

        return {
            "status": "Error",
            "confidence": 0,
            "error": str(e)
        }