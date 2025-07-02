const { body, validationResult } = require("express-validator");

// Validación profesional basada en estándares NIST y OWASP
const validatePasswordStrength = (password) => {
  // SOLO los patrones más críticos y justificados

  // 1. No permitir caracteres repetidos excesivamente (ataque de fuerza bruta básico)
  if (/^(.)\1{7,}$/.test(password)) {
    throw new Error("La contraseña no puede ser el mismo carácter repetido");
  }

  // 2. No permitir solo números (muy vulnerable)
  if (/^\d+$/.test(password)) {
    throw new Error("La contraseña debe incluir letras además de números");
  }

  // 3. No permitir solo letras (muy vulnerable)
  if (/^[a-zA-Z]+$/.test(password)) {
    throw new Error("La contraseña debe incluir números además de letras");
  }

  // 4. Verificar diversidad mínima de caracteres (entropía)
  const uniqueChars = new Set(password).size;
  if (uniqueChars < 4 && password.length >= 8) {
    throw new Error("La contraseña debe tener más variedad de caracteres");
  }

  return true;
};

const registerValidation = [
  body("email")
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("El email es demasiado largo"),

  body("password")
    .isLength({ min: 8, max: 128 })
    .withMessage("La contraseña debe tener entre 8 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La contraseña debe tener al menos: 1 minúscula, 1 mayúscula y 1 número"
    )
    .custom(validatePasswordStrength),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [{ msg }] = errors.array();
      return res.status(400).json({ error: msg });
    }
    next();
  },
];

const loginValidation = [
  body("email")
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email inválido"),

  body("password")
    .notEmpty()
    .withMessage("La contraseña es requerida")
    .isLength({ min: 1, max: 128 })
    .withMessage("Credenciales inválidas"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [{ msg }] = errors.array();
      return res.status(400).json({ error: msg });
    }
    next();
  },
];

// Validación para solicitud de reset de contraseña
const requestPasswordResetValidation = [
  body("email")
    .isEmail()
    .withMessage("El email no es válido")
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage("Email inválido"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [{ msg }] = errors.array();
      return res.status(400).json({ error: msg });
    }
    next();
  },
];

// Validación para reset de contraseña con token
const resetPasswordValidation = [
  body("token")
    .notEmpty()
    .withMessage("Token de recuperación requerido")
    .isLength({ min: 32, max: 255 })
    .withMessage("Token inválido"),

  body("newPassword")
    .isLength({ min: 8, max: 128 })
    .withMessage("La nueva contraseña debe tener entre 8 y 128 caracteres")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "La nueva contraseña debe tener al menos: 1 minúscula, 1 mayúscula y 1 número"
    )
    .custom(validatePasswordStrength),

  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Las contraseñas no coinciden");
    }
    return true;
  }),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [{ msg }] = errors.array();
      return res.status(400).json({ error: msg });
    }
    next();
  },
];

module.exports = {
  registerValidation,
  loginValidation,
  requestPasswordResetValidation,
  resetPasswordValidation,
};
