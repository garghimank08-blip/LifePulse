from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime

# --- AUTH SCHEMAS ---
class HospitalLoginSchema(BaseModel):
    facilityName: str
    email: str
    password: str

class DonorRegisterSchema(BaseModel):
    fullName: str
    email: Optional[str] = None
    bloodGroup: str
    phone: str
    age: int
    city: str
    availability: str
    passcode: str

class PatientRegisterSchema(BaseModel):
    fullName: str
    phone: str
    email: Optional[str] = None
    bloodGroup: Optional[str] = "B+"
    ageGender: str
    abhaId: Optional[str] = None
    emergencyContact: str
    passcode: str

class TokenResponse(BaseModel):
    token: str
    user: dict

# --- REQUEST & DISPATCH SCHEMAS ---
class PatientSosCreateSchema(BaseModel):
    category: str
    itemType: str
    hospitalName: str
    doctorName: str
    phone: str
    prescriptionData: Optional[str] = None
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090

class HospitalSosCreateSchema(BaseModel):
    category: str
    itemType: str
    units: int = 1
    urgency: str
    hospital: str
    doctor: str
    email: str
    sector: str
    radius: float = 10.0
    latitude: Optional[float] = 28.6139
    longitude: Optional[float] = 77.2090

class VerifyRequestSchema(BaseModel):
    action: str  # 'APPROVE' or 'REJECT'

class DonorRespondSchema(BaseModel):
    donorName: str
    phone: str
    eta: str

# --- ML MATCHING SCHEMAS ---
class MLMatchRequestSchema(BaseModel):
    donor_blood_group: str
    recipient_blood_group: str
    distance_km: float
    urgency_tier: str  # 'Critical', 'Urgent', 'Routine'
    transit_time_mins: float
    donor_vitality_score: float = 85.0

class MLMatchResultSchema(BaseModel):
    match_probability: float
    risk_tag: str
    biological_compatibility: float
    logistic_score: float
    recommendation: str
