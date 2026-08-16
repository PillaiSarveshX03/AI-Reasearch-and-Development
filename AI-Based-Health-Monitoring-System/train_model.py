import sqlite3
import pandas as pd
import joblib

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report


DATABASE = "patient_dataset_2000.db"


def load_data():

    connection = sqlite3.connect(DATABASE)

    query = """
        SELECT
            Heart_Rate,
            Blood_Pressure,
            SpO2,
            Body_Temperature,
            White_Blood_Cell_Count,
            Urine_pH,
            Respiratory_Rate,
            Risk_Level
        FROM patients
    """

    data = pd.read_sql_query(query, connection)

    connection.close()

    return data


def prepare_data(data):

    # Split blood pressure into two separate numbers
    data[["Systolic_BP", "Diastolic_BP"]] = (
        data["Blood_Pressure"]
        .str.split("/", expand=True)
        .astype(float)
    )

    # Features used by the ML model
    features = [
        "Heart_Rate",
        "Systolic_BP",
        "Diastolic_BP",
        "SpO2",
        "Body_Temperature",
        "White_Blood_Cell_Count",
        "Urine_pH",
        "Respiratory_Rate"
    ]

    X = data[features]

    # Target
    y = data["Risk_Level"]

    return X, y


def train_model():

    print("Loading real patient dataset...")

    data = load_data()

    print(f"Total patients: {len(data)}")

    print("\nRisk level distribution:")
    print(data["Risk_Level"].value_counts())

    X, y = prepare_data(data)

    X_train, X_test, y_train, y_test = train_test_split(
        X,
        y,
        test_size=0.2,
        random_state=42,
        stratify=y
    )

    print("\nTraining Random Forest model...")

    model = RandomForestClassifier(
        n_estimators=200,
        random_state=42,
        class_weight="balanced"
    )

    model.fit(X_train, y_train)

    predictions = model.predict(X_test)

    accuracy = accuracy_score(y_test, predictions)

    print(f"\nModel Accuracy: {accuracy * 100:.2f}%")

    print("\nClassification Report:")
    print(classification_report(y_test, predictions))

    # Save model
    joblib.dump(model, "health_model.pkl")

    print("\nModel saved successfully as:")
    print("health_model.pkl")


if __name__ == "__main__":
    train_model()