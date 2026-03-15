import { useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { useSession } from '../context/SessionContext';

// Single socket instance shared across entire app
let socket = null;
let isInitialized = false;

const useSocket = () => {
  const { user } = useAuth();
  const { addAlert, setProductivityScore } = useSession();

  useEffect(() => {
    if (!user || isInitialized) return;
    isInitialized = true;

    socket = io(
      process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000',
      {
        transports:        ['websocket'],
        reconnection:      true,
        reconnectionDelay: 3000,
      }
    );

    socket.on('connect', () => {
      socket.emit('join', user.id);
    });

    socket.on('focus-alert', (data) => {
      addAlert({
        id:        Date.now(),
        type:      'focus',
        severity:  data.severity,
        message:   data.message,
        timestamp: new Date()
      });
    });

    socket.on('score-update', (data) => {
      setProductivityScore(data.score || 0);
    });

    socket.on('burnout-warning', (data) => {
      addAlert({
        id:        Date.now(),
        type:      'burnout',
        severity:  'high',
        message:   data.message,
        timestamp: new Date()
      });
    });

    return () => {
      // Don't disconnect on unmount — keep connection alive
    };
  }, [user]);

  return socket;
};

export default useSocket;