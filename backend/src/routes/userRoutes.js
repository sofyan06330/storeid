const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { authenticate, authorize } = require('../middleware/auth');

// Seluruh endpoint akun hanya untuk admin
router.use(authenticate, authorize('admin'));
router.get('/', ctrl.getUsers);
router.patch('/:id/status', ctrl.toggleUserStatus);

module.exports = router;
