import React, { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import {
  HomeIcon,
  UsersIcon,
  PaperAirplaneIcon,
  InboxIcon,
  ChartBarIcon,
  DocumentTextIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  WrenchScrewdriverIcon,
} from "@heroicons/react/24/outline";

export default function DashboardLayout({ children, title = "Dashboard" }) {
  const { logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle theme
  const toggleTheme = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // Mock user data (replace with real user data from context)
  const currentUser = {
    name: "Santiago García",
    email: "santiago@example.com",
    role: "Admin",
    avatar: null, // We'll use initials for now
  };

  // Navigation items
  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: HomeIcon, current: title === "Dashboard" },
    { name: "Usuarios", href: "/dashboard/users", icon: UsersIcon, current: title === "Usuarios", adminOnly: true },
    { name: "Enviar Email", href: "/dashboard/send", icon: PaperAirplaneIcon, current: title === "Enviar Email" },
    { name: "Emails Enviados", href: "/dashboard/emails", icon: InboxIcon, current: title === "Emails Enviados" },
    { name: "Estadísticas", href: "/dashboard/stats", icon: ChartBarIcon, current: title === "Estadísticas" },
    { name: "Plantillas", href: "/dashboard/templates", icon: DocumentTextIcon, current: title === "Plantillas" },
    { name: "Config. Sistema", href: "/dashboard/config", icon: CogIcon, current: title === "Configuración", adminOnly: true },
  ];

  // Filter navigation based on user role (for now, show all)
  const filteredNavigation = navigation; // TODO: Filter based on user role

  // User dropdown items
  const userNavigation = [
    { name: "Mi Perfil", href: "/profile" },
    { name: "Mi Configuración", href: "/profile/settings" },
    { name: "Mi Actividad", href: "/profile/activity" },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userDropdownOpen && !event.target.closest("#user-dropdown")) {
        setUserDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [userDropdownOpen]);

  return (
    <div className={`${darkMode ? "dark" : ""}`}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        {/* Mobile sidebar backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75"></div>
          </div>
        )}

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } border-r border-gray-200 dark:border-gray-700`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#082563] rounded-lg flex items-center justify-center">
                <PaperAirplaneIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">EmailApp</span>
            </div>
            
            {/* Close button for mobile */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 rounded-md text-gray-400 hover:text-gray-500"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="mt-6 px-3">
            <div className="space-y-1">
              {filteredNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    item.current
                      ? "bg-[#082563] text-white"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  }`}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 ${
                      item.current ? "text-white" : "text-gray-400 group-hover:text-gray-500"
                    }`}
                  />
                  {item.name}
                  {item.adminOnly && (
                    <span className="ml-auto">
                      <WrenchScrewdriverIcon className="w-4 h-4" />
                    </span>
                  )}
                </a>
              ))}
            </div>
          </nav>

          {/* User info in sidebar (mobile) */}
          <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 dark:border-gray-700 lg:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[#082563] rounded-full flex items-center justify-center text-white text-sm font-medium">
                {currentUser.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {currentUser.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="lg:pl-64 flex flex-col min-h-screen">
          {/* Top navbar */}
          <div className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between h-16 px-4 sm:px-6">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                {/* Mobile menu button */}
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Bars3Icon className="w-6 h-6" />
                </button>

                {/* Page title */}
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {title}
                </h1>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-4">
                {/* Theme toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                  {darkMode ? (
                    <SunIcon className="w-5 h-5" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
                  )}
                </button>

                {/* Notifications */}
                <button className="p-2 rounded-lg text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  <BellIcon className="w-5 h-5" />
                </button>

                {/* User menu */}
                <div className="relative" id="user-dropdown">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-8 h-8 bg-[#082563] rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {currentUser.name.split(" ").map(n => n[0]).join("")}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {currentUser.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {currentUser.role}
                      </p>
                    </div>
                  </button>

                  {/* User dropdown */}
                  {userDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 py-1">
                      {userNavigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          {item.name}
                        </a>
                      ))}
                      <hr className="my-1 border-gray-200 dark:border-gray-600" />
                      <button
                        onClick={logout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                      >
                        <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
                        Cerrar Sesión
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}