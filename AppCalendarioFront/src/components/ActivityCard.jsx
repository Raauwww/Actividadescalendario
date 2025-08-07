import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    FaClock, 
    FaUser, 
    FaMapMarkerAlt, 
    FaFlag,
    FaCircle
} from 'react-icons/fa';

const ActivityCard = ({ 
    activity, 
    category, 
    onClick, 
    showDate = false,
    compact = false 
}) => {
    // Mapeo de estados
    const statusMap = {
        1: { name: 'Pendiente', color: '#6B7280', bgColor: '#F3F4F6' },
        2: { name: 'En Progreso', color: '#F59E0B', bgColor: '#FEF3C7' },
        3: { name: 'Completada', color: '#10B981', bgColor: '#D1FAE5' },
        4: { name: 'Cancelada', color: '#EF4444', bgColor: '#FEE2E2' },
        5: { name: 'Pausada', color: '#8B5CF6', bgColor: '#EDE9FE' },
        6: { name: 'Retrasada', color: '#F97316', bgColor: '#FED7AA' }
    };

    // Mapeo de prioridades
    const priorityMap = {
        'baja': { name: 'Baja', color: '#6B7280', icon: '⬇️' },
        'media': { name: 'Media', color: '#F59E0B', icon: '➡️' },
        'alta': { name: 'Alta', color: '#EF4444', icon: '⬆️' },
        'urgente': { name: 'Urgente', color: '#DC2626', icon: '🔥' }
    };

    const status = statusMap[activity.estado_id] || statusMap[1];
    const priority = priorityMap[activity.prioridad] || priorityMap['media'];
    const startTime = new Date(activity.fecha_inicio);
    const endTime = new Date(activity.fecha_fin);

    const handleClick = (e) => {
        e.preventDefault();
        onClick && onClick(activity);
    };

    const formatTime = (date) => {
        return format(date, 'HH:mm', { locale: es });
    };

    const formatDate = (date) => {
        return format(date, "d 'de' MMM", { locale: es });
    };

    if (compact) {
        return (
            <div
                onClick={handleClick}
                className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 cursor-pointer group"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                        {/* Indicador de categoría */}
                        <div
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: category?.color || '#3B82F6' }}
                        />
                        
                        {/* Información básica */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {activity.titulo}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTime(startTime)} - {formatTime(endTime)}
                            </p>
                        </div>
                    </div>

                    {/* Estado */}
                    <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                            backgroundColor: status.bgColor, 
                            color: status.color 
                        }}
                    >
                        <FaCircle className="w-2 h-2 mr-1" />
                        {status.name}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div
            onClick={handleClick}
            className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all duration-200 cursor-pointer group hover:border-primary-300 dark:hover:border-primary-600"
        >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                    {/* Indicador de categoría */}
                    <div
                        className="w-4 h-4 rounded-full flex-shrink-0"
                        style={{ backgroundColor: category?.color || '#3B82F6' }}
                        title={category?.nombre || 'Sin categoría'}
                    />
                    
                    {/* Título y categoría */}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                            {activity.titulo}
                        </h3>
                        {category && (
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {category.nombre}
                            </p>
                        )}
                    </div>
                </div>

                {/* Prioridad */}
                <div className="flex items-center space-x-2 flex-shrink-0">
                    <span
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
                        style={{ 
                            backgroundColor: `${priority.color}20`, 
                            color: priority.color 
                        }}
                        title={`Prioridad: ${priority.name}`}
                    >
                        <span className="mr-1">{priority.icon}</span>
                        {priority.name}
                    </span>
                </div>
            </div>

            {/* Descripción */}
            {activity.descripcion && (
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
                    {activity.descripcion}
                </p>
            )}

            {/* Información de tiempo y fecha */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                    {/* Fecha (solo si showDate es true) */}
                    {showDate && (
                        <div className="flex items-center space-x-1">
                            <FaClock className="w-3 h-3" />
                            <span>{formatDate(startTime)}</span>
                        </div>
                    )}
                    
                    {/* Hora */}
                    <div className="flex items-center space-x-1">
                        <FaClock className="w-3 h-3" />
                        <span>{formatTime(startTime)} - {formatTime(endTime)}</span>
                    </div>

                    {/* Ubicación */}
                    {activity.ubicacion && (
                        <div className="flex items-center space-x-1">
                            <FaMapMarkerAlt className="w-3 h-3" />
                            <span className="truncate max-w-32">{activity.ubicacion}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
                {/* Asignado a */}
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                    <FaUser className="w-3 h-3" />
                    <span>
                        {activity.asignado_nombre 
                            ? `${activity.asignado_nombre} ${activity.asignado_apellido}`
                            : 'Sin asignar'
                        }
                    </span>
                </div>

                {/* Estado */}
                <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium"
                    style={{ 
                        backgroundColor: status.bgColor, 
                        color: status.color 
                    }}
                >
                    <FaCircle className="w-2 h-2 mr-2" />
                    {status.name}
                </span>
            </div>

            {/* Indicador de tiempo real si la actividad está en progreso */}
            {activity.estado_id === 2 && activity.hora_inicio_real && (
                <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
                    <div className="flex items-center justify-between text-xs text-orange-600 dark:text-orange-400">
                        <span className="font-medium">Iniciada:</span>
                        <span>{format(new Date(activity.hora_inicio_real), 'HH:mm', { locale: es })}</span>
                    </div>
                </div>
            )}

            {/* Indicador de actividad completada con tiempos reales */}
            {activity.estado_id === 3 && activity.hora_inicio_real && activity.hora_fin_real && (
                <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between text-xs text-green-600 dark:text-green-400">
                        <span className="font-medium">Completada:</span>
                        <span>
                            {format(new Date(activity.hora_inicio_real), 'HH:mm', { locale: es })} - {' '}
                            {format(new Date(activity.hora_fin_real), 'HH:mm', { locale: es })}
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ActivityCard;