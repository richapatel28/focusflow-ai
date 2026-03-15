import React from 'react';
import { useSession } from '../context/SessionContext';

const AlertPanel = () => {
  const { alerts, clearAlerts } = useSession();

  if (alerts.length === 0) {
    return (
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
        <h3 className="text-white font-medium text-sm mb-3">Live Alerts</h3>
        <p className="text-gray-500 text-xs text-center py-4">No alerts yet</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-white font-medium text-sm">Live Alerts</h3>
        <button onClick={clearAlerts} className="text-gray-500 hover:text-gray-300 text-xs">
          Clear
        </button>
      </div>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {alerts.map(alert => (
          <div
            key={alert.id}
            className={`rounded-lg px-3 py-2 text-xs border ${
              alert.type === 'burnout'
                ? 'bg-red-900/30 border-red-700 text-red-300'
                : alert.severity === 'high'
                ? 'bg-orange-900/30 border-orange-700 text-orange-300'
                : 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
            }`}
          >
            <div className="flex justify-between mb-1">
              <span className="font-medium capitalize">{alert.type} alert</span>
              <span className="text-gray-500">
                {new Date(alert.timestamp).toLocaleTimeString()}
              </span>
            </div>
            <p>{alert.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AlertPanel;