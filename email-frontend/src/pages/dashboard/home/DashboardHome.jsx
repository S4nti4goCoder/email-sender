import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardLayout from "../../../components/layout/DashboardLayout";
import {
  PaperAirplaneIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@heroicons/react/24/outline";
import { getDashboardStats } from "../../../services/api";
import Alert from "../../../components/ui/Alert";

export default function DashboardHome() {
  const location = useLocation();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 🎯 Estado para el toast de bienvenida
  const [showWelcomeToast, setShowWelcomeToast] = useState(false);
  
  // 🎯 NUEVO: Estado para controlar "Ver más"
  const [showAllActivity, setShowAllActivity] = useState(false);

  useEffect(() => {
    // Verificar ÚNICAMENTE si viene del login por location.state (NO sessionStorage)
    const comesFromLogin = location.state?.fromLogin;
    
    if (comesFromLogin) {
      // Mostrar toast de bienvenida INMEDIATAMENTE
      setShowWelcomeToast(true);
      
      // Limpiar el state para que no persista en el historial
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  useEffect(() => {
    // Cargar datos del dashboard en un useEffect separado
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await getDashboardStats();
      setStats(data.stats);
      setRecentActivity(data.recentActivity);
    } catch (err) {
      console.error("Error loading dashboard:", err);
      setError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  // 🎯 NUEVA FUNCIÓN: Determinar qué actividades mostrar
  const getDisplayedActivity = () => {
    if (showAllActivity) {
      return recentActivity;
    }
    return recentActivity.slice(0, 5); // Solo los primeros 5
  };

  const displayedActivity = getDisplayedActivity();
  const hasMoreActivity = recentActivity.length > 5;

  const getStatsConfig = (stats) => [
    {
      name: "Emails Enviados",
      value: stats?.emailsSent?.value?.toLocaleString() || "0",
      change: stats?.emailsSent?.change || "0%",
      changeType: stats?.emailsSent?.changeType || "neutral",
      icon: PaperAirplaneIcon,
      color: "bg-blue-500",
      tooltip:
        "Incremento comparado con el período anterior (semana/mes pasado)",
    },
    {
      name: "Usuarios Registrados",
      value: stats?.usersRegistered?.value?.toLocaleString() || "0",
      change: stats?.usersRegistered?.change || "0",
      changeType: stats?.usersRegistered?.changeType || "neutral",
      icon: UsersIcon,
      color: "bg-green-500",
      tooltip: "Nuevos usuarios registrados en el período actual",
    },
    {
      name: "Emails Exitosos",
      value: stats?.successfulEmails?.value?.toLocaleString() || "0",
      change: stats?.successfulEmails?.change || "0%",
      changeType: stats?.successfulEmails?.changeType || "neutral",
      icon: CheckCircleIcon,
      color: "bg-emerald-500",
      tooltip: "Porcentaje de éxito en el envío de emails",
    },
    {
      name: "Emails Fallidos",
      value: stats?.failedEmails?.value?.toLocaleString() || "0",
      change: stats?.failedEmails?.change || "0%",
      changeType: stats?.failedEmails?.changeType || "neutral",
      icon: ExclamationTriangleIcon,
      color: "bg-red-500",
      tooltip: "Cambio en emails fallidos comparado con el período anterior",
    },
  ];

  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-2">
            <svg
              className="animate-spin h-8 w-8 text-blue-600"
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
            <span className="text-gray-600 dark:text-gray-400">
              Cargando datos del dashboard...
            </span>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const statsConfig = getStatsConfig(stats);

  return (
    <DashboardLayout title="Dashboard">
      {/* 🎯 Toast de bienvenida - Solo aparece inmediatamente al venir del login */}
      {showWelcomeToast && (
        <Alert
          type="success"
          isToast={true}
          duration={4000}
          onClose={() => setShowWelcomeToast(false)}
        >
          Bienvenido al sistema
        </Alert>
      )}

      <div className="space-y-6">
        {error && (
          <Alert type="error">
            {error}
            <button
              onClick={loadDashboardData}
              className="ml-2 underline hover:no-underline"
            >
              Reintentar
            </button>
          </Alert>
        )}

        {/* Banner de resumen */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">
                Dashboard
              </h2>
              <p className="text-blue-100 text-xl font-medium">
                Aquí tienes un resumen de la actividad de tu sistema de emails.
              </p>
            </div>
            <div className="hidden md:block ml-6">
              <ChartBarIcon className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {statsConfig.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 overflow-visible rounded-lg shadow hover:shadow-md transition-shadow relative"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}
                    >
                      <stat.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="ml-4 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                        {stat.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="ml-2 flex items-baseline">
                          <div
                            className={`flex items-center text-sm font-semibold ${
                              stat.changeType === "positive"
                                ? "text-green-600 dark:text-green-400"
                                : stat.changeType === "negative"
                                ? "text-red-600 dark:text-red-400"
                                : "text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            <span className="group relative cursor-help flex items-center">
                              {stat.change}
                              <InformationCircleIcon className="w-4 h-4 ml-1 opacity-60 hover:opacity-100 transition-opacity" />

                              <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-4 py-3 bg-gray-900 text-white text-sm rounded-xl shadow-2xl w-64 z-[100] border border-gray-700">
                                <div className="font-medium text-white leading-relaxed">
                                  {stat.tooltip}
                                </div>
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-6 border-transparent border-t-gray-900"></div>
                              </div>
                            </span>
                          </div>
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Actividad Reciente
                </h3>
                {/* 🎯 NUEVO: Contador de actividades */}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {showAllActivity 
                    ? `${recentActivity.length} actividades` 
                    : `${Math.min(5, recentActivity.length)} de ${recentActivity.length}`
                  }
                </span>
              </div>
            </div>
            <div className="p-6">
              {recentActivity.length === 0 ? (
                <div className="text-center py-8">
                  <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400">
                    No hay actividad reciente
                  </p>
                  <p className="text-sm text-gray-400 dark:text-gray-500">
                    ¡Envía tu primer email para ver la actividad aquí!
                  </p>
                </div>
              ) : (
                <div className="flow-root">
                  <ul className="-mb-8">
                    {displayedActivity.map((activity, activityIdx) => (
                      <li key={activity.id}>
                        <div className="relative pb-8">
                          {activityIdx !== displayedActivity.length - 1 ? (
                            <span
                              className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-gray-600"
                              aria-hidden="true"
                            />
                          ) : null}
                          <div className="relative flex items-start space-x-3">
                            <div>
                              <div
                                className={`relative px-1 ${
                                  activity.status === "success"
                                    ? "bg-green-500"
                                    : activity.status === "error"
                                    ? "bg-red-500"
                                    : "bg-blue-500"
                                } w-8 h-8 rounded-full flex items-center justify-center ring-8 ring-white dark:ring-gray-800`}
                              >
                                {activity.status === "success" ? (
                                  <CheckCircleIcon className="w-4 h-4 text-white" />
                                ) : activity.status === "error" ? (
                                  <ExclamationTriangleIcon className="w-4 h-4 text-white" />
                                ) : (
                                  <ClockIcon className="w-4 h-4 text-white" />
                                )}
                              </div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <div className="text-sm">
                                  <span className="font-medium text-gray-900 dark:text-white">
                                    {activity.user}
                                  </span>{" "}
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {activity.action}
                                  </span>
                                  {activity.target && (
                                    <>
                                      {" "}
                                      <span className="font-medium text-gray-900 dark:text-white">
                                        {activity.target}
                                      </span>
                                    </>
                                  )}
                                </div>
                                <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                  {activity.time}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                  
                  {/* 🎯 NUEVO: Botón Ver más / Ver menos */}
                  {hasMoreActivity && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <button
                        onClick={() => setShowAllActivity(!showAllActivity)}
                        className="w-full flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors duration-200"
                      >
                        {showAllActivity ? (
                          <>
                            <ChevronUpIcon className="w-4 h-4 mr-2" />
                            Ver menos
                          </>
                        ) : (
                          <>
                            <ChevronDownIcon className="w-4 h-4 mr-2" />
                            Ver más actividades ({recentActivity.length - 5} más)
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Acciones Rápidas
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <a
                href="/dashboard/send"
                className="w-full flex items-center justify-between p-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors group"
              >
                <div className="flex items-center">
                  <PaperAirplaneIcon className="w-6 h-6 mr-3" />
                  <span className="font-medium">Enviar Email</span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </a>

              <a
                href="/dashboard/users"
                className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <UsersIcon className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Gestionar Usuarios
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-300">
                  →
                </div>
              </a>

              <a
                href="/dashboard/templates"
                className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <DocumentTextIcon className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Crear Plantilla
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-300">
                  →
                </div>
              </a>

              <a
                href="/dashboard/stats"
                className="w-full flex items-center justify-between p-4 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors group"
              >
                <div className="flex items-center">
                  <ChartBarIcon className="w-6 h-6 mr-3 text-gray-600 dark:text-gray-300" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Ver Estadísticas
                  </span>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-600 dark:text-gray-300">
                  →
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}