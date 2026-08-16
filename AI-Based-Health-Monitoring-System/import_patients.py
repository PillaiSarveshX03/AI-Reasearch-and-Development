import sqlite3

from app import app
from database import db, Patient, HealthRecord


SOURCE_DB = "patient_dataset_2000.db"


def import_patients():

    print("Connecting to source database...")

    source = sqlite3.connect(SOURCE_DB)

    cursor = source.cursor()

    cursor.execute("""
        SELECT
            Patient_ID,
            Patient_Name,
            Age,
            Ward,
            Gender,
            Heart_Rate,
            Blood_Pressure,
            SpO2,
            Body_Temperature,
            White_Blood_Cell_Count,
            Urine_pH,
            Respiratory_Rate,
            Risk_Level,
            Admission_Date
        FROM patients
    """)

    patients = cursor.fetchall()

    print(f"Found {len(patients)} patients.")

    with app.app_context():

        # Remove old imported records
        HealthRecord.query.delete()
        Patient.query.delete()

        db.session.commit()

        print("Old patient data cleared.")

        for row in patients:

            (
                patient_code,
                name,
                age,
                ward,
                gender,
                heart_rate,
                blood_pressure,
                oxygen,
                temperature,
                wbc,
                urine_ph,
                respiratory_rate,
                risk_level,
                admission_date
            ) = row

            # Split blood pressure
            try:

                systolic, diastolic = blood_pressure.split("/")

                systolic = int(systolic)
                diastolic = int(diastolic)

            except:

                systolic = 120
                diastolic = 80


            # Create patient
            patient = Patient(

                patient_code=patient_code,

                name=name,

                age=age,

                ward=ward,

                gender=gender,

                admission_date=admission_date

            )

            db.session.add(patient)

            db.session.flush()


            # Create health record
            record = HealthRecord(

                patient_id=patient.id,

                heart_rate=heart_rate,

                blood_pressure_sys=systolic,

                blood_pressure_dia=diastolic,

                oxygen_level=oxygen,

                body_temperature=temperature,

                white_blood_cell_count=wbc,

                urine_ph=urine_ph,

                respiratory_rate=respiratory_rate,

                risk_level=risk_level

            )

            db.session.add(record)


        db.session.commit()


    source.close()

    print()
    print("=" * 50)
    print("PATIENT IMPORT COMPLETED")
    print("=" * 50)
    print(f"Patients imported: {len(patients)}")
    print("=" * 50)


if __name__ == "__main__":
    import_patients()