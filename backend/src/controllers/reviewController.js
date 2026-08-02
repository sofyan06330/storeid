const pool = require('../config/db');
const { success, fail } = require('../utils/response');

// ============ LIST ULASAN PRODUK (paginated, untuk tab "Ulasan") ============
exports.getReviews = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM product_reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT ? OFFSET ?`,
      [id, Number(limit), offset]
    );
    const [countRows] = await pool.query(
      'SELECT COUNT(*) AS total FROM product_reviews WHERE product_id = ?',
      [id]
    );

    return success(res, 'Berhasil mengambil daftar ulasan.', {
      items: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: countRows[0].total,
        totalPages: Math.max(1, Math.ceil(countRows[0].total / Number(limit))),
      },
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil daftar ulasan.', 500);
  }
};

// ============ KIRIM ULASAN (User/Admin, harus login) ============
exports.createReview = async (req, res) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    const ratingNum = Number(rating);
    if (!ratingNum || ratingNum < 1 || ratingNum > 5) {
      return fail(res, 'Rating harus antara 1 sampai 5.', 422);
    }

    const [product] = await pool.query('SELECT id FROM products WHERE id = ?', [id]);
    if (product.length === 0) return fail(res, 'Produk tidak ditemukan.', 404);

    await pool.query(
      'INSERT INTO product_reviews (product_id, user_id, rating, comment) VALUES (?, ?, ?, ?)',
      [id, req.user.id, ratingNum, comment || null]
    );

    // Perbarui rata-rata rating di tabel produk agar tampil konsisten di ProductCard/katalog
    const [avgRows] = await pool.query(
      'SELECT AVG(rating) AS avg_rating FROM product_reviews WHERE product_id = ?',
      [id]
    );
    await pool.query('UPDATE products SET rating = ? WHERE id = ?', [
      Number(avgRows[0].avg_rating).toFixed(1),
      id,
    ]);

    return success(res, 'Ulasan berhasil dikirim. Terima kasih atas masukan Anda!', null, 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengirim ulasan.', 500);
  }
};
