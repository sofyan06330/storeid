const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/register', ctrl.register);
router.post('/login', ctrl.login);
router.post('/forgot-password', ctrl.forgotPassword);
router.post('/reset-password', ctrl.resetPassword);

router.get('/me', authenticate, ctrl.me);
router.put('/update-profile', authenticate, ctrl.updateProfile);
router.put('/update-password', authenticate, ctrl.updatePassword);

module.exports = router;
