const pool = require('../config/db');
const { success, fail } = require('../utils/response');

// ============ TAMBAH KE KERANJANG ============
exports.addToCart = async (req, res) => {
  try {
    const { product_id, qty = 1 } = req.body;
    if (!product_id) return fail(res, 'ID produk wajib diisi.', 422);

    const [product] = await pool.query('SELECT id, stock FROM products WHERE id = ?', [product_id]);
    if (product.length === 0) return fail(res, 'Produk tidak ditemukan.', 404);
    if (product[0].stock < qty) return fail(res, 'Stok produk tidak mencukupi.', 400);

    await pool.query(
      `INSERT INTO carts (user_id, product_id, qty) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE qty = qty + VALUES(qty)`,
      [req.user.id, product_id, qty]
    );

    return success(res, 'Produk berhasil ditambahkan ke keranjang.', null, 201);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal menambahkan produk ke keranjang.', 500);
  }
};

// ============ LIHAT KERANJANG ============
exports.getCart = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.id AS cart_id, c.qty, p.id AS product_id, p.name, p.price, p.stock, p.images
       FROM carts c JOIN products p ON c.product_id = p.id
       WHERE c.user_id = ? ORDER BY c.created_at DESC`,
      [req.user.id]
    );
    const items = rows.map(r => ({ ...r, images: r.images ? JSON.parse(r.images) : [] }));
    const total = items.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
    return success(res, 'Berhasil mengambil isi keranjang.', { items, total });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil isi keranjang.', 500);
  }
};

// ============ UPDATE QTY ITEM KERANJANG ============
exports.updateCartItem = async (req, res) => {
  try {
    const { qty } = req.body;
    if (!qty || qty < 1) return fail(res, 'Jumlah tidak valid.', 422);

    const [result] = await pool.query(
      'UPDATE carts SET qty = ? WHERE id = ? AND user_id = ?',
      [qty, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return fail(res, 'Item keranjang tidak ditemukan.', 404);
    return success(res, 'Jumlah item berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memperbarui item keranjang.', 500);
  }
};

// ============ HAPUS ITEM KERANJANG ============
exports.removeCartItem = async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM carts WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0) return fail(res, 'Item keranjang tidak ditemukan.', 404);
    return success(res, 'Item berhasil dihapus dari keranjang.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal menghapus item keranjang.', 500);
  }
};
