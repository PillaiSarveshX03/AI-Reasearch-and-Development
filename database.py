import sqlite3

conn = sqlite3.connect("bhumi.db")
cursor = conn.cursor()

cursor.execute("""
CREATE TABLE IF NOT EXISTS predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    marks INTEGER,
    prediction TEXT,
    explanation TEXT
)
""")

conn.commit()

print("✅ Table created successfully!")

conn.close()