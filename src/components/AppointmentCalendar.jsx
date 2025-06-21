import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

const AppointmentCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const generateCalendar = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const navigateMonth = (direction) => {
    setCurrentDate(new Date(
      currentDate.getFullYear(), 
      currentDate.getMonth() + direction, 
      1
    ));
  };

  const isToday = (day) => {
    const today = new Date();
    return day === today.getDate() && 
           currentDate.getMonth() === today.getMonth() && 
           currentDate.getFullYear() === today.getFullYear();
  };

  const hasAppointment = (day) => {
    // Sample appointment days - replace with your actual data
    const appointmentDays = [15, 21, 28];
    return appointmentDays.includes(day);
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border border-pink-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 flex items-center space-x-2">
          <Calendar className="w-6 h-6 text-pink-500" />
          <span>Appointment Calendar</span>
        </h3>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <span className="text-lg font-semibold text-gray-800 min-w-36 text-center">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button 
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-pink-50 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Days of Week Header */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {generateCalendar().map((day, index) => (
          <div 
            key={index} 
            className={`text-center py-3 text-sm rounded-lg transition-all cursor-pointer relative ${
              day 
                ? 'hover:bg-pink-50 text-gray-700' 
                : ''
            } ${
              isToday(day)
                ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold shadow-lg' 
                : ''
            } ${
              hasAppointment(day) && !isToday(day)
                ? 'bg-pink-100 text-pink-700 font-semibold'
                : ''
            }`}
          >
            {day}
            {hasAppointment(day) && (
              <div className="absolute top-1 right-1 w-2 h-2 bg-pink-500 rounded-full"></div>
            )}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-6 flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full"></div>
          <span className="text-gray-600">Today</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-pink-100 rounded-full border border-pink-300"></div>
          <span className="text-gray-600">Appointment</span>
        </div>
      </div>
    </div>
  );
};

export default AppointmentCalendar;