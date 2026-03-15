const Analytics    = require('../models/Analytics');
const Session      = require('../models/Session');
const Task         = require('../models/Task');
const ActivityLog  = require('../models/ActivityLog');

const generateDailyReport = async (userId, date) => {
  try {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Generating report for userId:', userId);

    // Get all completed sessions for this user
    const sessions = await Session.find({
      userId,
      status: 'completed'
    });
    console.log('Sessions found:', sessions.length);

    // Get all tasks for this user
    const tasks = await Task.find({ userId });
    console.log('Tasks found:', tasks.length);

    // Get all activity logs
    const logs = await ActivityLog.find({ userId });
    console.log('Logs found:', logs.length);

    // Calculate productivity score
    const avgProductivity = sessions.length
      ? Math.round(
          sessions.reduce((s, se) => s + (se.productivityScore || 0), 0)
          / sessions.length
        )
      : 0;

    // Calculate burnout risk
    const avgBurnout = sessions.length
      ? Math.round(
          sessions.reduce((s, se) => s + (se.burnoutRiskScore || 0), 0)
          / sessions.length
        )
      : 0;

    // Calculate active hours
    const totalActiveMs = sessions.reduce(
      (s, se) => s + (se.activeTimeMs || 0), 0
    );
    const activeHours = parseFloat(
      (totalActiveMs / 3600000).toFixed(2)
    );

    // Calculate task adherence
    const tasksCompleted = tasks.filter(
      t => t.status === 'completed'
    ).length;
    const tasksMissed = tasks.filter(
      t => t.status === 'skipped'
    ).length;
    const adherence = tasks.length
      ? Math.round((tasksCompleted / tasks.length) * 100)
      : 0;

    // Count focus drift events
    const focusDriftCount = logs.filter(
      l => l.mlPredictions?.focusDrifting
    ).length;

    // Generate AI recommendation
    let recommendation = 'Keep up the good work!';
    if (avgBurnout > 60) {
      recommendation = 'High burnout risk detected. Take longer breaks.';
    } else if (avgProductivity < 40) {
      recommendation = 'Low productivity. Try shorter focused sessions.';
    } else if (focusDriftCount > 5) {
      recommendation = 'Too many distractions. Minimize tab switching.';
    } else if (tasksCompleted === tasks.length && tasks.length > 0) {
      recommendation = 'Excellent! All tasks completed!';
    } else if (avgProductivity >= 70) {
      recommendation = 'Great productivity! Keep maintaining this rhythm.';
    }

    console.log('Report metrics:', {
      avgProductivity,
      avgBurnout,
      activeHours,
      adherence,
      focusDriftCount,
      tasksCompleted,
      tasksMissed
    });

    // Save to analytics collection
    const analytics = await Analytics.findOneAndUpdate(
      { userId, date: startOfDay },
      {
        userId,
        date:                     startOfDay,
        productivityScore:        avgProductivity,
        burnoutRiskScore:         avgBurnout,
        scheduleAdherencePercent: adherence,
        focusDriftCount,
        activeHours,
        totalSessions:            sessions.length,
        tasksCompleted,
        tasksMissed,
        mlInsights: {
          recommendation,
          burnoutWarning: avgBurnout > 60
        }
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    console.log('Analytics document saved successfully');
    return analytics;
  } catch (err) {
    console.error('Report generation error:', err.message);
    throw err;
  }
};

module.exports = { generateDailyReport };