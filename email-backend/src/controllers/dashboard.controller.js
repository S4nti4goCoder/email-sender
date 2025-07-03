const db = require("../config/db");

// Obtener estadísticas del dashboard
exports.getStats = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Consultas paralelas para mejor performance
    const [
      [emailsCount],
      [usersCount],
      [successfulEmails],
      [failedEmails],
      recentActivityResult,
    ] = await Promise.all([
      // Total emails enviados por el usuario
      db.query("SELECT COUNT(*) as count FROM emails WHERE user_id = ?", [
        userId,
      ]),

      // Total usuarios registrados (todos pueden ver este número)
      db.query("SELECT COUNT(*) as count FROM users"),

      // Emails exitosos (por ahora todos los emails son exitosos)
      db.query("SELECT COUNT(*) as count FROM emails WHERE user_id = ?", [
        userId,
      ]),

      // Emails fallidos (por ahora 0, más adelante implementaremos estados)
      [[{ count: 0 }]],

      // 🎯 Actividad reciente (últimos 10 emails del usuario)
      db.query(
        `
        SELECT 
          e.id,
          e.recipient,
          e.subject,
          e.created_at,
          u.name as user_name,
          u.email as user_email
        FROM emails e
        JOIN users u ON e.user_id = u.id
        WHERE e.user_id = ?
        ORDER BY e.created_at DESC
        LIMIT 20
      `,
        [userId]
      ),
    ]);

    // 🎯 SOLUCIÓN: Extraer el primer elemento del array anidado
    const recentActivity = recentActivityResult[0] || [];

    // Calcular porcentajes de éxito
    const totalEmails = emailsCount[0].count;
    const successful = successfulEmails[0].count;
    const failed = failedEmails[0].count;

    const successRate =
      totalEmails > 0 ? ((successful / totalEmails) * 100).toFixed(1) : 100;

    // 🎯 FORMATEO CORREGIDO: Actividad reciente con datos reales
    const formattedActivity = recentActivity.map((activity) => {
      // Obtener nombre del usuario de forma segura
      let userName = "Usuario";
      if (activity.user_name && activity.user_name.trim()) {
        userName = activity.user_name;
      } else if (activity.user_email && activity.user_email.includes("@")) {
        userName = activity.user_email.split("@")[0];
      }

      return {
        id: activity.id,
        user: userName,
        action: "envió un email a",
        target: activity.recipient,
        subject: activity.subject || "Sin asunto",
        time: formatTimeAgo(activity.created_at),
        status: "success",
      };
    });

    res.json({
      stats: {
        emailsSent: {
          value: totalEmails,
          change: "0%",
          changeType: "neutral",
        },
        usersRegistered: {
          value: usersCount[0].count,
          change: "+3",
          changeType: "positive",
        },
        successfulEmails: {
          value: successful,
          change: `${successRate}%`,
          changeType: "positive",
        },
        failedEmails: {
          value: failed,
          change: "0%",
          changeType: "neutral",
        },
      },
      recentActivity: formattedActivity,
    });
  } catch (err) {
    console.error("❌ Error en dashboard.controller:", err);
    next(err);
  }
};

// 🎯 FUNCIÓN MEJORADA: Formatear tiempo más claro
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
  return `hace más de una semana`;
}
