from fastapi import FastAPI, HTTPException, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from ml_engine import compute_organ_compatibility

app = FastAPI(title="LifePulse API Engine")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WebSocket Connection Manager for Live Donor SOS
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
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# In-Memory Storage
requests_db = {}
h2h_transfers = []

class EmergencyRequest(BaseModel):
    patient_name: str
    age: int
    need_type: str  # "blood", "platelets", "organ"
    blood_group: Optional[str] = None
    organ_type: Optional[str] = None
    hospital_name: str
    doctor_name: str
    doctor_phone: str
    prescription_url: str = "prescription_mock.png"

class VerifyRequest(BaseModel):
    request_id: str
    hospital_pin: str

@app.post("/api/requests/create")
async def create_request(data: EmergencyRequest):
    req_id = f"REQ-{len(requests_db) + 101}"
    record = {
        "id": req_id,
        **data.dict(),
        "status": "UNVERIFIED_PENDING",
        "timestamp": datetime.now().strftime("%H:%M:%S")
    }
    requests_db[req_id] = record
    return {"status": "success", "request_id": req_id, "record": record}

@app.post("/api/requests/verify")
async def verify_request(data: VerifyRequest):
    if data.request_id not in requests_db:
        raise HTTPException(status_code=404, detail="Request not found")
    
    if data.hospital_pin != "4026":
        raise HTTPException(status_code=400, detail="Invalid Hospital Security PIN")
        
    record = requests_db[data.request_id]
    record["status"] = "VERIFIED_EMERGENCY"
    
    # Broadcast Real-Time SOS Alert to all connected donors
    await manager.broadcast({
        "event": "NEW_SOS_ALERT",
        "request": record
    })
    
    return {"status": "success", "message": "Verified & SOS Broadcasted"}

@app.post("/api/organ/match")
async def match_organ(donor: dict, recipients: List[dict]):
    results = []
    for rec in recipients:
        res = compute_organ_compatibility(donor, rec)
        results.append(res)
    results = sorted(results, key=lambda x: x["match_score"], reverse=True)
    return {"donor_id": donor.get("donor_id"), "ranked_recipients": results}

@app.websocket("/ws/donors")
async def websocket_donor_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)