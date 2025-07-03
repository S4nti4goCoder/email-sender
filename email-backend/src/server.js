require("dotenv").config();
const app = require("./app");
const { PORT } = require("./config");
const emailScheduler = require("./services/emailScheduler.service"); // 👈 NUEVA LÍNEA

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);

  // 👈 NUEVO BLOQUE: Iniciar el scheduler automáticamente
  setTimeout(() => {
    console.log("🚀 Iniciando sistema de envío programado...");
    emailScheduler.start();
  }, 2000); // Esperar 2 segundos para que todo esté listo
});
