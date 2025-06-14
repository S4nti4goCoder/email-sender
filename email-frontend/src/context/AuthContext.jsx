import React, { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

// Este provider guarda el token en estado y localStorage,
// y expone login() y logout() para toda la app.
export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  function login(newToken) {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    navigate("/dashboard", { replace: true });
  }

  function logout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login", { replace: true });
  }

  return (
    <AuthContext.Provider value={{ token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
