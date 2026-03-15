🚀 FocusFlow AI
FocusFlow AI is a full‑stack productivity monitoring system that analyzes user work patterns using Machine Learning.
It tracks browser activity, detects focus drift, predicts burnout risk, and displays insights on a real‑time dashboard.

✨ Key Features

Real‑time productivity monitoring

Browser activity tracking (keyboard, mouse, tabs)

Focus drift detection with live alerts

Burnout risk prediction

Daily task scheduling

Interactive analytics dashboard

Weekly productivity insights

🛠 Tech Stack

Frontend
React.js

Tailwind CSS

Recharts

Socket.io Client

Axios

React Router

Backend
Node.js

Express.js

MongoDB Atlas

Mongoose

JWT Authentication

bcryptjs

Machine Learning Service
Python

FastAPI

scikit‑learn

pandas

numpy

joblib

Database
MongoDB Atlas (Cloud Database)

📦 Project Structure
focusflow-ai
│
├── backend
│   ├── config
│   ├── controllers
│   ├── models
│   ├── routes
│   ├── middleware
│   ├── services
│   ├── socket
│   ├── jobs
│   └── server.js
│
├── frontend
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── context
│   │   └── services
│
├── ml
│   ├── training
│   ├── models
│   ├── schemas
│   └── main.py
│
├── .gitignore
└── README.md

⚙️ Installation Guide
1️⃣ Clone Repository
git clone https://github.com/YOUR_USERNAME/focusflow-ai.git
cd focusflow-ai

🖥 Backend Setup
cd backend
npm install
npm run dev

Backend runs on:
http://localhost:5000

🧠 ML Service Setup

cd ml
python -m venv venv
.\venv\Scripts\Activate
pip install fastapi uvicorn scikit-learn pandas numpy joblib
uvicorn main:app --reload --port 8000
ML service runs on:
http://localhost:8000

🌐 Frontend Setup
cd frontend
npm install
npm start
Frontend runs on:
http://localhost:3000

🔌 API Overview
Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Tasks
GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
DELETE /api/tasks/:id
Sessions
POST /api/sessions/start
PUT  /api/sessions/:id/end
Analytics
GET /api/analytics/dashboard
GET /api/analytics/weekly
🧠 System Workflow
1️⃣ User registers and logs in
2️⃣ User creates tasks in schedule planner
3️⃣ Work session starts and browser activity tracking begins
4️⃣ Activity data is sent to backend periodically
5️⃣ Backend sends data to ML service for predictions
6️⃣ Dashboard displays productivity insights and alerts

🗄 Database Collections
MongoDB automatically creates these collections:

users
tasks
sessions
activitylogs
analytics
▶ Running the Full Application
Run all three services:

Backend  → http://localhost:5000
ML API   → http://localhost:8000
Frontend → http://localhost:3000
🔮 Future Improvements
Browser extension for activity tracking

Mobile dashboard

Personalized productivity insights

AI‑based habit recommendations
