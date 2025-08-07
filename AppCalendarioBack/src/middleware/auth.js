const jwt = require('jsonwebtoken');
const { executeQuery } = require('../config/database');

// Middleware para verificar el token JWT
const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }
        
        const token = authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }
        
        // Verificar el token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Buscar usuario en la base de datos
        const query = `
            SELECT 
                usuarios.id,
                usuarios.nombre,
                usuarios.apellido,
                usuarios.email,
                usuarios.activo,
                usuarios.rol_id,
                roles.nombre as rol_nombre,
                roles.permisos
            FROM usuarios 
            INNER JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.id = ? AND usuarios.activo = true
        `;
        
        const users = await executeQuery(query, [decoded.id]);
        
        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no encontrado o inactivo'
            });
        }
        
        const user = users[0];
        
        // Agregar información del usuario al request
        req.user = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            rol_id: user.rol_id,
            rol_nombre: user.rol_nombre,
            permisos: typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos
        };
        
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Token inválido'
            });
        }
        
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expirado'
            });
        }
        
        console.error('Error en middleware de autenticación:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Middleware para verificar permisos específicos
const checkPermission = (permission) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            
            const userPermissions = req.user.permisos;
            
            // Los administradores tienen todos los permisos
            if (req.user.rol_nombre === 'Administrador') {
                return next();
            }
            
            // Verificar si el usuario tiene el permiso específico
            if (!userPermissions || !userPermissions[permission]) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para realizar esta acción'
                });
            }
            
            next();
        } catch (error) {
            console.error('Error verificando permisos:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

// Middleware para verificar si es administrador
const isAdmin = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'Usuario no autenticado'
            });
        }
        
        if (req.user.rol_nombre !== 'Administrador') {
            return res.status(403).json({
                success: false,
                message: 'Acceso restringido a administradores'
            });
        }
        
        next();
    } catch (error) {
        console.error('Error verificando rol de administrador:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Middleware para verificar si el usuario puede modificar el recurso
const canModifyResource = (resourceType) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }
            
            // Los administradores pueden modificar cualquier recurso
            if (req.user.rol_nombre === 'Administrador') {
                return next();
            }
            
            const resourceId = req.params.id;
            let query;
            let checkField;
            
            switch (resourceType) {
                case 'actividad':
                    query = 'SELECT creado_por, asignado_a FROM actividades WHERE id = ?';
                    break;
                case 'usuario':
                    // Solo puede modificar su propio perfil
                    if (parseInt(resourceId) !== req.user.id) {
                        return res.status(403).json({
                            success: false,
                            message: 'Solo puedes modificar tu propio perfil'
                        });
                    }
                    return next();
                default:
                    return res.status(400).json({
                        success: false,
                        message: 'Tipo de recurso no válido'
                    });
            }
            
            const resources = await executeQuery(query, [resourceId]);
            
            if (resources.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Recurso no encontrado'
                });
            }
            
            const resource = resources[0];
            
            // Verificar si el usuario puede modificar el recurso
            if (resourceType === 'actividad') {
                if (resource.creado_por === req.user.id || resource.asignado_a === req.user.id) {
                    return next();
                }
            }
            
            return res.status(403).json({
                success: false,
                message: 'No tienes permisos para modificar este recurso'
            });
            
        } catch (error) {
            console.error('Error verificando permisos de modificación:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno del servidor'
            });
        }
    };
};

module.exports = {
    verifyToken,
    checkPermission,
    isAdmin,
    canModifyResource
};