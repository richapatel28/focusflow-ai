const Session = require('../models/Session');
const ActivityLog = require('../models/ActivityLog');
const { predictProductivity, predictBurnout } = require('../services/mlService');
const { emitScoreUpdate, emitBurnoutWarning } = require('../socket/socketHandler');

// POST /api/sessions/start
const startSession = async (req, res) => {
  try {
    // End any existing active session first
    await Session.updateMany(
      { userId: req.user.id, status: 'active' },
      { status: 'completed', endTime: new Date() }
    );

    const session = await Session.create({
      userId: req.user.id,
      taskId: req.body.taskId || null,
      status: 'active',
      startTime: new Date()
    });

    // Start 5-minute productivity scoring interval
    const intervalId = setInterval(async () => {
      try {
        const activeSession = await Session.findById(session._id);
        if (!activeSession || activeSession.status !== 'active') {
          clearInterval(intervalId);
          return;
        }

        // Get last 5 min of logs
        const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000);
        const recentLogs = await ActivityLog.find({
          sessionId: session._id,
          timestamp: { $gte: fiveMinAgo }
        });

        if (recentLogs.length === 0) return;

        const totalInterval = recentLogs.reduce((s, l) => s + l.intervalDurationMs, 0) / 1000 / 60 || 1;
        const keyboard = recentLogs.reduce((s, l) => s + l.keyboardCount, 0) / totalInterval;
        const idle = recentLogs.reduce((s, l) => s + l.idleDurationMs, 0);
        const totalTime = recentLogs.reduce((s, l) => s + l.intervalDurationMs, 0) || 1;
        const idlePercent = (idle / totalTime) * 100;
        const tabs = recentLogs.reduce((s, l) => s + l.tabSwitchCount, 0);

        const result = await predictProductivity({
          keyboard_per_min: keyboard,
          idle_percent: idlePercent,
          tab_switches: tabs,
          active_min: totalInterval
        });

        // Update session score
        await Session.findByIdAndUpdate(session._id, {
          productivityScore: result.score || 50
        });

        // Push to frontend via Socket.io
        emitScoreUpdate(req.user.id, {
          sessionId: session._id,
          label: result.label,
          score: result.score,
          confidence: result.confidence
        });
      } catch (err) {
        console.error('Score interval error:', err.message);
      }
    }, 5 * 60 * 1000); // every 5 minutes

    res.status(201).json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/sessions/:id/pause
const pauseSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'paused' },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/sessions/:id/resume
const resumeSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'active' },
      { new: true }
    );
    if (!session) return res.status(404).json({ error: 'Session not found' });
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/sessions/:id/end
const endSession = async (req, res) => {
  try {
    const session = await Session.findOne({ _id: req.params.id, userId: req.user.id });
    if (!session) return res.status(404).json({ error: 'Session not found' });

    // Compute totals from activity logs
    const logs = await ActivityLog.find({ sessionId: session._id });
    session.activeTimeMs = logs.reduce((s, l) => s + (l.intervalDurationMs - l.idleDurationMs), 0);
    session.idleTimeMs   = logs.reduce((s, l) => s + l.idleDurationMs, 0);
    session.endTime      = new Date();
    session.status       = 'completed';
    session.focusDriftEvents = logs.filter(l => l.mlPredictions?.focusDrifting).length;

    // Average productivity score
    const scores = logs.map(l => l.mlPredictions?.productivityScore).filter(Boolean);
    if (scores.length) {
      session.productivityScore = Math.round(scores.reduce((a, b) => a + b) / scores.length);
    }

    // Burnout prediction using 7-day data
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const weekSessions = await Session.find({
      userId: req.user.id,
      startTime: { $gte: sevenDaysAgo },
      status: 'completed'
    });

    const avgHours = weekSessions.length
      ? weekSessions.reduce((s, se) => s + (se.activeTimeMs || 0), 0) / 3600000 / weekSessions.length
      : 0;
    const breakFreq = weekSessions.length
      ? weekSessions.reduce((s, se) => s + (se.breakCount || 0), 0) / weekSessions.length
      : 0;
    const wScores = weekSessions.map(se => se.productivityScore || 50);
    const slope = wScores.length > 1
      ? (wScores[wScores.length - 1] - wScores[0]) / wScores.length : 0;
    const overtimeDays = weekSessions.filter(se => (se.activeTimeMs || 0) > 8 * 3600 * 1000).length;

    const burnoutResult = await predictBurnout({
      avg_daily_hours:    avgHours,
      break_frequency:    breakFreq,
      productivity_slope: slope,
      overtime_days:      overtimeDays
    });

    session.burnoutRiskScore = burnoutResult.risk_percent || 0;
    await session.save();

    // Emit burnout warning if high risk
    if (burnoutResult.risk_percent > 60) {
      emitBurnoutWarning(req.user.id, {
        ...burnoutResult,
        message: 'High burnout risk detected. Take a longer break before your next session.'
      });
    }

    res.json({ success: true, session, burnoutResult });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/sessions/current
const getCurrentSession = async (req, res) => {
  try {
    const session = await Session.findOne({
      userId: req.user.id,
      status: { $in: ['active', 'paused'] }
    }).populate('taskId', 'title priority');
    res.json({ success: true, session });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { startSession, pauseSession, resumeSession, endSession, getCurrentSession };