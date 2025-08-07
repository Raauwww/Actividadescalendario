const express = require('express');
const router = express.Router();
const { verifyToken, isAdmin } = require('../middleware/auth');

// Placeholder para controladores de usuarios
router.get('/', verifyToken, (req, res) => {
    res.json({ success: true, message: 'Ruta de usuarios funcionando' });
});

module.exports = router;