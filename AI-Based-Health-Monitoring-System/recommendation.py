def generate_recommendation(vitals, prediction):
    """
    Generate simple decision-support recommendations
    based on the patient's current vital parameters.

    This is for project/demo purposes and is not a
    medical diagnosis system.
    """

    recommendations = []

    # --------------------------------------------------
    # Overall ML prediction
    # --------------------------------------------------

    if prediction == "Critical":

        recommendations.append(
            "High-priority monitoring is recommended based on the AI prediction."
        )

    elif prediction == "High":

        recommendations.append(
            "Increase monitoring frequency based on the AI prediction."
        )

    elif prediction == "Medium":

        recommendations.append(
            "Continue regular monitoring and observe changes in patient parameters."
        )

    elif prediction == "Low":

        recommendations.append(
            "Continue routine monitoring of the patient."
        )


    # --------------------------------------------------
    # Oxygen
    # --------------------------------------------------

    oxygen = vitals.get("oxygen_level")

    if oxygen is not None:

        if oxygen < 90:

            recommendations.append(
                f"SpO2 is {oxygen}%. Low oxygen saturation detected; "
                "prompt clinical review is recommended."
            )

        elif oxygen < 94:

            recommendations.append(
                f"SpO2 is {oxygen}%. Oxygen saturation should be monitored closely."
            )


    # --------------------------------------------------
    # Heart rate
    # --------------------------------------------------

    heart_rate = vitals.get("heart_rate")

    if heart_rate is not None:

        if heart_rate > 100:

            recommendations.append(
                f"Heart rate is {heart_rate} BPM. Elevated heart rate detected."
            )

        elif heart_rate < 60:

            recommendations.append(
                f"Heart rate is {heart_rate} BPM. Low heart rate detected."
            )


    # --------------------------------------------------
    # Body temperature
    # --------------------------------------------------

    temperature = vitals.get("body_temperature")

    if temperature is not None:

        if temperature >= 38:

            recommendations.append(
                f"Body temperature is {temperature}°C. "
                "Elevated temperature detected."
            )


    # --------------------------------------------------
    # Respiratory rate
    # --------------------------------------------------

    respiratory_rate = vitals.get("respiratory_rate")

    if respiratory_rate is not None:

        if respiratory_rate > 20:

            recommendations.append(
                f"Respiratory rate is {respiratory_rate} breaths/min. "
                "Elevated respiratory rate detected."
            )

        elif respiratory_rate < 12:

            recommendations.append(
                f"Respiratory rate is {respiratory_rate} breaths/min. "
                "Low respiratory rate detected."
            )


    # --------------------------------------------------
    # White Blood Cell Count
    # --------------------------------------------------

    wbc = vitals.get("white_blood_cell_count")

    if wbc is not None:

        if wbc > 11000:

            recommendations.append(
                f"WBC count is {wbc} cells/µL. "
                "Elevated WBC count detected."
            )

        elif wbc < 4000:

            recommendations.append(
                f"WBC count is {wbc} cells/µL. "
                "Low WBC count detected."
            )


    # --------------------------------------------------
    # Urine pH
    # --------------------------------------------------

    urine_ph = vitals.get("urine_ph")

    if urine_ph is not None:

        if urine_ph < 5:

            recommendations.append(
                f"Urine pH is {urine_ph}. "
                "Urine pH is outside the configured monitoring range."
            )

        elif urine_ph > 8:

            recommendations.append(
                f"Urine pH is {urine_ph}. "
                "Urine pH is outside the configured monitoring range."
            )


    # --------------------------------------------------
    # Fallback
    # --------------------------------------------------

    if len(recommendations) == 0:

        recommendations.append(
            "No specific parameter-based alerts were generated."
        )


    return recommendations