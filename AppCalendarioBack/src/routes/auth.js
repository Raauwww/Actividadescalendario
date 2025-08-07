const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Rutas públicas (no requieren autenticación)
router.post('/register', authController.register);
router.post('/login', authController.login);

// Rutas protegidas (requieren autenticación)
router.get('/profile', verifyToken, authController.getProfile);
router.post('/change-password', verifyToken, authController.changePassword);
router.get('/verify-token', verifyToken, authController.verifyToken);
router.post('/logout', verifyToken, authController.logout);

module.exports = router;