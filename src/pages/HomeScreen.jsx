import React, { useState } from 'react';
import Sidebar from '../components/Sidebar.jsx';
import ProfileForm from '../components/ProfileForm.jsx';
import DashboardCards from '../components/DashboardCards.jsx';
import AppointmentCalendar from '../components/AppointmentCalendar.jsx';
import MedicationProgress from '../components/MedicationProgress.jsx';
import MedicationSchedule from '../components/MedicationSchedule.jsx';

const HomeScreen = () => {
  const [medications, setMedications] = useState([
    { id: 1, name: 'Vitamin D Supplement', time: '8:00 AM', completed: false },
    { id: 2, name: 'Blood Pressure Medicine', time: '12:00 PM', completed: false },
    { id: 3, name: 'Evening Medication', time: '8:00 PM', completed: false }
  ]);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    consultant: 'Dr. Sarah Johnson',
    medicalHistory: ''
  });

  const toggleMedication = (id) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, completed: !med.completed } : med
    ));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      <div className="flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Health Dashboard</h1>
            <p className="text-gray-600">Track your wellness journey</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Form */}
            <div className="lg:col-span-1">
              <ProfileForm 
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </div>

            {/* Right Columns - Main Dashboard */}
            <div className="lg:col-span-2 space-y-6">
              {/* Health Metrics Cards */}
              <DashboardCards />

              {/* Calendar and Medication Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AppointmentCalendar />
                
                <div className="space-y-6">
                  <MedicationProgress medications={medications} />
                  <MedicationSchedule 
                    medications={medications}
                    toggleMedication={toggleMedication}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeScreen;