// src/context/AuthContext.jsx
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Helper: extrae el exp (en segundos) del JWT
function getTokenExpiryMs(token) {
  try {
    const payload = token.split(".")[1]; // segunda parte
    const decoded = JSON.parse(atob(payload)); // base64 → JSON
    return decoded.exp * 1000; // de seg → ms
  } catch {
    return 0;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  // arrancamos leyendo de localStorage (si lo hay)
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  // login normal: guardo token y voy al dashboard
  const login = useCallback(
    (newToken) => {
      localStorage.setItem("token", newToken);
      setToken(newToken);
      navigate("/dashboard", { replace: true });
    },
    [navigate]
  );

  // logout (también usado para expiración): borro y voy al login marcando expired
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login", {
      replace: true,
      state: { expired: true },
    });
  }, [navigate]);

  // auto-logout cuando venza el token
  useEffect(() => {
    if (!token) return;

    const expiryMs = getTokenExpiryMs(token);
    const now = Date.now();
    const msLeft = expiryMs - now;
    console.log("⏱️ token expira en (ms):", msLeft);

    if (msLeft <= 0) {
      // si ya expiró
      logout();
    } else {
      // programo el clearTimeout para limpiar si cambia el token
      const timer = setTimeout(() => {
        console.log("💥 token expirado — logout()");
        logout();
      }, msLeft);
      return () => clearTimeout(timer);
    }
  }, [token, logout]);

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
