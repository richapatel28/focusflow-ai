import React from 'react';

const BurnoutGauge = ({ risk }) => {
  const level = risk > 60 ? 'High' : risk > 30 ? 'Moderate' : 'Low';
  const color = risk > 60
    ? 'bg-red-500'
    : risk > 30
    ? 'bg-yellow-500'
    : 'bg-green-500';
  const textColor = risk > 60
    ? 'text-red-400'
    : risk > 30
    ? 'text-yellow-400'
    : 'text-green-400';
  const bgColor = risk > 60
    ? 'bg-red-900/20 border-red-800'
    : risk > 30
    ? 'bg-yellow-900/20 border-yellow-800'
    : 'bg-green-900/20 border-green-800';

  const message = risk > 60
    ? 'Take a longer break. You are showing signs of burnout.'
    : risk > 30
    ? 'Moderate risk. Make sure to take regular breaks.'
    : 'Great! Your work pattern is healthy.';

  return (
    <div className={`border rounded-xl p-5 ${bgColor}`}>
      <div className="flex justify-between items-center mb-2">
        <p className="text-gray-400 text-xs uppercase tracking-wide">
          Burnout Risk
        </p>
        <span className="text-gray-500 text-xs">Logistic Regression</span>
      </div>

      {/* Risk percentage */}
      <div className="flex items-end gap-2 mb-3">
        <span className={`text-5xl font-bold ${textColor}`}>
          {risk}%
        </span>
        <span className={`text-sm mb-1 font-medium ${textColor}`}>
          {level}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-800 rounded-full h-3 mb-3">
        <div
          className={`h-3 rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${Math.min(risk, 100)}%` }}
        />
      </div>

      {/* Risk zones */}
      <div className="flex justify-between text-xs text-gray-600 mb-3">
        <span>0% Low</span>
        <span>30% Moderate</span>
        <span>60% High</span>
      </div>

      {/* Message */}
      <p className={`text-xs ${textColor} opacity-80`}>
        {message}
      </p>
    </div>
  );
};

export default BurnoutGauge;
