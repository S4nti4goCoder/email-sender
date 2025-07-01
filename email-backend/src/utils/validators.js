const { body, validationResult } = require("express-validator");

const registerValidation = [
  body("email").isEmail().withMessage("El email no es válido"),
  body("password")
    .isLength({ min: 8 })
    .withMessage("La contraseña debe tener al menos 8 caracteres"),
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
  body("email").isEmail().withMessage("El email no es válido"),
  body("password").notEmpty().withMessage("La contraseña es requerida"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const [{ msg }] = errors.array();
      return res.status(400).json({ error: msg });
    }
    next();
  },
];

module.exports = { registerValidation, loginValidation };
