// src/services/api.js
import axios from "axios";

// Creamos la instancia de Axios
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // para enviar/recibir cookies (refresh token)
});

// ————— Interceptor mejorado para manejar requests concurrentes —————
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 🔧 NUEVO: Interceptor de REQUEST para asegurar que todas las requests tengan token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Debug: Log del error con más detalle
    console.log(`🔍 API Error: ${error.response?.status} - ${originalRequest?.url} - Auth: ${!!originalRequest?.headers?.Authorization}`);

    // Si recibimos 401 y no es el endpoint de refresh y no es reintento
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.endsWith("/api/refresh") &&
      !originalRequest.url?.includes("/login") &&
      !originalRequest.url?.includes("/register")
    ) {
      
      console.log("🔄 Token expirado, intentando refresh...");

      if (isRefreshing) {
        console.log("⏳ Ya hay un refresh en proceso, encolando request...");
        // Si ya estamos refrescando, encolamos la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return API(originalRequest);
          })
          .catch((refreshError) => Promise.reject(refreshError));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        console.log("🔄 Llamando a /api/refresh...");
        
        // 🔧 MEJORADO: Crear request de refresh sin interceptores para evitar loops
        const refreshResponse = await axios.post(`${API.defaults.baseURL}/api/refresh`, {}, {
          withCredentials: true,
          headers: { "Content-Type": "application/json" }
        });
        
        const { accessToken } = refreshResponse.data;
        
        console.log("✅ Refresh exitoso, nuevo token obtenido");
        
        // Guardamos el nuevo token y actualizamos headers
        localStorage.setItem("token", accessToken);
        API.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;
        originalRequest.headers["Authorization"] = `Bearer ${accessToken}`;
        
        // Procesamos la cola de requests pendientes
        processQueue(null, accessToken);
        isRefreshing = false;
        
        // 🔧 MEJORADO: Esperar un poco antes de reintentar para evitar race conditions
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Reintentamos el request original
        return API(originalRequest);
        
      } catch (refreshError) {
        console.error("❌ Error en refresh:", refreshError);
        
        // Si falla el refresh, limpiamos todo y redirigimos al login
        processQueue(refreshError, null);
        isRefreshing = false;
        
        localStorage.removeItem("token");
        delete API.defaults.headers.common["Authorization"];
        
        // Redirigir al login solo si no estamos ya en una página de auth
        if (!window.location.pathname.includes('/login') && 
            !window.location.pathname.includes('/register')) {
          console.log("🔄 Redirigiendo al login...");
          window.location.href = "/login?expired=true";
        }
        
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// 🔧 MEJORADO: Inicializar header Authorization de forma más robusta
const initializeAuth = () => {
  const savedToken = localStorage.getItem("token");
  if (savedToken) {
    API.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
    console.log("🔑 Token cargado desde localStorage");
  }
};

// Inicializar inmediatamente
initializeAuth();

// 🔧 NUEVO: Reinicializar token después de cambios en localStorage
window.addEventListener('storage', (e) => {
  if (e.key === 'token') {
    initializeAuth();
  }
});

export default API;

/**
 * Registra un nuevo usuario
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ message: string, userId: number }>}
 */
export function register(data) {
  return API.post("/api/register", data).then((res) => res.data);
}

/**
 * Loguea al usuario, devuelve accessToken en JSON
 * @param {{ email: string, password: string }} data
 * @returns {Promise<{ message: string, accessToken: string }>}
 */
export function login(data) {
  return API.post("/api/login", data).then((res) => res.data);
}

/**
 * Obtiene un nuevo accessToken usando la cookie de refresh
 * @returns {Promise<{ accessToken: string }>}
 */
export function refresh() {
  return API.post("/api/refresh").then((res) => res.data);
}

/**
 * Cierra sesión: elimina el refresh token del servidor y limpia la cookie
 * @returns {Promise<{ message: string }>}
 */
export function logout() {
  return API.post("/api/logout").then((res) => res.data);
}

/**
 * Consulta los datos del perfil del usuario (ruta protegida)
 * @returns {Promise<{ message: string, user: { id: number, email: string, iat: number, exp: number } }>}
 */
export function getProfile() {
  return API.get("/api/profile").then((res) => res.data);
}

/**
 * Obtiene el historial de emails enviados por el usuario (ruta protegida)
 * @returns {Promise<{ emails: Array<any> }>}
 */
export function getEmails() {
  return API.get("/api/emails").then((res) => res.data);
}

/**
 * Envía un nuevo email y lo guarda en la base (ruta protegida)
 * @param {{ recipient: string, subject: string, message: string, attachment?: string, scheduled_for?: string }} data
 * @returns {Promise<{ message: string, id: number }>}
 */
export function sendEmail(data) {
  return API.post("/api/emails", data).then((res) => res.data);
}

/**
 * Obtiene estadísticas del dashboard (ruta protegida)
 * @returns {Promise<{ stats: object, recentActivity: Array<any> }>}
 */
export function getDashboardStats() {
  return API.get("/api/dashboard/stats").then((res) => res.data);
}

/**
 * Obtiene el estado completo del sistema (ruta protegida)
 * @returns {Promise<{ server: object, user: object, timestamp: string }>}
 */
export function getSystemStatus() {
  return API.get("/api/system/status").then((res) => res.data);
}

/**
 * Obtiene estadísticas detalladas del usuario (ruta protegida)
 * @returns {Promise<{ period: object, topRecipients: Array<any> }>}
 */
export function getUserStats() {
  return API.get("/api/system/user-stats").then((res) => res.data);
}

/**
 * Obtiene estadísticas de emails programados (ruta protegida)
 * @returns {Promise<{ pending: number, sent: number, failed: number, nextEmail: object }>}
 */
export function getScheduledStats() {
  return API.get("/api/scheduler/stats").then((res) => res.data);
}

/**
 * Cancela un email programado (ruta protegida)
 * @param {number} emailId - ID del email a cancelar
 * @returns {Promise<{ message: string, emailId: number }>}
 */
export function cancelScheduledEmail(emailId) {
  return API.delete(`/api/scheduler/cancel/${emailId}`).then((res) => res.data);
}