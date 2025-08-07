import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    FaBell, 
    FaCheck, 
    FaTimes, 
    FaTrash,
    FaEnvelope,
    FaWhatsapp,
    FaDesktop,
    FaExclamationCircle,
    FaInfoCircle
} from 'react-icons/fa';
import { notificationService } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const NotificationCenter = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [notificationConfig, setNotificationConfig] = useState({
        email: { enabled: false, configured: false },
        whatsapp: { enabled: false, configured: false },
        system: { enabled: true }
    });
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 10,
        offset: 0,
        hasMore: false
    });

    useEffect(() => {
        if (isOpen) {
            loadNotifications();
            loadNotificationConfig();
        }
    }, [isOpen]);

    const loadNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationService.getNotifications({
                limit: pagination.limit,
                offset: pagination.offset
            });

            if (response.success) {
                setNotifications(response.data || []);
                setPagination(response.pagination || {});
            }
        } catch (error) {
            console.error('Error cargando notificaciones:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadNotificationConfig = async () => {
        try {
            const response = await notificationService.getNotifications(); // Usar endpoint config
            if (response.success) {
                // Simular configuración para desarrollo
                setNotificationConfig({
                    email: { enabled: false, configured: false },
                    whatsapp: { enabled: false, configured: false },
                    system: { enabled: true }
                });
            }
        } catch (error) {
            console.error('Error cargando configuración:', error);
            // Usar configuración por defecto
            setNotificationConfig({
                email: { enabled: false, configured: false },
                whatsapp: { enabled: false, configured: false },
                system: { enabled: true }
            });
        }
    };

    const markAsRead = async (notificationId) => {
        try {
            await notificationService.markAsRead(notificationId);
            // Actualizar localmente
            setNotifications(prev => 
                prev.map(notification => 
                    notification.id === notificationId 
                        ? { ...notification, read: true }
                        : notification
                )
            );
        } catch (error) {
            console.error('Error marcando como leída:', error);
        }
    };

    const deleteNotification = async (notificationId) => {
        try {
            // Simular eliminación (implementar en API si es necesario)
            setNotifications(prev => 
                prev.filter(notification => notification.id !== notificationId)
            );
        } catch (error) {
            console.error('Error eliminando notificación:', error);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case 'email':
                return <FaEnvelope className="w-4 h-4 text-blue-500" />;
            case 'whatsapp':
                return <FaWhatsapp className="w-4 h-4 text-green-500" />;
            case 'sistema':
            default:
                return <FaDesktop className="w-4 h-4 text-gray-500" />;
        }
    };

    const formatNotificationDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now - date) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            return 'Hace unos minutos';
        } else if (diffInHours < 24) {
            return `Hace ${Math.floor(diffInHours)} hora${Math.floor(diffInHours) > 1 ? 's' : ''}`;
        } else {
            return format(date, "d 'de' MMM, HH:mm", { locale: es });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-16 px-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-md max-h-96 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-2">
                        <FaBell className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Notificaciones
                        </h2>
                        {notifications.length > 0 && (
                            <span className="bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-medium px-2 py-1 rounded-full">
                                {notifications.length}
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    >
                        <FaTimes className="w-5 h-5" />
                    </button>
                </div>

                {/* Estado de servicios */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        Estado de servicios de notificación:
                    </p>
                    <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center space-x-1">
                            <FaDesktop className="w-3 h-3" />
                            <span className={`${notificationConfig.system.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                Sistema: {notificationConfig.system.enabled ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FaEnvelope className="w-3 h-3" />
                            <span className={`${notificationConfig.email.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                Email: {notificationConfig.email.enabled ? 'Activo' : 'No configurado'}
                            </span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <FaWhatsapp className="w-3 h-3" />
                            <span className={`${notificationConfig.whatsapp.enabled ? 'text-green-600' : 'text-gray-400'}`}>
                                WhatsApp: {notificationConfig.whatsapp.enabled ? 'Activo' : 'No configurado'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lista de notificaciones */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex justify-center items-center p-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center p-8">
                            <FaBell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                            <p className="text-gray-500 dark:text-gray-400">
                                No tienes notificaciones
                            </p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-2">
                                Las notificaciones del sistema aparecerán aquí
                            </p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200 dark:divide-gray-700">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                                        !notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                                    }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        <div className="flex-shrink-0 mt-1">
                                            {getNotificationIcon(notification.tipo)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {notification.asunto}
                                                    </p>
                                                    <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 line-clamp-2">
                                                        {notification.mensaje}
                                                    </p>
                                                    {notification.actividad_titulo && (
                                                        <p className="text-xs text-primary-600 dark:text-primary-400 mt-1">
                                                            📋 {notification.actividad_titulo}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-gray-400 mt-2">
                                                        {formatNotificationDate(notification.created_at)}
                                                    </p>
                                                </div>
                                                <div className="flex items-center space-x-1 ml-2">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => markAsRead(notification.id)}
                                                            className="text-gray-400 hover:text-green-600 transition-colors"
                                                            title="Marcar como leída"
                                                        >
                                                            <FaCheck className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => deleteNotification(notification.id)}
                                                        className="text-gray-400 hover:text-red-600 transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <FaTrash className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer con información */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                            <FaInfoCircle className="w-3 h-3" />
                            <span>
                                Sistema OpenSource - Solo notificaciones locales activas
                            </span>
                        </div>
                        {pagination.hasMore && (
                            <button
                                onClick={loadNotifications}
                                className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                            >
                                Cargar más
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotificationCenter;