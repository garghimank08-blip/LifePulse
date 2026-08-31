from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import EmergencyRequest, DonorResponse
from app.schemas.schemas import HospitalSosCreateSchema, VerifyRequestSchema
import random

router = APIRouter(prefix="/hospital", tags=["Hospital Console"])

@router.get("/requests/{facility_name}")
def get_hospital_requests(facility_name: str, db: Session = Depends(get_db)):
    reqs = db.query(EmergencyRequest).filter(EmergencyRequest.hospital_name == facility_name).all()
    
    pending = []
    approved = []
    rejected = []
    
    for r in reqs:
        item = {
            "ref": r.reference_id,
            "category": r.category,
            "item": r.item_required,
            "units": r.units,
            "urgency": r.urgency,
            "hospital": r.hospital_name,
            "doctor": r.doctor_name,
            "status": r.status,
            "isVerified": r.is_verified,
            "prescriptionUrl": r.prescription_data,
            "submittedByPatient": r.submitted_by_patient,
            "timestamp": r.created_at.strftime("%I:%M %p IST") if r.created_at else "Recent"
        }
        if r.status == "PENDING_HOSPITAL_VERIFICATION":
            pending.append(item)
        elif r.status == "ACTIVE_DISPATCH":
            approved.append(item)
        elif r.status == "REJECTED":
            rejected.append(item)
            
    return {
        "pending": pending,
        "approved": approved,
        "rejected": rejected
    }

@router.post("/direct-sos")
def create_hospital_direct_sos(payload: HospitalSosCreateSchema, db: Session = Depends(get_db)):
    ref_id = f"LP-IN-{random.randint(1000, 9999)}"
    
    req = EmergencyRequest(
        reference_id=ref_id,
        category=payload.category,
        item_required=payload.itemType,
        units=payload.units,
        urgency=payload.urgency,
        hospital_name=payload.hospital,
        doctor_name=payload.doctor,
        sector_location=payload.sector,
        latitude=payload.latitude,
        longitude=payload.longitude,
        geofence_radius_km=payload.radius,
        is_verified=True,
        status="ACTIVE_DISPATCH",
        submitted_by_patient=False
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    
    return {
        "success": True,
        "message": f"Direct Emergency SOS {ref_id} published to Donor Hub",
        "request": {
            "reference_id": req.reference_id,
            "category": req.category,
            "item_required": req.item_required,
            "hospital_name": req.hospital_name
        }
    }

@router.patch("/requests/{ref}/verify")
def verify_request(ref: str, payload: VerifyRequestSchema, db: Session = Depends(get_db)):
    req = db.query(EmergencyRequest).filter(EmergencyRequest.reference_id == ref).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if payload.action == "APPROVE":
        req.is_verified = True
        req.status = "ACTIVE_DISPATCH"
    else:
        req.is_verified = False
        req.status = "REJECTED"
        
    db.commit()
    db.refresh(req)
    
    return {
        "success": True,
        "reference_id": req.reference_id,
        "status": req.status,
        "is_verified": req.is_verified
    }
