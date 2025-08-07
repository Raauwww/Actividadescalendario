const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const { 
    getNotificationConfig, 
    getSystemNotifications,
    createSystemNotification
} = require('../services/notificationService');

// Obtener configuración de notificaciones (para mostrar al usuario qué servicios están disponibles)
router.get('/config', verifyToken, (req, res) => {
    try {
        const config = getNotificationConfig();
        res.json({
            success: true,
            data: config,
            message: 'Configuración de notificaciones obtenida'
        });
    } catch (error) {
        console.error('Error obteniendo configuración:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Obtener notificaciones del sistema para el usuario autenticado
router.get('/', verifyToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const { limit = 10, offset = 0 } = req.query;
        
        const result = await getSystemNotifications(
            userId, 
            parseInt(limit), 
            parseInt(offset)
        );
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                pagination: {
                    total: result.total,
                    limit: result.limit,
                    offset: result.offset,
                    hasMore: (result.offset + result.limit) < result.total
                }
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Crear notificación manual del sistema (solo para administradores)
router.post('/system', verifyToken, async (req, res) => {
    try {
        // Verificar que sea administrador
        if (req.user.rol_nombre !== 'Administrador') {
            return res.status(403).json({
                success: false,
                message: 'Solo los administradores pueden crear notificaciones del sistema'
            });
        }
        
        const { userId, activityId, subject, message } = req.body;
        
        if (!userId || !subject || !message) {
            return res.status(400).json({
                success: false,
                message: 'userId, subject y message son requeridos'
            });
        }
        
        const result = await createSystemNotification(
            userId, 
            activityId || null, 
            'manual', 
            subject, 
            message
        );
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: 'Notificación del sistema creada exitosamente'
            });
        } else {
            res.status(400).json({
                success: false,
                message: result.error
            });
        }
    } catch (error) {
        console.error('Error creando notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Marcar notificación como leída
router.patch('/:id/read', verifyToken, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;
        
        // Verificar que la notificación pertenezca al usuario
        const { executeQuery } = require('../config/database');
        
        const checkQuery = `
            SELECT id FROM notificaciones 
            WHERE id = ? AND usuario_id = ?
        `;
        
        const notifications = await executeQuery(checkQuery, [notificationId, userId]);
        
        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificación no encontrada'
            });
        }
        
        // Marcar como leída (aquí puedes agregar un campo 'leida' a la tabla si quieres)
        const updateQuery = `
            UPDATE notificaciones 
            SET updated_at = NOW() 
            WHERE id = ? AND usuario_id = ?
        `;
        
        await executeQuery(updateQuery, [notificationId, userId]);
        
        res.json({
            success: true,
            message: 'Notificación marcada como leída'
        });
        
    } catch (error) {
        console.error('Error marcando notificación como leída:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

// Eliminar notificación (solo del sistema, no las de email/whatsapp)
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const notificationId = req.params.id;
        const userId = req.user.id;
        
        const { executeQuery } = require('../config/database');
        
        // Verificar que la notificación pertenezca al usuario y sea del sistema
        const checkQuery = `
            SELECT id FROM notificaciones 
            WHERE id = ? AND usuario_id = ? AND tipo = 'sistema'
        `;
        
        const notifications = await executeQuery(checkQuery, [notificationId, userId]);
        
        if (notifications.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Notificación del sistema no encontrada'
            });
        }
        
        // Eliminar notificación
        const deleteQuery = `
            DELETE FROM notificaciones 
            WHERE id = ? AND usuario_id = ? AND tipo = 'sistema'
        `;
        
        await executeQuery(deleteQuery, [notificationId, userId]);
        
        res.json({
            success: true,
            message: 'Notificación eliminada exitosamente'
        });
        
    } catch (error) {
        console.error('Error eliminando notificación:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;