-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 28 Okt 2026 pada 13.14
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `storeid`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `carts`
--

CREATE TABLE `carts` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `qty` int(11) NOT NULL DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `slug` varchar(100) NOT NULL,
  `image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `categories`
--

INSERT INTO `categories` (`id`, `name`, `slug`, `image`) VALUES
(1, 'Elektronik', 'elektronik', NULL),
(2, 'Fashion', 'fashion', NULL),
(3, 'Rumah Tangga', 'rumah-tangga', NULL),
(4, 'Kecantikan', 'kecantikan', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `order_code` varchar(50) NOT NULL,
  `user_id` int(11) NOT NULL,
  `total_amount` decimal(14,2) NOT NULL,
  `shipping_address` text DEFAULT NULL,
  `status` enum('pending','paid','processing','shipped','completed','failed','expired','cancelled') DEFAULT 'pending',
  `payment_type` varchar(50) DEFAULT NULL,
  `snap_token` varchar(255) DEFAULT NULL,
  `midtrans_transaction_id` varchar(100) DEFAULT NULL,
  `paid_at` datetime DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `product_name` varchar(200) NOT NULL,
  `price` decimal(14,2) NOT NULL,
  `qty` int(11) NOT NULL,
  `subtotal` decimal(14,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(200) NOT NULL,
  `slug` varchar(220) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(14,2) NOT NULL DEFAULT 0.00,
  `stock` int(11) NOT NULL DEFAULT 0,
  `sku` varchar(50) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL,
  `images` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`images`)),
  `rating` decimal(2,1) DEFAULT 0.0,
  `location` varchar(100) DEFAULT NULL,
  `is_published` tinyint(1) DEFAULT 0,
  `compare_at_price` decimal(14,2) DEFAULT NULL,
  `sold_count` int(11) DEFAULT 0,
  `specifications` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`specifications`)),
  `warranty` varchar(100) DEFAULT '1 Tahun',
  `free_shipping` tinyint(1) DEFAULT 1,
  `return_days` int(11) DEFAULT 7,
  `created_by` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `products`
--

INSERT INTO `products` (`id`, `name`, `slug`, `description`, `price`, `stock`, `sku`, `category_id`, `images`, `rating`, `location`, `is_published`, `compare_at_price`, `sold_count`, `specifications`, `warranty`, `free_shipping`, `return_days`, `created_by`, `created_at`, `updated_at`) VALUES
(1, 'sepatu roda anak perempuan LED nyala labubu impor', 'sepatu-roda-anak-perempuan-led-nyala-labubu-impor-43026', 'Qualitas:impor 100％\r\n\r\n\r\n\r\nCara ukur : \r\n\r\nGambar kaki anak di kertas, ukur dengan penggaris dari depan sampai belakang, jika sudah lalu tambahkan 1 cm untuk mendapatkan size yang tepat\r\n\r\n\r\n\r\n\r\n\r\nSize 29 insole 19.4cm \r\n\r\nSize 30 insole 20 cm \r\n\r\nSize 31 insole 20.6 cm\r\n\r\nSize 32 insole 21.2cm \r\n\r\nSize 33 insole  21.8cm\r\n\r\nSize 34 insole  22.4 cm \r\n\r\nSize 35 insole 23 cm \r\n\r\nSize 36 insole 23.6cm\r\n\r\nSize 37 insole 24.2cm\r\n\r\nSize 38 insole 24.8cm\r\n\r\nSize 39 insole 25.4cm \r\n\r\nSize 40insole 26cm ', 350000.00, 99, 'TD-INS-01', 2, '[\"/uploads/1793187843009-808629823.png\",\"/uploads/1793187843017-524291884.png\"]', 0.0, NULL, 1, NULL, 0, '{}', '1 Tahun', 1, 7, 1, '2026-10-28 11:44:03', '2026-10-28 11:55:57'),
(2, 'Rubik Edukasi Anak 5X5 Ukuran Besar', 'rubik-edukasi-anak-5x5-ukuran-besar-49940', 'HARGA UNTUK PER BUAH\r\n\r\n\r\n\r\nUKURAN 5 X 5\r\n\r\n\r\n\r\nWARNA DIKIRIM RANDOM\r\n\r\n\r\n\r\nMAINAN RUBIK\r\n\r\n\r\n\r\nLAST ORDER PUKUL 16.00 AKAN DIKIRIM DIHARI YANG SAMA\r\n\r\n\r\n\r\nTAMBAHKAN PACKING TAMBAHAN BUBLE WARP UNTUK KENYAMANAN BERSAMA\r\n\r\n\r\n\r\nBARANG YANG DIKIRIM 100 °\\° KONDISI BARU DAN BAGUS\r\n\r\n\r\n\r\nKERUSAKAN DIPERJALANAN BUKAN TANGGUNG JAWAB KAMI\r\n\r\n\r\n\r\nTIDAK MENERIMA REQUEST GANTI ALAMAT/BARANG DICHAT INBOX ATAUPUN DIKETERANGAN PESANAN', 9500.00, 29, 'TD-NIU-02', 3, '[\"/uploads/1793188049931-457164316.png\",\"/uploads/1793188049935-256174528.png\"]', 0.0, NULL, 1, NULL, 0, '{}', '1 Tahun', 1, 7, 1, '2026-10-28 11:47:29', '2026-10-28 11:56:02'),
(3, 'Kemeja Wanita Polos Premium Shakila Twill Lengan Panjang - Adem, Formal & Casual Kekinian', 'kemeja-wanita-polos-premium-shakila-twill-lengan-panjang-adem-formal-casual-kekinian-44381', 'KEMEJA WANITA POLOS PREMIUM - JA FASHION \r\n\r\n\r\n\r\n\r\n\r\nTampil lebih elegan, rapi, dan percaya diri dengan kemeja wanita dari JA Fashion. Desain polos minimalis yang timeless cocok dipakai untuk berbagai aktivitas, mulai dari kerja kantor, kuliah, hingga hangout santai \r\n\r\n\r\n\r\nMenggunakan bahan pilihan yang lembut, adem, dan jatuh di badan, membuat kamu tetap nyaman seharian tanpa rasa gerah. Cocok untuk kamu yang ingin tampil stylish tanpa ribet!\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n   Keunggulan Produk:\r\n\r\n Bahan premium (halus, adem & nyaman)\r\n\r\n Tidak mudah kusut & mudah dirawat\r\n\r\n Model simpel elegan (cocok formal & casual)\r\n\r\n Cutting rapi, nyaman dipakai seharian\r\n\r\nTidak menerawang\r\n\r\nLogo Sablon memberikan kesan elegan', 43977.00, 99, 'TD-ISI-02', 2, '[\"/uploads/1793188444373-240423564.png\"]', 0.0, NULL, 1, NULL, 0, '{}', '1 Tahun', 1, 7, 1, '2026-10-28 11:54:04', '2026-10-28 11:54:04'),
(4, 'GELAS JUS MIYAKO 1SET BLENDER MIYAKO', 'gelas-jus-miyako-1set-blender-miyako-38671', '\r\n\r\nFULLSET MONTING PISAU 6, KARET SEAL, GELAS, PENUTUP, PENGADUK, BISA BUAT MIYAKO utk type  101PL 102PL 101GS 102GS 151PF 152PF 151GF 152GF\r\n\r\nGear/gigi plastik.\r\n\r\nBahan tebal, berkualitas, berstandar food grade, super bagus, mata pisau tajam. \r\n\r\n\r\n\r\nSEBELUM DI KIRIM BRG AKAN KAMI CEK TERLEBIH DAHULU DLM KONDISI BAIK DAN TANPA CACAT\r\n\r\n\r\n\r\n-PACKING RAPI DAN AMAN,DIKEMAS DENGAN DUS, FREE BUBBLE WRAP.\r\n\r\n\r\n\r\nREADY STOCK...!\r\n\r\n\r\n\r\nTERIMA KASIH AND HAPPY SHOPPING', 45000.00, 76, 'TD-JDK-02', 1, '[\"/uploads/1793188538667-852967578.png\"]', 0.0, NULL, 1, NULL, 0, '{}', '1 Tahun', 1, 7, 1, '2026-10-28 11:55:38', '2026-10-28 11:55:38');

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_reviews`
--

CREATE TABLE `product_reviews` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `rating` tinyint(4) NOT NULL CHECK (`rating` between 1 and 5),
  `comment` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `product_variants`
--

CREATE TABLE `product_variants` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `variant_group` varchar(50) NOT NULL,
  `value` varchar(100) NOT NULL,
  `color_hex` varchar(20) DEFAULT NULL,
  `extra_price` decimal(14,2) DEFAULT 0.00,
  `sort_order` int(11) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `whatsapp` varchar(20) NOT NULL,
  `birth_date` date DEFAULT NULL,
  `email` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `avatar` varchar(255) DEFAULT NULL,
  `reset_token` varchar(255) DEFAULT NULL,
  `reset_token_expiry` datetime DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `name`, `whatsapp`, `birth_date`, `email`, `password`, `role`, `avatar`, `reset_token`, `reset_token_expiry`, `is_active`, `created_at`, `updated_at`) VALUES
(1, 'Admin', '0831635728', '2000-02-04', 'anggersofyan@gmail.com', '$2a$10$sAF7OgFT5dlmBje9wPECIuGQ/kgUREXdGXVJAh4NDdwhn71EJV8za', 'admin', NULL, NULL, NULL, 1, '2026-08-02 13:53:16', '2026-10-28 11:40:50');

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uniq_user_product` (`user_id`,`product_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indeks untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_code` (`order_code`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `sku` (`sku`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `created_by` (`created_by`);

--
-- Indeks untuk tabel `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indeks untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `product_reviews`
--
ALTER TABLE `product_reviews`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `carts`
--
ALTER TABLE `carts`
  ADD CONSTRAINT `carts_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carts_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Ketidakleluasaan untuk tabel `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

--
-- Ketidakleluasaan untuk tabel `product_reviews`
--
ALTER TABLE `product_reviews`
  ADD CONSTRAINT `product_reviews_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `product_reviews_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Ketidakleluasaan untuk tabel `product_variants`
--
ALTER TABLE `product_variants`
  ADD CONSTRAINT `product_variants_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
