-- ============================================
-- TokoDinamis Database Schema (MySQL)
-- ============================================
CREATE DATABASE IF NOT EXISTS tokodinamis CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE tokodinamis;

-- ============ USERS ============
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  whatsapp VARCHAR(20) NOT NULL,
  birth_date DATE NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin','user') NOT NULL DEFAULT 'user',
  avatar VARCHAR(255) DEFAULT NULL,
  reset_token VARCHAR(255) DEFAULT NULL,
  reset_token_expiry DATETIME DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============ CATEGORIES ============
CREATE TABLE IF NOT EXISTS categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  image VARCHAR(255) DEFAULT NULL
);

INSERT IGNORE INTO categories (name, slug) VALUES
('Elektronik','elektronik'),('Fashion','fashion'),
('Rumah Tangga','rumah-tangga'),('Kecantikan','kecantikan');

-- ============ PRODUCTS ============
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(220) NOT NULL,
  description TEXT,
  price DECIMAL(14,2) NOT NULL DEFAULT 0,
  stock INT NOT NULL DEFAULT 0,
  sku VARCHAR(50) UNIQUE,
  category_id INT,
  images JSON DEFAULT NULL, -- array of image paths, max 5
  rating DECIMAL(2,1) DEFAULT 0,
  location VARCHAR(100) DEFAULT NULL,
  is_published TINYINT(1) DEFAULT 0,
  compare_at_price DECIMAL(14,2) DEFAULT NULL, -- harga coret sebelum diskon, kosongkan jika tidak diskon
  sold_count INT DEFAULT 0, -- "Terjual X" di halaman detail
  specifications JSON DEFAULT NULL, -- {"Prosesor":"Octa-core 3.2GHz", "RAM":"12GB LPDDR5X", ...}
  warranty VARCHAR(100) DEFAULT '1 Tahun', -- badge "Garansi"
  free_shipping TINYINT(1) DEFAULT 1, -- badge "Bebas Ongkir"
  return_days INT DEFAULT 7, -- badge "X Hari Retur"
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);

-- ============ PRODUCT VARIANTS (mis. Warna: Hitam/Silver/Biru, Kapasitas: 128GB/256GB) ============
CREATE TABLE IF NOT EXISTS product_variants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  variant_group VARCHAR(50) NOT NULL, -- contoh: 'Warna', 'Kapasitas'
  value VARCHAR(100) NOT NULL,        -- contoh: 'Hitam', '256GB'
  color_hex VARCHAR(20) DEFAULT NULL, -- diisi hanya untuk grup 'Warna', contoh '#111827'
  extra_price DECIMAL(14,2) DEFAULT 0, -- tambahan harga dari harga dasar produk jika varian ini dipilih
  sort_order INT DEFAULT 0,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============ PRODUCT REVIEWS (Ulasan Pembeli) ============
CREATE TABLE IF NOT EXISTS product_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  user_id INT NOT NULL,
  rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============ CART ============
CREATE TABLE IF NOT EXISTS carts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  product_id INT NOT NULL,
  qty INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_product (user_id, product_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- ============ ORDERS ============
CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_code VARCHAR(50) NOT NULL UNIQUE,
  user_id INT NOT NULL,
  total_amount DECIMAL(14,2) NOT NULL,
  shipping_address TEXT,
  status ENUM('pending','paid','processing','shipped','completed','failed','expired','cancelled') DEFAULT 'pending',
  payment_type VARCHAR(50) DEFAULT NULL,
  snap_token VARCHAR(255) DEFAULT NULL,
  midtrans_transaction_id VARCHAR(100) DEFAULT NULL,
  paid_at DATETIME DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============ ORDER ITEMS ============
CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_name VARCHAR(200) NOT NULL,
  price DECIMAL(14,2) NOT NULL,
  qty INT NOT NULL,
  subtotal DECIMAL(14,2) NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Default admin (password: Admin123!) - hash generated with bcrypt, ganti setelah login pertama
-- Gunakan endpoint /api/auth/register lalu ubah role manual di DB jika perlu, atau seed berikut:
-- INSERT INTO users (name, whatsapp, email, password, role) VALUES
-- ('Admin Toko', '081234567890', 'admin@tokodinamis.com', '$2a$10$replace_with_bcrypt_hash', 'admin');

-- ============================================
-- MIGRASI untuk instalasi lama (yang sudah pernah menjalankan schema.sql versi sebelumnya)
-- Jalankan blok ini saja jika tabel products/product_variants/product_reviews sudah ada tapi
-- belum punya kolom/tabel baru di atas. Membutuhkan MySQL 8.0.29+ untuk "ADD COLUMN IF NOT EXISTS".
-- ============================================
-- ALTER TABLE products
--   ADD COLUMN IF NOT EXISTS compare_at_price DECIMAL(14,2) DEFAULT NULL,
--   ADD COLUMN IF NOT EXISTS sold_count INT DEFAULT 0,
--   ADD COLUMN IF NOT EXISTS specifications JSON DEFAULT NULL,
--   ADD COLUMN IF NOT EXISTS warranty VARCHAR(100) DEFAULT '1 Tahun',
--   ADD COLUMN IF NOT EXISTS free_shipping TINYINT(1) DEFAULT 1,
--   ADD COLUMN IF NOT EXISTS return_days INT DEFAULT 7;
--
-- CREATE TABLE IF NOT EXISTS product_variants (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   product_id INT NOT NULL,
--   variant_group VARCHAR(50) NOT NULL,
--   value VARCHAR(100) NOT NULL,
--   color_hex VARCHAR(20) DEFAULT NULL,
--   extra_price DECIMAL(14,2) DEFAULT 0,
--   sort_order INT DEFAULT 0,
--   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
-- );
--
-- CREATE TABLE IF NOT EXISTS product_reviews (
--   id INT AUTO_INCREMENT PRIMARY KEY,
--   product_id INT NOT NULL,
--   user_id INT NOT NULL,
--   rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
--   comment TEXT,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
--   FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
-- );
