const Task = require('../models/Task');
const { predictAdherence } = require('../services/mlService');

// GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.id }).sort({ startTime: 1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/tasks/today
const getTodayTasks = async (req, res) => {
  try {
    const start = new Date(); start.setHours(0, 0, 0, 0);
    const end   = new Date(); end.setHours(23, 59, 59, 999);
    const tasks = await Task.find({
      userId: req.user.id,
      startTime: { $gte: start, $lte: end }
    }).sort({ startTime: 1 });
    res.json({ success: true, tasks });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, description, startTime, endTime, priority } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });

    const task = await Task.create({
      userId: req.user.id,
      title, description, startTime, endTime,
      priority: priority || 2
    });

    // Get adherence prediction for new task
    try {
      const allTasks = await Task.find({ userId: req.user.id, status: 'pending' });
      const adherence = await predictAdherence({
        priority: task.priority,
        time_allocated: endTime && startTime
          ? (new Date(endTime) - new Date(startTime)) / 60000 : 60,
        historical_rate: 0.7,
        tasks_pending: allTasks.length
      });
      task.adherencePrediction = {
        label: adherence.label,
        probability: adherence.probabilities?.[adherence.label] || 0
      };
      await task.save();
    } catch (mlErr) {
      console.error('Adherence prediction failed:', mlErr.message);
    }

    res.status(201).json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/tasks/:id/complete
const completeTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'completed', completedAt: new Date() },
      { new: true }
    );
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, task });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!task) return res.status(404).json({ error: 'Task not found' });
    res.json({ success: true, message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getTasks, getTodayTasks, createTask, updateTask, completeTask, deleteTask };