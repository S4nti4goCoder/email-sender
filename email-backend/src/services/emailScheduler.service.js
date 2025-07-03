const {
  processScheduledEmails,
} = require("../controllers/scheduler.controller");

class EmailSchedulerService {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.intervalMinutes = 1; // Verificar cada minuto
  }

  // Iniciar el scheduler automático
  start() {
    if (this.isRunning) {
      console.log("⚠️ Email scheduler ya está funcionando");
      return;
    }

    console.log(
      `🚀 Iniciando email scheduler (cada ${this.intervalMinutes} minuto(s))`
    );

    this.isRunning = true;

    // Ejecutar inmediatamente al inicio
    this.processEmails();

    // Configurar intervalo automático
    this.intervalId = setInterval(() => {
      this.processEmails();
    }, this.intervalMinutes * 60 * 1000); // Convertir minutos a milisegundos

    console.log("✅ Email scheduler iniciado correctamente");
  }

  // Detener el scheduler
  stop() {
    if (!this.isRunning) {
      console.log("⚠️ Email scheduler no está funcionando");
      return;
    }

    console.log("🛑 Deteniendo email scheduler...");

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    this.isRunning = false;
    console.log("✅ Email scheduler detenido");
  }

  // Procesar emails programados (función interna)
  async processEmails() {
    try {
      const result = await processScheduledEmails();

      // Solo mostrar log si se procesaron emails
      if (result.processed > 0) {
        console.log(
          `📨 Scheduler procesó ${result.processed} emails: ${result.success} exitosos, ${result.failed} fallidos`
        );
      }
    } catch (error) {
      console.error("❌ Error en scheduler automático:", error.message);
    }
  }

  // Obtener estado del scheduler
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.intervalMinutes,
      nextCheck: this.isRunning
        ? new Date(Date.now() + this.intervalMinutes * 60 * 1000)
        : null,
    };
  }

  // Cambiar intervalo (solo cuando está detenido)
  setInterval(minutes) {
    if (this.isRunning) {
      console.log(
        "⚠️ No se puede cambiar el intervalo mientras el scheduler está funcionando"
      );
      return false;
    }

    if (minutes < 1) {
      console.log("⚠️ El intervalo mínimo es 1 minuto");
      return false;
    }

    this.intervalMinutes = minutes;
    console.log(`✅ Intervalo del scheduler cambiado a ${minutes} minuto(s)`);
    return true;
  }

  // Ejecutar procesamiento manual (para testing)
  async runNow() {
    console.log("🔄 Ejecutando procesamiento manual de emails...");
    return await this.processEmails();
  }
}

// Crear instancia única del scheduler
const emailScheduler = new EmailSchedulerService();

module.exports = emailScheduler;
