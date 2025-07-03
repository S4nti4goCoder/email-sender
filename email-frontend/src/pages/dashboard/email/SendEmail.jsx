import React, { useState, useEffect } from "react";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  PaperAirplaneIcon,
  EnvelopeIcon,
  DocumentTextIcon,
  PaperClipIcon,
  CalendarDaysIcon,
  UserIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  InformationCircleIcon,
  ClockIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import {
  sendEmail,
  getSystemStatus,
  getScheduledStats,
  cancelScheduledEmail,
} from "../../../services/api";
import Alert from "../../../components/ui/Alert";

export default function SendEmail() {
  const [form, setForm] = useState({
    recipient: "",
    subject: "",
    message: "",
    attachment: "",
    scheduled_for: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  // 🎯 Estado del sistema dinámico
  const [systemStatus, setSystemStatus] = useState({
    server: { status: "checking", emailServer: { status: "checking" } },
    user: { emailsInQueue: 0, lastActivity: "Cargando...", emailsToday: 0 },
    timestamp: null,
  });

  // 🎯 NUEVO: Estado para emails programados
  const [scheduledStats, setScheduledStats] = useState({
    pending: 0,
    sent: 0,
    failed: 0,
    nextEmail: null,
  });

  const [systemLoading, setSystemLoading] = useState(true);
  const [scheduledLoading, setScheduledLoading] = useState(true);

  // Validaciones en tiempo real
  const [validations, setValidations] = useState({
    recipient: { isValid: true, message: "" },
    subject: { isValid: true, message: "" },
    message: { isValid: true, message: "" },
    scheduled_for: { isValid: true, message: "" },
  });

  // 🎯 Cargar estado del sistema
  useEffect(() => {
    loadSystemStatus();
    loadScheduledStats();
    // Actualizar cada 30 segundos
    const interval = setInterval(() => {
      loadSystemStatus();
      loadScheduledStats();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadSystemStatus = async () => {
    try {
      setSystemLoading(true);
      const status = await getSystemStatus();
      setSystemStatus(status);
    } catch (err) {
      console.error("Error loading system status:", err);
      setSystemStatus((prev) => ({
        ...prev,
        server: { status: "error", emailServer: { status: "error" } },
        user: { ...prev.user, lastActivity: "Error al cargar" },
      }));
    } finally {
      setSystemLoading(false);
    }
  };

  // 🎯 NUEVO: Cargar estadísticas de emails programados
  const loadScheduledStats = async () => {
    try {
      setScheduledLoading(true);
      const stats = await getScheduledStats();
      setScheduledStats(stats);
    } catch (err) {
      console.error("Error loading scheduled stats:", err);
    } finally {
      setScheduledLoading(false);
    }
  };

  // Auto-clear messages after 5 seconds
  useEffect(() => {
    if (!success && !error) return;
    const timer = setTimeout(() => {
      setSuccess("");
      setError("");
    }, 5000);
    return () => clearTimeout(timer);
  }, [success, error]);

  // Validar email en tiempo real
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      return { isValid: false, message: "El email es requerido" };
    }
    if (!emailRegex.test(email)) {
      return { isValid: false, message: "Formato de email inválido" };
    }
    return { isValid: true, message: "" };
  };

  // 🎯 NUEVO: Validar fecha programada
  const validateScheduledDate = (dateString) => {
    if (!dateString) return { isValid: true, message: "" };

    const scheduledDate = new Date(dateString);
    const now = new Date();

    if (scheduledDate <= now) {
      return { isValid: false, message: "La fecha debe ser futura" };
    }

    // No permitir fechas muy lejanas (más de 1 año)
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);

    if (scheduledDate > maxDate) {
      return {
        isValid: false,
        message: "No se puede programar con más de 1 año de anticipación",
      };
    }

    return { isValid: true, message: "" };
  };

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    // Limpiar mensajes al cambiar el formulario
    setError("");
    setSuccess("");

    // Validaciones en tiempo real
    if (name === "recipient") {
      setValidations((prev) => ({
        ...prev,
        recipient: validateEmail(value),
      }));
    }

    if (name === "subject") {
      setValidations((prev) => ({
        ...prev,
        subject: {
          isValid: value.trim().length > 0,
          message: value.trim().length === 0 ? "El asunto es requerido" : "",
        },
      }));
    }

    if (name === "message") {
      setValidations((prev) => ({
        ...prev,
        message: {
          isValid: value.trim().length > 0,
          message: value.trim().length === 0 ? "El mensaje es requerido" : "",
        },
      }));
    }

    // 🎯 NUEVO: Validar fecha programada
    if (name === "scheduled_for") {
      setValidations((prev) => ({
        ...prev,
        scheduled_for: validateScheduledDate(value),
      }));
    }
  };

  // Verificar si el formulario es válido
  const isFormValid = () => {
    return (
      validations.recipient.isValid &&
      validations.subject.isValid &&
      validations.message.isValid &&
      validations.scheduled_for.isValid &&
      form.recipient.trim() &&
      form.subject.trim() &&
      form.message.trim()
    );
  };

  // 🎯 NUEVO: Función para cancelar email programado
  const handleCancelScheduled = async (emailId) => {
    try {
      await cancelScheduledEmail(emailId);
      setSuccess("Email programado cancelado exitosamente");
      // Recargar estadísticas
      loadScheduledStats();
      loadSystemStatus();
    } catch (err) {
      setError("Error al cancelar el email programado");
    }
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validación final
    if (!isFormValid()) {
      setError("Por favor completa todos los campos requeridos correctamente");
      return;
    }

    setIsLoading(true);

    try {
      const emailData = {
        recipient: form.recipient.trim(),
        subject: form.subject.trim(),
        message: form.message.trim(),
        attachment: form.attachment.trim() || null,
        scheduled_for: form.scheduled_for || null,
      };

      await sendEmail(emailData);

      // 🎯 NUEVO: Mensaje diferente para emails programados vs inmediatos
      if (form.scheduled_for) {
        const scheduledDate = new Date(form.scheduled_for);
        setSuccess(
          `📅 Email programado exitosamente para ${scheduledDate.toLocaleString()}`
        );
      } else {
        setSuccess(`✅ Email enviado exitosamente a ${form.recipient}`);
      }

      // Limpiar formulario después del éxito
      setForm({
        recipient: "",
        subject: "",
        message: "",
        attachment: "",
        scheduled_for: "",
      });

      // Reset validations
      setValidations({
        recipient: { isValid: true, message: "" },
        subject: { isValid: true, message: "" },
        message: { isValid: true, message: "" },
        scheduled_for: { isValid: true, message: "" },
      });

      // 🎯 Actualizar estadísticas después del envío/programación
      setTimeout(() => {
        loadSystemStatus();
        loadScheduledStats();
      }, 1000);
    } catch (err) {
      console.error("Error sending email:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "Error al enviar el email. Intenta de nuevo."
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Plantillas predefinidas
  const templates = [
    {
      name: "Bienvenida",
      subject: "¡Bienvenido a nuestro sistema!",
      message:
        "Hola,\n\n¡Te damos la bienvenida a EmailApp! Estamos emocionados de tenerte con nosotros.\n\nSi tienes alguna pregunta, no dudes en contactarnos.\n\n¡Saludos!",
    },
    {
      name: "Seguimiento",
      subject: "Seguimiento de tu consulta",
      message:
        "Hola,\n\nEsperamos que te encuentres bien. Te escribimos para hacer seguimiento a tu consulta.\n\n¿Hay algo en lo que podamos ayudarte?\n\nQuedamos atentos a tu respuesta.",
    },
    {
      name: "Agradecimiento",
      subject: "¡Gracias por tu tiempo!",
      message:
        "Hola,\n\nQueremos agradecerte por el tiempo que dedicaste a nuestra reunión de hoy.\n\nValoramos mucho tu participación y esperamos continuar trabajando juntos.\n\n¡Saludos!",
    },
  ];

  const applyTemplate = (template) => {
    setForm((prev) => ({
      ...prev,
      subject: template.subject,
      message: template.message,
    }));

    // Update validations
    setValidations((prev) => ({
      ...prev,
      subject: { isValid: true, message: "" },
      message: { isValid: true, message: "" },
    }));
  };

  // Funciones para formatear el estado del servidor
  const getServerStatusColor = (status) => {
    switch (status) {
      case "online":
      case "connected":
      case "configured":
        return "text-green-600 dark:text-green-400";
      case "error":
        return "text-red-600 dark:text-red-400";
      case "checking":
        return "text-yellow-600 dark:text-yellow-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  const getServerStatusText = (status) => {
    switch (status) {
      case "online":
        return "Activo";
      case "connected":
        return "Conectado";
      case "configured":
        return "Configurado";
      case "error":
        return "Error";
      case "checking":
        return "Verificando...";
      default:
        return "Desconocido";
    }
  };

  const getServerStatusIcon = (status) => {
    switch (status) {
      case "online":
      case "connected":
      case "configured":
        return <CheckCircleIcon className="w-4 h-4 text-green-500 mr-1" />;
      case "error":
        return (
          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mr-1" />
        );
      case "checking":
        return (
          <svg
            className="animate-spin h-4 w-4 text-yellow-500 mr-1"
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
        );
      default:
        return (
          <ExclamationTriangleIcon className="w-4 h-4 text-gray-500 mr-1" />
        );
    }
  };

  return (
    <DashboardLayout title="Enviar Email">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center">
            <PaperAirplaneIcon className="w-8 h-8 mr-3" />
            <div>
              <h1 className="text-2xl font-bold">Enviar Email</h1>
              <p className="text-blue-100">
                Redacta y envía emails de forma profesional
              </p>
            </div>
          </div>
        </div>

        {/* Messages */}
        {success && <Alert type="success">{success}</Alert>}
        {error && <Alert type="error">{error}</Alert>}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Nuevo Email
                </h2>
              </div>

              <div className="p-6 space-y-6">
                {/* Recipient */}
                <div>
                  <label
                    htmlFor="recipient"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Destinatario *
                  </label>
                  <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      id="recipient"
                      name="recipient"
                      required
                      autoFocus
                      placeholder="destinatario@ejemplo.com"
                      value={form.recipient}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                        validations.recipient.isValid
                          ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                          : "border-red-300 focus:ring-red-500"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                  </div>
                  {!validations.recipient.isValid && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validations.recipient.message}
                    </p>
                  )}
                </div>

                {/* Subject */}
                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Asunto *
                  </label>
                  <div className="relative">
                    <DocumentTextIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder="Escribe el asunto del email"
                      value={form.subject}
                      onChange={handleChange}
                      disabled={isLoading}
                      className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                        validations.subject.isValid
                          ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                          : "border-red-300 focus:ring-red-500"
                      } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                    />
                  </div>
                  {!validations.subject.isValid && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validations.subject.message}
                    </p>
                  )}
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={8}
                    placeholder="Escribe tu mensaje aquí..."
                    value={form.message}
                    onChange={handleChange}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 resize-y ${
                      validations.message.isValid
                        ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                        : "border-red-300 focus:ring-red-500"
                    } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                  />
                  {!validations.message.isValid && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {validations.message.message}
                    </p>
                  )}
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Caracteres: {form.message.length}
                  </p>
                </div>

                {/* Optional Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Attachment (placeholder) */}
                  <div>
                    <label
                      htmlFor="attachment"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Adjunto (opcional)
                    </label>
                    <div className="relative">
                      <PaperClipIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        id="attachment"
                        name="attachment"
                        placeholder="URL del archivo (futuro)"
                        value={form.attachment}
                        onChange={handleChange}
                        disabled={isLoading}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* 🎯 NUEVO: Scheduled (ahora funcional) */}
                  <div>
                    <label
                      htmlFor="scheduled_for"
                      className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Programar envío (opcional)
                    </label>
                    <div className="relative">
                      <CalendarDaysIcon className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="datetime-local"
                        id="scheduled_for"
                        name="scheduled_for"
                        value={form.scheduled_for}
                        onChange={handleChange}
                        disabled={isLoading}
                        min={new Date().toISOString().slice(0, 16)} // No permitir fechas pasadas
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 disabled:opacity-50 ${
                          validations.scheduled_for.isValid
                            ? "border-gray-300 dark:border-gray-600 focus:ring-blue-500"
                            : "border-red-300 focus:ring-red-500"
                        } bg-white dark:bg-gray-700 text-gray-900 dark:text-white`}
                      />
                    </div>
                    {!validations.scheduled_for.isValid && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {validations.scheduled_for.message}
                      </p>
                    )}
                    {form.scheduled_for &&
                      validations.scheduled_for.isValid && (
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                          📅 Se enviará:{" "}
                          {new Date(form.scheduled_for).toLocaleString()}
                        </p>
                      )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                  <button
                    type="submit"
                    disabled={isLoading || !isFormValid()}
                    className={`flex-1 flex items-center justify-center px-6 py-3 rounded-lg text-white font-medium transition-colors ${
                      isLoading || !isFormValid()
                        ? "bg-gray-400 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
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
                        {form.scheduled_for ? "Programando..." : "Enviando..."}
                      </>
                    ) : (
                      <>
                        {form.scheduled_for ? (
                          <>
                            <ClockIcon className="w-5 h-5 mr-2" />
                            Programar Email
                          </>
                        ) : (
                          <>
                            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                            Enviar Email
                          </>
                        )}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    disabled={isLoading}
                    className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
                  >
                    <EyeIcon className="w-5 h-5 mr-2 inline" />
                    {showPreview ? "Ocultar" : "Previsualizar"}
                  </button>
                </div>
              </div>
            </form>

            {/* Preview */}
            {showPreview && (
              <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg shadow">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Vista previa del email
                  </h3>
                </div>
                <div className="p-6">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Para:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {form.recipient || "destinatario@ejemplo.com"}
                      </span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Asunto:{" "}
                      </span>
                      <span className="text-gray-900 dark:text-white">
                        {form.subject || "Sin asunto"}
                      </span>
                    </div>
                    {form.scheduled_for && (
                      <div>
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                          Programado para:{" "}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 font-medium">
                          📅 {new Date(form.scheduled_for).toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Mensaje:
                      </span>
                      <div className="mt-2 p-3 bg-white dark:bg-gray-800 rounded border text-gray-900 dark:text-white whitespace-pre-wrap">
                        {form.message || "Sin mensaje"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Templates */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Plantillas
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {templates.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => applyTemplate(template)}
                    disabled={isLoading}
                    className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
                  >
                    <div className="font-medium text-gray-900 dark:text-white text-sm">
                      {template.name}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
                      {template.subject}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 🎯 NUEVO: Emails Programados */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Emails Programados
                  </h3>
                  {scheduledLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-gray-400"
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
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
                    <div className="text-lg font-bold text-yellow-600 dark:text-yellow-400">
                      {scheduledStats.pending}
                    </div>
                    <div className="text-xs text-yellow-600 dark:text-yellow-400">
                      Pendientes
                    </div>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <div className="text-lg font-bold text-green-600 dark:text-green-400">
                      {scheduledStats.sent}
                    </div>
                    <div className="text-xs text-green-600 dark:text-green-400">
                      Enviados
                    </div>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                    <div className="text-lg font-bold text-red-600 dark:text-red-400">
                      {scheduledStats.failed}
                    </div>
                    <div className="text-xs text-red-600 dark:text-red-400">
                      Fallidos
                    </div>
                  </div>
                </div>

                {/* Próximo email programado */}
                {scheduledStats.nextEmail ? (
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-blue-900 dark:text-blue-200">
                          Próximo envío:
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                          📧 {scheduledStats.nextEmail.recipient}
                        </div>
                        <div className="text-xs text-blue-700 dark:text-blue-300">
                          📝 {scheduledStats.nextEmail.subject}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                          🕒{" "}
                          {new Date(
                            scheduledStats.nextEmail.scheduled_for
                          ).toLocaleString()}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleCancelScheduled(scheduledStats.nextEmail.id)
                        }
                        className="ml-2 p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        title="Cancelar email programado"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 dark:text-gray-400 text-sm py-4">
                    {scheduledStats.pending === 0
                      ? "No hay emails programados"
                      : "Cargando..."}
                  </div>
                )}
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
              <div className="flex items-start">
                <InformationCircleIcon className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                    Consejos para emails efectivos
                  </h4>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Usa un asunto claro y descriptivo</li>
                    <li>• Mantén el mensaje conciso</li>
                    <li>• Incluye un saludo y despedida</li>
                    <li>• Revisa antes de enviar</li>
                    <li>• 📅 Programa emails para momentos óptimos</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Estado del sistema dinámico */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Estado del sistema
                  </h3>
                  {systemLoading && (
                    <svg
                      className="animate-spin h-4 w-4 text-gray-400"
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
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Estado del servidor
                  </span>
                  <div
                    className={`flex items-center ${getServerStatusColor(
                      systemStatus.server.status
                    )}`}
                  >
                    {getServerStatusIcon(systemStatus.server.status)}
                    <span className="text-sm">
                      {getServerStatusText(systemStatus.server.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Emails en cola
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {systemStatus.user.emailsInQueue}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Emails hoy
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {systemStatus.user.emailsToday}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Última actividad
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {systemStatus.user.lastActivity}
                  </span>
                </div>

                {/* Email Server Status */}
                <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Servidor de email
                    </span>
                    <div
                      className={`flex items-center ${getServerStatusColor(
                        systemStatus.server.emailServer.status
                      )}`}
                    >
                      {getServerStatusIcon(
                        systemStatus.server.emailServer.status
                      )}
                      <span className="text-sm">
                        {getServerStatusText(
                          systemStatus.server.emailServer.status
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
