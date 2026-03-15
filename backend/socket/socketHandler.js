let ioInstance;

const initSocket = (io) => {
  ioInstance = io;
  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    // User joins their personal room
    socket.on('join', (userId) => {
      socket.join(userId.toString());
      console.log(`User ${userId} joined socket room`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected:', socket.id);
    });
  });
};

const emitAlert = (userId, alertData) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit('focus-alert', alertData);
  }
};

const emitScoreUpdate = (userId, scoreData) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit('score-update', scoreData);
  }
};

const emitBurnoutWarning = (userId, burnoutData) => {
  if (ioInstance) {
    ioInstance.to(userId.toString()).emit('burnout-warning', burnoutData);
  }
};

module.exports = { initSocket, emitAlert, emitScoreUpdate, emitBurnoutWarning };