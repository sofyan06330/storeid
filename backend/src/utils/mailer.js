const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendResetPasswordEmail(to, resetUrl) {
  await transporter.sendMail({
    from: `"StoreID" <${process.env.SMTP_USER}>`,
    to,
    subject: 'Reset Password - StoreID',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto;">
        <h2 style="color:#0f2557;">StoreID</h2>
        <p>Kami menerima permintaan untuk mengatur ulang password akun Anda.</p>
        <p>Klik tombol di bawah ini untuk membuat password baru. Tautan berlaku selama 1 jam.</p>
        <a href="${resetUrl}" style="display:inline-block;background:#ea580c;color:#fff;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;">Reset Password</a>
        <p style="margin-top:20px;color:#666;font-size:13px;">Jika Anda tidak meminta ini, abaikan email ini.</p>
      </div>
    `,
  });
}

module.exports = { sendResetPasswordEmail };
