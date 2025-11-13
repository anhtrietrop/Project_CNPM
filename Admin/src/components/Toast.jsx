import React, { useEffect } from "react";
import { FaCheckCircle, FaTimesCircle, FaInfoCircle } from "react-icons/fa";

const Toast = ({ id, message, type = "info", duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, id, onClose]);

  const getIcon = () => {
    switch (type) {
      case "success":
        return <FaCheckCircle className="text-green-500" size={20} />;
      case "error":
        return <FaTimesCircle className="text-red-500" size={20} />;
      case "info":
      default:
        return <FaInfoCircle className="text-blue-500" size={20} />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-green-50 border-green-200";
      case "error":
        return "bg-red-50 border-red-200";
      case "info":
      default:
        return "bg-blue-50 border-blue-200";
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border shadow-lg ${getBackgroundColor()} animate-slide-in`}
    >
      {getIcon()}
      <p className="text-gray-800 flex-1">{message}</p>
      <button
        onClick={() => onClose(id)}
        className="text-gray-500 hover:text-gray-700"
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
