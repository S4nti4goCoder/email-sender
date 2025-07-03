const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const systemCtrl = require("../controllers/system.controller");

// Todas las rutas del sistema requieren autenticación
router.use(authenticateToken);

// GET /api/system/status - Obtener estado completo del sistema
router.get("/status", systemCtrl.getSystemStatus);

// GET /api/system/user-stats - Obtener estadísticas detalladas del usuario
router.get("/user-stats", systemCtrl.getUserStats);

module.exports = router;
