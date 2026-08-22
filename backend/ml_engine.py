import numpy as np
import pandas as pd

def compute_organ_compatibility(donor_data: dict, recipient_data: dict) -> dict:
    """
    ML Scoring Engine: Evaluates blood compatibility, HLA tissue match %,
    age differential, and Cold Ischemia Decay.
    """
    # 1. Blood Compatibility Check
    donor_blood = donor_data.get("blood_type", "")
    rec_blood = recipient_data.get("blood_type", "")
    blood_score = 100.0 if donor_blood == rec_blood else (70.0 if donor_blood in ["O-", "O+"] else 30.0)
    
    # 2. HLA Match Percentage
    hla_match = recipient_data.get("hla_match_percent", 50.0)
    
    # 3. Cold Ischemia Time Decay
    max_ischemia = donor_data.get("max_ischemia_hours", 12.0)
    transit_time = recipient_data.get("transit_time_hours", 1.0)
    remaining_ischemia = max_ischemia - transit_time
    
    if remaining_ischemia <= 0:
        return {
            "recipient_id": recipient_data.get("recipient_id"),
            "match_score": 0.0,
            "risk_level": "CRITICAL - ISCHEMIA EXPIRED",
            "eligible": False
        }
    
    # 4. Clinical Urgency Factor (Scale 1-5)
    urgency = recipient_data.get("urgency_level", 3)
    
    # 5. Age Differential Penalty
    age_diff = abs(donor_data.get("age", 30) - recipient_data.get("age", 30))
    
    # ML Hybrid Formula
    base_score = (hla_match * 0.45) + (blood_score * 0.30) + (urgency * 5.0) - (age_diff * 0.2)
    decay_multiplier = max(0.1, remaining_ischemia / max_ischemia)
    
    final_score = min(99.5, max(5.0, base_score * decay_multiplier))
    
    # Risk Taxonomy
    if final_score >= 75.0:
        risk_level = "LOW RISK"
    elif final_score >= 50.0:
        risk_level = "MODERATE RISK"
    else:
        risk_level = "HIGH RISK"
        
    return {
        "recipient_id": recipient_data.get("recipient_id"),
        "recipient_name": recipient_data.get("recipient_name"),
        "match_score": round(final_score, 1),
        "risk_level": risk_level,
        "transit_time_hours": round(transit_time, 1),
        "remaining_ischemia_hours": round(remaining_ischemia, 1),
        "eligible": True
    }