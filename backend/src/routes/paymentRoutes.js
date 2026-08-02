const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/paymentController');
const { authenticate } = require('../middleware/auth');

// Endpoint publik untuk menerima notifikasi dari Midtrans (tanpa auth)
router.post('/notification', ctrl.handleNotification);

// Endpoint untuk cek status dari sisi client (butuh auth)
router.get('/status/:orderCode', authenticate, ctrl.checkStatus);

module.exports = router;
