import React, { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';

const ToastNotification = () => {
  const { alerts } = useSession();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState(null);

  useEffect(() => {
    if (alerts.length === 0) return;
    const latest = alerts[0];
    setCurrent(latest);
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [alerts]);

  if (!visible || !current) return null;

  const isBurnout = current.type === 'burnout';
  const isHigh    = current.severity === 'high';

  return (
    <div style={{
      position:  'fixed',
      top:       '20px',
      right:     '20px',
      zIndex:    9999,
      minWidth:  '320px',
      maxWidth:  '400px',
      animation: 'slideIn 0.3s ease'
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <div className={`rounded-xl border p-4 shadow-2xl ${
        isBurnout
          ? 'bg-red-950 border-red-700'
          : isHigh
          ? 'bg-orange-950 border-orange-700'
          : 'bg-yellow-950 border-yellow-700'
      }`}>

        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {isBurnout ? '🔥' : '⚠️'}
            </span>
            <span className={`font-semibold text-sm ${
              isBurnout
                ? 'text-red-300'
                : isHigh
                ? 'text-orange-300'
                : 'text-yellow-300'
            }`}>
              {isBurnout ? 'Burnout Warning!' : 'Focus Drift Detected!'}
            </span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-500 hover:text-gray-300 text-xl leading-none ml-4"
          >
            ×
          </button>
        </div>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-3">
          {current.message}
        </p>

        {/* Recommendation */}
        <div className={`rounded-lg px-3 py-2 text-xs ${
          isBurnout
            ? 'bg-red-900/50 text-red-300'
            : 'bg-orange-900/50 text-orange-300'
        }`}>
          {isBurnout
            ? '💤 Take a 30-minute break or stop working for today'
            : '☕ Take a 2-minute break — stretch or drink water'
          }
        </div>

        {/* Timestamp */}
        <p className="text-gray-600 text-xs mt-2 text-right">
          {new Date(current.timestamp).toLocaleTimeString()}
        </p>

      </div>
    </div>
  );
};

export default ToastNotification;