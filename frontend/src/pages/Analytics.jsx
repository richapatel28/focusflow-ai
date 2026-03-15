import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import analyticsService from '../services/analyticsService';
import taskService from '../services/taskService';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  LineChart, Line, Legend
} from 'recharts';

const Analytics = () => {
  const [weekly,  setWeekly]  = useState([]);
  const [tasks,   setTasks]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekRes, taskRes] = await Promise.all([
          analyticsService.getWeekly(),
          taskService.getAll()
        ]);
        setWeekly(weekRes.data.records || []);
        setTasks(taskRes.data.tasks    || []);
      } catch (err) {
        console.error('Analytics fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleGenerateReport = async () => {
  try {
    setLoading(true);
    await analyticsService.generate();
    const weekRes = await analyticsService.getWeekly();
    setWeekly(weekRes.data.records || []);
    alert('Report generated successfully!');
  } catch (err) {
    console.error('Generate report error:', err.message);
    alert('Error generating report: ' + err.message);
  } finally {
    setLoading(false);
  }
};

  // Chart data
  const chartData = weekly.map(r => ({
    date:        new Date(r.date).toLocaleDateString('en', {
      weekday: 'short',
      month:   'short',
      day:     'numeric'
    }),
    productivity: r.productivityScore        || 0,
    burnout:      r.burnoutRiskScore         || 0,
    adherence:    r.scheduleAdherencePercent || 0,
    hours:        parseFloat((r.activeHours  || 0).toFixed(1)),
    drifts:       r.focusDriftCount          || 0,
  }));

  // Task stats
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const skippedTasks   = tasks.filter(t => t.status === 'skipped').length;
  const pendingTasks   = tasks.filter(t => t.status === 'pending').length;
  const totalTasks     = tasks.length;
  const adherenceRate  = totalTasks > 0
    ? Math.round((completedTasks / totalTasks) * 100)
    : 0;

  // Weekly averages
  const avgProductivity = weekly.length
    ? Math.round(weekly.reduce((s, r) => s + (r.productivityScore || 0), 0) / weekly.length)
    : 0;
  const avgBurnout = weekly.length
    ? Math.round(weekly.reduce((s, r) => s + (r.burnoutRiskScore || 0), 0) / weekly.length)
    : 0;
  const totalDrifts = weekly.reduce((s, r) => s + (r.focusDriftCount || 0), 0);
  const totalHours  = parseFloat(
    weekly.reduce((s, r) => s + (r.activeHours || 0), 0).toFixed(1)
  );

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <p className="text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Analytics</h2>
            <p className="text-gray-500 text-sm mt-1">
              Your 7-day productivity report
            </p>
          </div>
          <button
            onClick={handleGenerateReport}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 py-2 rounded-lg transition"
          >
            Generate Report
          </button>
        </div>

        {weekly.length === 0 ? (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">📊</p>
            <p className="text-gray-400 text-lg mb-2">
              No analytics data yet
            </p>
            <p className="text-gray-500 text-sm mb-6">
              Complete work sessions to see your 7-day trends here
            </p>
            
              <a href="/session"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm transition"
            >
              Start a Session
            </a>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                  Avg Productivity
                </p>
                <p className={`text-3xl font-bold ${
                  avgProductivity >= 70 ? 'text-green-400' :
                  avgProductivity >= 40 ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {avgProductivity}%
                </p>
                <p className="text-gray-600 text-xs mt-1">7-day average</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                  Avg Burnout Risk
                </p>
                <p className={`text-3xl font-bold ${
                  avgBurnout > 60 ? 'text-red-400' :
                  avgBurnout > 30 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {avgBurnout}%
                </p>
                <p className="text-gray-600 text-xs mt-1">7-day average</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                  Total Active Hours
                </p>
                <p className="text-3xl font-bold text-blue-400">
                  {totalHours}h
                </p>
                <p className="text-gray-600 text-xs mt-1">This week</p>
              </div>

              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">
                  Focus Drift Events
                </p>
                <p className={`text-3xl font-bold ${
                  totalDrifts > 20 ? 'text-red-400' :
                  totalDrifts > 10 ? 'text-yellow-400' :
                  'text-green-400'
                }`}>
                  {totalDrifts}
                </p>
                <p className="text-gray-600 text-xs mt-1">This week</p>
              </div>

            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
              {['overview', 'productivity', 'burnout', 'tasks'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm capitalize transition ${
                    activeTab === tab
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-900 text-gray-400 hover:bg-gray-800'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-6">

                {/* Productivity + Burnout combined chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Productivity vs Burnout Risk — 7 Days
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background:   '#111827',
                          border:       '1px solid #374151',
                          borderRadius: '8px'
                        }}
                        labelStyle={{ color: '#fff' }}
                      />
                      <Legend
                        formatter={v => (
                          <span style={{ color: '#9ca3af', fontSize: 11 }}>
                            {v}
                          </span>
                        )}
                      />
                      <Line
                        type="monotone"
                        dataKey="productivity"
                        name="Productivity %"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        dot={{ fill: '#3b82f6', r: 4 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="burnout"
                        name="Burnout Risk %"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Active hours chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Active Hours Per Day
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background:   '#111827',
                          border:       '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar
                        dataKey="hours"
                        name="Active Hours"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

              </div>
            )}

            {/* Productivity Tab */}
            {activeTab === 'productivity' && (
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Daily Productivity Score
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background:   '#111827',
                          border:       '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar
                        dataKey="productivity"
                        name="Productivity %"
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* Focus drift chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Focus Drift Events Per Day
                  </h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <Tooltip
                        contentStyle={{
                          background:   '#111827',
                          border:       '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar
                        dataKey="drifts"
                        name="Focus Drifts"
                        fill="#f59e0b"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Burnout Tab */}
            {activeTab === 'burnout' && (
              <div className="space-y-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Burnout Risk Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background:   '#111827',
                          border:       '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="burnout"
                        name="Burnout Risk %"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ fill: '#ef4444', r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>

                {/* Burnout tips */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Burnout Prevention Tips
                  </h3>
                  <div className="space-y-3">
                    {[
                      { tip: 'Take a 5-minute break every 25 minutes (Pomodoro)', icon: '⏱️' },
                      { tip: 'Avoid working more than 8 hours continuously',       icon: '🛑' },
                      { tip: 'Stay hydrated and take screen breaks',               icon: '💧' },
                      { tip: 'End your day at a consistent time',                  icon: '🌙' },
                      { tip: 'Focus on one task at a time — avoid multitasking',   icon: '🎯' },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg"
                      >
                        <span className="text-lg">{item.icon}</span>
                        <span className="text-gray-300 text-sm">{item.tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tasks Tab */}
            {activeTab === 'tasks' && (
              <div className="space-y-6">

                {/* Task summary cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-white mb-1">
                      {totalTasks}
                    </p>
                    <p className="text-gray-500 text-xs">Total Tasks</p>
                  </div>
                  <div className="bg-gray-900 border border-green-800 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-green-400 mb-1">
                      {completedTasks}
                    </p>
                    <p className="text-gray-500 text-xs">Completed</p>
                  </div>
                  <div className="bg-gray-900 border border-red-800 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-red-400 mb-1">
                      {skippedTasks}
                    </p>
                    <p className="text-gray-500 text-xs">Skipped</p>
                  </div>
                  <div className="bg-gray-900 border border-blue-800 rounded-xl p-4 text-center">
                    <p className="text-3xl font-bold text-blue-400 mb-1">
                      {adherenceRate}%
                    </p>
                    <p className="text-gray-500 text-xs">Adherence Rate</p>
                  </div>
                </div>

                {/* Schedule adherence chart */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    Schedule Adherence — 7 Days
                  </h3>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={chartData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#1f2937"
                      />
                      <XAxis
                        dataKey="date"
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#6b7280"
                        tick={{ fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip
                        contentStyle={{
                          background:   '#111827',
                          border:       '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar
                        dataKey="adherence"
                        name="Adherence %"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>

                {/* All tasks list */}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                  <h3 className="text-white font-medium text-sm mb-4">
                    All Tasks
                  </h3>
                  {tasks.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-4">
                      No tasks yet
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {tasks.map(task => (
                        <div
                          key={task._id}
                          className="flex items-center justify-between p-3 bg-gray-800 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <span>
                              {task.status === 'completed' ? '✅' :
                               task.status === 'skipped'   ? '❌' :
                               task.status === 'in_progress' ? '🔵' : '⬜'}
                            </span>
                            <div>
                              <p className={`text-sm ${
                                task.status === 'completed'
                                  ? 'text-gray-500 line-through'
                                  : 'text-white'
                              }`}>
                                {task.title}
                              </p>
                              <p className="text-gray-600 text-xs">
                                Priority: {
                                  task.priority === 3 ? 'High' :
                                  task.priority === 2 ? 'Medium' : 'Low'
                                }
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.adherencePrediction?.label && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                task.adherencePrediction.label === 'On-time'
                                  ? 'bg-green-900/50 text-green-400' :
                                task.adherencePrediction.label === 'Delayed'
                                  ? 'bg-yellow-900/50 text-yellow-400' :
                                  'bg-red-900/50 text-red-400'
                              }`}>
                                ML: {task.adherencePrediction.label}
                              </span>
                            )}
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              task.status === 'completed'
                                ? 'bg-green-900/50 text-green-400' :
                              task.status === 'skipped'
                                ? 'bg-red-900/50 text-red-400' :
                                'bg-gray-700 text-gray-400'
                            }`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* Daily Report Table — always visible */}
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 mt-6">
              <h3 className="text-white font-medium text-sm mb-4">
                Daily Report Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-gray-500 text-xs border-b border-gray-800">
                      <th className="text-left py-3 pr-4">Date</th>
                      <th className="text-left py-3 pr-4">Productivity</th>
                      <th className="text-left py-3 pr-4">Burnout Risk</th>
                      <th className="text-left py-3 pr-4">Adherence</th>
                      <th className="text-left py-3 pr-4">Active Hours</th>
                      <th className="text-left py-3 pr-4">Drift Events</th>
                      <th className="text-left py-3">Recommendation</th>
                    </tr>
                  </thead>
                  <tbody>
                    {weekly.map((r, i) => (
                      <tr
                        key={i}
                        className="border-b border-gray-800 text-gray-300 text-xs hover:bg-gray-800/50"
                      >
                        <td className="py-3 pr-4 font-medium">
                          {new Date(r.date).toLocaleDateString('en', {
                            weekday: 'short',
                            month:   'short',
                            day:     'numeric'
                          })}
                        </td>
                        <td className={`py-3 pr-4 font-medium ${
                          r.productivityScore >= 70 ? 'text-green-400' :
                          r.productivityScore >= 40 ? 'text-yellow-400' :
                          'text-red-400'
                        }`}>
                          {r.productivityScore || 0}%
                        </td>
                        <td className={`py-3 pr-4 font-medium ${
                          r.burnoutRiskScore > 60 ? 'text-red-400' :
                          r.burnoutRiskScore > 30 ? 'text-yellow-400' :
                          'text-green-400'
                        }`}>
                          {r.burnoutRiskScore || 0}%
                        </td>
                        <td className="py-3 pr-4">
                          {r.scheduleAdherencePercent || 0}%
                        </td>
                        <td className="py-3 pr-4">
                          {r.activeHours || 0}h
                        </td>
                        <td className={`py-3 pr-4 ${
                          r.focusDriftCount > 5
                            ? 'text-red-400'
                            : 'text-gray-400'
                        }`}>
                          {r.focusDriftCount || 0}
                        </td>
                        <td className="py-3 text-gray-500 max-w-xs">
                          {r.mlInsights?.recommendation ||
                            'Complete more sessions for insights'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;
