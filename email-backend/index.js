// email-backend/index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const db = require("./db"); // Promise‐based pool de MySQL
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");

const authenticateToken = require("./auth");
const errorHandler = require("./errorHandler");
const { registerValidation, loginValidation } = require("./validators");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Almacén en memoria de refresh tokens válidos
const refreshTokens = new Set();

// Middlewares globales
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// --------------------------------------------------
// Rate limiter para login (solo cuenta intentos fallidos)
// --------------------------------------------------
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // hasta 5 fallidos
  keyGenerator: (req) => (req.body.email || "").toLowerCase() || req.ip,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
  },
});

// --------------------------------------------------
// RUTAS
// --------------------------------------------------

// Ruta de prueba
app.get("/", (req, res) => {
  res.send("Email backend is running");
});

// Registro de usuario
app.post("/api/register", registerValidation, async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      `INSERT INTO users (email, password) VALUES (?, ?)`,
      [email, hashed]
    );
    res.status(201).json({
      message: "Usuario registrado exitosamente",
      userId: result.insertId,
    });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      err.status = 409;
      err.message = "Email ya registrado";
    }
    next(err);
  }
});

// Login de usuario — genera Access + Refresh
app.post(
  "/api/login",
  loginLimiter,
  loginValidation,
  async (req, res, next) => {
    const { email, password } = req.body;
    try {
      const [rows] = await db.query(`SELECT * FROM users WHERE email = ?`, [
        email,
      ]);
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

      // Access token (30 minutos)
      const accessToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: "30m" }
      );

      // Refresh token (24 horas)
      const refreshToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.REFRESH_SECRET,
        { expiresIn: "24h" } // ← cambió aquí
      );
      refreshTokens.add(refreshToken);

      // Enviamos refresh token en cookie HttpOnly
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "Strict",
        maxAge: 24 * 60 * 60 * 1000, // ← y aquí
      });

      // Devolvemos el access token en JSON
      res.json({ message: "Login exitoso", accessToken });
    } catch (err) {
      next(err);
    }
  }
);

// Endpoint para renovar Access Token usando el Refresh Token
app.post("/api/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) {
    return res.status(401).json({ error: "No se encontró refresh token" });
  }
  if (!refreshTokens.has(token)) {
    return res.status(403).json({ error: "Refresh token inválido" });
  }

  jwt.verify(token, process.env.REFRESH_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Refresh token expirado" });
    }
    const newAccessToken = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "30m" }
    );
    res.json({ accessToken: newAccessToken });
  });
});

// Logout: elimina el refresh token y limpia cookie
app.post("/api/logout", (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) refreshTokens.delete(token);
  res.clearCookie("refreshToken", {
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
  });
  res.json({ message: "Logout exitoso" });
});

// Perfil (protegido con el Access Token)
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Perfil cargado correctamente",
    user: req.user,
  });
});

// Historial de emails (protegido)
app.get("/api/emails", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await db.query(
      `SELECT * FROM emails
           WHERE user_id = ?
           ORDER BY created_at DESC`,
      [req.user.id]
    );
    res.json({ emails: rows });
  } catch (err) {
    next(err);
  }
});

// Función interna para enviar emails
const sendEmail = async ({ recipient, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  await transporter.sendMail({
    from: `"EmailApp" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject,
    html: `<p>${message}</p>`,
  });
};

// Envío y guardado de email (protegido)
app.post("/api/emails", authenticateToken, async (req, res, next) => {
  const { recipient, subject, message, attachment, scheduled_for } = req.body;
  try {
    const [result] = await db.query(
      `INSERT INTO emails (user_id, recipient, subject, message, attachment, scheduled_for)
           VALUES (?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        recipient,
        subject,
        message,
        attachment || null,
        scheduled_for || null,
      ]
    );
    await sendEmail({ recipient, subject, message });
    res.status(201).json({
      message: "Email guardado y enviado correctamente",
      id: result.insertId,
    });
  } catch (err) {
    next(err);
  }
});

// --------------------------------------------------
// Middleware global de manejo de errores
// --------------------------------------------------
app.use(errorHandler);

// --------------------------------------------------
app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
