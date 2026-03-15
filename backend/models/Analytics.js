const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  date: { type: Date, required: true },
  productivityScore:        { type: Number, default: 0 },
  burnoutRiskScore:         { type: Number, default: 0 },
  scheduleAdherencePercent: { type: Number, default: 0 },
  focusDriftCount:          { type: Number, default: 0 },
  activeHours:              { type: Number, default: 0 },
  totalSessions:            { type: Number, default: 0 },
  tasksCompleted:           { type: Number, default: 0 },
  tasksMissed:              { type: Number, default: 0 },
  mlInsights: {
    recommendation: { type: String, default: '' },
    burnoutWarning:  { type: Boolean, default: false }
  }
}, { timestamps: true });

module.exports = mongoose.model('Analytics', AnalyticsSchema);