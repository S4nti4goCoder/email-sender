// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000",               // o tu VITE_API_URL si lo prefieres
  headers: { "Content-Type": "application/json" },
});

// ① Exportación por defecto de la instancia
export default API;

// ② Exports nombrados para registro y login
export function register(data) {
  return API.post("/api/register", data).then((r) => r.data);
}

export function login(data) {
  return API.post("/api/login", data).then((r) => r.data);
}
