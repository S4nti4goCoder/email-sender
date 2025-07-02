const db = require("../config/db");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, FRONTEND_URL } = require("../config");

// Configurar transporter de email (CORREGIDO)
const createEmailTransporter = () => {
  return nodemailer.createTransport({  // ← CORREGIDO: sin la 'r' al final
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: { 
      user: EMAIL_USER, 
      pass: EMAIL_PASS 
    },
  });
};

// Función para generar token seguro
const generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

// Función para logs seguros
const secureLog = (action, email, details = "", ip = "unknown") => {
  const timestamp = new Date().toISOString();
  const maskedEmail = email ? email.replace(/(.{3}).*(@.*)/, "$1***$2") : "unknown";
  console.log(`[${timestamp}] ${action}: ${maskedEmail} | ${details} | IP: ${ip}`);
};

// Solicitar reset de contraseña
async function requestPasswordReset(email, req = {}) {
  const ip = req.ip || "unknown";
  
  try {
    // Verificar si el usuario existe
    const [rows] = await db.query("SELECT id, email FROM users WHERE email = ?", [email]);
    
    if (rows.length === 0) {
      // Por seguridad, no revelamos si el email existe o no
      secureLog("❌ RESET_REQUEST", email, "Email no encontrado", ip);
      // Devolvemos éxito falso para no dar pistas sobre emails válidos
      return { success: true, message: "Si el email existe, recibirás un link de recuperación" };
    }
    
    const user = rows[0];
    
    // Generar token único
    const resetToken = generateResetToken();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // Expira en 15 minutos
    
    // Guardar token en base de datos
    await db.query(
      "UPDATE users SET password_reset_token = ?, password_reset_expires = ? WHERE id = ?",
      [resetToken, resetExpires, user.id]
    );
    
    // Crear link de recuperación
    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    
    // Plantilla de email
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #082563;">Recuperación de Contraseña</h2>
        <p>Hola,</p>
        <p>Recibiste este email porque solicitaste recuperar tu contraseña en EmailApp.</p>
        <p>Haz click en el siguiente botón para crear una nueva contraseña:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" 
             style="background-color: #082563; color: white; padding: 12px 24px; 
                    text-decoration: none; border-radius: 5px; display: inline-block;">
            Recuperar Contraseña
          </a>
        </div>
        <p><strong>Este link expira en 15 minutos.</strong></p>
        <p>Si no solicitaste esta recuperación, ignora este email.</p>
        <hr style="margin: 30px 0; border: 1px solid #eee;">
        <p style="color: #666; font-size: 12px;">
          Si el botón no funciona, copia y pega este link en tu navegador:<br>
          <a href="${resetUrl}">${resetUrl}</a>
        </p>
      </div>
    `;
    
    // Enviar email
    const transporter = createEmailTransporter();
    await transporter.sendMail({
      from: `"EmailApp" <${EMAIL_USER}>`,
      to: email,
      subject: "Recuperación de Contraseña - EmailApp",
      html: emailHtml,
    });
    
    secureLog("✅ RESET_REQUEST", email, "Email enviado", ip);
    
    return { 
      success: true, 
      message: "Si el email existe, recibirás un link de recuperación" 
    };
    
  } catch (error) {
    secureLog("❌ RESET_ERROR", email, `Error: ${error.message}`, ip);
    throw new Error("Error interno del servidor");
  }
}

// Validar token de reset
async function validateResetToken(token) {
  try {
    const [rows] = await db.query(
      "SELECT id, email, password_reset_expires FROM users WHERE password_reset_token = ?",
      [token]
    );
    
    if (rows.length === 0) {
      return { valid: false, error: "Token de recuperación inválido" };
    }
    
    const user = rows[0];
    const now = new Date();
    
    if (now > new Date(user.password_reset_expires)) {
      // Limpiar token expirado
      await db.query(
        "UPDATE users SET password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
        [user.id]
      );
      return { valid: false, error: "El token de recuperación ha expirado" };
    }
    
    return { valid: true, userId: user.id, email: user.email };
    
  } catch (error) {
    console.error("Error validando token:", error);
    return { valid: false, error: "Error validando token" };
  }
}

// Resetear contraseña
async function resetPassword(token, newPassword, req = {}) {
  const ip = req.ip || "unknown";
  
  try {
    // Validar token
    const tokenValidation = await validateResetToken(token);
    
    if (!tokenValidation.valid) {
      secureLog("❌ RESET_FAILED", "unknown", tokenValidation.error, ip);
      const e = new Error(tokenValidation.error);
      e.status = 400;
      throw e;
    }
    
    const { userId, email } = tokenValidation;
    
    // Encriptar nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Actualizar contraseña y limpiar token
    await db.query(
      "UPDATE users SET password = ?, password_reset_token = NULL, password_reset_expires = NULL WHERE id = ?",
      [hashedPassword, userId]
    );
    
    secureLog("✅ RESET_SUCCESS", email, "Contraseña actualizada", ip);
    
    return { success: true, message: "Contraseña actualizada exitosamente" };
    
  } catch (error) {
    if (error.status) {
      throw error; // Re-throw errors con status específico
    }
    secureLog("❌ RESET_ERROR", "unknown", `Error: ${error.message}`, ip);
    throw new Error("Error interno del servidor");
  }
}

module.exports = {
  requestPasswordReset,
  validateResetToken,
  resetPassword
};