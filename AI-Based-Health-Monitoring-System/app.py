from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS

from database import db, Doctor, Patient, HealthRecord
from predict import predict_health_status
from recommendation import generate_recommendation

import os


# ============================================================
# FLASK APP
# ============================================================

app = Flask(__name__)

CORS(app)


# ============================================================
# DATABASE CONFIGURATION
# ============================================================

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///hospital.db"

app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

db.init_app(app)


# ============================================================
# CREATE DATABASE TABLES
# ============================================================

with app.app_context():

    db.create_all()


# ============================================================
# DASHBOARD
# ============================================================

@app.route("/dashboard")
def dashboard():

    return send_from_directory(
        ".",
        "dashboard.html"
    )


# ============================================================
# LOGIN
# ============================================================

@app.route("/api/login", methods=["POST"])
def login():

    data = request.json

    doctor = Doctor.query.filter_by(
        username=data.get("username"),
        password=data.get("password")
    ).first()

    if doctor:

        return jsonify({

            "status": "success",

            "doctor": {
                "id": doctor.id,
                "name": doctor.name
            }

        })

    return jsonify({

        "status": "error",

        "message": "Invalid credentials"

    }), 401


# ============================================================
# GET ALL PATIENTS
# ============================================================

@app.route("/api/patients", methods=["GET"])
def get_patients():

    patients = Patient.query.all()

    return jsonify([

        {
            "id": patient.id,

            "patient_code":
                patient.patient_code,

            "name":
                patient.name,

            "age":
                patient.age,

            "ward":
                patient.ward,

            "gender":
                patient.gender,

            "admission_date":
                patient.admission_date
        }

        for patient in patients

    ])


# ============================================================
# DASHBOARD RISK OVERVIEW
# ============================================================

@app.route("/api/overview", methods=["GET"])
def get_overview():

    records = HealthRecord.query.all()


    risk_counts = {

        "Critical": 0,

        "High": 0,

        "Medium": 0,

        "Low": 0

    }


    for record in records:

        risk = record.risk_level


        if risk in risk_counts:

            risk_counts[risk] += 1


    total_patients = Patient.query.count()


    return jsonify({

        "total_patients":
            total_patients,

        "critical":
            risk_counts["Critical"],

        "high":
            risk_counts["High"],

        "medium":
            risk_counts["Medium"],

        "low":
            risk_counts["Low"]

    })


# ============================================================
# GET PATIENT HEALTH ANALYSIS
# ============================================================

@app.route("/api/patient/<int:id>/stats", methods=["GET"])
def get_patient_stats(id):

    record = (

        HealthRecord.query

        .filter_by(patient_id=id)

        .order_by(
            HealthRecord.timestamp.desc()
        )

        .first()

    )


    if not record:

        return jsonify({

            "status": "error",

            "message":
                "No health data found for this patient"

        }), 404


    patient = record.patient


    # ========================================================
    # VITALS
    # ========================================================

    vitals = {

        "heart_rate":
            record.heart_rate,

        "blood_pressure_sys":
            record.blood_pressure_sys,

        "blood_pressure_dia":
            record.blood_pressure_dia,

        "oxygen_level":
            record.oxygen_level,

        "body_temperature":
            record.body_temperature,

        "white_blood_cell_count":
            record.white_blood_cell_count,

        "urine_ph":
            record.urine_ph,

        "respiratory_rate":
            record.respiratory_rate

    }


    # ========================================================
    # AI PREDICTION
    # ========================================================

    ai_prediction = predict_health_status(
        vitals
    )


    # ========================================================
    # RECOMMENDATIONS
    # ========================================================

    recommendations = generate_recommendation(

        vitals,

        ai_prediction["status"]

    )


    # ========================================================
    # RETURN DATA
    # ========================================================

    return jsonify({

        "patient": {

            "id":
                patient.id,

            "patient_code":
                patient.patient_code,

            "name":
                patient.name,

            "age":
                patient.age,

            "ward":
                patient.ward,

            "gender":
                patient.gender,

            "admission_date":
                patient.admission_date

        },


        "vitals":
            vitals,


        "ai_prediction":
            ai_prediction,


        "dataset_risk_level":
            record.risk_level,


        "recommendations":
            recommendations

    })


# ============================================================
# ADD NEW HEALTH RECORD
# ============================================================

@app.route("/api/add_record", methods=["POST"])
def add_record():

    data = request.json


    new_record = HealthRecord(

        patient_id=
            data["patient_id"],

        heart_rate=
            data["heart_rate"],

        blood_pressure_sys=
            data["blood_pressure_sys"],

        blood_pressure_dia=
            data["blood_pressure_dia"],

        oxygen_level=
            data["oxygen_level"],

        body_temperature=
            data["body_temperature"],

        white_blood_cell_count=
            data["white_blood_cell_count"],

        urine_ph=
            data["urine_ph"],

        respiratory_rate=
            data["respiratory_rate"],

        risk_level=
            data.get("risk_level")

    )


    db.session.add(
        new_record
    )

    db.session.commit()


    return jsonify({

        "status":
            "success",

        "message":
            "Health record added successfully"

    })


# ============================================================
# START SERVER
# ============================================================

if __name__ == "__main__":

    if not os.path.exists(
        "health_model.pkl"
    ):

        print(
            "WARNING: health_model.pkl not found."
        )


    app.run(

        debug=True,

        port=5000

    )