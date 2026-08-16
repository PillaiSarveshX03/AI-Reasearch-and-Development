import sqlite3
import pandas as pd

from risk_predict import calculate_risk

conn = sqlite3.connect("patient_dataset_2000.db")

df = pd.read_sql("SELECT * FROM patients", conn)

risk=[]

for _,row in df.iterrows():

    bp=row["Blood_Pressure"]

    sbp=int(bp.split("/")[0])

    risk.append(
        calculate_risk(
            row["Age"],
            row["Heart_Rate"],
            sbp,
            row["SpO2"],
            row["Body_Temperature"],
            row["Respiratory_Rate"],
            row["White_Blood_Cell_Count"],
            row["Urine_pH"]
        )
    )

df["Predicted_Risk"]=risk

print(df.head())