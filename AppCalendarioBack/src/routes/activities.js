const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');

// Placeholder para controladores de actividades
router.get('/', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Ruta de actividades funcionando' });
});

module.exports = router;