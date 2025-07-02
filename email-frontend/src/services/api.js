// src/services/api.js
import axios from "axios";

// Creamos la instancia de Axios
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // para enviar/recibir cookies (refresh token)
});

// ————— Interceptor para manejar el refresh token —————
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

API.interceptors.response.use(
  (response) => response,
  (err) => {
    const originalReq = err.config;

    // Si recibimos 401 y no es el endpoint de refresh
    if (
      err.response?.status === 401 &&
      !originalReq._retry &&
      !originalReq.url.endsWith("/api/refresh")
    ) {
      if (isRefreshing) {
        // Si ya estamos refrescando, encolamos la petición
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalReq.headers["Authorization"] = `Bearer ${token}`;
            return API(originalReq);
          })
          .catch((e) => Promise.reject(e));
      }

      originalReq._retry = true;
      isRefreshing = true;

      // Llamamos a /api/refresh para obtener nuevo accessToken
      return new Promise((resolve, reject) => {
        API.post("/api/refresh")
          .then(({ data }) => {
            const { accessToken } = data;
            // Guardamos el nuevo token y actualizamos headers
            localStorage.setItem("token", accessToken);
            API.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${accessToken}`;
            originalReq.headers["Authorization"] = `Bearer ${accessToken}`;
            processQueue(null, accessToken);
            resolve(API(originalReq));
          })
          .catch((refreshError) => {
            processQueue(refreshError, null);
            // Si falla el refresh, limpiamos y redirigimos al login
            localStorage.removeItem("token");
            window.location.href = "/login?expired=true";
            reject(refreshError);
          })
          .finally(() => {
            isRefreshing = false;
          });
      });
    }

    return Promise.reject(err);
  }
);

// Inicializar header Authorization si ya hay token
const savedToken = localStorage.getItem("token");
if (savedToken) {
  API.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
}

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
