// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { login as apiLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth(); 
  const [form, setForm]   = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await apiLogin(form);
      login(data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Error de autenticación");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Inicio de sesión
        </h2>
        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-gray-700 mb-1 text-sm font-medium"
          >
            Correo electrónico
          </label>
          <div className="relative">
            <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="email"
              name="email"
              type="email"
              autoFocus
              required
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="
                w-full
                pl-10 pr-4 py-2
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#082563]
              "
            />
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="password"
            className="block text-gray-700 mb-1 text-sm font-medium"
          >
            Contraseña
          </label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="
                w-full
                pl-10 pr-4 py-2
                border border-gray-300 rounded-lg
                focus:outline-none focus:ring-2 focus:ring-[#082563]
              "
            />
          </div>
        </div>

        <button
          type="submit"
          className="
            w-full
            bg-[#082563] text-white py-2 rounded-lg
            hover:bg-[#061d47] transition cursor-pointer
          "
        >
          Ingresar
        </button>

        <p className="mt-4 text-center text-gray-600 text-sm">
          <span
            onClick={() => alert("Funcionalidad no implementada")}
            className="text-[#082563] hover:underline cursor-pointer font-medium"
          >
            ¿Olvidaste tu contraseña?
          </span>
        </p>

        <p className="mt-2 text-center text-gray-600 text-sm">
          ¿No tienes cuenta?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-[#082563] hover:underline cursor-pointer font-medium"
          >
            Regístrate
          </span>
        </p>
      </form>
    </div>
);
}
