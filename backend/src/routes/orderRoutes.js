const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.post('/checkout', ctrl.checkout);
router.get('/my-orders', ctrl.getMyOrders);
router.get('/:id', ctrl.getOrderDetail);
router.get('/', authorize('admin'), ctrl.getAllOrders);
router.patch('/:id/status', authorize('admin'), ctrl.updateOrderStatus);

module.exports = router;
