// src/components/MedicationManager.jsx
import React, { useState, useEffect } from 'react';
import {
  Pill, Plus, Clock, Check, X, ChevronDown,
  Save, Loader, AlertCircle, Database, TrendingUp
} from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Mock blob helpers – replace with your real API calls              */
/* ------------------------------------------------------------------ */
const mockBlobStorage = {
  saveMedicationsToBlob: async meds => {
    await new Promise(r => setTimeout(r, 800));
    console.log('>>> SAVED to blob:', meds);
    return { success: true };
  },
  loadMedicationsFromBlob: async () => {
    await new Promise(r => setTimeout(r, 800));
    return { success: true, medications: [] };
  },
  addMedicationToBlob: async med => {
    await new Promise(r => setTimeout(r, 500));
    return { success: true, medication: { ...med, id: Date.now() } };
  }
};

/* ------------------------------------------------------------------ */
/*   MedicationTable                                                  */
/* ------------------------------------------------------------------ */
const MedicationTable = React.memo(({ medications, onToggle, onDelete }) => {
  const [expanded, setExpanded] = useState(new Set());
  const toggleRow = id => {
    const s = new Set(expanded); s.has(id) ? s.delete(id) : s.add(id);
    setExpanded(s);
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
              <tr className={`border-b hover:bg-gray-50 ${med.completed ? 'opacity-75' : ''}`}>
                <td className="p-4">
                  <button
                    onClick={() => onToggle(med.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      med.completed
                        ? 'bg-green-500 border-green-500'
                        : 'border-pink-300 hover:border-pink-500'
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
                        expanded.has(med.id) ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  <button onClick={() => onDelete(med.id)}>
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </td>
              </tr>
              {expanded.has(med.id) && (
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

/* ------------------------------------------------------------------ */
/*   MedicationManager                                                */
/* ------------------------------------------------------------------ */
const MedicationManager = () => {
  const [medications, setMedications] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [lastSaved, setLastSaved]   = useState(null);

  const [formData, setFormData] = useState({
    name: '', time: '', dosage: '',
    frequency: 'Once daily',
    notes: '', description: ''
  });
  const frequencies = ['Once daily','Twice daily','Three times daily','As needed','Weekly'];

  // helper that actually saves everything
  const saveMedications = async meds => {
    try {
      setSaving(true);
      const res = await mockBlobStorage.saveMedicationsToBlob(meds);
      if (!res.success) throw new Error('Save failed');
      setLastSaved(new Date());
    } catch (e) {
      setError('Error saving: ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  // load on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await mockBlobStorage.loadMedicationsFromBlob();
        if (res.success) {
          // if empty, seed one default
          if (!res.medications.length) {
            const d = {
              id: Date.now(),
              name: 'Vitamin D3',
              time: '08:00',
              dosage: '1000 IU',
              frequency: 'Once daily',
              notes: 'Take with breakfast',
              description: 'Essential vitamin for bone health',
              completed: false,
              createdAt: new Date().toISOString()
            };
            setMedications([d]);
            await saveMedications([d]);
          } else {
            setMedications(res.medications);
          }
        } else {
          throw new Error(res.error);
        }
      } catch (e) {
        setError('Load error: ' + e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // add new
  const handleAdd = async () => {
    if (!formData.name || !formData.time) {
      setError('Name & Time required'); return;
    }
    const newMed = {
      ...formData,
      id: Date.now(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    try {
      setSaving(true);
      const added = await mockBlobStorage.addMedicationToBlob(newMed);
      if (!added.success) throw new Error('Add failed');

      const updated = [...medications, added.medication];
      setMedications(updated);
      await saveMedications(updated);

      setShowForm(false);
      setFormData({
        name:'',time:'',dosage:'',
        frequency:'Once daily',
        notes:'',description:''
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  // toggle / delete both call saveMedications
  const handleToggle = id => {
    const updated = medications.map(m =>
      m.id===id?{...m,completed:!m.completed}:m
    );
    setMedications(updated);
    saveMedications(updated);
  };
  const handleDelete = id => {
    const updated = medications.filter(m => m.id!==id);
    setMedications(updated);
    saveMedications(updated);
  };

  // derived
  const completedCount = medications.filter(m=>m.completed).length;
  const totalCount     = medications.length;
  const progressPct    = totalCount ? Math.round((completedCount/totalCount)*100) : 0;

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

        {/* header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold flex items-center space-x-2 text-gray-800">
              <Pill className="w-6 h-6 text-pink-500"/>
              <span>Medication Manager</span>
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {totalCount} medication{totalCount!==1?'s':''} &bull;{' '}
              {lastSaved?`Last saved ${lastSaved.toLocaleTimeString()}`:'Not yet saved'}
            </p>
          </div>
          <button
            onClick={()=>setShowForm(f=>!f)}
            className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg flex items-center space-x-2 shadow-lg hover:shadow-xl"
          >
            <Plus className={`${showForm?'rotate-45':''} w-4 h-4 transition-transform`}/>
            <span>{showForm?'Cancel':'Add Medication'}</span>
          </button>
        </div>

        {/* progress bar */}
        {totalCount>0 && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-blue-600"/>
                <span className="text-sm font-medium text-gray-700">Daily Progress</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">
                {completedCount} of {totalCount} ({progressPct}%)
              </span>
            </div>
            <div className="relative w-full bg-gray-200 rounded-full h-3 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  progressPct===100
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500'
                    : 'bg-gradient-to-r from-blue-400 to-indigo-500'
                }`}
                style={{width:`${progressPct}%`}}
              />
            </div>
            {progressPct===100 && (
              <div className="mt-2 text-center">
                <span className="text-sm font-medium text-green-700 bg-green-100 px-2 py-1 rounded-full">
                  🎉 All done today!
                </span>
              </div>
            )}
          </div>
        )}

        {/* error */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-red-200 border rounded flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2"/>
            <span className="flex-1 text-red-700">{error}</span>
            <button onClick={()=>setError(null)}>
              <X className="w-4 h-4 text-red-500"/>
            </button>
          </div>
        )}

        {/* add form */}
        {showForm && (
          <div className="mb-6 p-6 bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl border border-pink-200">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Name *</label>
                <input
                  value={formData.name}
                  onChange={e=>setFormData(fd=>({...fd,name:e.target.value}))}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Time *</label>
                <input
                  type="time"
                  value={formData.time}
                  onChange={e=>setFormData(fd=>({...fd,time:e.target.value}))}
                  className="input-primary"
                />
              </div>
            </div>
            <div className="mt-4 grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Dosage</label>
                <input
                  value={formData.dosage}
                  onChange={e=>setFormData(fd=>({...fd,dosage:e.target.value}))}
                  className="input-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={e=>setFormData(fd=>({...fd,frequency:e.target.value}))}
                  className="input-primary"
                >
                  {frequencies.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
              <textarea
                rows={2}
                value={formData.description}
                onChange={e=>setFormData(fd=>({...fd,description:e.target.value}))}
                className="input-primary resize-none"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium mb-1 text-gray-700">Notes</label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={e=>setFormData(fd=>({...fd,notes:e.target.value}))}
                className="input-primary resize-none"
              />
            </div>
            <div className="mt-6 flex space-x-2">
              <button
                onClick={handleAdd}
                disabled={saving||!formData.name||!formData.time}
                className="btn-primary flex-1 flex items-center justify-center space-x-2"
              >
                {saving
                  ? <Loader className="animate-spin w-4 h-4"/>
                  : <Save className="w-4 h-4"/>}
                <span>{saving?'Saving':'Save'}</span>
              </button>
              <button
                disabled={saving}
                onClick={()=>setShowForm(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* table */}
        <MedicationTable
          medications={medications}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      </div>
    </div>
  );
};

export default MedicationManager;
