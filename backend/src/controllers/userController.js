const pool = require('../config/db');
const { success, fail } = require('../utils/response');

// ============ LIST SEMUA AKUN TERDAFTAR (Admin) ============
exports.getUsers = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, whatsapp, role, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    return success(res, 'Berhasil mengambil daftar akun.', rows);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil daftar akun.', 500);
  }
};

// ============ AKTIFKAN / NONAKTIFKAN AKUN (Admin) ============
exports.toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (Number(id) === req.user.id) {
      return fail(res, 'Anda tidak dapat menonaktifkan akun sendiri.', 400);
    }

    const [existing] = await pool.query('SELECT is_active FROM users WHERE id = ?', [id]);
    if (existing.length === 0) return fail(res, 'Akun tidak ditemukan.', 404);

    const newStatus = existing[0].is_active ? 0 : 1;
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [newStatus, id]);

    return success(
      res,
      newStatus ? 'Akun berhasil diaktifkan.' : 'Akun berhasil dinonaktifkan.',
      { is_active: newStatus }
    );
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengubah status akun.', 500);
  }
};
