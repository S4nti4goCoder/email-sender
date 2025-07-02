const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, REFRESH_SECRET } = require("../config");

// almacén en memoria de refresh tokens válidos
const refreshTokens = new Set();

// Función auxiliar para logs seguros (sin mostrar datos sensibles)
const secureLog = (action, email, details = "", ip = "unknown") => {
  const timestamp = new Date().toISOString();
  const maskedEmail = email ? email.replace(/(.{3}).*(@.*)/, "$1***$2") : "unknown";
  console.log(`[${timestamp}] ${action}: ${maskedEmail} | ${details} | IP: ${ip}`);
};

async function registerUser(email, password) {
  try {
    const hashed = await bcrypt.hash(password, 12); // Aumentamos de 10 a 12 rounds para más seguridad
    
    // 👈 CORREGIDO: Tu BD tiene campo 'name', pero lo dejamos NULL por ahora
    // para mantener compatibilidad con tu frontend actual
    const [result] = await db.query(
      "INSERT INTO users (email, password, name) VALUES (?, ?, NULL)",
      [email, hashed]
    );
    
    // 📝 LOG: Registro exitoso
    secureLog("✅ REGISTRO_EXITOSO", email, `ID: ${result.insertId}`);
    
    return result.insertId;
  } catch (error) {
    // 📝 LOG: Error en registro
    if (error.code === 'ER_DUP_ENTRY') {
      secureLog("❌ REGISTRO_FALLIDO", email, "Email duplicado");
    } else {
      secureLog("❌ REGISTRO_ERROR", email, `Error: ${error.code || error.message}`);
    }
    throw error;
  }
}

async function loginUser(email, password, req = {}) {
  const ip = req.ip || "unknown";
  
  try {
    // 👈 CORREGIDO: Seleccionamos también el campo 'name' aunque sea NULL
    const [rows] = await db.query("SELECT id, name, email, password FROM users WHERE email = ?", [email]);
    
    if (rows.length === 0) {
      // 📝 LOG: Usuario no encontrado
      secureLog("❌ LOGIN_FALLIDO", email, "Usuario no existe", ip);
      const e = new Error("Usuario no encontrado");
      e.status = 404;
      throw e;
    }
    
    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password);
    
    if (!valid) {
      // 📝 LOG: Contraseña incorrecta
      secureLog("❌ LOGIN_FALLIDO", email, "Contraseña incorrecta", ip);
      const e = new Error("Credenciales inválidas");
      e.status = 401;
      throw e;
    }

    // 👈 CORREGIDO: Incluimos 'name' en el token (aunque sea NULL)
    const accessToken = jwt.sign({ 
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, JWT_SECRET, {
      expiresIn: "30m",
    });
    
    const refreshToken = jwt.sign({
      id: user.id, 
      email: user.email, 
      name: user.name 
    }, REFRESH_SECRET, {
      expiresIn: "24h"
    });
    
    refreshTokens.add(refreshToken);
    
    // 📝 LOG: Login exitoso
    secureLog("✅ LOGIN_EXITOSO", email, `ID: ${user.id}`, ip);
    
    return { accessToken, refreshToken };
  } catch (error) {
    // Si el error no fue logueado antes, lo logueamos
    if (!error.status) {
      secureLog("❌ LOGIN_ERROR", email, `Error: ${error.message}`, ip);
    }
    throw error;
  }
}

function refreshAccessToken(token, req = {}) {
  const ip = req.ip || "unknown";
  
  if (!refreshTokens.has(token)) {
    // 📝 LOG: Refresh token inválido
    secureLog("❌ REFRESH_FALLIDO", "unknown", "Token inválido", ip);
    const e = new Error("Refresh token inválido");
    e.status = 403;
    throw e;
  }
  
  try {
    const payload = jwt.verify(token, REFRESH_SECRET);
    
    // 👈 CORREGIDO: Preservamos todos los campos del payload original
    const newAccessToken = jwt.sign({
      id: payload.id,
      email: payload.email,
      name: payload.name
    }, JWT_SECRET, {
      expiresIn: "30m"
    });
    
    // 📝 LOG: Refresh exitoso
    secureLog("✅ REFRESH_EXITOSO", payload.email, "", ip);
    
    return newAccessToken;
  } catch (error) {
    // Token expirado o inválido
    refreshTokens.delete(token);
    secureLog("❌ REFRESH_FALLIDO", "unknown", "Token expirado", ip);
    const e = new Error("Refresh token expirado");
    e.status = 403;
    throw e;
  }
}

function logoutUser(token, req = {}) {
  const ip = req.ip || "unknown";
  
  if (refreshTokens.has(token)) {
    try {
      const payload = jwt.verify(token, REFRESH_SECRET);
      secureLog("✅ LOGOUT", payload.email, "", ip);
    } catch (error) {
      secureLog("✅ LOGOUT", "unknown", "Token inválido", ip);
    }
    refreshTokens.delete(token);
  }
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};