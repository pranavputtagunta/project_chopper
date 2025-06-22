import React, { useState, useRef, useEffect } from 'react';
import { Pill, Plus, Clock, Check, X, ChevronDown, Save, Loader, AlertCircle, Database, TrendingUp } from 'lucide-react';

// // Mock blob storage functions for demo (replace with actual imports) = test func
// const mockBlobStorage = {
//   saveMedicationsToBlob: async (medications) => {
//     await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
//     console.log('Saving medications to blob:', medications);
//     return { success: true, url: 'https://example.com/blob/medications.json' };
//   },
//   loadMedicationsFromBlob: async () => {
//     await new Promise(resolve => setTimeout(resolve, 800));
//     console.log('Loading medications from blob');
//     return { 
//       success: true, 
//       medications: [
//         {
//           id: 1,
//           name: "Vitamin D3",
//           time: "08:00",
//           dosage: "1000 IU",
//           frequency: "Once daily",
//           notes: "Take with breakfast",
//           description: "Essential vitamin for bone health and immune function",
//           completed: false,
//           createdAt: new Date().toISOString()
//         },
//         {
//           id: 2,
//           name: "Omega-3",
//           time: "19:00",
//           dosage: "2 capsules",
//           frequency: "Once daily",
//           notes: "Take with dinner",
//           description: "Fish oil supplement for heart and brain health",
//           completed: true,
//           createdAt: new Date().toISOString()
//         }
//       ]
//     };
//   }
// };


const MedicationTable = React.memo(({ medications, onToggle, onDelete }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());

  const toggleRow = (id) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  if (medications.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Database className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No medications in database</p>
        <p className="text-sm">Add your first medication to get started</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-200">
            <th className="text-left p-4 font-semibold text-gray-700">Status</th>
            <th className="text-left p-4 font-semibold text-gray-700">Medication</th>
            <th className="text-left p-4 font-semibold text-gray-700">Time</th>
            <th className="text-left p-4 font-semibold text-gray-700">Dosage</th>
            <th className="text-left p-4 font-semibold text-gray-700">Frequency</th>
            <th className="text-left p-4 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medications.map((medication) => (
            <React.Fragment key={medication.id}>
              <tr className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                medication.completed ? 'opacity-75' : ''
              }`}>
                <td className="p-4">
                  <button
                    onClick={() => onToggle(medication.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      medication.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-pink-300 hover:border-pink-500'
                    }`}
                  >
                    {medication.completed && (
                      <Check className="w-4 h-4 text-white" />
                    )}
                  </button>
                </td>
                <td className="p-4">
                  <div className={`font-medium ${
                    medication.completed ? 'text-green-800 line-through' : 'text-gray-800'
                  }`}>
                    {medication.name}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 text-gray-500" />
                    <span className="text-sm text-gray-600">{medication.time}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-600">{medication.dosage || 'N/A'}</td>
                <td className="p-4 text-sm text-gray-600">{medication.frequency}</td>
                <td className="p-4">
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => toggleRow(medication.id)}
                      className="p-1 hover:bg-pink-100 rounded-full transition-all"
                      title="View details"
                    >
                      <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedRows.has(medication.id) ? 'rotate-180' : ''
                      }`} />
                    </button>
                    <button
                      onClick={() => onDelete(medication.id)}
                      className="p-1 hover:bg-red-100 rounded-full transition-all"
                      title="Delete medication"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </button>
                  </div>
                </td>
              </tr>
              {expandedRows.has(medication.id) && (
                <tr>
                  <td colSpan="6" className="p-0">
                    <div className="bg-gray-50 p-4 border-l-4 border-pink-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        {medication.notes && (
                          <div>
                            <span className="font-medium text-gray-700">Notes:</span>
                            <p className="mt-1 text-gray-600">{medication.notes}</p>
                          </div>
                        )}
                        {medication.description && (
                          <div>
                            <span className="font-medium text-gray-700">Description:</span>
                            <p className="mt-1 text-gray-600">{medication.description}</p>
                          </div>
                        )}
                        {medication.createdAt && (
                          <div>
                            <span className="font-medium text-gray-700">Added:</span>
                            <p className="mt-1 text-gray-600">
                              {new Date(medication.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
});

const MedicationManager = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [initialized, setInitialized] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    time: '',
    dosage: '',
    frequency: 'Once daily',
    notes: '',
    description: ''
  });

  const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly'];

  // Calculate progress statistics
  const completedCount = medications.filter(med => med.completed).length;
  const totalCount = medications.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Load medications on component mount with duplicate prevention
  useEffect(() => {
    if (!initialized) {
      setInitialized(true);
      loadMedications();
    }
  }, [initialized]);

  const loadMedications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await mockBlobStorage.loadMedicationsFromBlob();
      
      if (result.success) {
        setMedications(result.medications);
      } else {
        setError('Failed to load medications: ' + result.error);
      }
    } catch (err) {
      setError('Error loading medications: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveMedications = async (medicationsToSave) => {
  try {
    const res = await fetch('/api/medications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medications: medicationsToSave }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to save');
    return true;
  } catch (err) {
    setError('Error saving medications: ' + err.message);
    return false;
  }
  };

  const handleAddMedication = async () => {
    if (!formData.name || !formData.time) {
      setError('Please fill in required fields (Name and Time)');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const newMedication = {
        id: Date.now() + Math.random(), // More unique ID to prevent conflicts
        name: formData.name,
        time: formData.time,
        dosage: formData.dosage,
        frequency: formData.frequency,
        notes: formData.notes,
        description: formData.description,
        completed: false,
        createdAt: new Date().toISOString()
      };

      // Update local state first
      const updatedMedications = [...medications, newMedication];
      setMedications(updatedMedications);
      
      // Save to blob storage
      const saveResult = await saveMedications(updatedMedications);
      
      if (saveResult) {
        // Reset form only if save was successful
        setFormData({
          name: '',
          time: '',
          dosage: '',
          frequency: 'Once daily',
          notes: '',
          description: ''
        });
        setShowAddForm(false);
      } else {
        // Revert local state if save failed
        setMedications(medications);
      }
    } catch (err) {
      setError('Error adding medication: ' + err.message);
      // Revert local state on error
      setMedications(medications);
    } finally {
      setSaving(false);
    }
  };

const handleToggleMedication = async (id) => {
  // Optimistically update UI
  const updatedMedications = medications.map(med =>
    med.id === id ? { ...med, completed: !med.completed } : med
  );
  setMedications(updatedMedications);

  // Send PATCH request to update only the toggled medication
  try {
    const toggledMed = updatedMedications.find(med => med.id === id);
    const res = await fetch('/api/medications', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, updates: { completed: toggledMed.completed } }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to update medication');
  } catch (err) {
    // Optionally revert UI or show error
    setError('Error updating medication: ' + err.message);
    // Optionally reload medications from DB here
  }
};

const handleDeleteMedication = async (id) => {
  // Optimistically update UI
  const prevMedications = medications;
  const updatedMedications = medications.filter(med => med.id !== id);
  setMedications(updatedMedications);

  try {
    const res = await fetch('/api/medications', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || 'Failed to delete medication');
  } catch (err) {
    setError('Error deleting medication: ' + err.message);
    // Optionally revert UI on error
    setMedications(prevMedications);
  }
};
  const handleCancel = () => {
    setFormData({
      name: '',
      time: '',
      dosage: '',
      frequency: 'Once daily',
      notes: '',
      description: ''
    });
    setShowAddForm(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-white p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <Loader className="w-8 h-8 mx-auto mb-4 text-pink-500 animate-spin" />
            <p className="text-gray-600">Loading medications...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-white p-4">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold text-gray-800 flex items-center space-x-2">
                <Pill className="w-6 h-6 text-pink-500" />
                <span>Medication Manager</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                {medications.length} medication{medications.length !== 1 ? 's' : ''} in database
                {lastSaved && (
                  <span className="ml-2 text-green-600">
                    • Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {saving && (
                <div className="flex items-center space-x-2 text-blue-600">
                  <Loader className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Saving...</span>
                </div>
              )}
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                disabled={saving}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
              >
                <Plus className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
                <span className="text-sm font-medium">{showAddForm ? 'Cancel' : 'Add Medication'}</span>
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          {totalCount > 0 && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-700">Daily Progress</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {completedCount} of {totalCount} completed ({progressPercentage}%)
                </span>
              </div>
              <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ease-out rounded-full ${
                    progressPercentage === 100 
                      ? 'bg-gradient-to-r from-green-400 to-emerald-500' 
                      : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
                {progressPercentage > 0 && (
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent rounded-full" />
                )}
              </div>
              {progressPercentage === 100 && (
                <div className="mt-2 text-center">
                  <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                    🎉 All medications completed for today!
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto p-1 hover:bg-red-100 rounded-full"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          )}

          {/* Add Medication Form */}
          {showAddForm && (
            <div className="mb-6 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
              <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Medication</h4>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Enter medication name"
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) => setFormData({...formData, time: e.target.value})}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Dosage
                    </label>
                    <input
                      type="text"
                      value={formData.dosage}
                      onChange={(e) => setFormData({...formData, dosage: e.target.value})}
                      placeholder="e.g., 10mg, 2 tablets"
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frequency
                    </label>
                    <select
                      value={formData.frequency}
                      onChange={(e) => setFormData({...formData, frequency: e.target.value})}
                      className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                    >
                      {frequencies.map(freq => (
                        <option key={freq} value={freq}>{freq}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    placeholder="What is this medication for? (stored in blob)"
                    rows={2}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder="Additional instructions or reminders"
                    rows={2}
                    className="w-full px-3 py-2 border border-pink-200 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none"
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleAddMedication}
                    disabled={saving || !formData.name || !formData.time}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <Loader className="w-4 h-4 animate-spin" />
                        <span>Adding...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Add to Database</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-all font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Medications Table */}
          <MedicationTable 
            medications={medications}
            onToggle={handleToggleMedication}
            onDelete={handleDeleteMedication}
          />
        </div>
      </div>
    </div>
  );
};

export default MedicationManager;