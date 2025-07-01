const db = require("../config/db");
const nodemailer = require("nodemailer");
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = require("../config");

async function sendEmailInternal({ recipient, subject, message }) {
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false,
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
  });
  await transporter.sendMail({
    from: `"EmailApp" <${EMAIL_USER}>`,
    to: recipient,
    subject,
    html: `<p>${message}</p>`,
  });
}

async function saveAndSendEmail(
  userId,
  { recipient, subject, message, attachment, scheduled_for }
) {
  const [result] = await db.query(
    `INSERT INTO emails (user_id, recipient, subject, message, attachment, scheduled_for)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      userId,
      recipient,
      subject,
      message,
      attachment || null,
      scheduled_for || null,
    ]
  );
  await sendEmailInternal({ recipient, subject, message });
  return result.insertId;
}

async function getEmailsByUser(userId) {
  const [rows] = await db.query(
    `SELECT * FROM emails WHERE user_id = ? ORDER BY created_at DESC`,
    [userId]
  );
  return rows;
}

module.exports = { saveAndSendEmail, getEmailsByUser };
