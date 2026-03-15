const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: { type: String, default: '' },
  startTime: { type: Date },
  endTime: { type: Date },
  priority: {
    type: Number,
    enum: [1, 2, 3],  // 1=Low 2=Medium 3=High
    default: 2
  },
  status: {
    type: String,
    enum: ['pending', 'in_progress', 'completed', 'skipped', 'delayed'],
    default: 'pending'
  },
  adherencePrediction: {
    label: { type: String },          // On-time / Delayed / Skipped
    probability: { type: Number }     // confidence %
  },
  completedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Task', TaskSchema);