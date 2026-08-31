from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.db.database import get_db
from app.models.models import User
from app.schemas.schemas import HospitalLoginSchema, DonorRegisterSchema, PatientRegisterSchema, TokenResponse
from datetime import datetime

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/hospital-login", response_model=TokenResponse)
def hospital_login(payload: HospitalLoginSchema, db: Session = Depends(get_db)):
    if not payload.facilityName or not payload.email:
        raise HTTPException(status_code=400, detail="Facility name and email required")
    
    token = f"jwt_hospital_{int(datetime.utcnow().timestamp())}"
    return {
        "token": token,
        "user": {
            "name": payload.facilityName,
            "role": "hospital",
            "email": payload.email,
            "facility": payload.facilityName
        }
    }

@router.post("/donor-register", response_model=TokenResponse)
def donor_register(payload: DonorRegisterSchema, db: Session = Depends(get_db)):
    # Check duplicate phone or email
    existing_phone = db.query(User).filter(User.phone == payload.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number is already registered")
    
    if payload.email:
        existing_email = db.query(User).filter(User.email == payload.email).first()
        if existing_email:
            raise HTTPException(status_code=400, detail="Email is already registered")
    
    user = User(
        full_name=payload.fullName,
        email=payload.email,
        phone=payload.phone,
        role="donor",
        blood_group=payload.bloodGroup,
        age=payload.age,
        city=payload.city,
        availability_status=payload.availability,
        hashed_passcode=payload.passcode
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = f"jwt_donor_{user.id}_{int(datetime.utcnow().timestamp())}"
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.full_name,
            "role": user.role,
            "blood_group": user.blood_group,
            "phone": user.phone,
            "city": user.city
        }
    }

@router.post("/patient-register", response_model=TokenResponse)
def patient_register(payload: PatientRegisterSchema, db: Session = Depends(get_db)):
    existing_phone = db.query(User).filter(User.phone == payload.phone).first()
    if existing_phone:
        raise HTTPException(status_code=400, detail="Phone number is already registered")
    
    user = User(
        full_name=payload.fullName,
        email=payload.email,
        phone=payload.phone,
        role="patient",
        blood_group=payload.bloodGroup,
        abha_id=payload.abhaId,
        hashed_passcode=payload.passcode
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    token = f"jwt_patient_{user.id}_{int(datetime.utcnow().timestamp())}"
    return {
        "token": token,
        "user": {
            "id": user.id,
            "name": user.full_name,
            "role": user.role,
            "phone": user.phone,
            "abha_id": user.abha_id
        }
    }
