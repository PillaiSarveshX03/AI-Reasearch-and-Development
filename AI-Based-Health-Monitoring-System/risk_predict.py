def calculate_risk_score(vitals):
    """
    Calculate a simple patient risk level.

    Expected vitals:
    {
        "heart_rate": ...,
        "blood_pressure_sys": ...,
        "blood_pressure_dia": ...,
        "oxygen_level": ...,
        "glucose": ...
    }
    """

    heart_rate = vitals.get("heart_rate", 0)
    systolic = vitals.get("blood_pressure_sys", 0)
    diastolic = vitals.get("blood_pressure_dia", 0)
    oxygen = vitals.get("oxygen_level", 0)
    glucose = vitals.get("glucose", 0)

    score = 0

    # Heart rate
    if heart_rate > 120 or heart_rate < 50:
        score += 2
    elif heart_rate > 100 or heart_rate < 60:
        score += 1

    # Blood pressure
    if systolic >= 180 or systolic < 85:
        score += 2
    elif systolic >= 140 or systolic < 90:
        score += 1

    if diastolic >= 120 or diastolic < 50:
        score += 2
    elif diastolic >= 90 or diastolic < 60:
        score += 1

    # Oxygen
    if oxygen < 88:
        score += 3
    elif oxygen < 92:
        score += 2
    elif oxygen < 95:
        score += 1

    # Glucose
    if glucose > 250 or glucose < 60:
        score += 2
    elif glucose > 180 or glucose < 70:
        score += 1

    # Final risk level
    if score >= 6:
        return "HIGH"

    elif score >= 3:
        return "MEDIUM"

    else:
        return "LOW"