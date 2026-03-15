import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import ScoreCard from '../components/ScoreCard';
import BurnoutGauge from '../components/BurnoutGauge';
import AlertPanel from '../components/AlertPanel';
import MLInsightsPanel from '../components/MLInsightsPanel';
import { useSession } from '../context/SessionContext';
import analyticsService from '../services/analyticsService';
import taskService from '../services/taskService';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer,
  Legend, BarChart, Bar, CartesianGrid
} from 'recharts';

const COLORS = ['#22c55e', '#3b82f6', '#ef4444', '#f59e0b'];

const Dashboard = () => {
  const { productivityScore, alerts, currentSession } = useSession();
  const [dashboard,  setDashboard]  = useState(null);
  const [weekly,     setWeekly]     = useState([]);
  const [tasks,      setTasks]      = useState([]);
  const [loading,    setLoading]    = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [dashRes, weekRes, taskRes] = await Promise.all([
          analyticsService.getDashboard(),
          analyticsService.getWeekly(),
          taskService.getToday()
        ]);
        setDashboard(dashRes.data);
        setWeekly(weekRes.data.records || []);
        setTasks(taskRes.data.tasks || []);
      } catch (err) {
        console.error('Dashboard fetch error:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Refresh dashboard every 2 minutes
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const dashRes = await analyticsService.getDashboard();
        setDashboard(dashRes.data);
      } catch (err) {
        console.error('Dashboard refresh error:', err.message);
      }
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">⏳</div>
            <p className="text-gray-400">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const analytics = dashboard?.analytics   || {};
  const taskStats = dashboard?.taskStats   || {};
  const session   = dashboard?.currentSession || currentSession;

  // Live score — use socket score if session active, else analytics score
  const liveScore = currentSession
    ? (productivityScore || analytics.productivityScore || 0)
    : (analytics.productivityScore || 0);

  // Task pie chart
  const taskPieData = [
    { name: 'Completed', value: taskStats.completed || 0 },
    { name: 'Pending',   value: taskStats.pending   || 0 },
    { name: 'Skipped',   value: taskStats.skipped   || 0 },
  ].filter(d => d.value > 0);

  // Weekly chart
  const weeklyChartData = weekly.map(r => ({
    day:          new Date(r.date).toLocaleDateString('en', { weekday: 'short' }),
    productivity: r.productivityScore        || 0,
    burnout:      r.burnoutRiskScore         || 0,
    adherence:    r.scheduleAdherencePercent || 0,
  }));

  // Today's schedule — sort by start time
  const todayTasks = tasks.sort((a, b) =>
    new Date(a.startTime) - new Date(b.startTime)
  );

  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-6 overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <p className="text-gray-500 text-sm mt-1">
              {new Date().toLocaleDateString('en', {
                weekday: 'long',
                year:    'numeric',
                month:   'long',
                day:     'numeric'
              })}
            </p>
          </div>
          {currentSession && (
            <div className="bg-green-900/30 border border-green-700 rounded-xl px-4 py-2">
              <p className="text-green-400 text-xs font-medium">
                🟢 Session Active
              </p>
              <p className="text-green-300 text-xs">
                ML tracking every 30s
              </p>
            </div>
          )}
        </div>

        {/* Score Cards Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ScoreCard
            label="Productivity Score"
            value={liveScore}
            subtitle={currentSession ? 'Live — updating' : 'Today average'}
          />
          <ScoreCard
            label="Active Hours"
            value={`${analytics.activeHours || 0}h`}
            subtitle="Today"
            color="text-blue-400"
          />
          <ScoreCard
            label="Tasks Completed"
            value={`${taskStats.completed || 0}/${taskStats.total || 0}`}
            subtitle="Today"
            color="text-green-400"
          />
          <ScoreCard
            label="Focus Drifts"
            value={analytics.focusDriftCount || 0}
            subtitle="Detected today"
            color={
              (analytics.focusDriftCount || 0) > 5
                ? 'text-red-400'
                : 'text-yellow-400'
            }
          />
        </div>

        {/* Row 2 — Weekly Chart + Burnout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Weekly Trend Chart */}
          <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-medium text-sm">
                7-Day Productivity Trend
              </h3>
              <span className="text-gray-500 text-xs">Last 7 days</span>
            </div>
            {weeklyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={weeklyChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis
                    dataKey="day"
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
                  <Bar
                    dataKey="productivity"
                    name="Productivity"
                    fill="#3b82f6"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="burnout"
                    name="Burnout Risk"
                    fill="#ef4444"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <p className="text-gray-500 text-sm mb-2">
                  No weekly data yet
                </p>
                <p className="text-gray-600 text-xs">
                  Complete sessions to see your 7-day trend
                </p>
              </div>
            )}
          </div>

          {/* Burnout Gauge */}
          <BurnoutGauge risk={analytics.burnoutRiskScore || 0} />
        </div>

        {/* Row 3 — Task Donut + ML Insights + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">

          {/* Task Completion Donut */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-white font-medium text-sm mb-4">
              Today's Tasks
            </h3>
            {taskPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie
                    data={taskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    dataKey="value"
                    paddingAngle={3}
                  >
                    {taskPieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i]} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={v => (
                      <span style={{ color: '#9ca3af', fontSize: 11 }}>
                        {v}
                      </span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      background:   '#111827',
                      border:       '1px solid #374151',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <p className="text-gray-500 text-sm mb-1">No tasks today</p>
                <p className="text-gray-600 text-xs">
                  Go to Planner to add tasks
                </p>
              </div>
            )}

            {/* Task stats summary */}
            <div className="mt-3 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-green-400">✓ Completed</span>
                <span className="text-green-400">{taskStats.completed || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-blue-400">◷ Pending</span>
                <span className="text-blue-400">{taskStats.pending || 0}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-400">✗ Skipped</span>
                <span className="text-red-400">{taskStats.skipped || 0}</span>
              </div>
            </div>
          </div>

          {/* ML Insights Panel */}
          <MLInsightsPanel
            productivity={{
              label:      analytics.productivityLabel || (liveScore > 70 ? 'Productive' : liveScore > 40 ? 'Moderate' : 'Distracted'),
              confidence: analytics.productivityConfidence || liveScore,
              score:      liveScore
            }}
            focusDrift={{
              drifting:    alerts.length > 0 && alerts[0]?.type === 'focus',
              probability: alerts.length > 0 && alerts[0]?.type === 'focus'
                ? parseFloat(alerts[0].message.match(/(\d+\.?\d*)%/)?.[1] || 0)
                : 0
            }}
            burnout={{
              risk_percent: analytics.burnoutRiskScore || 0,
              risk_level:
                (analytics.burnoutRiskScore || 0) > 60 ? 'High' :
                (analytics.burnoutRiskScore || 0) > 30 ? 'Moderate' : 'Low'
            }}
            adherence={{
              label:   analytics.scheduleAdherencePercent > 70 ? 'On-time' :
                       analytics.scheduleAdherencePercent > 40 ? 'Delayed' : 'Skipped',
              percent: analytics.scheduleAdherencePercent || 0
            }}
          />

          {/* Alert Panel */}
          <AlertPanel />
        </div>

        {/* Row 4 — Today's Schedule Timeline */}
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium text-sm">
              Today's Schedule
            </h3>
            
             <a href="/planner"
              className="text-blue-400 text-xs hover:underline"
            >
              Manage tasks →
            </a>
          </div>

          {todayTasks.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">
              No tasks scheduled for today.
              <a href="/planner" className="text-blue-400 ml-1 hover:underline">
                Add tasks →
              </a>
            </p>
          ) : (
            <div className="space-y-3">
              {todayTasks.map(task => (
                <div
                  key={task._id}
                  className={`flex items-center gap-4 p-3 rounded-lg border ${
                    task.status === 'completed'
                      ? 'border-green-800 bg-green-900/10'
                      : task.status === 'skipped'
                      ? 'border-red-800 bg-red-900/10'
                      : task.status === 'in_progress'
                      ? 'border-blue-700 bg-blue-900/20'
                      : 'border-gray-800 bg-gray-800/30'
                  }`}
                >
                  {/* Status icon */}
                  <span className="text-lg">
                    {task.status === 'completed'  ? '✅' :
                     task.status === 'skipped'    ? '❌' :
                     task.status === 'in_progress' ? '🔵' : '⬜'}
                  </span>

                  {/* Task info */}
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      task.status === 'completed'
                        ? 'text-gray-500 line-through'
                        : 'text-white'
                    }`}>
                      {task.title}
                    </p>
                    <p className="text-gray-500 text-xs">
                      {task.startTime
                        ? new Date(task.startTime).toLocaleTimeString([], {
                            hour:   '2-digit',
                            minute: '2-digit'
                          })
                        : '--'
                      }
                      {' → '}
                      {task.endTime
                        ? new Date(task.endTime).toLocaleTimeString([], {
                            hour:   '2-digit',
                            minute: '2-digit'
                          })
                        : '--'
                      }
                    </p>
                  </div>

                  {/* Priority badge */}
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.priority === 3
                      ? 'bg-red-900/50 text-red-400' :
                    task.priority === 2
                      ? 'bg-yellow-900/50 text-yellow-400' :
                      'bg-gray-800 text-gray-400'
                  }`}>
                    {task.priority === 3 ? 'High' :
                     task.priority === 2 ? 'Med'  : 'Low'}
                  </span>

                  {/* ML Adherence badge */}
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
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Dashboard;