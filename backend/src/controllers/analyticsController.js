const pool = require('../config/db');
const { success, fail } = require('../utils/response');

// ============ RINGKASAN ANALITIK TOKO (Admin) ============
exports.getSummary = async (req, res) => {
  try {
    const [[{ totalRevenue }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) AS totalRevenue FROM orders WHERE status IN ('paid','processing','shipped','completed')`
    );
    const [[{ totalOrders }]] = await pool.query('SELECT COUNT(*) AS totalOrders FROM orders');
    const [[{ totalProducts }]] = await pool.query('SELECT COUNT(*) AS totalProducts FROM products');
    const [[{ totalUsers }]] = await pool.query(`SELECT COUNT(*) AS totalUsers FROM users WHERE role = 'user'`);

    const [statusBreakdown] = await pool.query(
      'SELECT status, COUNT(*) AS count FROM orders GROUP BY status'
    );

    // Pendapatan 14 hari terakhir, untuk grafik tren
    const [revenueByDay] = await pool.query(
      `SELECT DATE(created_at) AS date, COALESCE(SUM(total_amount), 0) AS revenue
       FROM orders
       WHERE status IN ('paid','processing','shipped','completed')
         AND created_at >= DATE_SUB(CURDATE(), INTERVAL 13 DAY)
       GROUP BY DATE(created_at)
       ORDER BY date ASC`
    );

    // 5 produk terlaris berdasarkan jumlah unit terjual dari pesanan yang sudah dibayar
    const [topProducts] = await pool.query(
      `SELECT p.id, p.name, SUM(oi.qty) AS total_sold, SUM(oi.subtotal) AS total_revenue
       FROM order_items oi
       JOIN orders o ON oi.order_id = o.id
       JOIN products p ON oi.product_id = p.id
       WHERE o.status IN ('paid','processing','shipped','completed')
       GROUP BY p.id, p.name
       ORDER BY total_sold DESC
       LIMIT 5`
    );

    return success(res, 'Berhasil mengambil ringkasan analitik.', {
      totals: {
        revenue: Number(totalRevenue),
        orders: totalOrders,
        products: totalProducts,
        users: totalUsers,
      },
      statusBreakdown,
      revenueByDay,
      topProducts,
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil ringkasan analitik.', 500);
  }
};
