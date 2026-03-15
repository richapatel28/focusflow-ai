from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import numpy as np
import os

app = FastAPI(title="FocusFlow ML Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

# ── Load all models on startup ──────────────────────────
BASE = os.path.dirname(os.path.abspath(__file__))

prod_model    = joblib.load(os.path.join(BASE, 'models/productivity_classifier.pkl'))
focus_model   = joblib.load(os.path.join(BASE, 'models/focus_drift_detector.pkl'))
burnout_bundle= joblib.load(os.path.join(BASE, 'models/burnout_predictor.pkl'))
adhere_model  = joblib.load(os.path.join(BASE, 'models/task_adherence_predictor.pkl'))

burnout_model  = burnout_bundle['model']
burnout_scaler = burnout_bundle['scaler']

print("All 4 models loaded successfully!")

# ── Pydantic schemas ────────────────────────────────────
class ProductivityInput(BaseModel):
    keyboard_per_min: float
    idle_percent:     float
    tab_switches:     float
    active_min:       float

class FocusInput(BaseModel):
    tab_switch_rate: float
    idle_bursts:     float
    typing_variance: float
    mouse_erratic:   float

class BurnoutInput(BaseModel):
    avg_daily_hours:    float
    break_frequency:    float
    productivity_slope: float
    overtime_days:      float

class AdherenceInput(BaseModel):
    priority:         float
    time_allocated:   float
    historical_rate:  float
    tasks_pending:    float

# ── Endpoints ───────────────────────────────────────────
@app.get("/health")
def health():
    return {
        "status": "ok",
        "message": "FocusFlow ML Service running",
        "models_loaded": 4
    }

@app.post("/predict/productivity")
def predict_productivity(d: ProductivityInput):
    X = [[d.keyboard_per_min, d.idle_percent, d.tab_switches, d.active_min]]
    label_idx = int(prod_model.predict(X)[0])
    proba     = prod_model.predict_proba(X)[0]
    labels    = ['Productive', 'Moderate', 'Distracted']
    score     = max(0, min(100, round((1 - label_idx / 2) * 100)))
    return {
        "label":      labels[label_idx],
        "confidence": round(float(proba.max()) * 100, 1),
        "score":      score
    }

@app.post("/predict/focus-drift")
def predict_focus_drift(d: FocusInput):
    X     = [[d.tab_switch_rate, d.idle_bursts, d.typing_variance, d.mouse_erratic]]
    proba = float(focus_model.predict_proba(X)[0][1])
    return {
        "drifting":    proba > 0.7,
        "probability": round(proba * 100, 1)
    }

@app.post("/predict/burnout")
def predict_burnout(d: BurnoutInput):
    X   = [[d.avg_daily_hours, d.break_frequency, d.productivity_slope, d.overtime_days]]
    X_s = burnout_scaler.transform(X)
    proba = float(burnout_model.predict_proba(X_s)[0][1])
    risk  = round(proba * 100, 1)
    level = 'High' if risk > 60 else 'Moderate' if risk > 30 else 'Low'
    return {
        "risk_percent": risk,
        "risk_level":   level
    }

@app.post("/predict/adherence")
def predict_adherence(d: AdherenceInput):
    X         = [[d.priority, d.time_allocated, d.historical_rate, d.tasks_pending]]
    label_idx = int(adhere_model.predict(X)[0])
    probas    = adhere_model.predict_proba(X)[0].tolist()
    labels    = ['On-time', 'Delayed', 'Skipped']
    return {
        "label": labels[label_idx],
        "probabilities": {
            l: round(p * 100, 1)
            for l, p in zip(labels, probas)
        }
    }