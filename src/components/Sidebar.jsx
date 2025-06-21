import React from 'react';
import { Home, Activity, Calendar, Pill, User, Settings, Bell, BarChart3 } from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: Activity, label: 'Health Metrics', active: false },
    { icon: Calendar, label: 'Appointments', active: false },
    { icon: Pill, label: 'Medications', active: false },
    { icon: BarChart3, label: 'Reports', active: false },
    { icon: User, label: 'Profile', active: false },
    { icon: Bell, label: 'Notifications', active: false },
    { icon: Settings, label: 'Settings', active: false },
  ];

  return (
    <div className="w-64 bg-white shadow-xl border-r border-pink-100 h-screen sticky top-0">
      {/* Logo Section */}
      <div className="p-6 border-b border-pink-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">HealthTracker</h2>
            <p className="text-sm text-gray-500">Wellness Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item, index) => (
            <li key={index}>
              <a
                href="#"
                className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  item.active
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                    : 'text-gray-600 hover:bg-pink-50 hover:text-pink-600'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Profile Section */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800">Dr. Sarah Johnson</p>
            <p className="text-xs text-gray-500">Healthcare Provider</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;