const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos fallidos
  keyGenerator: (req) => (req.body.email || "").toLowerCase() || req.ip,
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Demasiados intentos de login. Intenta de nuevo en 15 minutos.",
  },
});

module.exports = { loginLimiter };
