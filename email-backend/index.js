// index.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connection = require("./db");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authenticateToken = require("./auth");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Email backend is running");
});

// Perfil (protegido)
app.get("/api/profile", authenticateToken, (req, res) => {
  res.json({
    message: "Perfil cargado correctamente",
    user: req.user,
  });
});

// Obtener historial de emails (protegido)
app.get("/api/emails", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = `SELECT * FROM emails WHERE user_id = ? ORDER BY created_at DESC`;
  connection.query(sql, [userId], (err, results) => {
    if (err) {
      console.error("Error al obtener emails:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    res.json({ emails: results });
  });
});

// Función para enviar email
const sendEmail = async ({ recipient, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"EmailApp" <${process.env.EMAIL_USER}>`,
    to: recipient,
    subject,
    html: `<p>${message}</p>`,
  });
};

// Enviar y guardar email (protegido)
app.post("/api/emails", authenticateToken, async (req, res) => {
  const { recipient, subject, message, attachment, scheduled_for } = req.body;
  const userId = req.user.id;
  const sql = `
    INSERT INTO emails (user_id, recipient, subject, message, attachment, scheduled_for)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  connection.query(
    sql,
    [
      userId,
      recipient,
      subject,
      message,
      attachment || null,
      scheduled_for || null,
    ],
    async (err, result) => {
      if (err) {
        console.error("Error al insertar email:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      try {
        await sendEmail({ recipient, subject, message });
        res.status(201).json({
          message: "Email guardado y enviado correctamente",
          id: result.insertId,
        });
      } catch (sendErr) {
        console.error("Error al enviar email:", sendErr);
        res.status(500).json({ error: "Falló el envío del email" });
      }
    }
  );
});

// Registro de usuario
app.post("/api/register", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña son requeridos" });

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    connection.query(sql, [email, hashedPassword], (err, result) => {
      if (err) {
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(409).json({ error: "Email ya registrado" });
        }
        console.error("Error en registro:", err);
        return res.status(500).json({ error: "Error en la base de datos" });
      }
      res.status(201).json({
        message: "Usuario registrado exitosamente",
        userId: result.insertId,
      });
    });
  } catch (hashErr) {
    console.error("Error al encriptar contraseña:", hashErr);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

// Login de usuario — aquí ajustamos la expiración a 1 hora
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email y contraseña son requeridos" });

  const sql = `SELECT * FROM users WHERE email = ?`;
  connection.query(sql, [email], async (err, results) => {
    if (err) {
      console.error("Error al buscar usuario:", err);
      return res.status(500).json({ error: "Error en la base de datos" });
    }
    if (results.length === 0)
      return res.status(404).json({ error: "Usuario no encontrado" });

    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Credenciales inválidas" });

    // Expiración cambiada a 1 hora
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ message: "Login exitoso", token });
  });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
