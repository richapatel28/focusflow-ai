import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import AlertPanel from '../components/AlertPanel';
import sessionService from '../services/sessionService';
import taskService from '../services/taskService';
import { useSession } from '../context/SessionContext';
import axiosInstance from '../utils/axiosInstance';

const Session = () => {
  const [tasks,        setTasks]        = useState([]);
  const [selectedTask, setSelectedTask] = useState('');
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState('');

  const {
    currentSession,
    setCurrentSession,
    setIsTracking,
    productivityScore,
    seconds,
    running,
    setRunning,
    setSeconds,
    formatTime,
    resetSession
  } = useSession();

  // Activity tracker — runs when session is active
useEffect(() => {
  if (!currentSession?._id) {
    return;
  }

  let keyboardCount  = 0;
  let mouseCount     = 0;
  let tabSwitchCount = 0;
  let idleDuration   = 0;
  let idleStart      = null;
  let idleTimer      = null;

  const resetIdle = () => {
    if (idleStart) {
      idleDuration += Date.now() - idleStart;
      idleStart = null;
    }
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      idleStart = Date.now();
    }, 10000);
  };

  const onKey   = () => { keyboardCount++;  resetIdle(); };
  const onMouse = () => { mouseCount++;     resetIdle(); };
  const onTab   = () => {
    if (document.hidden) {
      tabSwitchCount++;
    }
    resetIdle();
  };

  document.addEventListener('keydown',          onKey);
  document.addEventListener('mousemove',        onMouse);
  document.addEventListener('visibilitychange', onTab);

  // Send every 30 seconds
  const interval = setInterval(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/activity/log', {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId:      currentSession._id,
          keyboardCount,
          mouseCount,
          tabSwitchCount,
          idleDurationMs: Math.round(idleDuration)
        })
      });
      const data = await res.json();

      // Reset counters
      keyboardCount  = 0;
      mouseCount     = 0;
      tabSwitchCount = 0;
      idleDuration   = 0;
    } catch (err) {
      console.error('Activity log error:', err.message);
    }
  }, 30000);

  resetIdle();

  return () => {
    console.log('Tracker stopped');
    document.removeEventListener('keydown',          onKey);
    document.removeEventListener('mousemove',        onMouse);
    document.removeEventListener('visibilitychange', onTab);
    clearInterval(interval);
    clearTimeout(idleTimer);
  };
}, [currentSession?._id]);


  // Fetch tasks and check for existing active session
  useEffect(() => {
    const init = async () => {
      try {
        // Get tasks
        const taskRes = await taskService.getAll();
        setTasks(taskRes.data.tasks?.filter(t => t.status !== 'completed') || []);

        // Check if session already active
        const sesRes = await sessionService.current();
        if (sesRes.data.session) {
          setCurrentSession(sesRes.data.session);
          setIsTracking(true);
          setRunning(true);
        }
      } catch (err) {
        console.error('Init error:', err.message);
      }
    };
    init();
  }, []);

  const handleStart = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await sessionService.start(selectedTask || null);
      const newSession = res.data.session;

      // SET in context — this is what GlobalTracker watches
      setCurrentSession(newSession);
      setIsTracking(true);
      setRunning(true);
      setSeconds(0);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to start session');
    } finally {
      setLoading(false);
    }
  };

  const handlePause = async () => {
    try {
      await sessionService.pause(currentSession._id);
      setRunning(false);
      setIsTracking(false);
    } catch (err) {
      console.error('Pause error:', err.message);
    }
  };

  const handleResume = async () => {
    try {
      await sessionService.resume(currentSession._id);
      setRunning(true);
      setIsTracking(true);
    } catch (err) {
      console.error('Resume error:', err.message);
    }
  };

  const handleEnd = async () => {
    if (!currentSession) return;
    setLoading(true);
    try {
      const res = await sessionService.end(currentSession._id);
      const burnout = res.data.burnoutResult;
      resetSession();
      alert(`Session ended!\nBurnout Risk: ${burnout?.risk_level} (${burnout?.risk_percent}%)`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to end session');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-950">
      <Sidebar />
      <div className="flex-1 p-6">

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white">Work Session</h2>
          <p className="text-gray-500 text-sm mt-1">
            Track your focus and productivity in real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Session Control */}
          <div className="lg:col-span-2">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">

              {/* Timer */}
              <div className="mb-6">
                <p className="text-8xl font-mono font-bold text-white mb-2">
                  {formatTime(seconds)}
                </p>
                <p className="text-gray-500 text-sm">
                  {currentSession
                    ? running ? '🟢 Session Active' : '🟡 Session Paused'
                    : '⚪ No Active Session'
                  }
                </p>
              </div> 

              {/* Live Productivity Score */}
              {currentSession && (
                <div className="mb-6">
                  <p className="text-gray-500 text-xs mb-1">
                    Live Productivity Score
                  </p>
                  <p className={`text-5xl font-bold ${
                    productivityScore >= 70 ? 'text-green-400' :
                    productivityScore >= 40 ? 'text-yellow-400' :
                    'text-red-400'
                  }`}>
                    {productivityScore}
                  </p>
                </div>
              )}

              {error && (
                <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-lg px-4 py-2 mb-4 text-sm">
                  {error}
                </div>
              )}

              {/* Task selector — only when no session */}
              {!currentSession && (
                <div className="mb-6">
                  <select
                    value={selectedTask}
                    onChange={e => setSelectedTask(e.target.value)}
                    className="w-full max-w-xs bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
                  >
                    <option value="">Select a task (optional)</option>
                    {tasks.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Control Buttons */}
              <div className="flex justify-center gap-4 flex-wrap">
                {!currentSession ? (
                  <button
                    onClick={handleStart}
                    disabled={loading}
                    className="bg-green-600 hover:bg-green-700 text-white font-semibold px-10 py-3 rounded-xl transition disabled:opacity-50 text-lg"
                  >
                    {loading ? 'Starting...' : '▶ Start Session'}
                  </button>
                ) : (
                  <>
                    {running ? (
                      <button
                        onClick={handlePause}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                      >
                        ⏸ Pause
                      </button>
                    ) : (
                      <button
                        onClick={handleResume}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-xl transition"
                      >
                        ▶ Resume
                      </button>
                    )}
                    <button
                      onClick={handleEnd}
                      disabled={loading}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-xl transition disabled:opacity-50"
                    >
                      {loading ? 'Ending...' : '⏹ End Session'}
                    </button>
                  </>
                )}
              </div>

              {currentSession && (
                <p className="text-gray-700 text-xs mt-4">
                  Activity tracked every 30s automatically
                </p>
              )}

            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            <AlertPanel />
            {currentSession && (
              <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <h3 className="text-white font-medium text-sm mb-3">
                  Session Info
                </h3>
                <div className="space-y-2 text-xs text-gray-400">
                  <div className="flex justify-between">
                    <span>Status</span>
                    <span className={running ? 'text-green-400' : 'text-yellow-400'}>
                      {running ? 'Active' : 'Paused'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Started</span>
                    <span>
                      {new Date(currentSession.startTime).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Auto tracking</span>
                    <span className="text-green-400">Every 30s</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ML Service</span>
                    <span className="text-blue-400">Connected</span>
                  </div>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default Session;
