const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  timestamp:          { type: Date, default: Date.now },
  keyboardCount:      { type: Number, default: 0 },
  mouseCount:         { type: Number, default: 0 },
  tabSwitchCount:     { type: Number, default: 0 },
  idleDurationMs:     { type: Number, default: 0 },
  intervalDurationMs: { type: Number, default: 30000 },
  mlPredictions: {
    productivityLabel:  { type: String,  default: null },
    productivityScore:  { type: Number,  default: null },
    focusDrifting:      { type: Boolean, default: false },
    focusProbability:   { type: Number,  default: 0 }
  }
}, { timestamps: true });

module.exports = mongoose.model('ActivityLog', ActivityLogSchema);