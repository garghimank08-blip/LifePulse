"""
=========================================================================
LIFE PULSE — FASTAPI MAIN ENTRYPOINT & WEBSOCKET ENGINE
=========================================================================
"""

import json
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.config import settings
from app.db.database import engine, Base, SessionLocal
from app.models.models import EmergencyRequest, User, Hospital
from app.routes import auth_routes, dispatch_routes, hospital_routes, patient_routes, ml_routes
from app.ml.matcher import get_or_load_model

# Create Database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Tier 2-4 Emergency Care & Verified Donor Dispatch Backend with Scikit-Learn ML and WebSockets"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth_routes.router, prefix=settings.API_V1_STR)
app.include_router(dispatch_routes.router, prefix=settings.API_V1_STR)
app.include_router(hospital_routes.router, prefix=settings.API_V1_STR)
app.include_router(patient_routes.router, prefix=settings.API_V1_STR)
app.include_router(ml_routes.router, prefix=settings.API_V1_STR)

# --- WEBSOCKET CONNECTION MANAGER FOR INSTANT FAN-OUT BROADCAST (< 2s) ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"[WebSocket] Client connected. Total active connections: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"[WebSocket] Client disconnected. Total active: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        """Asynchronous fan-out dispatching verified alerts to all connected clients in < 2s"""
        dead_connections = []
        payload = json.dumps(message)
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                dead_connections.append(connection)
        for dead in dead_connections:
            self.disconnect(dead)

manager = ConnectionManager()

@app.websocket("/ws/dispatches")
async def websocket_dispatches_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                msg = json.loads(data)
                # Handle client ping or broadcast trigger
                if msg.get("type") == "PING":
                    await websocket.send_text(json.dumps({"type": "PONG", "timestamp": msg.get("timestamp")}))
                elif msg.get("type") == "TRIGGER_BROADCAST":
                    await manager.broadcast(msg)
            except Exception:
                pass
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "Life Pulse FastAPI Engine",
        "version": settings.VERSION,
        "active_websocket_connections": len(manager.active_connections)
    }

# Startup Event: Warm up ML Model and seed initial data if empty
@app.on_event("startup")
def startup_event():
    print("[Life Pulse] Initializing ML Model...")
    get_or_load_model()
    
    # Seed mock data in DB if empty
    db = SessionLocal()
    try:
        count = db.query(EmergencyRequest).count()
        if count == 0:
            print("[Life Pulse DB] Seeding initial emergency requests...")
            initial_reqs = [
                EmergencyRequest(
                    reference_id="LP-IN-9018",
                    category="Blood",
                    item_required="B- Blood",
                    units=2,
                    urgency="Critical",
                    hospital_name="AIIMS Apex Trauma Centre",
                    doctor_name="Dr. A. K. Sharma (ER Chief)",
                    sector_location="Ring Road, Safdarjung Enclave",
                    latitude=28.5672,
                    longitude=77.2100,
                    geofence_radius_km=5.0,
                    is_verified=True,
                    status="ACTIVE_DISPATCH",
                    ml_match_probability=94.2,
                    ml_risk_tag="LOW_RISK"
                ),
                EmergencyRequest(
                    reference_id="LP-IN-7842",
                    category="Blood",
                    item_required="O- Blood",
                    units=4,
                    urgency="Critical",
                    hospital_name="Yashoda Super Speciality Hospital",
                    doctor_name="Dr. M. K. Gupta",
                    sector_location="Nehru Nagar, Ghaziabad",
                    latitude=28.6692,
                    longitude=77.4538,
                    geofence_radius_km=10.0,
                    is_verified=True,
                    status="ACTIVE_DISPATCH",
                    ml_match_probability=91.8,
                    ml_risk_tag="LOW_RISK"
                ),
                EmergencyRequest(
                    reference_id="LP-IN-3401",
                    category="Organ",
                    item_required="Kidney (Transplant)",
                    units=1,
                    urgency="Urgent",
                    hospital_name="Max Super Speciality Hospital",
                    doctor_name="Dr. S. Patel (Transplant Lead)",
                    sector_location="Vaishali Sector 1, Ghaziabad",
                    latitude=28.6418,
                    longitude=77.3374,
                    geofence_radius_km=20.0,
                    is_verified=True,
                    status="ACTIVE_DISPATCH",
                    ml_match_probability=86.5,
                    ml_risk_tag="LOW_RISK"
                )
            ]
            db.add_all(initial_reqs)
            db.commit()
    finally:
        db.close()
