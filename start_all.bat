@echo off
title Life Pulse — 5-Tier Full Stack Launcher
echo =========================================================================
echo   LIFE PULSE — EMERGENCY CARE & VERIFIED DONOR NETWORK
echo   React 18 (Vite) + FastAPI (Python 3.11) + Scikit-Learn ML + WebSockets
echo =========================================================================
echo.

echo [1/2] Launching Python FastAPI Backend Server on port 5000...
start cmd /k "cd backend && pip install -r requirements.txt && python -m app.ml.train_model && uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"

echo [2/2] Launching React Vite Frontend Application on port 3000...
start cmd /k "cd frontend && npm install && npm run dev"

echo.
echo =========================================================================
echo   Both services are launching:
echo   - Frontend:  http://localhost:3000
echo   - Backend:   http://localhost:5000/docs (FastAPI Swagger UI)
echo   - WebSocket: ws://localhost:5000/ws/dispatches
echo =========================================================================
echo.
pause
