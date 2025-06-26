// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
  withCredentials: true, // para enviar/recibir cookies (refresh token)
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
