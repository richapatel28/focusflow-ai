import React from 'react';

const MLInsightsPanel = ({ productivity, focusDrift, burnout, adherence }) => {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
      <h3 className="text-white font-medium text-sm mb-4">
        🤖 ML Insights
      </h3>

      <div className="space-y-4">

        {/* Model 1 — Productivity */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 text-xs">
              Productivity Classifier
            </span>
            <span className="text-gray-600 text-xs">Random Forest</span>
          </div>
          <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${
            productivity?.label === 'Productive'
              ? 'bg-green-900/30'
              : productivity?.label === 'Moderate'
              ? 'bg-yellow-900/30'
              : 'bg-red-900/30'
          }`}>
            <span className={`text-sm font-medium ${
              productivity?.label === 'Productive'
                ? 'text-green-400'
                : productivity?.label === 'Moderate'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {productivity?.label || 'No data'}
            </span>
            <span className="text-gray-400 text-xs">
              Score: {productivity?.score || 0}
            </span>
          </div>
        </div>

        {/* Model 2 — Focus Drift */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 text-xs">
              Focus Drift Detector
            </span>
            <span className="text-gray-600 text-xs">Gradient Boosting</span>
          </div>
          <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${
            focusDrift?.drifting
              ? 'bg-orange-900/30'
              : 'bg-blue-900/20'
          }`}>
            <span className={`text-sm font-medium ${
              focusDrift?.drifting
                ? 'text-orange-400'
                : 'text-blue-400'
            }`}>
              {focusDrift?.drifting ? '⚠️ Drifting' : '✓ Focused'}
            </span>
            {focusDrift?.probability > 0 && (
              <span className="text-gray-400 text-xs">
                {focusDrift.probability}%
              </span>
            )}
          </div>
        </div>

        {/* Model 3 — Burnout */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 text-xs">
              Burnout Predictor
            </span>
            <span className="text-gray-600 text-xs">Logistic Regression</span>
          </div>
          <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${
            burnout?.risk_level === 'High'
              ? 'bg-red-900/30'
              : burnout?.risk_level === 'Moderate'
              ? 'bg-yellow-900/30'
              : 'bg-green-900/20'
          }`}>
            <span className={`text-sm font-medium ${
              burnout?.risk_level === 'High'
                ? 'text-red-400'
                : burnout?.risk_level === 'Moderate'
                ? 'text-yellow-400'
                : 'text-green-400'
            }`}>
              {burnout?.risk_level || 'Low'} Risk
            </span>
            <span className="text-gray-400 text-xs">
              {burnout?.risk_percent || 0}%
            </span>
          </div>
        </div>

        {/* Model 4 — Task Adherence */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-gray-500 text-xs">
              Task Adherence
            </span>
            <span className="text-gray-600 text-xs">Decision Tree</span>
          </div>
          <div className={`flex justify-between items-center px-3 py-2 rounded-lg ${
            adherence?.label === 'On-time'
              ? 'bg-green-900/20'
              : adherence?.label === 'Delayed'
              ? 'bg-yellow-900/30'
              : 'bg-red-900/30'
          }`}>
            <span className={`text-sm font-medium ${
              adherence?.label === 'On-time'
                ? 'text-green-400'
                : adherence?.label === 'Delayed'
                ? 'text-yellow-400'
                : 'text-red-400'
            }`}>
              {adherence?.label || 'No tasks'}
            </span>
            {adherence?.percent > 0 && (
              <span className="text-gray-400 text-xs">
                {adherence.percent}% adherence
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Footer note */}
      <p className="text-gray-700 text-xs mt-4 text-center">
        All 4 models running in real-time
      </p>
    </div>
  );
};

export default MLInsightsPanel;