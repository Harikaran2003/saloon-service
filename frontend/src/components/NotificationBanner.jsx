import React, { useState, useEffect } from 'react';

const NotificationBanner = ({ message, type = 'info', onClose }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (message) {
      setVisible(true);
      // Auto-hide after 5 seconds for success messages
      if (type === 'success') {
        const timer = setTimeout(() => {
          setVisible(false);
          onClose && onClose();
        }, 5000);
        return () => clearTimeout(timer);
      }
    }
  }, [message, type, onClose]);

  if (!visible || !message) return null;

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className={`border-l-4 p-4 mb-4 ${getColorClasses()}`}>
      <div className="flex">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-3">
          <button
            onClick={() => {
              setVisible(false);
              onClose && onClose();
            }}
            className="text-gray-400 hover:text-gray-600"
          >
            <span className="sr-only">Close</span>
            ✕
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotificationBanner;