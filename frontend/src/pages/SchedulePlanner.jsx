import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import taskService from '../services/taskService';

const PRIORITY_LABELS = { 1: 'Low', 2: 'Medium', 3: 'High' };
const PRIORITY_COLORS = { 1: 'text-gray-400', 2: 'text-yellow-400', 3: 'text-red-400' };

const SchedulePlanner = () => {
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [form,    setForm]    = useState({
    title: '', description: '', startTime: '', endTime: '', priority: 2
  });
  const [error,   setError]   = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      const res = await taskService.getAll();
      setTasks(res.data.tasks || []);
    } catch (err) {
      console.error('Fetch tasks error:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await taskService.create(form);
      setForm({ title: '', description: '', startTime: '', endTime: '', priority: 2 });
      fetchTasks();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id) => {
    try {
      await taskService.complete(id);
      fetchTasks();
    } catch (err) {
      console.error('Complete task error:', err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await taskService.delete(id);
      fetchTasks();
    } catch (err) {
      console.error('Delete task error:', err.message);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Schedule Planner</h2>
          <p className="text-gray-500 text-sm mt-1">Plan and manage your daily tasks</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Add Task Form */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-medium text-sm mb-4">Add New Task</h3>

            {error && (
              <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-3 py-2 mb-4 text-xs">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Task title *"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                required
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              />
              <textarea
                placeholder="Description (optional)"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">Start Time</label>
                  <input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={e => setForm({ ...form, startTime: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-gray-500 text-xs mb-1 block">End Time</label>
                  <input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={e => setForm({ ...form, endTime: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
              <select
                value={form.priority}
                onChange={e => setForm({ ...form, priority: parseInt(e.target.value) })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
              >
                <option value={1}>Low Priority</option>
                <option value={2}>Medium Priority</option>
                <option value={3}>High Priority</option>
              </select>
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 rounded-lg transition disabled:opacity-50 flex items-center justify-center gap-2">
                    {submitting ? (
                    <>
                    <span className="animate-spin">⏳</span>
                      Adding...
                    </>
                  ) : (
                    'Add Task'
                  )}
                </button>
            </form>
          </div>

          {/* Task List */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-medium text-sm mb-4">
              All Tasks ({tasks.length})
            </h3>

            {loading ? (
              <p className="text-gray-500 text-sm">Loading tasks...</p>
            ) : tasks.length === 0 ? (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                <p className="text-gray-500 text-sm">No tasks yet. Add your first task!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tasks.map(task => (
                  <div key={task._id} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`text-sm font-medium ${
                            task.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'
                          }`}>
                            {task.title}
                          </h4>
                          <span className={`text-xs ${PRIORITY_COLORS[task.priority]}`}>
                            {PRIORITY_LABELS[task.priority]}
                          </span>
                        </div>
                        {task.description && (
                          <p className="text-gray-500 text-xs mb-2">{task.description}</p>
                        )}
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          {task.startTime && (
                            <span>Start: {new Date(task.startTime).toLocaleTimeString()}</span>
                          )}
                          {task.endTime && (
                            <span>End: {new Date(task.endTime).toLocaleTimeString()}</span>
                          )}
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            task.status === 'completed' ? 'bg-green-900/50 text-green-400' :
                            task.status === 'in_progress' ? 'bg-blue-900/50 text-blue-400' :
                            'bg-gray-800 text-gray-400'
                          }`}>
                            {task.status}
                          </span>
                        </div>
                        {/* ML Adherence Prediction */}
                        {task.adherencePrediction?.label && (
                          <div className="mt-2">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              task.adherencePrediction.label === 'On-time' ? 'bg-green-900/50 text-green-400' :
                              task.adherencePrediction.label === 'Delayed'  ? 'bg-yellow-900/50 text-yellow-400' :
                              'bg-red-900/50 text-red-400'
                            }`}>
                              ML: {task.adherencePrediction.label}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 ml-4">
                        {task.status !== 'completed' && (
                          <button
                            onClick={() => handleComplete(task._id)}
                            className="text-xs bg-green-900/50 hover:bg-green-900 text-green-400 px-3 py-1 rounded-lg transition"
                          >
                            Done
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-xs bg-red-900/50 hover:bg-red-900 text-red-400 px-3 py-1 rounded-lg transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePlanner;