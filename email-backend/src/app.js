const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { FRONTEND_URL } = require("./config");
const authRoutes = require("./routes/auth.routes");
const emailRoutes = require("./routes/email.routes");
const errorHandler = require("./middlewares/error.middleware");

const app = express();

app.use(cors({ origin: FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(cookieParser());

// prefijamos todas las rutas de auth y email
app.use("/api", authRoutes);
app.use("/api/emails", emailRoutes);

// middleware global de errores
app.use(errorHandler);

module.exports = app;
