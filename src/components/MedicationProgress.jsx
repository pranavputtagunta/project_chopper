import React from 'react';
import { TrendingUp } from 'lucide-react';

const MedicationProgress = ({ medications }) => {
  const completedCount = medications.filter(m => m.completed).length;
  const totalCount     = medications.length;
  const percent        = totalCount > 0
    ? Math.round((completedCount / totalCount) * 100)
    : 0;

  return (
    <div>
      <h4 className="text-lg font-semibold text-gray-800 mb-4">Daily Progress</h4>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Progress</span>
        </div>
        <span className="text-sm font-semibold text-gray-800">
          {completedCount} of {totalCount} ({percent}%)
        </span>
      </div>
      <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ease-out ${
            percent === 100
              ? 'bg-gradient-to-r from-green-400 to-emerald-500'
              : 'bg-gradient-to-r from-blue-400 to-indigo-500'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {percent === 100 && (
        <div className="mt-2 text-center">
          <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
            🎉 All medications completed for today!
          </span>
        </div>
      )}
    </div>
  );
};

export default MedicationProgress;
