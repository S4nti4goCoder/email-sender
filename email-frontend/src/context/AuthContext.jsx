// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(localStorage.getItem("token"));

  // Cada vez que el token cambie, actualizamos el header Authorization
  useEffect(() => {
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common["Authorization"];
    }
  }, [token]);

  // Interceptor para capturar 401 (cuando el refresh falla) y forzar logout
  useEffect(() => {
    const id = api.interceptors.response.use(
      res => res,
      err => {
        if (err.response?.status === 401) {
          // Limpiamos estado y redirigimos al login con banner de expiración
          localStorage.removeItem("token");
          setToken(null);
          navigate("/login", { replace: true, state: { expired: true } });
        }
        return Promise.reject(err);
      }
    );
    return () => {
      api.interceptors.response.eject(id);
    };
  }, [navigate]);

  // login: almacenar accessToken en localStorage y en estado
  const login = accessToken => {
    localStorage.setItem("token", accessToken);
    setToken(accessToken);
  };

  // logout: borrar token y redirigir al login con banner de “fromLogout”
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
