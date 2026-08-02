const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/cartController');
const { authenticate } = require('../middleware/auth');

router.use(authenticate);
router.get('/', ctrl.getCart);
router.post('/', ctrl.addToCart);
router.put('/:id', ctrl.updateCartItem);
router.delete('/:id', ctrl.removeCartItem);

module.exports = router;
