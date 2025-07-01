const mysql = require("mysql2");
const { DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT } = process.env;

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  port: DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

db.query("SELECT 1")
  .then(() => console.log("🔌 Conectado a MySQL"))
  .catch((err) => console.error("❌ Error conexión MySQL:", err));

module.exports = db;
