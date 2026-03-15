import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SessionProvider, useSession } from './context/SessionContext';
import ToastNotification from './components/ToastNotification';
import useSocket from './hooks/useSocket';

import Login           from './pages/Login';
import Register        from './pages/Register';
import Dashboard       from './pages/Dashboard';
import SchedulePlanner from './pages/SchedulePlanner';
import Session         from './pages/Session';
import Analytics       from './pages/Analytics';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-gray-950 text-gray-500">
      Loading...
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

// Socket connection only — no activity tracker here
const GlobalSocket = () => {
  useSocket();
  return null;
};

const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <SessionProvider>
      <GlobalSocket />
      <ToastNotification />
      <Routes>
        <Route path="/login"
          element={!user ? <Login /> : <Navigate to="/" />}
        />
        <Route path="/register"
          element={!user ? <Register /> : <Navigate to="/" />}
        />
        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />
        <Route path="/planner" element={
          <ProtectedRoute><SchedulePlanner /></ProtectedRoute>
        } />
        <Route path="/session" element={
          <ProtectedRoute><Session /></ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute><Analytics /></ProtectedRoute>
        } />
      </Routes>
    </SessionProvider>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;