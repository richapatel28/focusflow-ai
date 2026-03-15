
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const mongoose  = require('mongoose');
const connectDB = require('./config/db');
const { initSocket } = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

// Connect Database
connectDB();
mongoose.set('returnDocument', 'after');

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/tasks',     require('./routes/taskRoutes'));
app.use('/api/sessions',  require('./routes/sessionRoutes'));
app.use('/api/activity',  require('./routes/activityRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));

// Health check
app.get('/', (req, res) => res.json({ status: 'FocusFlow API running' }));

// Socket
initSocket(io);
app.set('io', io);

// Error handler
app.use(require('./middleware/errorHandler'));

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));