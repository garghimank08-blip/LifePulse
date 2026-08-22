import numpy as np

def calculate_compatibility(donor_data: dict, recipient_data: dict) -> dict:
    """
    ML Organ Scoring & Ischemia Logic.
    Calculates a match compatibility percentage based on:
    1. HLA Gene Marker Match (Weight: 45%)
    2. Cold Ischemia Time Decay (Weight: 35%)
    3. Distance / Transit Window (Weight: 20%)
    """
    # 1. HLA Typing Match
    hla_match = donor_data.get("hla_match_ratio", 0.85)  # 0.0 to 1.0
    hla_score = hla_match * 45.0

    # 2. Cold Ischemia Decay Penalty
    # Ischemia threshold varies by organ (e.g., Heart: 4-6 hrs, Kidney: 24 hrs)
    max_ischemia = donor_data.get("max_ischemia_hours", 12.0)
    current_ischemia = donor_data.get("current_ischemia_hours", 2.0)
    remaining_ratio = max(0.0, (max_ischemia - current_ischemia) / max_ischemia)
    ischemia_score = remaining_ratio * 35.0

    # 3. Distance & Logistics Score
    distance_km = recipient_data.get("distance_km", 15.0)
    max_distance_km = 150.0
    distance_factor = max(0.0, (max_distance_km - distance_km) / max_distance_km)
    distance_score = distance_factor * 20.0

    # Aggregate Total Score
    total_score = round(hla_score + ischemia_score + distance_score, 2)

    # Risk Determination
    if total_score >= 80.0:
        recommendation = "OPTIMAL_MATCH"
    elif total_score >= 60.0:
        recommendation = "MODERATE_RISK"
    else:
        recommendation = "HIGH_ISCHEMIA_RISK"

    return {
        "match_score": total_score,
        "hla_compatibility_pct": round(hla_match * 100, 1),
        "remaining_ischemia_hours": round(max_ischemia - current_ischemia, 1),
        "recommendation": recommendation,
        "estimated_transit_hours": round(distance_km / 60.0, 1)  # Assumes 60 km/h speed
    }