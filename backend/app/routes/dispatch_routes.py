from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import EmergencyRequest, DonorResponse
from app.schemas.schemas import DonorRespondSchema
from typing import List, Dict, Any

router = APIRouter(prefix="/dispatches", tags=["Dispatches"])

@router.get("/active", response_model=List[Dict[str, Any]])
def get_active_dispatches(db: Session = Depends(get_db)):
    records = db.query(EmergencyRequest).filter(
        EmergencyRequest.is_verified == True,
        EmergencyRequest.status == "ACTIVE_DISPATCH"
    ).order_by(EmergencyRequest.created_at.desc()).all()
    
    result = []
    for r in records:
        # Check if there is an approved or pending donor response
        assigned_donor = None
        pending_donor = None
        for dr in r.donor_responses:
            if dr.status == "APPROVED":
                assigned_donor = {"name": dr.donor_name, "phone": dr.donor_phone, "eta": dr.eta}
            elif dr.status == "PENDING_APPROVAL":
                pending_donor = {"name": dr.donor_name, "phone": dr.donor_phone, "eta": dr.eta}
        
        result.append({
            "reference_id": r.reference_id,
            "category": r.category,
            "item_required": r.item_required,
            "units": r.units,
            "urgency": r.urgency,
            "hospital_name": r.hospital_name,
            "doctor_name": r.doctor_name,
            "sector_location": r.sector_location,
            "latitude": r.latitude,
            "longitude": r.longitude,
            "geofence_radius_km": r.geofence_radius_km,
            "is_verified": r.is_verified,
            "status": r.status,
            "ml_match_probability": r.ml_match_probability,
            "ml_risk_tag": r.ml_risk_tag,
            "prescription_data": r.prescription_data,
            "submitted_by_patient": r.submitted_by_patient,
            "assigned_donor": assigned_donor,
            "pending_donor": pending_donor,
            "created_at": r.created_at.isoformat() if r.created_at else None
        })
    return result

@router.post("/{ref}/respond")
def respond_to_dispatch(ref: str, payload: DonorRespondSchema, db: Session = Depends(get_db)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.reference_id == ref).first()
    if not req:
        raise HTTPException(status_code=404, detail="Dispatch request not found")
    
    response = DonorResponse(
        request_id=req.id,
        donor_name=payload.donorName,
        donor_phone=payload.phone,
        eta=payload.eta,
        status="PENDING_APPROVAL"
    )
    db.add(response)
    db.commit()
    db.refresh(response)
    
    return {
        "success": True,
        "message": f"Response submitted for {ref}, awaiting hospital clearance",
        "response_id": response.id
    }
