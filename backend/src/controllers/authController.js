const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { sendResetPasswordEmail } = require('../utils/mailer');
require('dotenv').config();

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES || '7d' }
  );
}

// ============ REGISTER ============
exports.register = async (req, res) => {
  try {
    const { name, whatsapp, birth_date, email, password, confirm_password } = req.body;

    if (!name || !whatsapp || !email || !password || !confirm_password) {
      return fail(res, 'Semua field wajib diisi.', 422);
    }
    if (password !== confirm_password) {
      return fail(res, 'Password dan konfirmasi password tidak sama.', 422);
    }
    if (password.length < 8) {
      return fail(res, 'Password minimal 8 karakter.', 422);
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return fail(res, 'Email sudah terdaftar. Silakan login.', 409);
    }

    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (name, whatsapp, birth_date, email, password, role)
       VALUES (?, ?, ?, ?, ?, 'user')`,
      [name, whatsapp, birth_date || null, email, hashed]
    );

    const user = { id: result.insertId, name, email, role: 'user' };
    const token = generateToken(user);

    return success(res, 'Registrasi berhasil. Selamat datang di TokoDinamis!', {
      user,
      token,
    }, 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Registrasi gagal. Terjadi kesalahan pada server.', 500);
  }
};

// ============ LOGIN ============
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return fail(res, 'Email dan password wajib diisi.', 422);
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return fail(res, 'Email atau password salah.', 401);
    }

    const user = rows[0];
    if (!user.is_active) {
      return fail(res, 'Akun Anda dinonaktifkan. Hubungi admin.', 403);
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return fail(res, 'Email atau password salah.', 401);
    }

    const token = generateToken(user);
    delete user.password;
    delete user.reset_token;
    delete user.reset_token_expiry;

    return success(res, 'Login berhasil.', { user, token });
  } catch (err) {
    console.error(err);
    return fail(res, 'Login gagal. Terjadi kesalahan pada server.', 500);
  }
};

// ============ FORGOT PASSWORD ============
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return fail(res, 'Email wajib diisi.', 422);

    const [rows] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      // Untuk keamanan, tetap kirim respon sukses walau email tidak ditemukan
      return success(res, 'Jika email terdaftar, tautan reset password telah dikirim.');
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 jam

    await pool.query(
      'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE email = ?',
      [hashedToken, expiry, email]
    );

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    try {
      await sendResetPasswordEmail(email, resetUrl);
    } catch (mailErr) {
      console.error('Gagal kirim email:', mailErr.message);
    }

    return success(res, 'Jika email terdaftar, tautan reset password telah dikirim.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memproses permintaan lupa password.', 500);
  }
};

// ============ RESET PASSWORD ============
exports.resetPassword = async (req, res) => {
  try {
    const { email, token, password, confirm_password } = req.body;
    if (!email || !token || !password || !confirm_password) {
      return fail(res, 'Semua field wajib diisi.', 422);
    }
    if (password !== confirm_password) {
      return fail(res, 'Password dan konfirmasi password tidak sama.', 422);
    }
    if (password.length < 8) {
      return fail(res, 'Password minimal 8 karakter.', 422);
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await pool.query(
      `SELECT id, reset_token_expiry FROM users
       WHERE email = ? AND reset_token = ?`,
      [email, hashedToken]
    );

    if (rows.length === 0) {
      return fail(res, 'Tautan reset password tidak valid.', 400);
    }
    const user = rows[0];
    if (new Date(user.reset_token_expiry) < new Date()) {
      return fail(res, 'Tautan reset password sudah kedaluwarsa. Silakan minta ulang.', 400);
    }

    const hashed = await bcrypt.hash(password, 10);
    await pool.query(
      'UPDATE users SET password = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
      [hashed, user.id]
    );

    return success(res, 'Password berhasil diubah. Silakan login dengan password baru.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mereset password.', 500);
  }
};

// ============ GET PROFILE (ME) ============
exports.me = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, whatsapp, birth_date, email, role, avatar, created_at FROM users WHERE id = ?',
      [req.user.id]
    );
    if (rows.length === 0) return fail(res, 'Pengguna tidak ditemukan.', 404);
    return success(res, 'Berhasil mengambil data profil.', rows[0]);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil data profil.', 500);
  }
};

// ============ UPDATE DATA DIRI ============
exports.updateProfile = async (req, res) => {
  try {
    const { name, whatsapp, birth_date } = req.body;
    if (!name || !whatsapp) {
      return fail(res, 'Nama dan No. WhatsApp wajib diisi.', 422);
    }
    await pool.query(
      'UPDATE users SET name = ?, whatsapp = ?, birth_date = ? WHERE id = ?',
      [name, whatsapp, birth_date || null, req.user.id]
    );
    return success(res, 'Data profil berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memperbarui data profil.', 500);
  }
};

// ============ UPDATE PASSWORD (saat sudah login) ============
exports.updatePassword = async (req, res) => {
  try {
    const { old_password, new_password, confirm_password } = req.body;
    if (!old_password || !new_password || !confirm_password) {
      return fail(res, 'Semua field wajib diisi.', 422);
    }
    if (new_password !== confirm_password) {
      return fail(res, 'Password baru dan konfirmasi tidak sama.', 422);
    }
    if (new_password.length < 8) {
      return fail(res, 'Password baru minimal 8 karakter.', 422);
    }

    const [rows] = await pool.query('SELECT password FROM users WHERE id = ?', [req.user.id]);
    if (rows.length === 0) return fail(res, 'Pengguna tidak ditemukan.', 404);

    const match = await bcrypt.compare(old_password, rows[0].password);
    if (!match) return fail(res, 'Password lama tidak sesuai.', 401);

    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = ? WHERE id = ?', [hashed, req.user.id]);

    return success(res, 'Password berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memperbarui password.', 500);
  }
};
