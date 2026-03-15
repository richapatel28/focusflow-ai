import pandas as pd
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

print("Training Task Adherence Predictor...")

np.random.seed(42)
N = 2000

# Generate synthetic data
priority     = np.random.randint(1, 4,   N).astype(float)
allocated    = np.random.randint(15, 180, N).astype(float)
hist_rate    = np.random.uniform(0, 1,    N)
tasks_pending= np.random.randint(0, 10,  N).astype(float)

# Label rules
labels = []
for i in range(N):
    score = (
        hist_rate[i]          * 0.5 +
        (priority[i] / 3)     * 0.3 -
        (tasks_pending[i]/10) * 0.2
    )
    score += np.random.normal(0, 0.07)
    if score > 0.65:
        labels.append(0)   # On-time
    elif score > 0.35:
        labels.append(1)   # Delayed
    else:
        labels.append(2)   # Skipped

df = pd.DataFrame({
    'priority':       priority,
    'time_allocated': allocated,
    'historical_rate':hist_rate,
    'tasks_pending':  tasks_pending,
    'label':          labels
})

X = df[['priority', 'time_allocated', 'historical_rate', 'tasks_pending']]
y = df['label']

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train Decision Tree
model = DecisionTreeClassifier(
    max_depth=8,
    min_samples_split=20,
    random_state=42
)
model.fit(X_train, y_train)

# Evaluate
print("\nClassification Report:")
print(classification_report(
    y_test,
    model.predict(X_test),
    target_names=['On-time', 'Delayed', 'Skipped']
))

# Save
os.makedirs('models', exist_ok=True)
joblib.dump(model, 'models/task_adherence_predictor.pkl')
print("Saved: models/task_adherence_predictor.pkl")