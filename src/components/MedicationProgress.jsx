import React from 'react';
import { Activity, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const MedicationProgress = ({ medications }) => {
  const completedCount = medications.filter(med => med.completed).length;
  const totalCount = medications.length;
  const progressPercentage = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  const getProgressColor = () => {
    if (progressPercentage >= 80) return 'from-green-400 to-green-600';
    if (progressPercentage >= 50) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const getProgressBgColor = () => {
    if (progressPercentage >= 80) return 'bg-gradient-to-br from-green-50 to-green-100';
    if (progressPercentage >= 50) return 'bg-gradient-to-br from-yellow-50 to-yellow-100';
    return 'bg-gradient-to-br from-red-50 to-red-100';
  };

  return (
    <div className={`${getProgressBgColor()} rounded-2xl p-6 shadow-lg border border-white/50`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <Activity className="w-5 h-5 text-pink-500" />
          <span>Daily Progress</span>
        </h3>
        <div className={`w-10 h-10 bg-gradient-to-br ${getProgressColor()} rounded-xl flex items-center justify-center shadow-lg`}>
          {progressPercentage === 100 ? (
            <CheckCircle className="w-5 h-5 text-white" />
          ) : progressPercentage > 0 ? (
            <Clock className="w-5 h-5 text-white" />
          ) : (
            <AlertCircle className="w-5 h-5 text-white" />
          )}
        </div>
      </div>

      {/* Progress Stats */}
      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 mb-2">
          <span>Medications Taken</span>
          <span>{completedCount} of {totalCount}</span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-white rounded-full h-3 shadow-inner">
          <div 
            className={`h-3 bg-gradient-to-r ${getProgressColor()} rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
        
        <div className="text-center mt-2">
          <span className="text-2xl font-bold text-gray-800">
            {Math.round(progressPercentage)}%
          </span>
          <p className="text-sm text-gray-600">Complete</p>
        </div>
      </div>

      {/* Status Message */}
      <div className="text-center">
        {progressPercentage === 100 ? (
          <p className="text-sm text-green-700 font-medium">
            🎉 All medications taken today!
          </p>
        ) : progressPercentage >= 50 ? (
          <p className="text-sm text-yellow-700 font-medium">
            👍 Good progress, keep it up!
          </p>
        ) : (
          <p className="text-sm text-red-700 font-medium">
            ⚠️ Don't forget your medications
          </p>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/50">
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{completedCount}</p>
          <p className="text-xs text-gray-600">Completed</p>
        </div>
        <div className="text-center">
          <p className="text-lg font-bold text-gray-800">{totalCount - completedCount}</p>
          <p className="text-xs text-gray-600">Remaining</p>
        </div>
      </div>
    </div>
  );
};

export default MedicationProgress;