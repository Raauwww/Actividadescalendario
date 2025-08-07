const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Placeholder para controladores de categorías
router.get('/', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Ruta de categorías funcionando' });
});

module.exports = router;