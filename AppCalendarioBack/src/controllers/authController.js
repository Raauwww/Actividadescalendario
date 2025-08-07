const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const { executeQuery } = require('../config/database');

// Esquemas de validación
const registerSchema = Joi.object({
    nombre: Joi.string().min(2).max(50).required(),
    apellido: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    telefono: Joi.string().pattern(/^[0-9+\-\s()]+$/).optional(),
    rol_id: Joi.number().integer().min(1).required()
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const changePasswordSchema = Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
});

// Función para generar token JWT
const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user.id, 
            email: user.email,
            rol_id: user.rol_id 
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
    );
};

// Registro de usuario
const register = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = registerSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { nombre, apellido, email, password, telefono, rol_id } = value;

        // Verificar si el email ya existe
        const existingUser = await executeQuery(
            'SELECT id FROM usuarios WHERE email = ?',
            [email]
        );

        if (existingUser.length > 0) {
            return res.status(409).json({
                success: false,
                message: 'El email ya está registrado'
            });
        }

        // Verificar si el rol existe
        const role = await executeQuery(
            'SELECT id FROM roles WHERE id = ?',
            [rol_id]
        );

        if (role.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Rol no válido'
            });
        }

        // Encriptar contraseña
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insertar usuario
        const insertQuery = `
            INSERT INTO usuarios (nombre, apellido, email, password, telefono, rol_id) 
            VALUES (?, ?, ?, ?, ?, ?)
        `;

        const result = await executeQuery(insertQuery, [
            nombre,
            apellido,
            email,
            hashedPassword,
            telefono || null,
            rol_id
        ]);

        // Obtener datos del usuario creado
        const newUser = await executeQuery(`
            SELECT 
                usuarios.id,
                usuarios.nombre,
                usuarios.apellido,
                usuarios.email,
                usuarios.telefono,
                usuarios.activo,
                usuarios.created_at,
                roles.nombre as rol_nombre,
                roles.descripcion as rol_descripcion
            FROM usuarios 
            INNER JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.id = ?
        `, [result.insertId]);

        // Generar token
        const token = generateToken(newUser[0]);

        res.status(201).json({
            success: true,
            message: 'Usuario registrado exitosamente',
            data: {
                user: {
                    id: newUser[0].id,
                    nombre: newUser[0].nombre,
                    apellido: newUser[0].apellido,
                    email: newUser[0].email,
                    telefono: newUser[0].telefono,
                    rol_nombre: newUser[0].rol_nombre,
                    rol_descripcion: newUser[0].rol_descripcion
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Login de usuario
const login = async (req, res) => {
    try {
        // Validar datos de entrada
        const { error, value } = loginSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { email, password } = value;

        // Buscar usuario
        const users = await executeQuery(`
            SELECT 
                usuarios.id,
                usuarios.nombre,
                usuarios.apellido,
                usuarios.email,
                usuarios.password,
                usuarios.telefono,
                usuarios.activo,
                usuarios.rol_id,
                roles.nombre as rol_nombre,
                roles.descripcion as rol_descripcion,
                roles.permisos
            FROM usuarios 
            INNER JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.email = ?
        `, [email]);

        if (users.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        const user = users[0];

        // Verificar si el usuario está activo
        if (!user.activo) {
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo. Contacta al administrador'
            });
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Credenciales inválidas'
            });
        }

        // Actualizar último login
        await executeQuery(
            'UPDATE usuarios SET ultimo_login = NOW() WHERE id = ?',
            [user.id]
        );

        // Generar token
        const token = generateToken(user);

        res.json({
            success: true,
            message: 'Login exitoso',
            data: {
                user: {
                    id: user.id,
                    nombre: user.nombre,
                    apellido: user.apellido,
                    email: user.email,
                    telefono: user.telefono,
                    rol_id: user.rol_id,
                    rol_nombre: user.rol_nombre,
                    rol_descripcion: user.rol_descripcion,
                    permisos: typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos
                },
                token
            }
        });

    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Obtener perfil del usuario autenticado
const getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const users = await executeQuery(`
            SELECT 
                usuarios.id,
                usuarios.nombre,
                usuarios.apellido,
                usuarios.email,
                usuarios.telefono,
                usuarios.foto_perfil,
                usuarios.activo,
                usuarios.ultimo_login,
                usuarios.created_at,
                roles.nombre as rol_nombre,
                roles.descripcion as rol_descripcion,
                roles.permisos
            FROM usuarios 
            INNER JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.id = ?
        `, [userId]);

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        const user = users[0];

        res.json({
            success: true,
            data: {
                id: user.id,
                nombre: user.nombre,
                apellido: user.apellido,
                email: user.email,
                telefono: user.telefono,
                foto_perfil: user.foto_perfil,
                ultimo_login: user.ultimo_login,
                created_at: user.created_at,
                rol_nombre: user.rol_nombre,
                rol_descripcion: user.rol_descripcion,
                permisos: typeof user.permisos === 'string' ? JSON.parse(user.permisos) : user.permisos
            }
        });

    } catch (error) {
        console.error('Error obteniendo perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Cambiar contraseña
const changePassword = async (req, res) => {
    try {
        const userId = req.user.id;
        
        // Validar datos de entrada
        const { error, value } = changePasswordSchema.validate(req.body);
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Datos inválidos',
                errors: error.details.map(detail => detail.message)
            });
        }

        const { currentPassword, newPassword } = value;

        // Obtener contraseña actual del usuario
        const users = await executeQuery(
            'SELECT password FROM usuarios WHERE id = ?',
            [userId]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar contraseña actual
        const isValidPassword = await bcrypt.compare(currentPassword, users[0].password);
        if (!isValidPassword) {
            return res.status(400).json({
                success: false,
                message: 'Contraseña actual incorrecta'
            });
        }

        // Encriptar nueva contraseña
        const saltRounds = 12;
        const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

        // Actualizar contraseña
        await executeQuery(
            'UPDATE usuarios SET password = ? WHERE id = ?',
            [hashedNewPassword, userId]
        );

        res.json({
            success: true,
            message: 'Contraseña cambiada exitosamente'
        });

    } catch (error) {
        console.error('Error cambiando contraseña:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Verificar token (para validación del frontend)
const verifyToken = async (req, res) => {
    try {
        // Si llegamos aquí, el token ya fue verificado por el middleware
        res.json({
            success: true,
            message: 'Token válido',
            data: {
                user: req.user
            }
        });
    } catch (error) {
        console.error('Error verificando token:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

// Logout (invalidar token en el cliente)
const logout = async (req, res) => {
    try {
        // En una implementación más robusta, podrías mantener una lista negra de tokens
        res.json({
            success: true,
            message: 'Logout exitoso'
        });
    } catch (error) {
        console.error('Error en logout:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
};

module.exports = {
    register,
    login,
    getProfile,
    changePassword,
    verifyToken,
    logout
};