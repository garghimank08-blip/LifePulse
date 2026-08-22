from sqlalchemy import create_engine, Column, Integer, String, Float, Boolean, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime

SQLALCHEMY_DATABASE_URL = "sqlite:///./lifepulse.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class PatientRequest(Base):
    __tablename__ = "patient_requests"

    id = Column(String, primary_key=True, index=True)
    patient_name = Column(String, nullable=False)
    age = Column(Integer, nullable=False)
    need_type = Column(String, nullable=False)  # 'blood' or 'organ'
    blood_group = Column(String, nullable=True)
    organ_type = Column(String, nullable=True)
    hospital_name = Column(String, nullable=False)
    doctor_name = Column(String, nullable=False)
    doctor_phone = Column(String, nullable=True)
    status = Column(String, default="UNVERIFIED_PENDING")  # UNVERIFIED_PENDING, VERIFIED_BROADCAST, MATCHED, CLOSED
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class OrganMatch(Base):
    __tablename__ = "organ_matches"

    id = Column(Integer, primary_key=True, index=True)
    donor_hospital = Column(String, nullable=False)
    organ_type = Column(String, nullable=False)
    blood_group = Column(String, nullable=False)
    donor_age = Column(Integer, nullable=False)
    max_ischemia_hours = Column(Float, nullable=False)
    recipient_name = Column(String, nullable=False)
    recipient_hospital = Column(String, nullable=False)
    hla_compatibility = Column(Float, nullable=False)
    ml_score = Column(Float, nullable=False)
    status = Column(String, default="PENDING_TRANSIT")

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()