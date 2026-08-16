from flask_sqlalchemy import SQLAlchemy
from datetime import datetime


db = SQLAlchemy()


class Doctor(db.Model):

    id = db.Column(db.Integer, primary_key=True)

    username = db.Column(
        db.String(80),
        unique=True,
        nullable=False
    )

    password = db.Column(
        db.String(120),
        nullable=False
    )

    name = db.Column(
        db.String(100)
    )


class Patient(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    patient_code = db.Column(
        db.String(50),
        unique=True
    )

    name = db.Column(
        db.String(100),
        nullable=False
    )

    age = db.Column(
        db.Integer
    )

    ward = db.Column(
        db.String(100)
    )

    gender = db.Column(
        db.String(20)
    )

    admission_date = db.Column(
        db.String(50)
    )

    records = db.relationship(
        "HealthRecord",
        backref="patient",
        lazy=True,
        cascade="all, delete-orphan"
    )


class HealthRecord(db.Model):

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    patient_id = db.Column(
        db.Integer,
        db.ForeignKey("patient.id"),
        nullable=False
    )

    heart_rate = db.Column(
        db.Integer
    )

    blood_pressure_sys = db.Column(
        db.Integer
    )

    blood_pressure_dia = db.Column(
        db.Integer
    )

    oxygen_level = db.Column(
        db.Integer
    )

    body_temperature = db.Column(
        db.Float
    )

    white_blood_cell_count = db.Column(
        db.Integer
    )

    urine_ph = db.Column(
        db.Float
    )

    respiratory_rate = db.Column(
        db.Integer
    )

    risk_level = db.Column(
        db.String(30)
    )

    timestamp = db.Column(
        db.DateTime,
        default=datetime.utcnow
    )