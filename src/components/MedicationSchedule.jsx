// src/components/MedicationManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Pill,
  Plus,
  Clock,
  Check,
  X,
  ChevronDown,
  Save,
  Loader,
  AlertCircle,
  Database,
  TrendingUp
} from 'lucide-react';

const MedicationTable = React.memo(({ medications, onToggle, onDelete }) => {
  const [expandedRows, setExpandedRows] = useState(new Set());
  const toggleRow = id => {
    const s = new Set(expandedRows);
    s.has(id) ? s.delete(id) : s.add(id);
    setExpandedRows(s);
  };

  if (!medications.length) {
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
            <th className="p-4 text-left font-semibold text-gray-700">Status</th>
            <th className="p-4 text-left font-semibold text-gray-700">Medication</th>
            <th className="p-4 text-left font-semibold text-gray-700">Time</th>
            <th className="p-4 text-left font-semibold text-gray-700">Dosage</th>
            <th className="p-4 text-left font-semibold text-gray-700">Frequency</th>
            <th className="p-4 text-left font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {medications.map(med => (
            <React.Fragment key={med.id}>
              <tr className={`border-b hover:bg-gray-50 transition-colors ${med.completed ? 'opacity-75' : ''}`}>
                <td className="p-4">
                  <button
                    onClick={() => onToggle(med.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                      med.completed ? 'bg-green-500 border-green-500' : 'border-pink-300 hover:border-pink-500'
                    }`}
                  >
                    {med.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                </td>
                <td className="p-4 font-medium">{med.name}</td>
                <td className="p-4 flex items-center space-x-1">
                  <Clock className="w-3 h-3 text-gray-500" />
                  <span className="text-sm text-gray-600">{med.time}</span>
                </td>
                <td className="p-4 text-sm text-gray-600">{med.dosage || 'N/A'}</td>
                <td className="p-4 text-sm text-gray-600">{med.frequency}</td>
                <td className="p-4 flex space-x-2">
                  <button onClick={() => toggleRow(med.id)}>
                    <ChevronDown
                      className={`w-4 h-4 text-gray-500 transition-transform ${
                        expandedRows.has(med.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button onClick={() => onDelete(med.id)}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
              {expandedRows.has(med.id) && (
                <tr>
                  <td colSpan="6" className="p-4 bg-gray-50 border-l-4 border-pink-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      {med.notes && (
                        <div>
                          <strong>Notes:</strong>
                          <p className="mt-1 text-gray-600">{med.notes}</p>
                        </div>
                      )}
                      {med.description && (
                        <div>
                          <strong>Description:</strong>
                          <p className="mt-1 text-gray-600">{med.description}</p>
                        </div>
                      )}
                      <div>
                        <strong>Added:</strong>
                        <p className="mt-1 text-gray-600">
                          {new Date(med.createdAt).toLocaleDateString()}
                        </p>
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

  const [formData, setFormData] = useState({
    name: '',
    time: '',
    dosage: '',
    frequency: 'Once daily',
    notes: '',
    description: ''
  });

  const frequencies = ['Once daily', 'Twice daily', 'Three times daily', 'As needed', 'Weekly'];

  const completedCount = medications.filter(m => m.completed).length;
  const totalCount = medications.length;
  const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/medications');
        const { success, medications } = await res.json();
        if (success) {
          setMedications(medications);
        } else {
          throw new Error('Failed to load');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleAddMedication = async () => {
    if (!formData.name || !formData.time) {
      setError('Name and Time are required');
      return;
    }
    const newMed = {
      ...formData,
      id: Date.now(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    const updated = [...medications, newMed];
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ medications: updated })
      });
      const { success } = await res.json();
      if (!success) throw new Error('Save failed');
      setMedications(updated);
      setLastSaved(new Date());
      setShowAddForm(false);
      setFormData({
        name: '',
        time: '',
        dosage: '',
        frequency: 'Once daily',
        notes: '',
        description: ''
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleToggleMedication = async id => {
    const updated = medications.map(m =>
      m.id === id ? { ...m, completed: !m.completed } : m
    );
    setMedications(updated);
    try {
      await fetch('/api/medications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates: { completed: updated.find(m => m.id === id).completed } })
      });
      setLastSaved(new Date());
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDeleteMedication = async id => {
    const prev = medications;
    const updated = medications.filter(m => m.id !== id);
    setMedications(updated);
    try {
      const res = await fetch('/api/medications', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const { success } = await res.json();
      if (!success) throw new Error('Delete failed');
      setLastSaved(new Date());
    } catch (e) {
      setError(e.message);
      setMedications(prev);
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setError(null);
    setFormData({
      name: '',
      time: '',
      dosage: '',
      frequency: 'Once daily',
      notes: '',
      description: ''
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="animate-spin w-8 h-8 text-pink-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-rose-50 to-white p-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl p-6">
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
          <button
            onClick={() => setShowAddForm(f => !f)}
            disabled={saving}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:from-pink-600 hover:to-rose-600 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
          >
            <Plus className={`w-4 h-4 transition-transform ${showAddForm ? 'rotate-45' : ''}`} />
            <span className="text-sm font-medium">{showAddForm ? 'Cancel' : 'Add Medication'}</span>
          </button>
        </div>

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

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
            <span className="text-red-700">{error}</span>
            <button onClick={() => setError(null)} className="ml-auto p-1 hover:bg-red-100 rounded-full">
              <X className="w-4 h-4 text-red-500" />
            </button>
          </div>
        )}

        {showAddForm && (
          <div className="mb-6 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
            <h4 className="text-lg font-semibold text-gray-800 mb-4">Add New Medication</h4>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Medication Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={e => setFormData({ ...formData, time: e.target.value })}
                    className="input-primary"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Dosage</label>
                  <input
                    type="text"
                    value={formData.dosage}
                    onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                    className="input-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Frequency</label>
                  <select
                    value={formData.frequency}
                    onChange={e => setFormData({ ...formData, frequency: e.target.value })}
                    className="input-primary"
                  >
                    {frequencies.map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  rows={2}
                  className="input-primary resize-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="input-primary resize-none"
                />
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={handleAddMedication}
                  disabled={saving || !formData.name || !formData.time}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  {saving ? <Loader className="animate-spin w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{saving ? 'Adding...' : 'Add to Database'}</span>
                </button>
                <button
                  onClick={handleCancel}
                  disabled={saving}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <MedicationTable
          medications={medications}
          onToggle={handleToggleMedication}
          onDelete={handleDeleteMedication}
        />
      </div>
    </div>
  );
};

export default MedicationManager;
