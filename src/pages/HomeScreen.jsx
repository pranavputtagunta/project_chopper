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
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Health Dashboard</h1>
            <p className="text-gray-600">Track your wellness journey</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-8">
            {/* Left Column - Profile Form */}
            <div>
              <ProfileForm 
                formData={formData}
                handleInputChange={handleInputChange}
              />
            </div>

            {/* Right Column */}
            <div className="space-y-8">
              {/* Health Metrics Cards */}
              <DashboardCards />

              {/* Calendar and Medication Section as flex */}
              <div className="flex flex-wrap gap-8">
                {/* Wider calendar container */}
                <div className="flex-[1_1_360px] bg-white rounded-2xl shadow p-6">
                  <AppointmentCalendar />
                </div>

                {/* Medication Section */}
                <div className="flex-[1_1_360px] space-y-6">
                  <div className="bg-white rounded-2xl shadow p-6">
                    <MedicationProgress medications={medications} />
                  </div>
                  <div className="bg-white rounded-2xl shadow p-6">
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
    </div>
  );
};

export default HomeScreen;
