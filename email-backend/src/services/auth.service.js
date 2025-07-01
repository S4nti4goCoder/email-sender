const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { JWT_SECRET, REFRESH_SECRET } = require("../config");

// almacén en memoria de refresh tokens válidos
const refreshTokens = new Set();

async function registerUser(email, password) {
  const hashed = await bcrypt.hash(password, 10);
  const [result] = await db.query(
    "INSERT INTO users (email, password) VALUES (?, ?)",
    [email, hashed]
  );
  return result.insertId;
}

async function loginUser(email, password) {
  const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) {
    const e = new Error("Usuario no encontrado");
    e.status = 404;
    throw e;
  }
  const user = rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    const e = new Error("Credenciales inválidas");
    e.status = 401;
    throw e;
  }

  const accessToken = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: "30m",
  });
  const refreshToken = jwt.sign(
    { id: user.id, email: user.email },
    REFRESH_SECRET,
    { expiresIn: "24h" }
  );
  refreshTokens.add(refreshToken);
  return { accessToken, refreshToken };
}

function refreshAccessToken(token) {
  if (!refreshTokens.has(token)) {
    const e = new Error("Refresh token inválido");
    e.status = 403;
    throw e;
  }
  const payload = jwt.verify(token, REFRESH_SECRET);
  const newAccessToken = jwt.sign(
    { id: payload.id, email: payload.email },
    JWT_SECRET,
    { expiresIn: "30m" }
  );
  return newAccessToken;
}

function logoutUser(token) {
  refreshTokens.delete(token);
}

module.exports = {
  registerUser,
  loginUser,
  refreshAccessToken,
  logoutUser,
};
