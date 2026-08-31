from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import EmergencyRequest
from app.schemas.schemas import PatientSosCreateSchema
import random

router = APIRouter(prefix="/requests", tags=["Patient Requests"])

@router.post("/patient-sos")
def submit_patient_sos(payload: PatientSosCreateSchema, db: Session = Depends(get_db)):
    if not payload.prescriptionData:
        raise HTTPException(status_code=400, detail="Doctor prescription note is mandatory")
        
    ref_id = f"LP-IN-{random.randint(1000, 9999)}"
    
    req = EmergencyRequest(
        reference_id=ref_id,
        category=payload.category,
        item_required=payload.itemType,
        units=1,
        urgency="Critical",
        hospital_name=payload.hospitalName,
        doctor_name=payload.doctorName,
        patient_contact=payload.phone,
        sector_location="Patient SOS Geofence Sector",
        latitude=payload.latitude or 28.6139,
        longitude=payload.longitude or 77.2090,
        geofence_radius_km=10.0,
        is_verified=False,
        status="PENDING_HOSPITAL_VERIFICATION",
        prescription_data=payload.prescriptionData,
        submitted_by_patient=True
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    
    return {
        "success": True,
        "message": f"Patient SOS {ref_id} submitted to {payload.hospitalName} for review",
        "request": {
            "reference_id": req.reference_id,
            "category": req.category,
            "item_required": req.item_required,
            "hospital_name": req.hospital_name,
            "status": req.status,
            "is_verified": req.is_verified
        }
    }
