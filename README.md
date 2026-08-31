# Life Pulse — Emergency Care & Verified Donor Network

> **5-Tier Emergency Architecture Matching Slide 07 Hackathon Tech Stack Specification**  
> *"Browser-side slide into a real-time WebSocket backbone. Five layers, single source of truth, zero-install on the patient side."*

---

## 🏛️ 5-Tier Architecture

| Layer | Component | Technologies | What It Delivers |
|---|---|---|---|
| **01** | **FRONTEND** | `React 18` · `Vite` · `TailwindCSS` · `Leaflet.js` · `OpenStreetMap` | Zero-install web portal = patient form, donor map, hospital admin desk. Leaflet renders the 5–10 km geofence + live donor beacons. |
| **02** | **BACKEND** | `Python 3.11` · `FastAPI` · `FastAPI WebSockets` · `Pydantic` · `asyncio` | REST endpoints for requests + persistent WebSocket channels for donors. Asynchronous fan-out dispatches verified alerts in `< 2 s`. |
| **03** | **DATA** | `SQLite` / `PostgreSQL` · `SQLAlchemy 2.0` · `Alembic` · `Blob Storage` | Donation records, request ledger, prescription photographs, audit trail. Regional sharding keeps organ matches inside the same network. |
| **04** | **MACHINE LEARNING** | `Scikit-Learn` · `Pandas` · `NumPy` · `Joblib` | `RandomForestRegressor` ranks every donor-recipient pair over 5 biological inputs. Returns probability & risk tag per pair. |
| **05** | **DEPLOYMENT** | `Docker` · `docker-compose` · `Vercel` · `Render/Railway` | Globally distributed edge + auto-scaling WebSocket backend. Health-checked uptime suitable for hospital-grade SLAs. |

---

## 📂 Project Directory Structure

```
life-pulse/
├── frontend/                          # Layer 01: React 18 + Vite + Tailwind + Leaflet
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx                    # Application root with WebSocket listener
│       ├── main.jsx                   # DOM entry point
│       ├── index.css                  # Tailwind styles & medical animations
│       ├── components/
│       │   ├── Navbar.jsx             # Glassmorphic responsive navigation
│       │   ├── LoginHero.jsx          # Role selector & ECG Telemetry
│       │   ├── DispatchGrid.jsx       # Live Emergency Dispatches Feed
│       │   ├── HospitalConsole.jsx    # Trauma Level-1 Review & SOS Creator
│       │   ├── DonorHub.jsx           # Volunteer Hero Console & Acceptance
│       │   ├── PatientPortal.jsx      # 4-Step Pipeline & Prescription Upload
│       │   ├── RadarMap.jsx           # Leaflet Geofence & GPS Map
│       │   ├── MLMatchCard.jsx        # Scikit-Learn Match Probability Card
│       │   └── Modals.jsx             # Prescription & Donor Modals
│       └── services/
│           ├── api.js                 # Axios/Fetch API client
│           └── websocket.js           # Live WebSocket connection manager
│
├── backend/                           # Layer 02, 03 & 04: FastAPI + SQLAlchemy + Scikit-Learn
│   ├── requirements.txt               # Dependencies
│   ├── Dockerfile
│   └── app/
│       ├── main.py                    # FastAPI entrypoint, CORS, WebSocket hub
│       ├── config.py                  # Settings & environment variables
│       ├── models/models.py           # SQLAlchemy Database Models
│       ├── schemas/schemas.py         # Pydantic validation schemas
│       ├── routes/                    # API Route Handlers
│       │   ├── auth_routes.py
│       │   ├── dispatch_routes.py
│       │   ├── hospital_routes.py
│       │   ├── patient_routes.py
│       │   └── ml_routes.py
│       ├── ml/                        # Layer 04: Scikit-Learn ML Model
│       │   ├── train_model.py         # Trains RandomForest model on 5 inputs
│       │   ├── matcher.py             # Live ML scoring & risk evaluation engine
│       │   └── model_weights.joblib   # Serialized model weights
│       └── db/database.py             # SQLite/PostgreSQL connection engine
│
├── start_all.bat                      # One-click Windows launcher (Backend + Frontend)
├── start_backend.bat                  # Backend launcher
├── start_frontend.bat                 # Frontend launcher
├── Dockerfile                         # Container definition
├── docker-compose.yml                 # Multi-container orchestration
├── README.md                          # Full Architecture Documentation
└── life-pulse-fullstack.zip           # Complete project ZIP archive for download
```

---

## ⚡ Quick Start Guide

### Option 1: One-Click Windows Script
Double-click `start_all.bat` to launch both the FastAPI backend and React frontend concurrently.

### Option 2: Manual Terminal Execution

#### 1. Backend Server (FastAPI + WebSockets + ML)
```bash
cd backend
pip install -r requirements.txt
python -m app.ml.train_model
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
```
- **Backend API**: `http://localhost:5000`
- **Interactive Swagger Docs**: `http://localhost:5000/docs`
- **WebSocket Endpoint**: `ws://localhost:5000/ws/dispatches`

#### 2. Frontend App (React 18 + Vite)
```bash
cd frontend
npm install
npm run dev
```
- **Web Portal**: `http://localhost:3000`

### Option 3: Docker Compose
```bash
docker-compose up --build
```

---

## 🧠 Machine Learning Engine (Layer 04)
The platform integrates a custom **`RandomForestRegressor`** trained on 5 biological and operational parameters:
1. **Biological Compatibility**: AB/Rh antigen matrix compatibility score.
2. **Geographic Distance**: Real-time Haversine distance between donor and hospital.
3. **Urgency Priority**: Tiered weighting (Critical / Urgent / Routine).
4. **Transit Latency**: Estimated transit time vs organ ischemic/shelf-life limit.
5. **Donor Vitality Score**: Volunteer health and availability clearance.

**Output**: Returns exact match probability percentage (0–100%) and clinical risk tags (`LOW_RISK`, `MODERATE_RISK`, `HIGH_RISK`).

---

## 📥 Direct Download
Download the entire codebase directly via [`life-pulse-fullstack.zip`](file:///C:/Users/AGRIM%20DHYANI/.gemini/antigravity/scratch/life-pulse/life-pulse-fullstack.zip).
