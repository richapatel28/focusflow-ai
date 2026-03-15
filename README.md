🚀 FocusFlow AI

FocusFlow AI is a full‑stack productivity monitoring system that analyzes user work patterns using Machine Learning.
The system tracks browser activity, detects focus drift, predicts burnout risk, and provides real‑time productivity insights through an interactive dashboard.

✨ Features
📊 Real‑time productivity monitoring
🧠 Machine learning‑based behavior analysis
⚡ Live alerts for focus drift using Socket.io
📅 Daily task scheduling and tracking
📈 Interactive productivity dashboard
🔮 Burnout risk prediction
📉 Weekly analytics reports

🛠 Tech Stack
Frontend
React.js
Tailwind CSS
Recharts
Socket.io Client
Axios

Backend
Node.js
Express.js
MongoDB Atlas
Mongoose
JWT Authentication
bcryptjs

ML Service
Python
FastAPI
scikit‑learn
pandas
numpy

📂 Project Structure
focusflow-ai
│
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   └── services
│
├── ml
│   ├── training
│   ├── models
│   └── main.py
│
└── README.md

⚙️ Installation
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/focusflow-ai.git
cd focusflow-ai
Backend Setup
cd backend
npm install
npm run dev
Runs on:
http://localhost:5000

ML Service Setup
cd ml
python -m venv venv
.\venv\Scripts\Activate
pip install fastapi uvicorn scikit-learn pandas numpy joblib
uvicorn main:app --reload --port 8000
Runs on:
http://localhost:8000

Frontend Setup
cd frontend
npm install
npm start
Runs on:
http://localhost:3000

📡 API Overview
Auth
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Tasks
GET /api/tasks
POST /api/tasks
PUT /api/tasks/:id
DELETE /api/tasks/:id
Sessions
POST /api/sessions/start
PUT /api/sessions/:id/end
Analytics
GET /api/analytics/dashboard
GET /api/analytics/weekly

🧠 How It Works
User logs in and creates tasks.
Work session begins and browser activity is tracked.
Activity data is sent to the backend periodically.
Backend sends data to the ML service.
ML models analyze productivity, focus drift, and burnout risk.
Results appear on the dashboard with real‑time alerts.

🗄 Database Collections
users
tasks
sessions
activitylogs
analytics

▶ Run Full Application
Start all three services:
Backend  → localhost:5000
ML API   → localhost:8000
Frontend → localhost:3000

📌 Future Improvements
Browser extension for activity tracking
Mobile dashboard
Personalized productivity recommendations

AI‑based habit coaching

