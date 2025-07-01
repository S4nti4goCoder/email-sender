const express = require("express");
const router = express.Router();
const { authenticateToken } = require("../middlewares/auth.middleware");
const emailCtrl = require("../controllers/email.controller");

router.use(authenticateToken);

router.get("/", emailCtrl.list);
router.post("/", emailCtrl.send);

module.exports = router;
