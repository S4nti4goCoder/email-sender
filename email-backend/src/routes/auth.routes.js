const express = require("express");
const router = express.Router();
const { registerValidation, loginValidation } = require("../utils/validators");
const { loginLimiter } = require("../middlewares/rateLimiter");
const authCtrl = require("../controllers/auth.controller");

router.post("/register", registerValidation, authCtrl.register);
router.post("/login", loginLimiter, loginValidation, authCtrl.login);
router.post("/refresh", authCtrl.refresh);
router.post("/logout", authCtrl.logout);

module.exports = router;
