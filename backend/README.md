# FocusFlow AI — Backend

Node.js + Express REST API server for FocusFlow AI.

## Tech Stack
- Node.js + Express.js — REST API server
- MongoDB + Mongoose — Database
- JWT + bcryptjs — Authentication
- Socket.io — Real-time alerts
- Axios — Calls ML service
- node-cron — Nightly report generation

## How to Run

### 1. Install dependencies
npm install

### 2. Create .env file
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
ML_SERVICE_URL=http://localhost:8000
CLIENT_URL=http://localhost:3000
NODE_ENV=development

### 3. Start server
npm run dev

Server runs on http://localhost:5000

## Folder Structure
- config/        MongoDB connection
- controllers/   Business logic for each feature
- models/        Mongoose database schemas
- routes/        Express API routes
- middleware/     JWT auth + error handling
- services/      ML service caller + report generator
- socket/        Socket.io real-time handler
- jobs/          Nightly cron job

## API Endpoints
- POST /api/auth/register     Register new user
- POST /api/auth/login        Login user
- GET  /api/auth/me           Get current user
- GET  /api/tasks             Get all tasks
- POST /api/tasks             Create task
- PUT  /api/tasks/:id         Update task
- DELETE /api/tasks/:id       Delete task
- POST /api/sessions/start    Start work session
- PUT  /api/sessions/:id/end  End work session
- POST /api/activity/log      Log browser activity
- GET  /api/analytics/dashboard  Get dashboard data
- GET  /api/analytics/weekly     Get 7-day trend

## Socket Events
- focus-alert      Fired when focus drift probability > 70%
- score-update     Fired every 5 minutes with productivity score
- burnout-warning  Fired when burnout risk > 60%