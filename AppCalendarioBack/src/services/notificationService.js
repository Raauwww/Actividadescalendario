const nodemailer = require('nodemailer');
const { executeQuery } = require('../config/database');

// Configuración de notificaciones basada en variables de entorno
const notificationConfig = {
    email: {
        enabled: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT) || 587,
        user: process.env.SMTP_USER,
        password: process.env.SMTP_PASSWORD,
        secure: process.env.SMTP_SECURE === 'true'
    },
    whatsapp: {
        enabled: process.env.ENABLE_WHATSAPP_NOTIFICATIONS === 'true',
        accountSid: process.env.TWILIO_ACCOUNT_SID,
        authToken: process.env.TWILIO_AUTH_TOKEN,
        whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
    },
    system: {
        enabled: process.env.ENABLE_SYSTEM_NOTIFICATIONS !== 'false' // Por defecto habilitado
    }
};

// Cliente de email (solo se inicializa si está configurado)
let emailTransporter = null;

// Cliente de WhatsApp (solo se inicializa si está configurado)
let twilioClient = null;

// Inicializar servicios según configuración
const initializeServices = () => {
    console.log('🔧 Inicializando servicios de notificación...');
    
    // Inicializar email si está configurado
    if (notificationConfig.email.enabled && 
        notificationConfig.email.host && 
        notificationConfig.email.user) {
        try {
            emailTransporter = nodemailer.createTransporter({
                host: notificationConfig.email.host,
                port: notificationConfig.email.port,
                secure: notificationConfig.email.secure,
                auth: {
                    user: notificationConfig.email.user,
                    pass: notificationConfig.email.password
                }
            });
            console.log('✅ Servicio de email configurado');
        } catch (error) {
            console.log('⚠️  Error al configurar email:', error.message);
            notificationConfig.email.enabled = false;
        }
    } else {
        console.log('📧 Notificaciones por email deshabilitadas (configuración incompleta o deshabilitada)');
    }

    // Inicializar WhatsApp si está configurado
    if (notificationConfig.whatsapp.enabled && 
        notificationConfig.whatsapp.accountSid && 
        notificationConfig.whatsapp.authToken) {
        try {
            // Solo importar Twilio si está configurado
            const twilio = require('twilio');
            twilioClient = twilio(
                notificationConfig.whatsapp.accountSid,
                notificationConfig.whatsapp.authToken
            );
            console.log('✅ Servicio de WhatsApp configurado');
        } catch (error) {
            console.log('⚠️  Error al configurar WhatsApp:', error.message);
            notificationConfig.whatsapp.enabled = false;
        }
    } else {
        console.log('📱 Notificaciones por WhatsApp deshabilitadas (configuración incompleta o deshabilitada)');
    }

    // Sistema de notificaciones siempre habilitado
    if (notificationConfig.system.enabled) {
        console.log('✅ Notificaciones del sistema habilitadas');
    }

    console.log('🚀 Servicios de notificación inicializados');
};

// Función para crear notificación en la base de datos
const createSystemNotification = async (userId, activityId, type, subject, message) => {
    try {
        const query = `
            INSERT INTO notificaciones (usuario_id, actividad_id, tipo, asunto, mensaje, enviado, fecha_envio)
            VALUES (?, ?, 'sistema', ?, ?, true, NOW())
        `;
        
        await executeQuery(query, [userId, activityId, subject, message]);
        return { success: true, message: 'Notificación del sistema creada' };
    } catch (error) {
        console.error('Error creando notificación del sistema:', error);
        return { success: false, error: error.message };
    }
};

// Función para enviar email
const sendEmail = async (to, subject, html, activityId = null) => {
    if (!notificationConfig.email.enabled || !emailTransporter) {
        return { success: false, error: 'Servicio de email no configurado' };
    }

    try {
        const mailOptions = {
            from: `"Agendador de Actividades" <${notificationConfig.email.user}>`,
            to: to,
            subject: subject,
            html: html
        };

        const info = await emailTransporter.sendMail(mailOptions);
        
        // Registrar en base de datos
        if (activityId) {
            await executeQuery(`
                INSERT INTO notificaciones (usuario_id, actividad_id, tipo, asunto, mensaje, enviado, fecha_envio)
                VALUES ((SELECT id FROM usuarios WHERE email = ? LIMIT 1), ?, 'email', ?, ?, true, NOW())
            `, [to, activityId, subject, html]);
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando email:', error);
        
        // Registrar error en base de datos
        if (activityId) {
            await executeQuery(`
                INSERT INTO notificaciones (usuario_id, actividad_id, tipo, asunto, mensaje, enviado, error_envio, intentos_envio)
                VALUES ((SELECT id FROM usuarios WHERE email = ? LIMIT 1), ?, 'email', ?, ?, false, ?, 1)
            `, [to, activityId, subject, html, error.message]);
        }
        
        return { success: false, error: error.message };
    }
};

// Función para enviar WhatsApp
const sendWhatsApp = async (to, message, activityId = null) => {
    if (!notificationConfig.whatsapp.enabled || !twilioClient) {
        return { success: false, error: 'Servicio de WhatsApp no configurado' };
    }

    try {
        const formattedTo = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;
        
        const twilioMessage = await twilioClient.messages.create({
            body: message,
            from: notificationConfig.whatsapp.whatsappNumber,
            to: formattedTo
        });

        // Registrar en base de datos
        if (activityId) {
            await executeQuery(`
                INSERT INTO notificaciones (usuario_id, actividad_id, tipo, asunto, mensaje, enviado, fecha_envio)
                VALUES ((SELECT id FROM usuarios WHERE telefono = ? LIMIT 1), ?, 'whatsapp', 'Notificación WhatsApp', ?, true, NOW())
            `, [to.replace('whatsapp:', ''), activityId, message]);
        }

        return { success: true, sid: twilioMessage.sid };
    } catch (error) {
        console.error('Error enviando WhatsApp:', error);
        
        // Registrar error en base de datos
        if (activityId) {
            await executeQuery(`
                INSERT INTO notificaciones (usuario_id, actividad_id, tipo, asunto, mensaje, enviado, error_envio, intentos_envio)
                VALUES ((SELECT id FROM usuarios WHERE telefono = ? LIMIT 1), ?, 'whatsapp', 'Notificación WhatsApp', ?, false, ?, 1)
            `, [to.replace('whatsapp:', ''), activityId, message, error.message]);
        }
        
        return { success: false, error: error.message };
    }
};

// Función principal para enviar notificación
const sendNotification = async (userId, activityId, type, data) => {
    const results = {
        system: { success: false },
        email: { success: false },
        whatsapp: { success: false }
    };

    try {
        // Obtener datos del usuario
        const userQuery = `
            SELECT usuarios.*, roles.nombre as rol_nombre 
            FROM usuarios 
            INNER JOIN roles ON usuarios.rol_id = roles.id 
            WHERE usuarios.id = ?
        `;
        const users = await executeQuery(userQuery, [userId]);
        
        if (users.length === 0) {
            throw new Error('Usuario no encontrado');
        }
        
        const user = users[0];

        // Siempre crear notificación del sistema (es gratuito y no requiere configuración)
        if (notificationConfig.system.enabled) {
            results.system = await createSystemNotification(
                userId, 
                activityId, 
                type, 
                data.subject, 
                data.message
            );
        }

        // Enviar email si está habilitado y el usuario tiene email
        if (notificationConfig.email.enabled && user.email && data.email) {
            results.email = await sendEmail(
                user.email, 
                data.subject, 
                data.email.html, 
                activityId
            );
        }

        // Enviar WhatsApp si está habilitado y el usuario tiene teléfono
        if (notificationConfig.whatsapp.enabled && user.telefono && data.whatsapp) {
            results.whatsapp = await sendWhatsApp(
                user.telefono, 
                data.whatsapp.message, 
                activityId
            );
        }

        return {
            success: true,
            results,
            message: 'Notificación procesada',
            enabledServices: {
                system: notificationConfig.system.enabled,
                email: notificationConfig.email.enabled,
                whatsapp: notificationConfig.whatsapp.enabled
            }
        };

    } catch (error) {
        console.error('Error en sendNotification:', error);
        return {
            success: false,
            error: error.message,
            results
        };
    }
};

// Plantillas de notificación
const templates = {
    activityAssigned: (activity, assignedBy) => ({
        subject: `Nueva actividad asignada: ${activity.titulo}`,
        message: `Se te ha asignado una nueva actividad: "${activity.titulo}" programada para ${activity.fecha_inicio}`,
        email: {
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">Nueva Actividad Asignada</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">${activity.titulo}</h2>
                        <p style="color: #666; line-height: 1.6;">${activity.descripcion || 'Sin descripción'}</p>
                        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>📅 Fecha:</strong> ${new Date(activity.fecha_inicio).toLocaleDateString('es-ES')}</p>
                            <p style="margin: 5px 0;"><strong>🕐 Hora:</strong> ${new Date(activity.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            ${activity.ubicacion ? `<p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> ${activity.ubicacion}</p>` : ''}
                            <p style="margin: 5px 0;"><strong>👤 Asignado por:</strong> ${assignedBy}</p>
                        </div>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            Este es un mensaje automático del Sistema de Agendador de Actividades.
                        </p>
                    </div>
                </div>
            `
        },
        whatsapp: {
            message: `🔔 *Nueva Actividad Asignada*\n\n📋 *${activity.titulo}*\n📅 ${new Date(activity.fecha_inicio).toLocaleDateString('es-ES')}\n🕐 ${new Date(activity.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}\n👤 Asignado por: ${assignedBy}\n\n${activity.descripcion ? `📝 ${activity.descripcion}` : ''}`
        }
    }),

    activityReminder: (activity) => ({
        subject: `Recordatorio: ${activity.titulo} en 15 minutos`,
        message: `Recordatorio: Tu actividad "${activity.titulo}" comenzará en 15 minutos`,
        email: {
            html: `
                <div style="font-family: 'Poppins', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                        <h1 style="color: white; margin: 0; font-size: 24px;">⏰ Recordatorio de Actividad</h1>
                    </div>
                    <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
                        <h2 style="color: #333; margin-top: 0;">${activity.titulo}</h2>
                        <p style="color: #f5576c; font-size: 18px; font-weight: bold;">¡Comienza en 15 minutos!</p>
                        <div style="background: #fff3cd; border: 1px solid #ffeaa7; padding: 20px; border-radius: 8px; margin: 20px 0;">
                            <p style="margin: 5px 0;"><strong>🕐 Hora de inicio:</strong> ${new Date(activity.fecha_inicio).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                            ${activity.ubicacion ? `<p style="margin: 5px 0;"><strong>📍 Ubicación:</strong> ${activity.ubicacion}</p>` : ''}
                        </div>
                        <p style="color: #666; font-size: 14px; margin-top: 30px;">
                            Prepárate para tu actividad. ¡Éxito!
                        </p>
                    </div>
                </div>
            `
        },
        whatsapp: {
            message: `⏰ *Recordatorio*\n\n📋 *${activity.titulo}*\n🕐 Comienza en 15 minutos\n\n${activity.ubicacion ? `📍 ${activity.ubicacion}` : ''}¡Prepárate! 💪`
        }
    })
};

// Función para enviar notificación de actividad asignada
const notifyActivityAssigned = async (userId, activity, assignedByName) => {
    const templateData = templates.activityAssigned(activity, assignedByName);
    return await sendNotification(userId, activity.id, 'activity_assigned', templateData);
};

// Función para enviar recordatorio de actividad
const notifyActivityReminder = async (userId, activity) => {
    const templateData = templates.activityReminder(activity);
    return await sendNotification(userId, activity.id, 'activity_reminder', templateData);
};

// Función para obtener configuración de servicios (para el frontend)
const getNotificationConfig = () => {
    return {
        email: {
            enabled: notificationConfig.email.enabled,
            configured: !!(notificationConfig.email.host && notificationConfig.email.user)
        },
        whatsapp: {
            enabled: notificationConfig.whatsapp.enabled,
            configured: !!(notificationConfig.whatsapp.accountSid && notificationConfig.whatsapp.authToken)
        },
        system: {
            enabled: notificationConfig.system.enabled
        }
    };
};

// Función para obtener notificaciones del sistema para un usuario
const getSystemNotifications = async (userId, limit = 10, offset = 0) => {
    try {
        const query = `
            SELECT 
                n.*,
                a.titulo as actividad_titulo
            FROM notificaciones n
            LEFT JOIN actividades a ON n.actividad_id = a.id
            WHERE n.usuario_id = ? AND n.tipo = 'sistema'
            ORDER BY n.created_at DESC
            LIMIT ? OFFSET ?
        `;
        
        const notifications = await executeQuery(query, [userId, limit, offset]);
        
        // Contar total para paginación
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM notificaciones 
            WHERE usuario_id = ? AND tipo = 'sistema'
        `;
        const [countResult] = await executeQuery(countQuery, [userId]);
        
        return {
            success: true,
            data: notifications,
            total: countResult.total,
            limit,
            offset
        };
    } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        return {
            success: false,
            error: error.message
        };
    }
};

// Inicializar servicios al cargar el módulo
initializeServices();

module.exports = {
    sendNotification,
    notifyActivityAssigned,
    notifyActivityReminder,
    getNotificationConfig,
    getSystemNotifications,
    createSystemNotification,
    initializeServices
};