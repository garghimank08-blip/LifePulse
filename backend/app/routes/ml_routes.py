from fastapi import APIRouter
from app.schemas.schemas import MLMatchRequestSchema, MLMatchResultSchema
from app.ml.matcher import evaluate_donor_recipient_pair

router = APIRouter(prefix="/ml", tags=["Machine Learning Matching Engine"])

@router.post("/match", response_model=MLMatchResultSchema)
def compute_match_compatibility(payload: MLMatchRequestSchema):
    """
    Tier 4 Scikit-Learn Compatibility Evaluator:
    Scores donor-recipient compatibility and risk tags across 5 inputs.
    """
    result = evaluate_donor_recipient_pair(
        donor_blood_group=payload.donor_blood_group,
        recipient_blood_group=payload.recipient_blood_group,
        distance_km=payload.distance_km,
        urgency_tier=payload.urgency_tier,
        transit_time_mins=payload.transit_time_mins,
        donor_vitality_score=payload.donor_vitality_score
    )
    return result
