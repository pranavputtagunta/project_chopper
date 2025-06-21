import React from 'react';
import { Pill, Plus, Clock, Check } from 'lucide-react';

const MedicationSchedule = ({ medications, toggleMedication }) => {
  const addMedication = () => {
    // This would typically open a modal or form to add new medication
    console.log('Add new medication');
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 flex items-center space-x-2">
          <Pill className="w-5 h-5 text-pink-500" />
          <span>Medication Schedule</span>
        </h3>
        <button
          onClick={addMedication}
          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Plus className="w-4 h-4" />
          <span className="text-sm font-medium">Add</span>
        </button>
      </div>

      {/* Medication List */}
      <div className="space-y-3">
        {medications.map((medication) => (
          <div 
            key={medication.id} 
            className={`flex items-center space-x-4 p-4 rounded-xl border transition-all cursor-pointer ${
              medication.completed
                ? 'bg-green-50 border-green-200 shadow-sm'
                : 'bg-pink-50 border-pink-200 hover:bg-pink-100'
            }`}
            onClick={() => toggleMedication(medication.id)}
          >
            {/* Checkbox */}
            <div className="flex-shrink-0">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                medication.completed
                  ? 'bg-green-500 border-green-500'
                  : 'border-pink-300 hover:border-pink-500'
              }`}>
                {medication.completed && (
                  <Check className="w-4 h-4 text-white" />
                )}
              </div>
            </div>

            {/* Medication Info */}
            <div className="flex-1">
              <h4 className={`font-medium ${
                medication.completed ? 'text-green-800 line-through' : 'text-gray-800'
              }`}>
                {medication.name}
              </h4>
              <div className="flex items-center space-x-1 mt-1">
                <Clock className="w-3 h-3 text-gray-500" />
                <span className={`text-sm ${
                  medication.completed ? 'text-green-600' : 'text-gray-600'
                }`}>
                  {medication.time}
                </span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex-shrink-0">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                medication.completed
                  ? 'bg-green-100 text-green-800'
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {medication.completed ? 'Taken' : 'Pending'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Medication Button */}
      <button
        onClick={addMedication}
        className="w-full mt-6 py-3 px-6 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-medium hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
      >
        <Plus className="w-5 h-5" />
        <span>Add Medication</span>
      </button>
    </div>
  );
};

export default MedicationSchedule;