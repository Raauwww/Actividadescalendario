-- Base de datos para Agendador de Actividades
-- Crear base de datos
CREATE DATABASE IF NOT EXISTS agendador_actividades;
USE agendador_actividades;

-- Tabla de roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT,
    permisos JSON, -- Permisos específicos del rol
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de usuarios
CREATE TABLE usuarios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    telefono VARCHAR(20),
    rol_id INT NOT NULL,
    activo BOOLEAN DEFAULT TRUE,
    foto_perfil VARCHAR(255),
    ultimo_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (rol_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Tabla de categorías de actividades
CREATE TABLE categorias_actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Color hex para identificación visual
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabla de estados de actividades
CREATE TABLE estados_actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    color VARCHAR(7) DEFAULT '#6B7280',
    descripcion TEXT,
    es_final BOOLEAN DEFAULT FALSE, -- Indica si es un estado final
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de actividades
CREATE TABLE actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    titulo VARCHAR(200) NOT NULL,
    descripcion TEXT,
    fecha_inicio DATETIME NOT NULL,
    fecha_fin DATETIME NOT NULL,
    categoria_id INT,
    estado_id INT NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    ubicacion VARCHAR(255),
    notas TEXT,
    creado_por INT NOT NULL,
    asignado_a INT,
    hora_inicio_real DATETIME NULL, -- Cuando realmente empezó
    hora_fin_real DATETIME NULL, -- Cuando realmente terminó
    tiempo_estimado INT DEFAULT 0, -- En minutos
    recordatorio_minutos INT DEFAULT 15, -- Minutos antes para recordatorio
    requiere_confirmacion BOOLEAN DEFAULT FALSE,
    es_recurrente BOOLEAN DEFAULT FALSE,
    patron_recurrencia JSON, -- Para actividades recurrentes
    actividad_padre_id INT NULL, -- Para actividades recurrentes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (categoria_id) REFERENCES categorias_actividades(id) ON DELETE SET NULL,
    FOREIGN KEY (estado_id) REFERENCES estados_actividades(id) ON DELETE RESTRICT,
    FOREIGN KEY (creado_por) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (asignado_a) REFERENCES usuarios(id) ON DELETE SET NULL,
    FOREIGN KEY (actividad_padre_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Tabla de participantes de actividades
CREATE TABLE participantes_actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actividad_id INT NOT NULL,
    usuario_id INT NOT NULL,
    rol_participante ENUM('organizador', 'participante', 'observador') DEFAULT 'participante',
    confirmado BOOLEAN DEFAULT FALSE,
    fecha_confirmacion TIMESTAMP NULL,
    notas_participante TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_participante (actividad_id, usuario_id),
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de notificaciones
CREATE TABLE notificaciones (
    id INT PRIMARY KEY AUTO_INCREMENT,
    usuario_id INT NOT NULL,
    actividad_id INT,
    tipo ENUM('email', 'whatsapp', 'sistema') NOT NULL,
    asunto VARCHAR(255),
    mensaje TEXT NOT NULL,
    enviado BOOLEAN DEFAULT FALSE,
    fecha_envio TIMESTAMP NULL,
    fecha_programada TIMESTAMP NULL,
    intentos_envio INT DEFAULT 0,
    error_envio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE
);

-- Tabla de historial de cambios
CREATE TABLE historial_actividades (
    id INT PRIMARY KEY AUTO_INCREMENT,
    actividad_id INT NOT NULL,
    usuario_id INT NOT NULL,
    accion ENUM('creada', 'modificada', 'eliminada', 'estado_cambiado', 'asignada', 'completada') NOT NULL,
    campo_modificado VARCHAR(100),
    valor_anterior TEXT,
    valor_nuevo TEXT,
    comentario TEXT,
    fecha_cambio TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (actividad_id) REFERENCES actividades(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de configuración del sistema
CREATE TABLE configuracion_sistema (
    id INT PRIMARY KEY AUTO_INCREMENT,
    clave VARCHAR(100) NOT NULL UNIQUE,
    valor TEXT,
    descripcion TEXT,
    tipo ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    categoria VARCHAR(50) DEFAULT 'general',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insertar datos iniciales
INSERT INTO roles (nombre, descripcion, permisos) VALUES
('Administrador', 'Acceso completo al sistema', '{"read": true, "write": true, "delete": true, "manage_users": true, "manage_roles": true}'),
('Supervisor', 'Puede gestionar actividades y ver reportes', '{"read": true, "write": true, "delete": false, "manage_users": false, "view_reports": true}'),
('Empleado', 'Puede ver y actualizar sus actividades asignadas', '{"read": true, "write": false, "delete": false, "update_own": true}');

INSERT INTO estados_actividades (nombre, color, descripcion, es_final) VALUES
('Pendiente', '#6B7280', 'Actividad programada pero no iniciada', FALSE),
('En Progreso', '#F59E0B', 'Actividad actualmente en ejecución', FALSE),
('Completada', '#10B981', 'Actividad finalizada exitosamente', TRUE),
('Cancelada', '#EF4444', 'Actividad cancelada', TRUE),
('Pausada', '#8B5CF6', 'Actividad temporalmente pausada', FALSE),
('Retrasada', '#F97316', 'Actividad que no se completó a tiempo', FALSE);

INSERT INTO categorias_actividades (nombre, color, descripcion) VALUES
('Reunión', '#3B82F6', 'Reuniones de equipo, con clientes, etc.'),
('Proyecto', '#10B981', 'Tareas relacionadas con proyectos específicos'),
('Capacitación', '#8B5CF6', 'Actividades de formación y desarrollo'),
('Mantenimiento', '#F59E0B', 'Tareas de mantenimiento y soporte'),
('Personal', '#EF4444', 'Actividades personales o administrativas');

INSERT INTO configuracion_sistema (clave, valor, descripcion, tipo, categoria) VALUES
('smtp_host', '', 'Servidor SMTP para envío de emails', 'string', 'email'),
('smtp_port', '587', 'Puerto SMTP', 'number', 'email'),
('smtp_user', '', 'Usuario SMTP', 'string', 'email'),
('smtp_password', '', 'Contraseña SMTP', 'string', 'email'),
('whatsapp_api_url', '', 'URL de API de WhatsApp', 'string', 'whatsapp'),
('whatsapp_token', '', 'Token de API de WhatsApp', 'string', 'whatsapp'),
('default_reminder_minutes', '15', 'Minutos por defecto para recordatorios', 'number', 'general'),
('work_hours_start', '08:00', 'Hora de inicio de jornada laboral', 'string', 'general'),
('work_hours_end', '18:00', 'Hora de fin de jornada laboral', 'string', 'general');

-- Crear índices para mejorar rendimiento
CREATE INDEX idx_actividades_fecha_inicio ON actividades(fecha_inicio);
CREATE INDEX idx_actividades_fecha_fin ON actividades(fecha_fin);
CREATE INDEX idx_actividades_asignado_a ON actividades(asignado_a);
CREATE INDEX idx_actividades_creado_por ON actividades(creado_por);
CREATE INDEX idx_actividades_estado ON actividades(estado_id);
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol_id);
CREATE INDEX idx_notificaciones_usuario ON notificaciones(usuario_id);
CREATE INDEX idx_notificaciones_fecha_programada ON notificaciones(fecha_programada);
CREATE INDEX idx_historial_actividad ON historial_actividades(actividad_id);