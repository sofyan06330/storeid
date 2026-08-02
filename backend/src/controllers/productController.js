const pool = require('../config/db');
const { success, fail } = require('../utils/response');

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-5);
}

// ============ TAMBAH PRODUK (Admin) ============
exports.createProduct = async (req, res) => {
  try {
    const {
      name, description, price, stock, sku, category_id, is_published,
      compare_at_price, specifications, warranty, free_shipping, return_days,
    } = req.body;

    if (!name || !price) {
      return fail(res, 'Nama produk dan harga wajib diisi.', 422);
    }

    const images = (req.files || []).map(f => `/uploads/${f.filename}`);
    const slug = slugify(name);

    // specifications dikirim frontend sebagai JSON string, contoh: '{"Prosesor":"Octa-core"}'
    let specJson = null;
    if (specifications) {
      try { specJson = JSON.stringify(JSON.parse(specifications)); } catch { specJson = null; }
    }

    const [result] = await pool.query(
      `INSERT INTO products (name, slug, description, price, stock, sku, category_id, images, is_published, created_by,
        compare_at_price, specifications, warranty, free_shipping, return_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        slug,
        description || '',
        price,
        stock || 0,
        sku || null,
        category_id || null,
        JSON.stringify(images),
        is_published === 'true' || is_published === true ? 1 : 0,
        req.user.id,
        compare_at_price || null,
        specJson,
        warranty || '1 Tahun',
        free_shipping === 'false' || free_shipping === false ? 0 : 1,
        return_days || 7,
      ]
    );

    return success(res, 'Produk berhasil ditambahkan.', { id: result.insertId, slug, images }, 201);
  } catch (err) {
    console.error(err);
    if (err.code === 'ER_DUP_ENTRY') {
      return fail(res, 'SKU produk sudah digunakan.', 409);
    }
    return fail(res, 'Gagal menambahkan produk.', 500);
  }
};

// ============ LIST PRODUK (publik / katalog) — mendukung filter & sorting ============
exports.getProducts = async (req, res) => {
  try {
    const {
      category, search, page = 1, limit = 12, publishedOnly = 'true',
      sort = 'popular', minPrice, maxPrice, minRating, location,
    } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    let whereClause = `FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE 1=1`;
    const params = [];

    if (publishedOnly === 'true') {
      whereClause += ' AND p.is_published = 1';
    }
    if (category) {
      // Mendukung banyak kategori sekaligus, dipisah koma: ?category=fashion,elektronik
      const slugs = String(category).split(',').filter(Boolean);
      if (slugs.length > 0) {
        whereClause += ` AND c.slug IN (${slugs.map(() => '?').join(',')})`;
        params.push(...slugs);
      }
    }
    if (search) {
      whereClause += ' AND p.name LIKE ?';
      params.push(`%${search}%`);
    }
    if (minPrice) {
      whereClause += ' AND p.price >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      whereClause += ' AND p.price <= ?';
      params.push(Number(maxPrice));
    }
    if (minRating) {
      whereClause += ' AND p.rating >= ?';
      params.push(Number(minRating));
    }
    if (location) {
      const locs = String(location).split(',').filter(Boolean);
      if (locs.length > 0) {
        whereClause += ` AND p.location IN (${locs.map(() => '?').join(',')})`;
        params.push(...locs);
      }
    }

    const [countRows] = await pool.query(`SELECT COUNT(*) AS total ${whereClause}`, params);
    const total = countRows[0].total;

    let orderBy = 'p.created_at DESC';
    if (sort === 'lowest') orderBy = 'p.price ASC';
    else if (sort === 'highest') orderBy = 'p.price DESC';
    else if (sort === 'newest') orderBy = 'p.created_at DESC';
    else if (sort === 'popular') orderBy = 'p.rating DESC, p.created_at DESC';

    const query = `SELECT p.*, c.name AS category_name ${whereClause} ORDER BY ${orderBy} LIMIT ? OFFSET ?`;
    const [rows] = await pool.query(query, [...params, Number(limit), offset]);

    return success(res, 'Berhasil mengambil daftar produk.', {
      items: rows,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.max(1, Math.ceil(total / Number(limit))),
      },
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil daftar produk.', 500);
  }
};

// ============ FILTER OPTIONS (kategori + lokasi unik, untuk sidebar filter katalog) ============
exports.getFilterOptions = async (req, res) => {
  try {
    const [categories] = await pool.query('SELECT * FROM categories ORDER BY name');
    const [locationRows] = await pool.query(
      `SELECT DISTINCT location FROM products WHERE location IS NOT NULL AND location != '' ORDER BY location`
    );
    return success(res, 'Berhasil mengambil opsi filter.', {
      categories,
      locations: locationRows.map(r => r.location),
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil opsi filter.', 500);
  }
};

// ============ DETAIL PRODUK (untuk halaman katalog admin/detail sederhana) ============
exports.getProductById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name FROM products p
       LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return fail(res, 'Produk tidak ditemukan.', 404);
    return success(res, 'Berhasil mengambil detail produk.', rows[0]);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil detail produk.', 500);
  }
};

// ============ DETAIL PRODUK LENGKAP (halaman Detail Produk: varian, spesifikasi, ringkasan ulasan) ============
exports.getProductDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p
       LEFT JOIN categories c ON p.category_id = c.id WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0) return fail(res, 'Produk tidak ditemukan.', 404);
    const product = rows[0];

    const [variantRows] = await pool.query(
      `SELECT id, variant_group, value, color_hex, extra_price FROM product_variants
       WHERE product_id = ? ORDER BY variant_group, sort_order, id`,
      [id]
    );
    const variants = {};
    for (const v of variantRows) {
      if (!variants[v.variant_group]) variants[v.variant_group] = [];
      variants[v.variant_group].push(v);
    }

    const [ratingRows] = await pool.query(
      'SELECT rating, COUNT(*) AS count FROM product_reviews WHERE product_id = ? GROUP BY rating',
      [id]
    );
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalReviews = 0;
    let sumRating = 0;
    for (const r of ratingRows) {
      breakdown[r.rating] = r.count;
      totalReviews += r.count;
      sumRating += r.rating * r.count;
    }
    const average = totalReviews > 0 ? Number((sumRating / totalReviews).toFixed(1)) : Number(product.rating || 0);

    const [reviews] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name
       FROM product_reviews r JOIN users u ON r.user_id = u.id
       WHERE r.product_id = ? ORDER BY r.created_at DESC LIMIT 5`,
      [id]
    );

    return success(res, 'Berhasil mengambil detail produk.', {
      ...product,
      variants,
      rating_summary: { average, total: totalReviews, breakdown },
      reviews,
    });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil detail produk.', 500);
  }
};

// ============ UPDATE PRODUK (Admin) ============
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, price, stock, sku, category_id, is_published,
      compare_at_price, specifications, warranty, free_shipping, return_days,
    } = req.body;

    const [existing] = await pool.query('SELECT * FROM products WHERE id = ?', [id]);
    if (existing.length === 0) return fail(res, 'Produk tidak ditemukan.', 404);

    let images = existing[0].images;
    if (req.files && req.files.length > 0) {
      images = JSON.stringify(req.files.map(f => `/uploads/${f.filename}`));
    }

    let specJson = existing[0].specifications;
    if (specifications) {
      try { specJson = JSON.stringify(JSON.parse(specifications)); } catch { /* keep existing on invalid JSON */ }
    }

    await pool.query(
      `UPDATE products SET name=?, description=?, price=?, stock=?, sku=?, category_id=?, images=?, is_published=?,
        compare_at_price=?, specifications=?, warranty=?, free_shipping=?, return_days=? WHERE id=?`,
      [
        name || existing[0].name,
        description ?? existing[0].description,
        price || existing[0].price,
        stock ?? existing[0].stock,
        sku || existing[0].sku,
        category_id || existing[0].category_id,
        images,
        is_published === 'true' || is_published === true ? 1 : (is_published === 'false' || is_published === false ? 0 : existing[0].is_published),
        compare_at_price === '' ? null : (compare_at_price ?? existing[0].compare_at_price),
        specJson,
        warranty || existing[0].warranty,
        free_shipping === 'false' || free_shipping === false ? 0 : (free_shipping === undefined ? existing[0].free_shipping : 1),
        return_days || existing[0].return_days,
        id,
      ]
    );

    return success(res, 'Produk berhasil diperbarui.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal memperbarui produk.', 500);
  }
};

// ============ HAPUS PRODUK (Admin) ============
exports.deleteProduct = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return fail(res, 'Produk tidak ditemukan.', 404);
    return success(res, 'Produk berhasil dihapus.');
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal menghapus produk.', 500);
  }
};

// ============ TOGGLE PUBLIKASI PRODUK (Admin) — quick action tanpa perlu buka form Edit ============
exports.togglePublish = async (req, res) => {
  try {
    const [existing] = await pool.query('SELECT is_published FROM products WHERE id = ?', [req.params.id]);
    if (existing.length === 0) return fail(res, 'Produk tidak ditemukan.', 404);

    const newStatus = existing[0].is_published ? 0 : 1;
    await pool.query('UPDATE products SET is_published = ? WHERE id = ?', [newStatus, req.params.id]);

    return success(res, newStatus ? 'Produk berhasil dipublikasikan.' : 'Produk disembunyikan dari etalase.', { is_published: newStatus });
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengubah status publikasi produk.', 500);
  }
};

// ============ LIST KATEGORI ============
exports.getCategories = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM categories ORDER BY id');
    return success(res, 'Berhasil mengambil daftar kategori.', rows);
  } catch (err) {
    console.error(err);
    return fail(res, 'Gagal mengambil daftar kategori.', 500);
  }
};
