const Analytics = require('../models/Analytics');
const Session   = require('../models/Session');
const Task      = require('../models/Task');
const { generateDailyReport } = require('../services/reportService');

// GET /api/analytics/dashboard
const getDashboard = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Generate fresh report
    const analytics = await generateDailyReport(req.user.id, new Date());

    // Current active session
    const currentSession = await Session.findOne({
      userId: req.user.id,
      status: { $in: ['active', 'paused'] }
    });

    // Today's tasks
    const tasks = await Task.find({ userId: req.user.id });
    const taskStats = {
      total:     tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      pending:   tasks.filter(t => t.status === 'pending').length,
      skipped:   tasks.filter(t => t.status === 'skipped').length
    };

    res.json({ success: true, analytics, currentSession, taskStats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/analytics/weekly
const getWeekly = async (req, res) => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    let records = await Analytics.find({
      userId: req.user.id,
      date:   { $gte: sevenDaysAgo }
    }).sort({ date: 1 });

    // If no records — generate one now
    if (records.length === 0) {
      const report = await generateDailyReport(req.user.id, new Date());
      records = [report];
    }

    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/analytics/generate
const generateReport = async (req, res) => {
  try {
    console.log('Manual report generation triggered by:', req.user.id);
    const date   = req.body.date ? new Date(req.body.date) : new Date();
    const report = await generateDailyReport(req.user.id, date);
    res.json({ success: true, report });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getDashboard, getWeekly, generateReport };