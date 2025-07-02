import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
} from "@heroicons/react/24/outline";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [tokenInfo, setTokenInfo] = useState(null);

  // Password strength meter
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

  // Real-time password mismatch detection
  const [isMismatch, setIsMismatch] = useState(false);
  useEffect(() => {
    setIsMismatch(
      form.confirmPassword.length > 0 &&
        form.newPassword !== form.confirmPassword
    );
  }, [form.newPassword, form.confirmPassword]);

  // Auto-clear messages
  useEffect(() => {
    if (!message && !error) return;
    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 8000);
    return () => clearTimeout(timer);
  }, [message, error]);

  // Validate token on component mount
  useEffect(() => {
    if (!token) {
      setError("Token de recuperación no encontrado en la URL");
      setIsValidating(false);
      return;
    }

    validateToken();
  }, [token]);

  const validateToken = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/password-reset/validate/${token}`
      );
      const data = await response.json();

      if (response.ok) {
        setTokenInfo(data);
        setMessage(
          `✅ Token válido. Puedes crear una nueva contraseña para: ${data.email}`
        );
      } else {
        setError(data.error || "Token inválido o expirado");
      }
    } catch (err) {
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setIsValidating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setError("");
    setMessage("");

    if (name === "newPassword") {
      setStrength(getPasswordStrength(value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/password-reset/reset",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            token,
            newPassword: form.newPassword,
            confirmPassword: form.confirmPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "✅ ¡Contraseña actualizada exitosamente! Redirigiendo al login..."
        );
        setTimeout(() => {
          navigate("/login", {
            replace: true,
            state: { fromPasswordReset: true },
          });
        }, 3000);
      } else {
        setError(data.error || "Error al actualizar la contraseña");
      }
    } catch (err) {
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading screen while validating token
  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <div className="flex items-center justify-center mb-4">
            <svg
              className="animate-spin h-8 w-8 text-[#082563]"
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
          </div>
          <p className="text-gray-600">Validando token de recuperación...</p>
        </div>
      </div>
    );
  }

  // Show error screen if token is invalid
  if (error && !tokenInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md w-full">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Token Inválido
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={() => navigate("/forgot-password")}
              className="w-full bg-[#082563] text-white py-2 rounded-lg hover:bg-[#061d47] transition"
            >
              Solicitar nuevo link
            </button>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition"
            >
              Volver al login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        {/* Success Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6 text-center">
            {message}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-lg"
        >
          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
            Nueva Contraseña
          </h2>

          {tokenInfo && (
            <p className="text-gray-600 text-sm text-center mb-6">
              Creando nueva contraseña para: <strong>{tokenInfo.email}</strong>
            </p>
          )}

          {/* Error Message */}
          {error && tokenInfo && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {/* New Password */}
          <div className="mb-2">
            <label
              htmlFor="newPassword"
              className="block text-gray-700 mb-1 text-sm font-medium"
            >
              Nueva contraseña
            </label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="newPassword"
                name="newPassword"
                type={showPassword ? "text" : "password"}
                autoFocus
                required
                placeholder="••••••••"
                value={form.newPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
              />
              <button
                type="button"
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

          {/* Password Strength Meter */}
          {form.newPassword && (
            <div className="mb-4">
              <div className="h-1 w-full bg-gray-200 rounded">
                <div
                  className={`${strengthColors[strength]} h-1 rounded transition-all duration-300`}
                  style={{ width: `${(strength / 4) * 100}%` }}
                />
              </div>
              <p className="mt-1 text-xs text-gray-600">
                {strengthLabels[strength]}
              </p>
            </div>
          )}

          {/* Confirm Password */}
          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="block text-gray-700 mb-1 text-sm font-medium"
            >
              Confirmar nueva contraseña
            </label>
            <div className="relative">
              <LockClosedIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirm ? "text" : "password"}
                required
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={isMismatch}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
              />
              <button
                type="button"
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
              <p className="text-red-500 text-sm mt-1">
                Las contraseñas no coinciden
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={
              isLoading ||
              isMismatch ||
              !form.newPassword ||
              !form.confirmPassword
            }
            className={`w-full bg-[#082563] text-white py-2 rounded-lg hover:bg-[#061d47] transition flex items-center justify-center ${
              isLoading ||
              isMismatch ||
              !form.newPassword ||
              !form.confirmPassword
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2"
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
                Actualizando...
              </>
            ) : (
              "Actualizar contraseña"
            )}
          </button>

          {/* Additional Links */}
          <div className="mt-6 text-center">
            <p className="text-gray-600 text-sm">
              ¿Recordaste tu contraseña?{" "}
              <span
                onClick={() => navigate("/login")}
                className="text-[#082563] hover:underline cursor-pointer font-medium"
              >
                Iniciar sesión
              </span>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
