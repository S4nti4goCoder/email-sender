const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { FRONTEND_URL } = require("./config");

// Importar todas las rutas
const authRoutes = require("./routes/auth.routes");
const emailRoutes = require("./routes/email.routes");
const passwordResetRoutes = require("./routes/passwordReset.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const systemRoutes = require("./routes/system.routes");
const schedulerRoutes = require("./routes/scheduler.routes");
const errorHandler = require("./middlewares/error.middleware");

// Importar el scheduler
const emailScheduler = require("./services/emailScheduler.service");

const app = express();

// ========================================
// 🛡️ HEADERS DE SEGURIDAD
// ========================================
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  next();
});

// Configuración de middleware
app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// 🐛 DEBUG: Log de requests para debug
app.use((req, res, next) => {
  console.log(`📝 ${req.method} ${req.path} - Token: ${req.headers.authorization ? 'SÍ' : 'NO'}`);
  next();
});

// ========================================
// 🛠️ RUTAS DE LA APLICACIÓN
// ========================================

// Rutas de autenticación (públicas)
app.use("/api", authRoutes);

// Rutas de recuperación de contraseña (públicas)
app.use("/api/password-reset", passwordResetRoutes);

// Rutas protegidas que requieren autenticación
app.use("/api/emails", emailRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/system", systemRoutes);
app.use("/api/scheduler", schedulerRoutes);

// Ruta de prueba para verificar que el servidor funciona
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    routes_registered: [
      'POST /api/login',
      'POST /api/register', 
      'GET /api/dashboard/stats',
      'GET /api/system/status',
      'GET /api/scheduler/stats',
      'POST /api/emails'
    ]
  });
});

// Middleware global de errores (debe ir al final)
app.use(errorHandler);

// ========================================
// 🚀 INICIALIZACIÓN DEL SCHEDULER
// ========================================

// Función para iniciar el scheduler de forma segura
const initializeScheduler = () => {
  try {
    console.log("🚀 Iniciando sistema de envío programado...");
    emailScheduler.start();
    console.log("✅ Scheduler iniciado correctamente");
  } catch (error) {
    console.error("❌ Error iniciando scheduler:", error);
  }
};

// Inicializar scheduler después de que el servidor esté listo
setTimeout(initializeScheduler, 3000);

// ========================================
// 🛑 MANEJO DE CIERRE GRACEFUL
// ========================================

process.on('SIGTERM', () => {
  console.log("🛑 Cerrando aplicación...");
  try {
    emailScheduler.stop();
  } catch (error) {
    console.error("Error cerrando scheduler:", error);
  }
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log("🛑 Cerrando aplicación...");
  try {
    emailScheduler.stop();
  } catch (error) {
    console.error("Error cerrando scheduler:", error);
  }
  process.exit(0);
});

module.exports = app;