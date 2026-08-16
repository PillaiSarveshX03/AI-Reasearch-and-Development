import sqlite3
import pandas as pd

conn = sqlite3.connect("patient_dataset_2000.db")

query = "SELECT * FROM patients"

df = pd.read_sql_query(query, conn)

print(df.head())

conn.close()