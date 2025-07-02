const {
  requestPasswordReset,
  validateResetToken,
  resetPassword,
} = require("../services/passwordReset.service");

// Solicitar recuperación de contraseña
exports.requestReset = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await requestPasswordReset(email, req);

    // Siempre devolvemos 200 para no revelar si el email existe
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Validar token de recuperación (para mostrar formulario)
exports.validateToken = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await validateResetToken(token);

    if (!result.valid) {
      return res.status(400).json({ error: result.error });
    }

    res.json({
      valid: true,
      message: "Token válido",
      email: result.email.replace(/(.{3}).*(@.*)/, "$1***$2"), // Email enmascarado
    });
  } catch (err) {
    next(err);
  }
};

// Resetear contraseña
exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;
    const result = await resetPassword(token, newPassword, req);

    res.json(result);
  } catch (err) {
    next(err);
  }
};
