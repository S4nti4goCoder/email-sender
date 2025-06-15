// src/components/PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PublicRoute({ children }) {
  const { token } = useAuth();

  if (token) {
    // si ya hay token, al dashboard (y reemplaza historia)
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
