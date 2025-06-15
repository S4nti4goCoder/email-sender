// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Dashboard from "./pages/Dashboard.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import PublicRoute from "./components/PublicRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* raíz → redirige a login */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* rutas públicas (login/register) solo si NO estás autenticado */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* ruta protegida: Dashboard solo si ESTÁS autenticado */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* cualquier otra → al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
