import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

print("Training Focus Drift Detector...")

np.random.seed(42)
N = 1500

# Generate synthetic data
tab_rate   = np.random.uniform(0, 5,   N)
idle_bursts= np.random.randint(0, 10,  N)
typing_var = np.random.uniform(0, 500, N)
mouse_err  = np.random.uniform(0, 1,   N)

# Label rules
labels = []
for i in range(N):
    score = (
        (tab_rate[i]    / 5)   * 0.4 +
        (idle_bursts[i] / 10)  * 0.3 +
        (typing_var[i]  / 500) * 0.2 +
        mouse_err[i]           * 0.1
    )
    score += np.random.normal(0, 0.05)
    labels.append(1 if score > 0.5 else 0)  # 1=Drifting 0=Focused

df = pd.DataFrame({
    'tab_switch_rate': tab_rate,
    'idle_bursts':     idle_bursts,
    'typing_variance': typing_var,
    'mouse_erratic':   mouse_err,
    'label':           labels
})

X = df[['tab_switch_rate', 'idle_bursts', 'typing_variance', 'mouse_erratic']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Gradient Boosting
model = GradientBoostingClassifier(
    n_estimators=100,
    learning_rate=0.1,
    max_depth=4,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
print("\nClassification Report:")
print(classification_report(
    y_test,
    model.predict(X_test),
    target_names=['Focused', 'Drifting']
))

# Save
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/focus_drift_detector.pkl')
print("Saved: models/focus_drift_detector.pkl")