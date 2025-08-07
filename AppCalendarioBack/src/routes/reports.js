const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Placeholder para controladores de reportes
router.get('/', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Ruta de reportes funcionando' });
});

module.exports = router;