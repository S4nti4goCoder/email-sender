// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { login as apiLogin } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);

  // Cargo email guardado y chequeo de expiración
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setForm((f) => ({ ...f, email: saved }));
      setRememberEmail(true);
    }
    if (location.state?.expired) {
      setInfo("🔒 Tu sesión ha expirado. Por favor inicia sesión de nuevo.");
    }
  }, [location.state]);

  // auto-clear info a los 5s
  useEffect(() => {
    if (!info) return;
    const tid = setTimeout(() => setInfo(""), 5000);
    return () => clearTimeout(tid);
  }, [info]);

  // auto-clear error a los 5s
  useEffect(() => {
    if (!error) return;
    const tid = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(tid);
  }, [error]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleRememberChange = (e) => setRememberEmail(e.target.checked);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setInfo("");
    if (rememberEmail) {
      localStorage.setItem("rememberedEmail", form.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }
    setIsLoading(true);
    try {
      const data = await apiLogin(form);
      login(data.token);
    } catch (err) {
      setError(err.response?.data?.error || "Error de autenticación");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        aria-live="polite"
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Inicio de sesión
        </h2>

        {/** INFO banner **/}
        {info && (
          <div className="bg-yellow-100 border border-yellow-300 text-yellow-800 px-4 py-2 rounded mb-4 text-center">
            {info}
          </div>
        )}
        {/** ERROR banner **/}
        {error && (
          <p role="alert" className="text-red-500 mb-4 text-center">
            {error}
          </p>
        )}

        {/* Email */}
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
              aria-required="true"
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563]"
            />
          </div>
        </div>

        {/* Recordar correo */}
        <div className="mb-4 flex items-center">
          <input
            id="remember"
            type="checkbox"
            checked={rememberEmail}
            onChange={handleRememberChange}
            className="h-4 w-4 accent-[#082563] border-2 border-[#082563] rounded cursor-pointer"
          />
          <label
            htmlFor="remember"
            className="ml-2 block text-gray-700 text-sm cursor-pointer"
          >
            Recordar correo electrónico
          </label>
        </div>

        {/* Contraseña */}
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
              type={showPassword ? "text" : "password"}
              required
              aria-required="true"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563]"
            />
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer text-gray-400 hover:text-gray-600 rounded"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full bg-[#082563] text-white py-2 rounded-lg hover:bg-[#061d47] transition ${
            isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
          }`}
        >
          {isLoading ? "Cargando..." : "Ingresar"}
        </button>

        {/* Olvidaste tu contraseña */}
        <p className="mt-4 text-center text-gray-600 text-sm">
          <span
            onClick={() => alert("Funcionalidad no implementada")}
            className="text-[#082563] hover:underline cursor-pointer font-medium"
          >
            ¿Olvidaste tu contraseña?
          </span>
        </p>

        {/* Regístrate */}
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
