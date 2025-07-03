// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import DashboardHome from "./pages/dashboard/home/DashboardHome.jsx";
import SendEmail from "./pages/dashboard/email/SendEmail.jsx";
import ForgotPassword from "./pages/auth/ForgotPassword.jsx";
import ResetPassword from "./pages/auth/ResetPassword.jsx";

import ProtectedRoute from "./components/auth/ProtectedRoute.jsx";
import PublicRoute from "./components/auth/PublicRoute.jsx";

export default function App() {
  return (
    <Routes>
      {/* raíz → redirige a login */}
      <Route index element={<Navigate to="/login" replace />} />

      {/* rutas públicas (login/register/forgot/reset) solo si NO estás autenticado */}
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
      <Route
        path="/forgot-password"
        element={
          <PublicRoute>
            <ForgotPassword />
          </PublicRoute>
        }
      />
      <Route
        path="/reset-password"
        element={
          <PublicRoute>
            <ResetPassword />
          </PublicRoute>
        }
      />

      {/* rutas protegidas: Dashboard solo si ESTÁS autenticado */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardHome />
          </ProtectedRoute>
        }
      />
      
      {/* Nueva ruta: Enviar Email */}
      <Route
        path="/dashboard/send"
        element={
          <ProtectedRoute>
            <SendEmail />
          </ProtectedRoute>
        }
      />

      {/* cualquier otra → al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}