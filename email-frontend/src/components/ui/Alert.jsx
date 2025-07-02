import React, { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

const COLORS = {
  success: {
    bg: "bg-green-50 dark:bg-green-900/50",
    border: "border-green-200 dark:border-green-700",
    text: "text-green-700 dark:text-green-200",
    icon: "✅",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-900/50",
    border: "border-red-200 dark:border-red-700",
    text: "text-red-700 dark:text-red-200",
    icon: "❌",
  },
  warning: {
    bg: "bg-yellow-50 dark:bg-yellow-900/50",
    border: "border-yellow-200 dark:border-yellow-700",
    text: "text-yellow-800 dark:text-yellow-200",
    icon: "⚠️",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-900/50",
    border: "border-blue-200 dark:border-blue-700",
    text: "text-blue-700 dark:text-blue-200",
    icon: "ℹ️",
  },
};

export default function Alert({ 
  type = "info", 
  children, 
  // Nuevas props para funcionalidad de toast
  isToast = false,
  duration = 5000,
  onClose,
  title,
  showCloseButton = false
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  const { bg, border, text, icon } = COLORS[type] || COLORS.info;

  useEffect(() => {
    if (isToast) {
      setIsAnimating(true);
      
      // Auto ocultar después del duration
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isToast, duration]);

  const handleClose = () => {
    if (isToast) {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, 300);
    } else {
      setIsVisible(false);
      onClose?.();
    }
  };

  if (!isVisible) return null;

  // Clases base
  const baseClasses = `${bg} ${border} border px-4 py-2 rounded flex items-center space-x-2`;
  
  // Clases específicas para toast
  const toastClasses = isToast 
    ? `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-sm w-full shadow-lg transition-all duration-300 ${
        isAnimating ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
      }`
    : 'mb-4';

  return (
    <div
      role="alert"
      className={`${baseClasses} ${toastClasses}`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <div className="flex-1">
        {title && (
          <div className={`${text} text-sm font-medium`}>{title}</div>
        )}
        <span className={`${text} text-sm ${title ? 'block' : ''}`}>
          {children}
        </span>
      </div>
      
      {(showCloseButton || isToast) && (
        <button
          onClick={handleClose}
          className={`${text} hover:opacity-75 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-md p-1`}
        >
          <span className="sr-only">Cerrar</span>
          <XMarkIcon className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}