const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/productController');
const reviewCtrl = require('../controllers/reviewController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.get('/', ctrl.getProducts);
router.get('/categories', ctrl.getCategories);
router.get('/filters', ctrl.getFilterOptions);
router.get('/:id/detail', ctrl.getProductDetail);
router.get('/:id/reviews', reviewCtrl.getReviews);
router.post('/:id/reviews', authenticate, reviewCtrl.createReview);
router.get('/:id', ctrl.getProductById);

// Admin only
router.post('/', authenticate, authorize('admin'), upload.array('images', 5), ctrl.createProduct);
router.put('/:id', authenticate, authorize('admin'), upload.array('images', 5), ctrl.updateProduct);
router.delete('/:id', authenticate, authorize('admin'), ctrl.deleteProduct);
router.patch('/:id/publish', authenticate, authorize('admin'), ctrl.togglePublish);

module.exports = router;
