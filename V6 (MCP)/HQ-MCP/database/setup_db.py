import sqlite3

connection = sqlite3.connect("database/aircraft.db")

cursor = connection.cursor()


# =========================
# Aircraft Table
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS aircraft (
    aircraft_id TEXT PRIMARY KEY,
    model TEXT NOT NULL,
    squadron TEXT NOT NULL,
    fuel INTEGER NOT NULL,
    flight_hours INTEGER NOT NULL,
    status TEXT NOT NULL
)
""")


aircraft = [
    ("FALCON-001", "SU-30 MKI", "Alpha", 78, 142, "Operational"),
    ("FALCON-002", "SU-30 MKI", "Bravo", 42, 219, "Maintenance"),
]


cursor.executemany("""
INSERT OR REPLACE INTO aircraft
(aircraft_id, model, squadron, fuel, flight_hours, status)
VALUES (?, ?, ?, ?, ?, ?)
""", aircraft)


# =========================
# Maintenance Table
# =========================

cursor.execute("""
CREATE TABLE IF NOT EXISTS maintenance (
    maintenance_id INTEGER PRIMARY KEY AUTOINCREMENT,
    aircraft_id TEXT NOT NULL,
    maintenance_date TEXT NOT NULL,
    maintenance_type TEXT NOT NULL,
    description TEXT,
    technician TEXT,
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
)
""")


maintenance_records = [
    (
        "FALCON-001",
        "2026-08-15",
        "Engine Inspection",
        "Routine engine inspection completed",
        "A. Sharma"
    ),
    (
        "FALCON-001",
        "2026-07-10",
        "Hydraulic Check",
        "Hydraulic system inspection completed",
        "R. Mehta"
    ),
    (
        "FALCON-002",
        "2026-09-01",
        "Scheduled Service",
        "Scheduled maintenance service",
        "V. Patil"
    )
]


cursor.executemany("""
INSERT INTO maintenance
(aircraft_id, maintenance_date, maintenance_type, description, technician)
VALUES (?, ?, ?, ?, ?)
""", maintenance_records)


# =========================
# Save Changes
# =========================

connection.commit()
connection.close()

print("Aircraft database created successfully.")