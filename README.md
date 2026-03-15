# FocusFlow AI 🧠

An intelligent productivity tracking system that uses 
4 Machine Learning models to monitor work patterns 
and prevent burnout in real-time.

## What it does
- Tracks keyboard, mouse, and tab activity silently
- Detects focus drift using Gradient Boosting ML model
- Predicts burnout risk from 7-day work patterns
- Forecasts task completion probability
- Sends real-time alerts via Socket.io

## Tech Stack
- Frontend: React.js + Tailwind CSS + Recharts
- Backend: Node.js + Express + Socket.io
- ML Service: Python + FastAPI + scikit-learn
- Database: MongoDB Atlas

## ML Models
| Model | Algorithm | Purpose |
|-------|-----------|---------|
| Productivity Classifier | Random Forest | Labels session productivity |
| Focus Drift Detector | Gradient Boosting | Real-time distraction detection |
| Burnout Predictor | Logistic Regression | 7-day burnout risk |
| Task Adherence | Decision Tree | Task completion prediction |

## Setup Instructions

### Prerequisites
- Node.js v16+
- Python 3.11+
- MongoDB Atlas account

### 1. Clone the repo
git clone https://github.com/YOUR_USERNAME/focusflow-ai.git
cd focusflow-ai

### 2. Backend
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
npm run dev

### 3. ML Service
cd ml
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows
source venv/bin/activate      # Mac/Linux
pip install fastapi uvicorn scikit-learn pandas numpy joblib python-multipart
python training/train_productivity.py
python training/train_focus_drift.py
python training/train_burnout.py
python training/train_adherence.py
uvicorn main:app --reload --port 8000

### 4. Frontend
cd frontend
npm install
cp .env.example .env
# Fill in your values in .env
npm start

### 5. Open browser
http://localhost:3000

## Screenshots
(Add screenshots of your dashboard here)

## Live Demo
(Add your deployed URL here after Day 7 deployment)

## Developer
Made by: Patel Richa
MCA Project — 2026
