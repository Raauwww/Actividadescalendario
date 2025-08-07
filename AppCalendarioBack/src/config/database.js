const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    acquireTimeout: 60000,
    timeout: 60000,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    multipleStatements: true
};

// Crear pool de conexiones
const pool = mysql.createPool(dbConfig);

// Función para ejecutar queries
const executeQuery = async (query, params = []) => {
    try {
        const [rows] = await pool.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Error en la consulta:', error);
        throw error;
    }
};

// Función para transacciones
const executeTransaction = async (queries) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        
        const results = [];
        for (const { query, params } of queries) {
            const [result] = await connection.execute(query, params);
            results.push(result);
        }
        
        await connection.commit();
        return results;
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Función para verificar conexión
const testConnection = async () => {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión a la base de datos establecida');
        connection.release();
        return true;
    } catch (error) {
        console.error('❌ Error conectando a la base de datos:', error.message);
        return false;
    }
};

// Función para cerrar el pool
const closePool = async () => {
    try {
        await pool.end();
        console.log('🔌 Pool de conexiones cerrado');
    } catch (error) {
        console.error('Error cerrando el pool:', error);
    }
};

// Función para obtener usuarios con paginación
const getPaginatedUsers = async (page = 1, limit = 10, search = '') => {
    const offset = (page - 1) * limit;
    let whereClause = 'WHERE usuarios.activo = true';
    let params = [];
    
    if (search) {
        whereClause += ` AND (usuarios.nombre LIKE ? OR usuarios.apellido LIKE ? OR usuarios.email LIKE ?)`;
        const searchParam = `%${search}%`;
        params.push(searchParam, searchParam, searchParam);
    }
    
    const countQuery = `
        SELECT COUNT(*) as total 
        FROM usuarios 
        INNER JOIN roles ON usuarios.rol_id = roles.id 
        ${whereClause}
    `;
    
    const dataQuery = `
        SELECT 
            usuarios.id,
            usuarios.nombre,
            usuarios.apellido,
            usuarios.email,
            usuarios.telefono,
            usuarios.activo,
            usuarios.foto_perfil,
            usuarios.ultimo_login,
            usuarios.created_at,
            roles.nombre as rol_nombre,
            roles.descripcion as rol_descripcion
        FROM usuarios 
        INNER JOIN roles ON usuarios.rol_id = roles.id 
        ${whereClause}
        ORDER BY usuarios.created_at DESC
        LIMIT ? OFFSET ?
    `;
    
    const [countResult] = await executeQuery(countQuery, params);
    const users = await executeQuery(dataQuery, [...params, limit, offset]);
    
    return {
        users,
        total: countResult.total,
        page,
        limit,
        totalPages: Math.ceil(countResult.total / limit)
    };
};

module.exports = {
    pool,
    executeQuery,
    executeTransaction,
    testConnection,
    closePool,
    getPaginatedUsers
};