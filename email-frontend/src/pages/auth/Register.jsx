// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { register as apiRegister } from "../../services/api";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fuerza de contraseña
  const [strength, setStrength] = useState(0);
  const getPasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };
  const strengthLabels = [
    "Muy débil",
    "Débil",
    "Medio",
    "Fuerte",
    "Muy fuerte",
  ];
  const strengthColors = [
    "bg-red-500",
    "bg-red-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-green-700",
  ];

  // Detecta mismatch en tiempo real
  const [isMismatch, setIsMismatch] = useState(false);
  useEffect(() => {
    setIsMismatch(form.confirm.length > 0 && form.password !== form.confirm);
  }, [form.password, form.confirm]);

  // auto-clear error a los 5s
  useEffect(() => {
    if (!error) return;
    const tid = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(tid);
  }, [error]);

  // auto-clear success (antes de redirigir)
  useEffect(() => {
    if (!success) return;
    const tid = setTimeout(() => setSuccess(""), 5000);
    return () => clearTimeout(tid);
  }, [success]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    setSuccess("");
    if (name === "password") setStrength(getPasswordStrength(value));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);
    try {
      await apiRegister({
        email: form.email,
        password: form.password,
      });
      setSuccess("✅ ¡Registro exitoso! Redirigiendo al login...");
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      // mostramos el mensaje que venga del servidor o un fallback
      setError(
        err.response?.data?.error || err.message || "Error al registrarse"
      );
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
          Registro
        </h2>

        {/* Error */}
        {error && (
          <p role="alert" className="text-red-500 mb-4 text-center">
            {error}
          </p>
        )}
        {/* Success */}
        {success && (
          <p role="status" className="text-green-600 mb-4 text-center">
            {success}
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
              disabled={isLoading}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
            />
          </div>
        </div>

        {/* Contraseña */}
        <div className="mb-2">
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
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
            />
            <button
              type="button"
              aria-label={
                showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowPassword((v) => !v)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
            >
              {showPassword ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Medidor de fuerza */}
        {form.password && (
          <div className="mb-4">
            <div className="h-1 w-full bg-gray-200 rounded">
              <div
                className={`${strengthColors[strength]} h-1 rounded`}
                style={{ width: `${(strength / 4) * 100}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-gray-600">
              {strengthLabels[strength]}
            </p>
          </div>
        )}

        {/* Confirmar contraseña */}
        <div className="mb-6">
          <label
            htmlFor="confirm"
            className="block text-gray-700 mb-1 text-sm font-medium"
          >
            Confirmar contraseña
          </label>
          <div className="relative">
            <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="confirm"
              name="confirm"
              type={showConfirm ? "text" : "password"}
              required
              aria-invalid={isMismatch}
              aria-describedby={isMismatch ? "confirm-error" : undefined}
              placeholder="••••••••"
              value={form.confirm}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
            />
            <button
              type="button"
              aria-label={
                showConfirm ? "Ocultar contraseña" : "Mostrar contraseña"
              }
              onClick={() => setShowConfirm((v) => !v)}
              disabled={isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 cursor-pointer text-gray-400 hover:text-gray-600 rounded disabled:opacity-50"
            >
              {showConfirm ? (
                <EyeSlashIcon className="w-5 h-5" />
              ) : (
                <EyeIcon className="w-5 h-5" />
              )}
            </button>
          </div>
          {isMismatch && (
            <p
              id="confirm-error"
              role="alert"
              className="text-red-500 text-sm mt-1"
            >
              Las contraseñas no coinciden
            </p>
          )}
        </div>

        {/* Botón */}
        <button
          type="submit"
          disabled={isLoading || isMismatch}
          className={`w-full bg-[#082563] text-white py-2 rounded-lg hover:bg-[#061d47] transition ${
            isLoading || isMismatch
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer"
          }`}
        >
          {isLoading ? "Cargando..." : "Registrarse"}
        </button>

        <p className="mt-4 text-center text-gray-600 text-sm">
          ¿Ya tienes cuenta?{" "}
          <span
            onClick={() => navigate("/login", { replace: true })}
            className="text-[#082563] hover:underline cursor-pointer font-medium"
          >
            Inicia sesión
          </span>
        </p>
      </form>
    </div>
  );
}
