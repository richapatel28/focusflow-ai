import React from 'react';
import { useSession } from '../context/SessionContext';

const ScoreCard = ({ label, value, subtitle, color }) => {
  const getColor = () => {
    if (color) return color;
    if (value >= 70) return 'text-green-400';
    if (value >= 40) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <p className="text-gray-500 text-xs uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-4xl font-bold ${getColor()}`}>{value}</p>
      {subtitle && <p className="text-gray-500 text-xs mt-1">{subtitle}</p>}
    </div>
  );
};

export default ScoreCard;