# FocusFlow AI — ML Service

Python FastAPI microservice with 4 trained machine learning models.

## Tech Stack
- Python 3.11
- FastAPI + Uvicorn — API server
- scikit-learn — ML models
- pandas + numpy — Data processing
- joblib — Model serialization

## How to Run

### 1. Activate virtual environment
Windows:
.\venv\Scripts\Activate.ps1

Mac/Linux:
source venv/bin/activate

### 2. Install dependencies
pip install fastapi uvicorn scikit-learn pandas numpy joblib python-multipart

### 3. Train all models (run once)
python training/train_productivity.py
python training/train_focus_drift.py
python training/train_burnout.py
python training/train_adherence.py

### 4. Start FastAPI server
uvicorn main:app --reload --port 8000

Server runs on http://localhost:8000
Swagger UI at http://localhost:8000/docs

## The 4 ML Models

### 1. Productivity Classifier
- Algorithm: Random Forest
- Purpose: Classifies each 5-minute work window as
  Productive / Moderate / Distracted
- Input: keyboard rate, idle %, tab switches, active minutes
- Output: label + confidence score (0-100)
- Fires: Every 5 minutes during a session

### 2. Focus Drift Detector
- Algorithm: Gradient Boosting
- Purpose: Detects early signs of distraction in real-time
  and triggers a live browser alert
- Input: tab switch rate, idle bursts, typing variance,
  mouse erratic score
- Output: drifting true/false + probability %
- Fires: Every 30 seconds during a session

### 3. Burnout Predictor
- Algorithm: Logistic Regression
- Purpose: Predicts burnout risk based on 7-day
  work patterns
- Input: avg daily hours, break frequency,
  productivity slope, overtime days
- Output: risk % (0-100) + Low/Moderate/High level
- Fires: Every session end

### 4. Task Adherence Predictor
- Algorithm: Decision Tree
- Purpose: Predicts whether a task will be completed
  On-time, Delayed, or Skipped
- Input: priority, time allocated, historical rate,
  tasks pending
- Output: label + probabilities for each class
- Fires: When a task is created or fetched

## API Endpoints
- GET  /health                  Health check
- POST /predict/productivity    Productivity prediction
- POST /predict/focus-drift     Focus drift detection
- POST /predict/burnout         Burnout risk prediction
- POST /predict/adherence       Task adherence prediction

## How Models Are Connected to Backend
1. Node.js receives activity data from browser
2. Node.js calls FastAPI via HTTP using axios
3. FastAPI loads .pkl model and runs prediction
4. FastAPI returns JSON result to Node.js
5. Node.js stores result in MongoDB
6. Node.js emits Socket.io alert if needed