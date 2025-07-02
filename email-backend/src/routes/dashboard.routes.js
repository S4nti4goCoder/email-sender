const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const dashboardCtrl = require("../controllers/dashboard.controller");

// Todas las rutas del dashboard requieren autenticación
router.use(authenticateToken);

// GET /api/dashboard/stats - Obtener estadísticas del dashboard
router.get("/stats", dashboardCtrl.getStats);

module.exports = router;
