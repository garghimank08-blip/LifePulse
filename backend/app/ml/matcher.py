"""
Life Pulse — Tier 4 Machine Learning Engine: Inference & Risk Evaluator
Loads the trained RandomForestRegressor and scores live donor-recipient pairs.
"""

import os
import joblib
import numpy as np
from app.ml.train_model import compute_bio_compatibility, train_and_save_model
from app.config import settings

_model = None

def get_or_load_model():
    global _model
    if _model is not None:
        return _model
    
    model_path = settings.ML_MODEL_PATH
    if os.path.exists(model_path):
        try:
            _model = joblib.load(model_path)
            return _model
        except Exception as e:
            print(f"[Life Pulse ML] Failed to load existing model: {e}")
    
    # Train on the fly if model weights do not exist
    print("[Life Pulse ML] Training fresh RandomForest model weights...")
    _model = train_and_save_model()
    return _model

def evaluate_donor_recipient_pair(
    donor_blood_group: str,
    recipient_blood_group: str,
    distance_km: float,
    urgency_tier: str,
    transit_time_mins: float,
    donor_vitality_score: float = 85.0
) -> dict:
    """
    Ranks donor-recipient pair across 5 biological & logistical inputs.
    Returns:
      - match_probability: float (0.0 - 100.0)
      - risk_tag: 'LOW_RISK' | 'MODERATE_RISK' | 'HIGH_RISK'
      - biological_compatibility: float
      - logistic_score: float
      - recommendation: str
    """
    model = get_or_load_model()
    
    bio_compat = compute_bio_compatibility(donor_blood_group, recipient_blood_group)
    
    urgency_map = {'Critical': 3, 'Urgent': 2, 'Routine': 1}
    urgency_val = urgency_map.get(urgency_tier, 2)
    
    input_vector = np.array([[
        bio_compat,
        distance_km,
        urgency_val,
        transit_time_mins,
        donor_vitality_score
    ]])
    
    predicted_score = float(model.predict(input_vector)[0])
    match_probability = round(np.clip(predicted_score * 100.0, 0.0, 99.8), 1)
    
    # Risk categorization
    if bio_compat < 0.5:
        risk_tag = "HIGH_RISK"
        recommendation = "Incompatible blood group antigen match. Cross-match contraindicated."
    elif match_probability >= 80.0:
        risk_tag = "LOW_RISK"
        recommendation = "Optimal biological and geographic match. Immediate green corridor dispatch cleared."
    elif match_probability >= 50.0:
        risk_tag = "MODERATE_RISK"
        recommendation = "Compatible match with extended transit duration. Priority clinical escort advised."
    else:
        risk_tag = "HIGH_RISK"
        recommendation = "Elevated transit latency or sub-optimal compatibility. Second-tier donor backup required."
        
    logistic_score = round(max(0.0, 100.0 - (distance_km * 1.5 + transit_time_mins * 0.4)), 1)

    return {
        "match_probability": match_probability,
        "risk_tag": risk_tag,
        "biological_compatibility": round(bio_compat * 100, 1),
        "logistic_score": logistic_score,
        "recommendation": recommendation
    }
