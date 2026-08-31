from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(150), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=True)
    phone = Column(String(50), unique=True, index=True, nullable=False)
    role = Column(String(50), nullable=False)  # 'hospital', 'donor', 'patient'
    blood_group = Column(String(10), nullable=True)
    age = Column(Integer, nullable=True)
    city = Column(String(100), nullable=True)
    availability_status = Column(String(50), default="Immediate")  # 'Immediate', '24 Hours', 'Scheduled'
    abha_id = Column(String(100), nullable=True)
    hashed_passcode = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    responses = relationship("DonorResponse", back_populates="donor")
    patient_requests = relationship("EmergencyRequest", back_populates="patient_user")


class Hospital(Base):
    __tablename__ = "hospitals"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, nullable=False)
    facility_code = Column(String(50), unique=True, nullable=False)
    email = Column(String(150), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    contact_phone = Column(String(50), nullable=False)
    address = Column(String(255), nullable=False)

    requests = relationship("EmergencyRequest", back_populates="hospital_facility")


class EmergencyRequest(Base):
    __tablename__ = "emergency_requests"

    id = Column(Integer, primary_key=True, index=True)
    reference_id = Column(String(50), unique=True, index=True, nullable=False)
    category = Column(String(50), nullable=False)  # 'Blood', 'Organ'
    item_required = Column(String(100), nullable=False)
    units = Column(Integer, default=1)
    urgency = Column(String(50), nullable=False)  # 'Critical', 'Urgent', 'Routine'
    hospital_name = Column(String(200), nullable=False)
    doctor_name = Column(String(150), nullable=False)
    patient_contact = Column(String(50), nullable=True)
    sector_location = Column(String(255), nullable=False)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    geofence_radius_km = Column(Float, default=10.0)
    is_verified = Column(Boolean, default=False)
    status = Column(String(50), default="PENDING_HOSPITAL_VERIFICATION")  # 'ACTIVE_DISPATCH', 'PENDING_HOSPITAL_VERIFICATION', 'COMPLETED', 'REJECTED'
    
    # ML Scoring Cache
    ml_match_probability = Column(Float, default=0.0)
    ml_risk_tag = Column(String(50), default="LOW_RISK")  # 'LOW_RISK', 'MODERATE_RISK', 'HIGH_RISK'

    prescription_data = Column(Text, nullable=True)  # Base64 or URL
    submitted_by_patient = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Foreign Keys
    hospital_id = Column(Integer, ForeignKey("hospitals.id"), nullable=True)
    patient_user_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    hospital_facility = relationship("Hospital", back_populates="requests")
    patient_user = relationship("User", back_populates="patient_requests")
    donor_responses = relationship("DonorResponse", back_populates="request")


class DonorResponse(Base):
    __tablename__ = "donor_responses"

    id = Column(Integer, primary_key=True, index=True)
    request_id = Column(Integer, ForeignKey("emergency_requests.id"), nullable=False)
    donor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    donor_name = Column(String(150), nullable=False)
    donor_phone = Column(String(50), nullable=False)
    eta = Column(String(50), nullable=False)
    status = Column(String(50), default="PENDING_APPROVAL")  # 'PENDING_APPROVAL', 'APPROVED', 'DECLINED'
    created_at = Column(DateTime, default=datetime.utcnow)

    request = relationship("EmergencyRequest", back_populates="donor_responses")
    donor = relationship("User", back_populates="responses")
