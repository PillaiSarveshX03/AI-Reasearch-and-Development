import sqlite3

conn = sqlite3.connect("patient_dataset_2000.db")   # Change if your DB has a different name

cursor = conn.cursor()

cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")

tables = cursor.fetchall()

print("Tables:", tables)

conn.close()