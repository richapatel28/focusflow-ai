import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const SessionContext = createContext();

export const SessionProvider = ({ children }) => {
  const [currentSession,     setCurrentSession]     = useState(null);
  const [alerts,             setAlerts]             = useState([]);
  const [productivityScore,  setProductivityScore]  = useState(0);
  const [isTracking,         setIsTracking]         = useState(false);
  const [seconds,            setSeconds]            = useState(0);
  const [running,            setRunning]            = useState(false);
  const intervalRef = useRef(null);

  // Timer lives in context — persists across page navigation
  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setSeconds(s => s + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [running]);

  const addAlert = (alert) => {
    setAlerts(prev => [alert, ...prev].slice(0, 10));
  };

  const clearAlerts = () => setAlerts([]);

  const resetSession = () => {
    setCurrentSession(null);
    setIsTracking(false);
    setRunning(false);
    setSeconds(0);
    setProductivityScore(0);
  };

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  return (
    <SessionContext.Provider value={{
      currentSession,  setCurrentSession,
      alerts,          addAlert,          clearAlerts,
      productivityScore, setProductivityScore,
      isTracking,      setIsTracking,
      seconds,         setSeconds,
      running,         setRunning,
      formatTime,
      resetSession
    }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => useContext(SessionContext);