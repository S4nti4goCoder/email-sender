import React from "react";

const COLORS = {
  success: {
    bg: "bg-green-50",
    border: "border-green-200",
    text: "text-green-700",
    icon: "✅",
  },
  error: {
    bg: "bg-red-50",
    border: "border-red-200",
    text: "text-red-700",
    icon: "❌",
  },
  warning: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    text: "text-yellow-800",
    icon: "⚠️",
  },
  info: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-700",
    icon: "ℹ️",
  },
};

export default function Alert({ type = "info", children }) {
  const { bg, border, text, icon } = COLORS[type] || COLORS.info;
  return (
    <div
      role="alert"
      className={`${bg} ${border} border px-4 py-2 rounded mb-4 flex items-center space-x-2`}
    >
      <span className="text-xl leading-none">{icon}</span>
      <span className={`${text} text-sm`}>{children}</span>
    </div>
  );
}
