// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { register as apiRegister } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]   = useState({ email: "", password: "", confirm: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      await apiRegister({ email: form.email, password: form.password });
      navigate("/login", { replace: true });
    } catch (err) {
      setError(err.message || "Error al registrarse");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          Registro
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
              minLength={6}
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
              type="password"
              required
              placeholder="••••••••"
              value={form.confirm}
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
          Registrarse
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
