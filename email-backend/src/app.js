const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { FRONTEND_URL } = require("./config");
const authRoutes = require("./routes/auth.routes");
const emailRoutes = require("./routes/email.routes");
const passwordResetRoutes = require("./routes/passwordReset.routes");
const dashboardRoutes = require("./routes/dashboard.routes"); // 👈 NUEVA LÍNEA
const errorHandler = require("./middlewares/error.middleware");

const app = express();

// ========================================
// 🛡️ HEADERS DE SEGURIDAD
// ========================================
app.use((req, res, next) => {
  // Previene que el navegador "adivine" tipos de archivo maliciosos
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Previene que tu app se muestre en iframes maliciosos (clickjacking)
  res.setHeader("X-Frame-Options", "DENY");

  // Protección XSS básica del navegador
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Control de información de referrer
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Deshabilita funciones del navegador que no necesitas
  res.setHeader(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()"
  );

  next();
});

// Configuración existente
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// Rutas de la aplicación
app.use("/api", authRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/password-reset", passwordResetRoutes);
app.use("/api/dashboard", dashboardRoutes); // 👈 NUEVA LÍNEA

// middleware global de errores
app.use(errorHandler);

module.exports = app;
