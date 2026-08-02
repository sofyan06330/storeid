const jwt = require('jsonwebtoken');
const { fail } = require('../utils/response');
require('dotenv').config();

// Verifikasi JWT dari header Authorization: Bearer <token>
function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return fail(res, 'Token tidak ditemukan. Silakan login terlebih dahulu.', 401);
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    return fail(res, 'Token tidak valid atau sudah kedaluwarsa.', 401);
  }
}

// Middleware pembatas akses berdasarkan role, contoh: authorize('admin')
function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return fail(res, 'Anda tidak memiliki hak akses untuk aksi ini.', 403);
    }
    next();
  };
}

module.exports = { authenticate, authorize };
