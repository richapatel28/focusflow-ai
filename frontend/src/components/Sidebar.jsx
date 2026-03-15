import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const location = useLocation();
  const { running, seconds, formatTime, currentSession } = useSession();

  const links = [
    { path: '/',          label: 'Dashboard',  icon: '📊' },
    { path: '/planner',   label: 'Planner',    icon: '📅' },
    { path: '/session',   label: 'Session',    icon: '⏱️' },
    { path: '/analytics', label: 'Analytics',  icon: '📈' },
  ];

  return (
    <div className="w-64 min-h-screen bg-gray-900 border-r border-gray-800 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-800">
        <h1 className="text-xl font-bold text-white">
          FocusFlow <span className="text-blue-500">AI</span>
        </h1>
        <p className="text-gray-500 text-xs mt-1">Productivity Tracker</p>
      </div>

      {/* User */}
      <div className="px-6 py-4 border-b border-gray-800">
        <p className="text-white text-sm font-medium">{user?.name}</p>
        <p className="text-gray-500 text-xs">{user?.email}</p>
      </div>

      {/* Live Session Timer — shows on all pages when session active */}
      {currentSession && (
        <div className={`mx-4 mt-4 rounded-xl p-3 border ${
          running
            ? 'bg-green-900/30 border-green-700'
            : 'bg-yellow-900/30 border-yellow-700'
        }`}>
          <p className="text-xs text-gray-400 mb-1">
            {running ? '🟢 Session Active' : '🟡 Session Paused'}
          </p>
          <p className="text-2xl font-mono font-bold text-white">
            {formatTime(seconds)}
          </p>
          <Link
            to="/session"
            className="text-xs text-blue-400 hover:underline mt-1 block"
          >
            Go to session →
          </Link>
        </div>
      )}

      {/* Nav Links */}
      <nav className="flex-1 px-4 py-4 space-y-1">
        {links.map(link => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition ${
              location.pathname === link.path
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:bg-gray-800 hover:text-white'
            }`}
          >
            <span>{link.icon}</span>
            <span>{link.label}</span>
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <button
          onClick={logout}
          className="w-full text-gray-400 hover:text-red-400 text-sm py-2 transition"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;