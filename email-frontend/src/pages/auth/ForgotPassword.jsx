import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EnvelopeIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Auto-clear messages after 8 seconds
  useEffect(() => {
    if (!message && !error) return;
    const timer = setTimeout(() => {
      setMessage("");
      setError("");
    }, 8000);
    return () => clearTimeout(timer);
  }, [message, error]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setIsLoading(true);

    try {
      const response = await fetch(
        "http://localhost:3000/api/password-reset/request",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          `📧 Se ha enviado un link de recuperación a ${email}. Revisa tu bandeja de entrada y spam.`
        );
        setEmail(""); // Clear the form
      } else {
        setError(data.error || "Error al solicitar recuperación");
      }
    } catch (err) {
      setError("Error de conexión. Verifica que el servidor esté funcionando.");
    } finally {
      setIsLoading(false);
    }
  };

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
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate("/login")}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Volver al login
          </button>

          <h2 className="text-2xl font-bold mb-2 text-gray-800 text-center">
            ¿Olvidaste tu contraseña?
          </h2>

          <p className="text-gray-600 text-sm text-center mb-6">
            Ingresa tu email y te enviaremos un link para recuperar tu
            contraseña
          </p>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg mb-4 text-center">
              {error}
            </div>
          )}

          {/* Email Input */}
          <div className="mb-6">
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
                placeholder="tu-email@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#082563] disabled:opacity-50"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !email.trim()}
            className={`w-full bg-[#082563] text-white py-2 rounded-lg hover:bg-[#061d47] transition flex items-center justify-center ${
              isLoading || !email.trim()
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
                Enviando...
              </>
            ) : (
              "Enviar link de recuperación"
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
