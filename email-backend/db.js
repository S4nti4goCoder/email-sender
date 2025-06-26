// email-backend/db.js
const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

// Creamos un pool en lugar de una única conexión
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Opcional: promesas en lugar de callbacks
const promisePool = pool.promise();

promisePool
  .query("SELECT 1")
  .then(() => console.log("Pool de MySQL conectado ✅"))
  .catch((err) => console.error("Error al conectar pool de MySQL:", err));

module.exports = promisePool;
