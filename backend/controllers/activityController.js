const ActivityLog = require('../models/ActivityLog');
const { predictFocusDrift } = require('../services/mlService');
const { emitAlert } = require('../socket/socketHandler');

// POST /api/activity/log
const logActivity = async (req, res) => {
  try {
    const {
      sessionId,
      keyboardCount,
      mouseCount,
      tabSwitchCount,
      idleDurationMs
    } = req.body;

    const userId = req.user.id;

    if (!sessionId) {
      return res.status(400).json({ error: 'sessionId is required' });
    }

    // Save activity log
    const log = await ActivityLog.create({
      sessionId,
      userId,
      keyboardCount:  keyboardCount  || 0,
      mouseCount:     mouseCount     || 0,
      tabSwitchCount: tabSwitchCount || 0,
      idleDurationMs: idleDurationMs || 0
    });

    // Get last 10 logs for feature calculation
    const recentLogs = await ActivityLog.find({ sessionId })
      .sort({ timestamp: -1 })
      .limit(10);

    // Calculate features
    const totalMs  = recentLogs.reduce((s, l) => s + l.intervalDurationMs, 0);
    const totalMin = totalMs / 1000 / 60 || 0.5; // default 0.5 min

    // Tab switch rate per minute
    const totalTabs = recentLogs.reduce((s, l) => s + l.tabSwitchCount, 0);
    const tabRate   = totalTabs / totalMin;

    // Idle bursts — logs with more than 10 seconds idle
    const idleBursts = recentLogs.filter(l => l.idleDurationMs > 10000).length;

    // Typing variance
    const kbCounts = recentLogs.map(l => l.keyboardCount);
    const kbMean   = kbCounts.reduce((a, b) => a + b, 0) / (kbCounts.length || 1);
    const typingVar = kbCounts.reduce((s, v) =>
      s + Math.pow(v - kbMean, 2), 0
    ) / (kbCounts.length || 1);

    // Mouse erratic score
    const mouseErratic = mouseCount > 0
      ? Math.min(tabSwitchCount / (mouseCount + 1), 1)
      : tabSwitchCount > 5 ? 0.8 : 0.2;

    console.log('ML Features:', {
      tabRate,
      idleBursts,
      typingVar,
      mouseErratic,
      tabSwitchCount
    });

    // Direct drift detection based on tab switches
    // If more than 5 tab switches in one batch = definitely drifting
    let focusResult;

    if (tabSwitchCount >= 5) {
      // High tab switches — call ML but also force drift if very high
      focusResult = await predictFocusDrift({
        tab_switch_rate: Math.max(tabRate, tabSwitchCount * 2),
        idle_bursts:     idleBursts,
        typing_variance: typingVar,
        mouse_erratic:   Math.max(mouseErratic, 0.7)
      });

      // If ML says not drifting but tabs are very high — override
      if (!focusResult.drifting && tabSwitchCount >= 8) {
        focusResult = {
          drifting:    true,
          probability: Math.min(60 + tabSwitchCount * 3, 99)
        };
      }
    } else {
      focusResult = await predictFocusDrift({
        tab_switch_rate: tabRate,
        idle_bursts:     idleBursts,
        typing_variance: typingVar,
        mouse_erratic:   mouseErratic
      });
    }

    console.log('Focus result:', focusResult);

    // Save ML predictions to log
    log.mlPredictions = {
      focusDrifting:    focusResult.drifting,
      focusProbability: focusResult.probability
    };
    await log.save();

    // Emit alert if drifting
    if (focusResult.drifting) {
      const prob = focusResult.probability;
      let message;
      if (prob >= 90) {
        message = `High distraction detected (${prob}%). Take a 5-minute break now.`;
      } else if (prob >= 80) {
        message = `Focus drifting detected — ${prob}% probability. Try a 2-minute break.`;
      } else {
        message = `Mild focus drift detected (${prob}%). Try to refocus on your task.`;
      }

      console.log('Emitting focus alert to user:', userId, message);

      emitAlert(userId, {
        type:      'focus',
        severity:  prob > 85 ? 'high' : 'medium',
        message,
        timestamp: new Date()
      });
    }

    res.json({ success: true, log, focusResult });
  } catch (error) {
    console.error('Activity log error:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { logActivity };
