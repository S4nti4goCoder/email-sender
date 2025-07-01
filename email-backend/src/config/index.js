// carga variables de entorno y las exporta
require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_SECRET: process.env.REFRESH_SECRET,
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
};
