const pool = require('../config/db');
const { success, fail } = require('../utils/response');
const { coreApi } = require('../config/midtrans');

// ============ MIDTRANS WEBHOOK / NOTIFICATION HANDLER ============
// Endpoint ini didaftarkan sebagai "Payment Notification URL" di dashboard Midtrans
exports.handleNotification = async (req, res) => {
  try {
    const statusResponse = await coreApi.transaction.notification(req.body);
    const orderCode = statusResponse.order_id;
    const transactionStatus = statusResponse.transaction_status;
    const fraudStatus = statusResponse.fraud_status;
    const paymentType = statusResponse.payment_type;
    const transactionId = statusResponse.transaction_id;

    let newStatus = 'pending';

    if (transactionStatus === 'capture') {
      newStatus = fraudStatus === 'accept' ? 'paid' : 'pending';
    } else if (transactionStatus === 'settlement') {
      newStatus = 'paid';
    } else if (transactionStatus === 'pending') {
      newStatus = 'pending';
    } else if (transactionStatus === 'deny') {
      newStatus = 'failed';
    } else if (transactionStatus === 'cancel') {
      newStatus = 'cancelled';
    } else if (transactionStatus === 'expire') {
      newStatus = 'expired';
    }

    const paidAt = newStatus === 'paid' ? new Date() : null;

    await pool.query(
      `UPDATE orders SET status = ?, payment_type = ?, midtrans_transaction_id = ?, paid_at = COALESCE(?, paid_at)
       WHERE order_code = ?`,
      [newStatus, paymentType, transactionId, paidAt, orderCode]
    );

    // Jika gagal/batal/kedaluwarsa, kembalikan stok produk
    if (['failed', 'cancelled', 'expired'].includes(newStatus)) {
      const [order] = await pool.query('SELECT id FROM orders WHERE order_code = ?', [orderCode]);
      if (order.length > 0) {
        const [items] = await pool.query('SELECT product_id, qty FROM order_items WHERE order_id = ?', [order[0].id]);
        for (const item of items) {
          await pool.query('UPDATE products SET stock = stock + ? WHERE id = ?', [item.qty, item.product_id]);
        }
      }
    }

    return success(res, 'Notifikasi pembayaran berhasil diproses.', { order_code: orderCode, status: newStatus });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memproses notifikasi pembayaran.', 500);
  }
};

// ============ CEK STATUS PEMBAYARAN MANUAL ============
exports.checkStatus = async (req, res) => {
  try {
    const { orderCode } = req.params;
    const [rows] = await pool.query('SELECT * FROM orders WHERE order_code = ? AND user_id = ?', [orderCode, req.user.id]);
    if (rows.length === 0) return fail(res, 'Pesanan tidak ditemukan.', 404);

    // Sinkronkan status terbaru dari Midtrans
    try {
      const statusResponse = await coreApi.transaction.status(orderCode);
      let newStatus = rows[0].status;
      if (statusResponse.transaction_status === 'settlement' || statusResponse.transaction_status === 'capture') {
        newStatus = 'paid';
      } else if (statusResponse.transaction_status === 'expire') {
        newStatus = 'expired';
      } else if (statusResponse.transaction_status === 'deny') {
        newStatus = 'failed';
      }
      if (newStatus !== rows[0].status) {
        await pool.query('UPDATE orders SET status = ? WHERE id = ?', [newStatus, rows[0].id]);
        rows[0].status = newStatus;
      }
    } catch (e) {
      // Jika belum ada transaksi di Midtrans, biarkan status lokal
    }

    return success(res, 'Berhasil mengambil status pembayaran.', rows[0]);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil status pembayaran.', 500);
  }
};
