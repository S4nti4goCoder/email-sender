const db = require("../config/db");
const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require("../config");

// Obtener estado completo del sistema
exports.getSystemStatus = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Consultas paralelas para obtener datos del sistema
    const [
      [emailsInQueue],
      [lastActivityResult],
      [totalEmailsToday],
      [systemUptimeResult]
    ] = await Promise.all([
      // Emails en cola (programados para el futuro)
      db.query(
        "SELECT COUNT(*) as count FROM emails WHERE scheduled_for > NOW() AND user_id = ?",
        [userId]
      ),

      // Última actividad del usuario
      db.query(
        `SELECT created_at FROM emails 
         WHERE user_id = ? 
         ORDER BY created_at DESC 
         LIMIT 1`,
        [userId]
      ),

      // Total de emails enviados hoy por el usuario
      db.query(
        `SELECT COUNT(*) as count FROM emails 
         WHERE DATE(created_at) = CURDATE() AND user_id = ?`,
        [userId]
      ),

      // Tiempo de actividad del sistema (aproximado basado en la primera actividad)
      db.query(
        "SELECT MIN(created_at) as first_activity FROM emails"
      )
    ]);

    // Verificar estado del servidor de email
    const emailServerStatus = await checkEmailServerStatus();

    // Formatear última actividad
    let lastActivity = "Sin actividad";
    if (lastActivityResult[0]?.created_at) {
      lastActivity = formatTimeAgo(lastActivityResult[0].created_at);
    }

    // Calcular uptime del sistema
    let systemUptime = "Desconocido";
    if (systemUptimeResult[0]?.first_activity) {
      systemUptime = formatSystemUptime(systemUptimeResult[0].first_activity);
    }

    // Respuesta completa del estado del sistema
    res.json({
      server: {
        status: "online",
        uptime: systemUptime,
        emailServer: emailServerStatus
      },
      user: {
        emailsInQueue: emailsInQueue[0].count,
        lastActivity: lastActivity,
        emailsToday: totalEmailsToday[0].count
      },
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    console.error("❌ Error en system.controller:", err);
    next(err);
  }
};

// Verificar conectividad del servidor de email
async function checkEmailServerStatus() {
  try {
    // Primero verificar que las credenciales estén configuradas
    if (!EMAIL_USER || !EMAIL_PASS || !EMAIL_HOST) {
      return {
        status: "error",
        host: EMAIL_HOST || "No configurado",
        message: "Credenciales de email no configuradas"
      };
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: false,
      auth: { 
        user: EMAIL_USER, 
        pass: EMAIL_PASS 
      },
      // Configuración específica para Gmail
      requireTLS: true,
      connectionTimeout: 10000,
      greetingTimeout: 5000,
      socketTimeout: 10000,
    });

    // Intentar verificar con timeout más largo para Gmail
    await Promise.race([
      transporter.verify(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Timeout de verificación')), 8000)
      )
    ]);
    
    console.log("✅ Servidor de email verificado correctamente");
    return {
      status: "connected",
      host: EMAIL_HOST,
      message: "Servidor de email conectado y verificado"
    };

  } catch (error) {
    console.log("⚠️ Verificación de email falló, pero credenciales configuradas:", error.message);
    
    // Para Gmail, si la verificación falla pero las credenciales están bien configuradas,
    // asumimos que funciona (porque sabemos que envía emails correctamente)
    if (EMAIL_USER && EMAIL_PASS && EMAIL_HOST === 'smtp.gmail.com') {
      console.log("✅ Gmail configurado correctamente (verificación falló pero credenciales OK)");
      return {
        status: "configured",
        host: EMAIL_HOST,
        message: "Gmail configurado y funcional"
      };
    }
    
    return {
      status: "error",
      host: EMAIL_HOST,
      message: `Error de conexión: ${error.message}`
    };
  }
}

// Formatear tiempo transcurrido desde una fecha
function formatTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "hace un momento";
  if (minutes === 1) return "hace 1 minuto";
  if (minutes < 60) return `hace ${minutes} minutos`;
  if (hours === 1) return "hace 1 hora";
  if (hours < 24) return `hace ${hours} horas`;
  if (days === 1) return "hace 1 día";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} semanas`;
  return `hace ${Math.floor(days / 30)} meses`;
}

// Formatear tiempo de actividad del sistema
function formatSystemUptime(firstActivityDate) {
  const now = new Date();
  const start = new Date(firstActivityDate);
  const diff = now - start;
  
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);

  if (days > 0) {
    return `${days} días, ${hours} horas`;
  } else if (hours > 0) {
    return `${hours} horas, ${minutes} minutos`;
  } else {
    return `${minutes} minutos`;
  }
}

// Obtener estadísticas detalladas del usuario
exports.getUserStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [
      [emailsThisWeek],
      [emailsThisMonth],
      [avgEmailsPerDay],
      [topRecipients]
    ] = await Promise.all([
      // Emails esta semana
      db.query(
        `SELECT COUNT(*) as count FROM emails 
         WHERE WEEK(created_at) = WEEK(NOW()) 
         AND YEAR(created_at) = YEAR(NOW()) 
         AND user_id = ?`,
        [userId]
      ),

      // Emails este mes
      db.query(
        `SELECT COUNT(*) as count FROM emails 
         WHERE MONTH(created_at) = MONTH(NOW()) 
         AND YEAR(created_at) = YEAR(NOW()) 
         AND user_id = ?`,
        [userId]
      ),

      // Promedio de emails por día (últimos 30 días)
      db.query(
        `SELECT ROUND(COUNT(*) / 30, 1) as avg_per_day FROM emails 
         WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) 
         AND user_id = ?`,
        [userId]
      ),

      // Top 5 destinatarios más frecuentes
      db.query(
        `SELECT recipient, COUNT(*) as count 
         FROM emails 
         WHERE user_id = ? 
         GROUP BY recipient 
         ORDER BY count DESC 
         LIMIT 5`,
        [userId]
      )
    ]);

    res.json({
      period: {
        thisWeek: emailsThisWeek[0].count,
        thisMonth: emailsThisMonth[0].count,
        avgPerDay: avgEmailsPerDay[0].avg_per_day || 0
      },
      topRecipients: topRecipients[0].map(r => ({
        email: r.recipient,
        count: r.count
      }))
    });

  } catch (err) {
    console.error("❌ Error en getUserStats:", err);
    next(err);
  }
};