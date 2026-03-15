# FocusFlow AI — Frontend

React.js frontend for FocusFlow AI productivity tracking system.

## Tech Stack
- React.js 18 — UI framework
- Tailwind CSS v3 — Styling
- Recharts — Data visualization charts
- Socket.io Client — Real-time alerts
- Axios — HTTP requests to backend
- React Router v6 — Client-side routing

## Folder Structure
```
src/
├── components/
│   ├── Sidebar.jsx          — Navigation sidebar with live timer
│   ├── AlertPanel.jsx       — Real-time ML alert display
│   ├── ScoreCard.jsx        — Productivity score card
│   ├── BurnoutGauge.jsx     — Burnout risk progress bar
│   ├── MLInsightsPanel.jsx  — All 4 ML model outputs
│   └── ToastNotification.jsx — Popup alerts on any page
├── pages/
│   ├── Dashboard.jsx        — Main productivity hub
│   ├── Login.jsx            — User login
│   ├── Register.jsx         — User registration
│   ├── SchedulePlanner.jsx  — Task management
│   ├── Session.jsx          — Work session tracker
│   └── Analytics.jsx        — 7-day analytics reports
├── hooks/
│   ├── useActivityTracker.js — Browser activity tracking
│   └── useSocket.js          — Socket.io real-time connection
├── context/
│   ├── AuthContext.js        — JWT authentication state
│   └── SessionContext.js     — Session timer and alerts state
├── services/
│   ├── authService.js        — Auth API calls
│   ├── taskService.js        — Task CRUD API calls
│   ├── sessionService.js     — Session API calls
│   ├── activityService.js    — Activity logging
│   └── analyticsService.js  — Analytics API calls
└── utils/
    ├── axiosInstance.js      — Axios with JWT interceptor
    └── helpers.js            — Utility functions
```

## Setup and Run

### 1. Install dependencies
```bash
npm install
```

### 2. Create .env file
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 3. Start development server
```bash
npm start
```

App runs at http://localhost:3000

## Key Features

### Activity Tracking
The app silently tracks browser activity every 30 seconds:
- Keyboard events (keydown listener)
- Mouse movements (mousemove listener)
- Tab switches (visibilitychange listener)
- Idle time (10 second timeout)

Data is batched and sent to backend automatically.

### Real-time Alerts
Socket.io maintains a persistent WebSocket connection.
When ML models detect focus drift or burnout risk,
alerts appear instantly as toast notifications on any page.

### ML Insights Panel
Shows live output from all 4 ML models:
- Productivity Classifier (Random Forest)
- Focus Drift Detector (Gradient Boosting)
- Burnout Predictor (Logistic Regression)
- Task Adherence Predictor (Decision Tree)

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Dashboard | / | Main hub with scores, charts, ML insights |
| Planner | /planner | Create and manage daily tasks |
| Session | /session | Start work session with live tracking |
| Analytics | /analytics | 7-day productivity reports |

## How Activity Tracking Works
```
User starts session
       ↓
Browser binds keyboard, mouse, tab events
       ↓
Every 30 seconds → batch sent to Node.js backend
       ↓
Backend calls FastAPI ML service
       ↓
ML model returns prediction
       ↓
If drift detected → Socket.io fires alert
       ↓
Toast notification appears on screen
```

## Socket Events

| Event | Direction | Description |
|-------|-----------|-------------|
| join | Client → Server | User joins personal room |
| focus-alert | Server → Client | Focus drift detected |
| score-update | Server → Client | Productivity score updated |
| burnout-warning | Server → Client | High burnout risk detected |

## Environment Variables

| Variable | Description |
|----------|-------------|
| REACT_APP_API_URL | Backend server URL |
| REACT_APP_SOCKET_URL | Socket.io server URL |

## Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| react | 18.x | UI framework |
| react-router-dom | 6.x | Client routing |
| axios | 1.x | HTTP client |
| recharts | latest | Charts |
| socket.io-client | 4.x | WebSocket |
| tailwindcss | 3.x | Styling |