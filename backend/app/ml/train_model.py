"""
Life Pulse — Tier 4 Machine Learning Engine: RandomForest Compatibility Trainer
Trains a biological & logistical compatibility regressor matching donor-recipient pairs over 5 inputs.
"""

import os
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import joblib

# Blood compatibility matrix
BLOOD_COMPATIBILITY = {
    'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],  # Universal Red Cell Donor
    'O+': ['O+', 'A+', 'B+', 'AB+'],
    'A-': ['A-', 'A+', 'AB-', 'AB+'],
    'A+': ['A+', 'AB+'],
    'B-': ['B-', 'B+', 'AB-', 'AB+'],
    'B+': ['B+', 'AB+'],
    'AB-': ['AB-', 'AB+'],
    'AB+': ['AB+']  # Universal Recipient
}

def compute_bio_compatibility(donor_bg: str, recipient_bg: str) -> float:
    donor_bg = donor_bg.replace(" Blood", "").strip()
    recipient_bg = recipient_bg.replace(" Blood", "").strip()
    
    if donor_bg == recipient_bg:
        return 1.0
    if recipient_bg in BLOOD_COMPATIBILITY.get(donor_bg, []):
        return 0.90
    return 0.10

def generate_synthetic_training_data(n_samples: int = 5000) -> pd.DataFrame:
    np.random.seed(42)
    
    blood_groups = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
    urgency_map = {'Critical': 3, 'Urgent': 2, 'Routine': 1}
    
    data = []
    for _ in range(n_samples):
        donor_bg = np.random.choice(blood_groups)
        recipient_bg = np.random.choice(blood_groups)
        
        bio_compat = compute_bio_compatibility(donor_bg, recipient_bg)
        distance_km = np.random.uniform(0.5, 45.0)
        urgency_val = np.random.choice([1, 2, 3])  # Routine, Urgent, Critical
        transit_time_mins = distance_km * np.random.uniform(1.8, 3.2)
        donor_vitality = np.random.uniform(60.0, 100.0)
        
        # Calculate target probability (0.0 to 1.0)
        if bio_compat < 0.5:
            base_prob = np.random.uniform(0.02, 0.20)
        else:
            # Weighted formula: 45% Bio, 25% Distance/Transit, 15% Urgency speed, 15% Vitality
            dist_factor = max(0, 1.0 - (distance_km / 50.0))
            transit_factor = max(0, 1.0 - (transit_time_mins / 90.0))
            vitality_factor = donor_vitality / 100.0
            
            base_prob = (
                bio_compat * 0.45 +
                dist_factor * 0.20 +
                transit_factor * 0.15 +
                (urgency_val / 3.0) * 0.05 +
                vitality_factor * 0.15
            )
            base_prob = np.clip(base_prob + np.random.normal(0, 0.02), 0.0, 1.0)
            
        data.append({
            'bio_compatibility': bio_compat,
            'distance_km': distance_km,
            'urgency_level': urgency_val,
            'transit_time_mins': transit_time_mins,
            'donor_vitality': donor_vitality,
            'match_probability': base_prob
        })
        
    return pd.DataFrame(data)

def train_and_save_model():
    print("[Life Pulse ML] Generating synthetic clinical donor-recipient dataset...")
    df = generate_synthetic_training_data(6000)
    
    X = df[['bio_compatibility', 'distance_km', 'urgency_level', 'transit_time_mins', 'donor_vitality']]
    y = df['match_probability']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("[Life Pulse ML] Training RandomForestRegressor (100 estimators)...")
    model = RandomForestRegressor(
        n_estimators=100,
        max_depth=12,
        min_samples_split=4,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)
    
    predictions = model.predict(X_test)
    r2 = r2_score(y_test, predictions)
    mse = mean_squared_error(y_test, predictions)
    
    print(f"[Life Pulse ML] Model Trained! R² Score: {r2:.4f}, MSE: {mse:.6f}")
    
    output_dir = os.path.dirname(os.path.abspath(__file__))
    model_path = os.path.join(output_dir, "model_weights.joblib")
    
    joblib.dump(model, model_path)
    print(f"[Life Pulse ML] Model serialized successfully to: {model_path}")
    return model

if __name__ == "__main__":
    train_and_save_model()
