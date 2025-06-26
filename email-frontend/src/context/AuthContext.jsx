// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Inyecta Authorization header
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Interceptor para capturar 401 (token expirado)
  useEffect(() => {
    const id = api.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          setToken(null);
          navigate("/login", { replace: true, state: { expired: true } });
        }
        return Promise.reject(err);
      }
    );
    return () => api.interceptors.response.eject(id);
  }, [navigate]);

  // login: guarda el access token
  const login = (accessToken) => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
  };

  // logout: limpia y redirige
  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login", { replace: true, state: { fromLogout: true } });
  };

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
