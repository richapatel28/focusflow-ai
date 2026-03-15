import pandas as pd
import numpy as np
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, roc_auc_score
from sklearn.preprocessing import StandardScaler
import joblib
import os

print("Training Burnout Predictor...")

np.random.seed(42)
N = 2000

# Generate synthetic data
daily_hrs   = np.random.uniform(4,  14, N)
break_freq  = np.random.uniform(0,  8,  N)
prod_slope  = np.random.uniform(-5, 2,  N)
overtime_d  = np.random.randint(0,  7,  N)

# Label rules
labels = []
for i in range(N):
    risk = (
        (daily_hrs[i]  / 14) * 0.35 +
        ((8 - break_freq[i]) / 8) * 0.25 +
        ((-prod_slope[i]) / 5) * 0.25 +
        (overtime_d[i] / 7) * 0.15
    )
    risk += np.random.normal(0, 0.04)
    labels.append(1 if risk > 0.55 else 0)  # 1=High Risk 0=Low Risk

df = pd.DataFrame({
    'avg_daily_hours':    daily_hrs,
    'break_frequency':    break_freq,
    'productivity_slope': prod_slope,
    'overtime_days':      overtime_d,
    'label':              labels
})

X = df[['avg_daily_hours', 'break_frequency', 'productivity_slope', 'overtime_days']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Scale features — required for Logistic Regression
scaler = StandardScaler()
X_train_s = scaler.fit_transform(X_train)
X_test_s  = scaler.transform(X_test)

# Train Logistic Regression
model = LogisticRegression(max_iter=1000, random_state=42)
model.fit(X_train_s, y_train)

# Evaluate
print("\nClassification Report:")
print(classification_report(
    y_test,
    model.predict(X_test_s),
    target_names=['Low Risk', 'High Risk']
))
print("AUC-ROC:", round(
    roc_auc_score(y_test, model.predict_proba(X_test_s)[:, 1]), 3
))

# Save model AND scaler together
os.makedirs('models', exist_ok=True)
joblib.dump(
    {'model': model, 'scaler': scaler},
    'models/burnout_predictor.pkl'
)
print("Saved: models/burnout_predictor.pkl")