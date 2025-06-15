// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function ProtectedRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    // sin token, al login (y reemplaza historia)
    return <Navigate to="/login" replace />;
  }

  return children;
}
