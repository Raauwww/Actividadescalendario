import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    FaCalendarAlt, 
    FaUsers, 
    FaBell, 
    FaCog, 
    FaSignOutAlt,
    FaBars,
    FaTimes,
    FaMoon,
    FaSun,
    FaUser,
    FaTasks,
    FaChartBar
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Calendar from '../components/Calendar';
import NotificationCenter from '../components/NotificationCenter';

const Dashboard = () => {
    const navigate = useNavigate();
    const { user, logout, isAdmin, isSupervisor } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('calendar');
    const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        }
    };

    const menuItems = [
        {
            id: 'calendar',
            name: 'Calendario',
            icon: FaCalendarAlt,
            component: Calendar,
            permission: 'read'
        },
        {
            id: 'activities',
            name: 'Mis Actividades',
            icon: FaTasks,
            component: () => <div className="p-6">Mis actividades en desarrollo...</div>,
            permission: 'read'
        },
        {
            id: 'users',
            name: 'Usuarios',
            icon: FaUsers,
            component: () => <div className="p-6">Gestión de usuarios en desarrollo...</div>,
            permission: 'manage_users',
            adminOnly: true
        },
        {
            id: 'reports',
            name: 'Reportes',
            icon: FaChartBar,
            component: () => <div className="p-6">Reportes en desarrollo...</div>,
            permission: 'view_reports'
        },
        {
            id: 'notifications',
            name: 'Notificaciones',
            icon: FaBell,
            component: () => <div className="p-6">Notificaciones en desarrollo...</div>,
            permission: 'read'
        },
        {
            id: 'settings',
            name: 'Configuración',
            icon: FaCog,
            component: () => <div className="p-6">Configuración en desarrollo...</div>,
            permission: 'read'
        }
    ];

    // Filtrar items del menú según permisos
    const allowedMenuItems = menuItems.filter(item => {
        if (item.adminOnly && !isAdmin()) return false;
        if (item.permission && !user?.permisos?.[item.permission] && !isAdmin()) return false;
        return true;
    });

    const ActiveComponent = allowedMenuItems.find(item => item.id === activeTab)?.component || Calendar;

    return (
        <div className="h-screen bg-gray-50 dark:bg-gray-900 flex overflow-hidden">
            {/* Sidebar */}
            <div className={`
                fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                lg:translate-x-0 lg:static lg:inset-0
            `}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                                <FaCalendarAlt className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                                Agendador
                            </span>
                        </div>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* User Info */}
                    <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                <FaUser className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {user?.nombre} {user?.apellido}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                    {user?.rol_nombre}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* OpenSource Badge */}
                    <div className="px-4 py-2">
                        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                            <div className="flex items-center space-x-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <span className="text-xs font-medium text-green-700 dark:text-green-400">
                                    Modo OpenSource
                                </span>
                            </div>
                            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                Sin dependencias externas
                            </p>
                        </div>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                        {allowedMenuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => {
                                        setActiveTab(item.id);
                                        setSidebarOpen(false);
                                    }}
                                    className={`
                                        w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors
                                        ${activeTab === item.id
                                            ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                                        }
                                    `}
                                >
                                    <Icon className="w-5 h-5 flex-shrink-0" />
                                    <span className="font-medium">{item.name}</span>
                                </button>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                            <FaSignOutAlt className="w-5 h-5" />
                            <span className="font-medium">Cerrar sesión</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Overlay para móvil */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <FaBars className="w-5 h-5" />
                            </button>
                            <div>
                                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    {allowedMenuItems.find(item => item.id === activeTab)?.name || 'Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Bienvenido, {user?.nombre} • Sistema OpenSource
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            {/* Tema toggle */}
                            <button
                                onClick={toggleTheme}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                title="Cambiar tema"
                            >
                                {theme === 'dark' ? (
                                    <FaSun className="w-5 h-5" />
                                ) : (
                                    <FaMoon className="w-5 h-5" />
                                )}
                            </button>

                            {/* Notificaciones */}
                            <button 
                                onClick={() => setNotificationCenterOpen(true)}
                                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
                                title="Notificaciones del sistema"
                            >
                                <FaBell className="w-5 h-5" />
                                <span className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full" title="Solo notificaciones del sistema"></span>
                            </button>

                            {/* Perfil */}
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                                    <FaUser className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                                </div>
                                <div className="hidden sm:block">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                        {user?.nombre}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {user?.rol_nombre}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-auto">
                    <div className="h-full">
                        <ActiveComponent />
                    </div>
                </main>
            </div>

            {/* Centro de Notificaciones */}
            <NotificationCenter 
                isOpen={notificationCenterOpen}
                onClose={() => setNotificationCenterOpen(false)}
            />
        </div>
    );
};

export default Dashboard;