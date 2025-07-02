import React from "react";
import DashboardLayout from "../../components/layout/DashboardLayout";
import {
  PaperAirplaneIcon,
  UsersIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  ClockIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";

export default function DashboardHome() {
  // Mock data for dashboard stats
  const stats = [
    {
      name: "Emails Enviados",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: PaperAirplaneIcon,
      color: "bg-blue-500",
    },
    {
      name: "Usuarios Registrados",
      value: "89",
      change: "+3",
      changeType: "positive",
      icon: UsersIcon,
      color: "bg-green-500",
    },
    {
      name: "Emails Exitosos",
      value: "1,198",
      change: "96.1%",
      changeType: "positive",
      icon: CheckCircleIcon,
      color: "bg-emerald-500",
    },
    {
      name: "Emails Fallidos",
      value: "49",
      change: "-8%",
      changeType: "negative",
      icon: ExclamationTriangleIcon,
      color: "bg-red-500",
    },
  ];

  // Mock recent activity
  const recentActivity = [
    {
      id: 1,
      user: "Santiago García",
      action: "envió un email",
      target: "marketing@empresa.com",
      time: "hace 2 minutos",
      status: "success",
    },
    {
      id: 2,
      user: "María López",
      action: "se registró en el sistema",
      target: "",
      time: "hace 15 minutos",
      status: "info",
    },
    {
      id: 3,
      user: "Carlos Ruiz",
      action: "falló al enviar email",
      target: "invalid@domain.com",
      time: "hace 32 minutos",
      status: "error",
    },
    {
      id: 4,
      user: "Ana Martínez",
      action: "creó una plantilla",
      target: "Bienvenida Clientes",
      time: "hace 1 hora",
      status: "success",
    },
  ];

  return (
    <DashboardLayout title="Dashboard">
      <div className="space-y-6">
        {/* Welcome Message */}
        <div className="bg-gradient-to-r from-[#082563] to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">¡Bienvenido de vuelta!</h2>
              <p className="text-blue-100">
                Aquí tienes un resumen de la actividad de tu sistema de emails.
              </p>
            </div>
            <div className="hidden md:block">
              <ChartBarIcon className="w-16 h-16 text-blue-200" />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.name}
              className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center`}>
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
                        <div
                          className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.changeType === "positive"
                              ? "text-green-600 dark:text-green-400"
                              : "text-red-600 dark:text-red-400"
                          }`}
                        >
                          {stat.change}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Actividad Reciente
              </h3>
            </div>
            <div className="p-6">
              <div className="flow-root">
                <ul className="-mb-8">
                  {recentActivity.map((activity, activityIdx) => (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
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
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Acciones Rápidas
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <a
                href="/dashboard/send"
                className="w-full flex items-center justify-between p-4 bg-[#082563] hover:bg-blue-700 rounded-lg text-white transition-colors group"
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
                  <span className="font-medium text-gray-900 dark:text-white">Gestionar Usuarios</span>
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
                  <span className="font-medium text-gray-900 dark:text-white">Crear Plantilla</span>
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
                  <span className="font-medium text-gray-900 dark:text-white">Ver Estadísticas</span>
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