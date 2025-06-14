// src/pages/Dashboard.jsx
import React from "react";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { logout } = useAuth();
  return (
    <div className="p-8">
      <h1 className="text-3xl mb-4">Bienvenido al Dashboard</h1>
      <button
        onClick={logout}
        className="bg-red-600 text-white px-4 py-2 rounded-lg"
      >
        Cerrar sesión
      </button>
    </div>
  );
}
