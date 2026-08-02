const pool = require('../config/db');
const { v4: uuidv4 } = require('uuid');
const { success, fail } = require('../utils/response');
const { snap } = require('../config/midtrans');

// ============ LANJUTKAN PESANAN (checkout dari cart -> buat order + snap token) ============
exports.checkout = async (req, res) => {
  const conn = await pool.getConnection();
  try {
    const { shipping_address } = req.body;
    if (!shipping_address) return fail(res, 'Alamat pengiriman wajib diisi.', 422);

    const [cartItems] = await conn.query(
      `SELECT c.qty, p.id AS product_id, p.name, p.price, p.stock
       FROM carts c JOIN products p ON c.product_id = p.id WHERE c.user_id = ?`,
      [req.user.id]
    );

    if (cartItems.length === 0) return fail(res, 'Keranjang Anda kosong.', 400);

    for (const item of cartItems) {
      if (item.stock < item.qty) {
        return fail(res, `Stok produk "${item.name}" tidak mencukupi.`, 400);
      }
    }

    const totalAmount = cartItems.reduce((sum, i) => sum + Number(i.price) * i.qty, 0);
    const orderCode = 'TD-' + Date.now() + '-' + uuidv4().slice(0, 6).toUpperCase();

    await conn.beginTransaction();

    const [orderResult] = await conn.query(
      `INSERT INTO orders (order_code, user_id, total_amount, shipping_address, status)
       VALUES (?, ?, ?, ?, 'pending')`,
      [orderCode, req.user.id, totalAmount, shipping_address]
    );
    const orderId = orderResult.insertId;

    for (const item of cartItems) {
      await conn.query(
        `INSERT INTO order_items (order_id, product_id, product_name, price, qty, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [orderId, item.product_id, item.name, item.price, item.qty, item.price * item.qty]
      );
      await conn.query('UPDATE products SET stock = stock - ? WHERE id = ?', [item.qty, item.product_id]);
    }

    // Buat transaksi Midtrans Snap
    const [userRows] = await conn.query('SELECT name, email, whatsapp FROM users WHERE id = ?', [req.user.id]);
    const user = userRows[0];

    const parameter = {
      transaction_details: {
        order_id: orderCode,
        gross_amount: Math.round(totalAmount),
      },
      customer_details: {
        first_name: user.name,
        email: user.email,
        phone: user.whatsapp,
      },
      item_details: cartItems.map(i => ({
        id: String(i.product_id),
        price: Math.round(i.price),
        quantity: i.qty,
        name: i.name.slice(0, 50),
      })),
    };

    const transaction = await snap.createTransaction(parameter);

    await conn.query('UPDATE orders SET snap_token = ? WHERE id = ?', [transaction.token, orderId]);
    await conn.query('DELETE FROM carts WHERE user_id = ?', [req.user.id]);

    await conn.commit();

    return success(res, 'Pesanan berhasil dibuat. Silakan lanjutkan pembayaran.', {
      order_id: orderId,
      order_code: orderCode,
      total_amount: totalAmount,
      snap_token: transaction.token,
      redirect_url: transaction.redirect_url,
    }, 201);
  } catch (err) {
    await conn.rollback();
    console.error(err);
    return fail(res, 'Gagal memproses pesanan.', 500);
  } finally {
    conn.release();
  }
};

// ============ LIST PESANAN USER ============
exports.getMyOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      'SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    return success(res, 'Berhasil mengambil daftar pesanan.', orders);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil daftar pesanan.', 500);
  }
};

// ============ DETAIL PESANAN ============
exports.getOrderDetail = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email AS customer_email, u.whatsapp AS customer_whatsapp
       FROM orders o JOIN users u ON o.user_id = u.id
       WHERE o.id = ? AND (o.user_id = ? OR ? = "admin")`,
      [req.params.id, req.user.id, req.user.role]
    );
    if (orders.length === 0) return fail(res, 'Pesanan tidak ditemukan.', 404);

    const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ?', [req.params.id]);
    return success(res, 'Berhasil mengambil detail pesanan.', { ...orders[0], items });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil detail pesanan.', 500);
  }
};

// ============ LIST SEMUA PESANAN (Admin) ============
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.email FROM orders o
       JOIN users u ON o.user_id = u.id ORDER BY o.created_at DESC`
    );
    return success(res, 'Berhasil mengambil semua pesanan.', orders);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil semua pesanan.', 500);
  }
};

// ============ UBAH STATUS PESANAN SECARA MANUAL (Admin) ============
// Dipakai admin untuk menandai pesanan sebagai processing/shipped/completed/cancelled
// setelah pembayaran (status pending/paid/failed/expired tetap dikontrol otomatis oleh webhook Midtrans).
exports.updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const allowedStatuses = ['pending', 'paid', 'processing', 'shipped', 'completed', 'failed', 'expired', 'cancelled'];

    if (!status || !allowedStatuses.includes(status)) {
      return fail(res, 'Status tidak valid.', 422);
    }

    const [existing] = await pool.query('SELECT id FROM orders WHERE id = ?', [id]);
    if (existing.length === 0) return fail(res, 'Pesanan tidak ditemukan.', 404);

    await pool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

    return success(res, 'Status pesanan berhasil diperbarui.', { status });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memperbarui status pesanan.', 500);
  }
};
