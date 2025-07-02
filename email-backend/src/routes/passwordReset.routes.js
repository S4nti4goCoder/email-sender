const express = require("express");
const router = express.Router();
const {
  requestPasswordResetValidation,
  resetPasswordValidation,
} = require("../utils/validators");
const passwordResetCtrl = require("../controllers/passwordReset.controller");

// Solicitar recuperación de contraseña
router.post(
  "/request",
  requestPasswordResetValidation,
  passwordResetCtrl.requestReset
);

// Validar token de recuperación
router.get("/validate/:token", passwordResetCtrl.validateToken);

// Resetear contraseña con token
router.post("/reset", resetPasswordValidation, passwordResetCtrl.resetPassword);

module.exports = router;
