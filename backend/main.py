from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
import json

from database import init_db, get_db, PatientRequest, OrganMatch
from ml_engine import calculate_compatibility

app = FastAPI(title="LifePulse Emergency & Organ Exchange API")

# Enable CORS for Frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize SQLite database schema
init_db()

# WebSocket Connection Manager for Real-Time Donor Feeds
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

# Pydantic Schemas
class CreatePatientRequest(BaseModel):
    patient_name: str
    age: int
    need_type: str
    blood_group: Optional[str] = None
    organ_type: Optional[str] = None
    hospital_name: str
    doctor_name: str
    doctor_phone: Optional[str] = None

class MatchQuery(BaseModel):
    organ_type: str
    blood_group: str
    donor_age: int
    max_ischemia_hours: float
    current_ischemia_hours: float
    hla_match_ratio: float

# REST Routes
@app.get("/api/requests")
def get_all_requests(db: Session = Depends(get_db)):
    return db.query(PatientRequest).order_by(PatientRequest.created_at.desc()).all()

@app.post("/api/requests")
async def create_request(req: CreatePatientRequest, db: Session = Depends(get_db)):
    req_count = db.query(PatientRequest).count()
    new_id = f"REQ-{101 + req_count}"
    
    db_req = PatientRequest(
        id=new_id,
        patient_name=req.patient_name,
        age=req.age,
        need_type=req.need_type,
        blood_group=req.blood_group,
        organ_type=req.organ_type,
        hospital_name=req.hospital_name,
        doctor_name=req.doctor_name,
        doctor_phone=req.doctor_phone,
        status="UNVERIFIED_PENDING"
    )
    db.add(db_req)
    db.commit()
    db.refresh(db_req)

    # Broadcast new pending request to WebSocket clients
    await manager.broadcast({
        "type": "NEW_PENDING_REQUEST",
        "data": {
            "id": db_req.id,
            "patient_name": db_req.patient_name,
            "need_type": db_req.need_type,
            "hospital_name": db_req.hospital_name,
            "status": db_req.status
        }
    })

    return db_req

@app.put("/api/requests/{req_id}/verify")
async def verify_request(req_id: str, db: Session = Depends(get_db)):
    db_req = db.query(PatientRequest).filter(PatientRequest.id == req_id).first()
    if not db_req:
        raise HTTPException(status_code=404, detail="Request ticket not found")

    db_req.status = "VERIFIED_BROADCAST"
    db.commit()

    # Broadcast emergency alert to donors
    await manager.broadcast({
        "type": "EMERGENCY_BROADCAST_ALERT",
        "data": {
            "id": db_req.id,
            "title": f"CRITICAL NEED: {db_req.blood_group or db_req.organ_type}",
            "patient_name": db_req.patient_name,
            "hospital_name": db_req.hospital_name,
            "need_type": db_req.need_type,
            "blood_group": db_req.blood_group,
            "organ_type": db_req.organ_type,
            "status": "VERIFIED_BROADCAST"
        }
    })

    return {"status": "success", "data": db_req}

@app.post("/api/h2h/match")
def run_organ_match(query: MatchQuery):
    mock_recipients = [
        {"id": "R-201", "name": "Rohan Sharma", "hospital": "Metro Heart Institute", "distance_km": 12.5},
        {"id": "R-202", "name": "Priya Patel", "hospital": "City Care Hospital", "distance_km": 42.0},
        {"id": "R-203", "name": "Amit Kumar", "hospital": "Apex Trauma Center", "distance_km": 88.0}
    ]

    results = []
    donor_dict = {
        "max_ischemia_hours": query.max_ischemia_hours,
        "current_ischemia_hours": query.current_ischemia_hours,
        "hla_match_ratio": query.hla_match_ratio
    }

    for rec in mock_recipients:
        comp = calculate_compatibility(donor_dict, rec)
        results.append({
            "recipient_id": rec["id"],
            "recipient_name": rec["name"],
            "hospital": rec["hospital"],
            "distance_km": rec["distance_km"],
            **comp
        })

    # Sort recipients by compatibility score descending
    results.sort(key=lambda x: x["match_score"], reverse=True)
    return {"donor_organ": query.organ_type, "ranked_matches": results}

# WebSocket Endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)