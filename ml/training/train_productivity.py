import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

print("Training Productivity Classifier...")

np.random.seed(42)
N = 1500

# Generate synthetic training data
keyboard  = np.random.randint(0, 120, N).astype(float)
idle      = np.random.randint(0, 100, N).astype(float)
tabs      = np.random.randint(0, 30,  N).astype(float)
active    = np.random.randint(5, 120,  N).astype(float)

# Label rules with noise
labels = []
for i in range(N):
    idle_n = idle[i] + np.random.normal(0, 5)
    tabs_n = tabs[i] + np.random.normal(0, 2)
    if idle_n > 55 or tabs_n > 15:
        labels.append(2)   # Distracted
    elif idle_n > 30 or tabs_n > 7:
        labels.append(1)   # Moderate
    else:
        labels.append(0)   # Productive

df = pd.DataFrame({
    'keyboard_per_min': keyboard,
    'idle_percent':     idle,
    'tab_switches':     tabs,
    'active_min':       active,
    'label':            labels
})

X = df[['keyboard_per_min', 'idle_percent', 'tab_switches', 'active_min']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Random Forest
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=10,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
print("\nClassification Report:")
print(classification_report(
    y_test,
    model.predict(X_test),
    target_names=['Productive', 'Moderate', 'Distracted']
))

# Save model
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/productivity_classifier.pkl')
print("Saved: models/productivity_classifier.pkl")