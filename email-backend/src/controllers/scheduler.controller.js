const db = require("../config/db");
const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require("../config");

// Procesar emails programados pendientes
exports.processScheduledEmails = async () => {
  try {
    console.log("🔍 Verificando emails programados...");

    // Buscar emails programados que ya deben enviarse
    const [scheduledEmails] = await db.query(
      `SELECT e.*, u.email as user_email, u.name as user_name 
       FROM emails e 
       JOIN users u ON e.user_id = u.id 
       WHERE e.scheduled_for IS NOT NULL 
       AND e.scheduled_for <= NOW() 
       AND e.sent_at IS NULL 
       AND e.failed_at IS NULL
       ORDER BY e.scheduled_for ASC
       LIMIT 10`
    );

    if (scheduledEmails.length === 0) {
      console.log("📭 No hay emails programados pendientes");
      return { processed: 0, success: 0, failed: 0 };
    }

    console.log(
      `📨 Procesando ${scheduledEmails.length} emails programados...`
    );

    let successCount = 0;
    let failedCount = 0;

    // Procesar cada email programado
    for (const email of scheduledEmails) {
      try {
        // Enviar el email
        await sendScheduledEmail(email);

        // Marcar como enviado exitosamente
        await markEmailAsSent(email.id);

        successCount++;
        console.log(`✅ Email enviado: ${email.id} -> ${email.recipient}`);
      } catch (error) {
        // Marcar como fallido
        await markEmailAsFailed(email.id, error.message);

        failedCount++;
        console.error(`❌ Error enviando email ${email.id}:`, error.message);
      }
    }

    const result = {
      processed: scheduledEmails.length,
      success: successCount,
      failed: failedCount,
    };

    console.log(`📊 Procesamiento completado:`, result);
    return result;
  } catch (error) {
    console.error("❌ Error procesando emails programados:", error);
    throw error;
  }
};

// Enviar un email programado específico
async function sendScheduledEmail(emailData) {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  // Preparar el contenido del email
  const mailOptions = {
    from: `"EmailApp" <${EMAIL_USER}>`,
    to: emailData.recipient,
    subject: emailData.subject,
    html: formatEmailContent(emailData),
  };

  // Agregar adjunto si existe
  if (emailData.attachment) {
    mailOptions.attachments = [
      {
        filename: "attachment",
        path: emailData.attachment,
      },
    ];
  }

  // Enviar el email
  await transporter.sendMail(mailOptions);
}

// Formatear contenido del email para envío programado
function formatEmailContent(emailData) {
  const message = emailData.message.replace(/\n/g, "<br>");

  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 20px; border-left: 4px solid #082563;">
        <p style="margin: 0; font-size: 12px; color: #666;">
          📅 Este email fue programado y enviado automáticamente por EmailApp
        </p>
      </div>
      
      <div style="line-height: 1.6; color: #333;">
        ${message}
      </div>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #666;">
        <p>Enviado por EmailApp - Sistema de envío programado</p>
      </div>
    </div>
  `;
}

// Marcar email como enviado exitosamente
async function markEmailAsSent(emailId) {
  await db.query("UPDATE emails SET sent_at = NOW() WHERE id = ?", [emailId]);
}

// Marcar email como fallido
async function markEmailAsFailed(emailId, errorMessage) {
  await db.query(
    "UPDATE emails SET failed_at = NOW(), failure_reason = ? WHERE id = ?",
    [errorMessage, emailId]
  );
}

// Obtener estadísticas de emails programados para un usuario
exports.getScheduledStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      [pendingEmails],
      [sentEmails],
      [failedEmails],
      [nextScheduledEmail],
    ] = await Promise.all([
      // Emails pendientes de envío
      db.query(
        `SELECT COUNT(*) as count FROM emails 
         WHERE user_id = ? AND scheduled_for > NOW() 
         AND sent_at IS NULL AND failed_at IS NULL`,
        [userId]
      ),

      // Emails programados enviados exitosamente
      db.query(
        `SELECT COUNT(*) as count FROM emails 
         WHERE user_id = ? AND scheduled_for IS NOT NULL 
         AND sent_at IS NOT NULL`,
        [userId]
      ),

      // Emails programados fallidos
      db.query(
        `SELECT COUNT(*) as count FROM emails 
         WHERE user_id = ? AND scheduled_for IS NOT NULL 
         AND failed_at IS NOT NULL`,
        [userId]
      ),

      // Próximo email programado
      db.query(
        `SELECT id, recipient, subject, scheduled_for 
         FROM emails 
         WHERE user_id = ? AND scheduled_for > NOW() 
         AND sent_at IS NULL AND failed_at IS NULL
         ORDER BY scheduled_for ASC 
         LIMIT 1`,
        [userId]
      ),
    ]);

    res.json({
      pending: pendingEmails[0].count,
      sent: sentEmails[0].count,
      failed: failedEmails[0].count,
      nextEmail: nextScheduledEmail[0] || null,
    });
  } catch (err) {
    console.error("❌ Error obteniendo estadísticas programadas:", err);
    next(err);
  }
};

// Cancelar un email programado
exports.cancelScheduledEmail = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const emailId = req.params.id;

    // Verificar que el email pertenece al usuario y está pendiente
    const [emailResult] = await db.query(
      `SELECT id FROM emails 
       WHERE id = ? AND user_id = ? 
       AND scheduled_for > NOW() 
       AND sent_at IS NULL AND failed_at IS NULL`,
      [emailId, userId]
    );

    if (emailResult.length === 0) {
      return res.status(404).json({
        error: "Email programado no encontrado o ya procesado",
      });
    }

    // Cancelar el email (eliminar la programación)
    await db.query("UPDATE emails SET scheduled_for = NULL WHERE id = ?", [
      emailId,
    ]);

    res.json({
      message: "Email programado cancelado exitosamente",
      emailId: emailId,
    });
  } catch (err) {
    console.error("❌ Error cancelando email programado:", err);
    next(err);
  }
};
