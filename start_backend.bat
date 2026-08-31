@echo off
title Life Pulse Backend (FastAPI + WebSockets + Scikit-Learn)
echo Starting Life Pulse Backend Server...
cd backend
pip install -r requirements.txt
python -m app.ml.train_model
uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload
pause
