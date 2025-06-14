// src/services/api.js
import axios from "axios";

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
  headers: { "Content-Type": "application/json" },
});

export function register(data) {
  return API.post("/api/register", data).then((r) => r.data);
}

export function login(data) {
  return API.post("/api/login", data).then((r) => r.data);
}
