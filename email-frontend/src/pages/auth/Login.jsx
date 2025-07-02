// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";
import { login as apiLogin } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [bannerType, setBannerType] = useState(null); // "loading" | "expired" | "logout" | "login"
  const [showPassword, setShowPassword] = useState(false);
  const [rememberEmail, setRememberEmail] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load remembered email & handle expired/logout banners
  useEffect(() => {
    const saved = localStorage.getItem("rememberedEmail");
    if (saved) {
      setForm((f) => ({ ...f, email: saved }));
      setRememberEmail(true);
    }

    const { expired, fromLogout } = location.state || {};
    if (fromLogout) {
      setInfo("Has cerrado sesión correctamente.");
      setBannerType("logout");
    } else if (expired) {
      setInfo("🔒 Tu sesión ha expirado. Por favor inicia sesión de nuevo.");
      setBannerType("expired");
    }

    // clear the navigation state so banners don't reappear
    if (expired || fromLogout) {
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, navigate]);

  // Clear banners after 5s
  useEffect(() => {
    if (!info) return;
    const t = setTimeout(() => {
      setInfo("");
      setBannerType(null);
    }, 5000);
    return () => clearTimeout(t);
  }, [info]);

  // Clear error after 5s
  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(""), 5000);
    return () => clearTimeout(t);
  }, [error]);

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  const handleRememberChange = (e) => setRememberEmail(e.target.checked);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // reset any existing banners
    setError("");
    setInfo("");
    setBannerType(null);

    // remember or forget email
    if (rememberEmail) {
      localStorage.setItem("rememberedEmail", form.email);
    } else {
      localStorage.removeItem("rememberedEmail");
    }

    // show loading banner
    setBannerType("loading");
    setInfo("⌛ Ingresando...");
    setIsLoading(true);

    try {
      // API call: extraemos accessToken del objeto
      const { accessToken } = await apiLogin(form);
      login(accessToken); // <-- guardamos el token en contexto

      // success banner
      setBannerType("login");
      setInfo("✔️ Has iniciado sesión correctamente.");

      // wait a moment, then redirect
      setTimeout(() => {
        setIsLoading(false);
        // Marcar que viene del login para mostrar bienvenida
        sessionStorage.setItem("fromLogin", "true");
        navigate("/dashboard", {
          replace: true,
          state: { fromLogin: true },
        });
      }, 2000);
    } catch (err) {
      // on error, clear loading/banner info and show error
      setIsLoading(false);
      setInfo(""); // hide any info banner
      setBannerType(null);
      setError(err.response?.data?.error || "Error de autenticación");
    }
  };

  // banner styling map
  const bannerClasses =
    bannerType === "loading"
      ? "bg-gray-100 border border-gray-300 text-gray-800"
      : bannerType === "expired"
      ? "bg-yellow-100 border border-yellow-300 text-yellow-800"
      : bannerType === "logout"
      ? "bg-blue-100 border border-blue-300 text-blue-800"
      : bannerType === "login"
      ? "bg-green-100 border border-green-300 text-green-800"
      : "";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* Only show info banner when there's no error */}
        {!error && info && (
          <div
            className={`${bannerClasses} px-4 py-2 rounded mb-4 flex items-center justify-center space-x-2`}
            role="status"
          >
            {bannerType === "loading" && (
              <svg
                className="animate-spin h-5 w-5 text-gray-800"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v8H4z"
                />
              </svg>
            )}
            <span>{info}</span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">
            Inicio de sesión
          </h2>

          {/* Error banner */}
          {error && (
            <div
              className="bg-red-100 border border-red-300 text-red-800 px-4 py-2 rounded mb-4 text-center"
              role="alert"
            >
              {error}
            </div>
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
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Remember email */}
          <div className="mb-4 flex items-center">
            <input
              id="remember"
              type="checkbox"
              checked={rememberEmail}
              onChange={handleRememberChange}
              disabled={isLoading}
              className="h-4 w-4 accent-[#082563] border-2 border-[#082563] rounded cursor-pointer disabled:opacity-50"
            />
            <label
              htmlFor="remember"
              className="ml-2 block text-gray-700 text-sm cursor-pointer"
            >
              Recordar correo electrónico
            </label>
          </div>

          {/* Password */}
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

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-[#082563] text-white py-2 rounded-lg hover:bg-[#061d47] transition ${
              isLoading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            Ingresar
          </button>

          {/* Links */}
          <p className="mt-4 text-center text-gray-600 text-sm">
            <span
              onClick={() => navigate("/forgot-password")}
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
    </div>
  );
}
