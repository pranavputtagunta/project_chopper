/* src/components/NotificationPopup.jsx
   Tailwind only; no extra CSS file needed */

import React, { useEffect, useState } from 'react';
import { Pill, X } from 'lucide-react';

const NotificationPopup = ({ medication, onAnswer }) => {
  /* slide-in animation control */
  const [visible, setVisible] = useState(false);

  /* show on mount */
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClick = answer => {
    setVisible(false);                 // slide out
    /* wait for animation to finish before reporting answer */
    setTimeout(() => onAnswer(answer), 300);
  };

  return (
    <div
      className={`
        fixed top-6 right-0 z-50
        w-80 max-w-full
        transform ${visible ? 'translate-x-0' : 'translate-x-full'}
        transition-transform duration-300 ease-out
      `}
    >
      <div className="bg-white rounded-2xl shadow-xl border border-pink-200 p-6">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <Pill className="w-6 h-6 text-pink-500" />
          </div>
          <div className="ml-3 flex-1">
            <h4 className="text-lg font-semibold text-gray-800 mb-1">
              Missed dose – {medication.name}
            </h4>
            <p className="text-sm text-gray-600">
              It’s past <span className="font-medium">{medication.time}</span> and this pill
              hasn’t been marked as taken.<br />
              Would you like to discuss next steps / a treatment plan?
            </p>
          </div>
          <button
            onClick={() => handleClick('no')}
            className="ml-2 p-1 rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="mt-4 flex space-x-3">
          <button
            onClick={() => handleClick('yes')}
            className="btn-primary flex-1"
          >
            Yes
          </button>
          <button
            onClick={() => handleClick('no')}
            className="btn-secondary flex-1"
          >
            No
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationPopup;
