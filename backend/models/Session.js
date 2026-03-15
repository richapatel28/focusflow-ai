const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  startTime: { type: Date, default: Date.now },
  endTime:   { type: Date, default: null },
  activeTimeMs: { type: Number, default: 0 },
  idleTimeMs:   { type: Number, default: 0 },
  productivityScore: { type: Number, default: 0 },
  focusDriftEvents:  { type: Number, default: 0 },
  burnoutRiskScore:  { type: Number, default: 0 },
  breakCount:        { type: Number, default: 0 },
  status: {
    type: String,
    enum: ['active', 'paused', 'completed'],
    default: 'active'
  }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);