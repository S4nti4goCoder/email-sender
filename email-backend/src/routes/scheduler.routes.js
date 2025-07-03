const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const schedulerCtrl = require("../controllers/scheduler.controller");

// Todas las rutas del scheduler requieren autenticación
router.use(authenticateToken);

// GET /api/scheduler/stats - Obtener estadísticas de emails programados
router.get("/stats", schedulerCtrl.getScheduledStats);

// DELETE /api/scheduler/cancel/:id - Cancelar un email programado
router.delete("/cancel/:id", schedulerCtrl.cancelScheduledEmail);

module.exports = router;
