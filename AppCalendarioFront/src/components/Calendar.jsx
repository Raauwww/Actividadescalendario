import React, { useState, useEffect, useCallback } from 'react';
import Calendar from 'react-calendar';
import { format, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
    FaPlus, 
    FaCalendarAlt, 
    FaClock, 
    FaFilter,
    FaSearch,
    FaChevronLeft,
    FaChevronRight,
    FaList,
    FaTh
} from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { activityService, categoryService } from '../services/api';
import ActivityModal from './ActivityModal';
import ActivityCard from './ActivityCard';

const ActivityCalendar = () => {
    const { user, hasPermission } = useAuth();
    const { isDark } = useTheme();
    
    // Estados principales
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [activities, setActivities] = useState([]);
    const [categories, setCategories] = useState([]);
    const [filteredActivities, setFilteredActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Estados de la UI
    const [viewMode, setViewMode] = useState('calendar'); // 'calendar' | 'list'
    const [selectedActivity, setSelectedActivity] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isCreateMode, setIsCreateMode] = useState(false);
    
    // Estados de filtros
    const [filters, setFilters] = useState({
        search: '',
        category: '',
        status: '',
        assignedTo: '',
    });
    const [showFilters, setShowFilters] = useState(false);

    // Cargar datos iniciales
    useEffect(() => {
        loadInitialData();
    }, []);

    // Filtrar actividades cuando cambian los filtros
    useEffect(() => {
        filterActivities();
    }, [activities, filters]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [activitiesResponse, categoriesResponse] = await Promise.all([
                activityService.getActivities({
                    start_date: format(startOfMonth(selectedDate), 'yyyy-MM-dd'),
                    end_date: format(endOfMonth(selectedDate), 'yyyy-MM-dd'),
                }),
                categoryService.getCategories(),
            ]);

            if (activitiesResponse.success) {
                setActivities(activitiesResponse.data || []);
            }

            if (categoriesResponse.success) {
                setCategories(categoriesResponse.data || []);
            }
        } catch (err) {
            setError('Error al cargar los datos');
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const filterActivities = useCallback(() => {
        let filtered = activities;

        // Filtro por búsqueda de texto
        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(activity =>
                activity.titulo.toLowerCase().includes(searchLower) ||
                activity.descripcion?.toLowerCase().includes(searchLower)
            );
        }

        // Filtro por categoría
        if (filters.category) {
            filtered = filtered.filter(activity => 
                activity.categoria_id === parseInt(filters.category)
            );
        }

        // Filtro por estado
        if (filters.status) {
            filtered = filtered.filter(activity => 
                activity.estado_id === parseInt(filters.status)
            );
        }

        // Filtro por asignado a
        if (filters.assignedTo) {
            filtered = filtered.filter(activity => 
                activity.asignado_a === parseInt(filters.assignedTo)
            );
        }

        setFilteredActivities(filtered);
    }, [activities, filters]);

    // Obtener actividades para una fecha específica
    const getActivitiesForDate = (date) => {
        return filteredActivities.filter(activity => {
            const activityDate = new Date(activity.fecha_inicio);
            return isSameDay(activityDate, date);
        });
    };

    // Renderizar el contenido de cada día en el calendario
    const tileContent = ({ date, view }) => {
        if (view === 'month') {
            const dayActivities = getActivitiesForDate(date);
            
            if (dayActivities.length > 0) {
                return (
                    <div className="flex flex-col items-center space-y-1 mt-1">
                        {dayActivities.slice(0, 2).map((activity, index) => {
                            const category = categories.find(cat => cat.id === activity.categoria_id);
                            return (
                                <div
                                    key={activity.id}
                                    className="w-full h-1 rounded-full"
                                    style={{ backgroundColor: category?.color || '#3B82F6' }}
                                    title={activity.titulo}
                                />
                            );
                        })}
                        {dayActivities.length > 2 && (
                            <div className="text-xs font-semibold text-primary-600 dark:text-primary-400">
                                +{dayActivities.length - 2}
                            </div>
                        )}
                    </div>
                );
            }
        }
        return null;
    };

    // Aplicar estilos a los días del calendario
    const tileClassName = ({ date, view }) => {
        if (view === 'month') {
            const dayActivities = getActivitiesForDate(date);
            let classes = [];

            if (dayActivities.length > 0) {
                classes.push('has-activities');
            }

            if (isSameDay(date, selectedDate)) {
                classes.push('selected-date');
            }

            return classes.join(' ');
        }
        return null;
    };

    // Manejar clic en una fecha
    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    // Manejar clic en actividad
    const handleActivityClick = (activity) => {
        setSelectedActivity(activity);
        setIsCreateMode(false);
        setIsModalOpen(true);
    };

    // Manejar creación de nueva actividad
    const handleCreateActivity = () => {
        setSelectedActivity(null);
        setIsCreateMode(true);
        setIsModalOpen(true);
    };

    // Manejar actualización de actividad
    const handleActivityUpdate = (updatedActivity) => {
        setActivities(prev => 
            prev.map(activity => 
                activity.id === updatedActivity.id ? updatedActivity : activity
            )
        );
        setIsModalOpen(false);
    };

    // Manejar creación de actividad
    const handleActivityCreate = (newActivity) => {
        setActivities(prev => [...prev, newActivity]);
        setIsModalOpen(false);
    };

    // Manejar eliminación de actividad
    const handleActivityDelete = (activityId) => {
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
        setIsModalOpen(false);
    };

    // Renderizar lista de actividades del día seleccionado
    const renderDayActivities = () => {
        const dayActivities = getActivitiesForDate(selectedDate);
        
        if (dayActivities.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No hay actividades para este día</p>
                    {hasPermission('write') && (
                        <button
                            onClick={handleCreateActivity}
                            className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                            <FaPlus className="w-4 h-4 mr-2 inline" />
                            Crear actividad
                        </button>
                    )}
                </div>
            );
        }

        return (
            <div className="space-y-3">
                {dayActivities.map(activity => (
                    <ActivityCard
                        key={activity.id}
                        activity={activity}
                        category={categories.find(cat => cat.id === activity.categoria_id)}
                        onClick={() => handleActivityClick(activity)}
                    />
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-8 text-red-600 dark:text-red-400">
                <p>{error}</p>
                <button
                    onClick={loadInitialData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        Calendario de Actividades
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        {format(selectedDate, "d 'de' MMMM, yyyy", { locale: es })}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {/* Botón de filtros */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg transition-colors ${
                            showFilters 
                                ? 'bg-primary-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'
                        }`}
                    >
                        <FaFilter className="w-4 h-4" />
                    </button>

                    {/* Toggle de vista */}
                    <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                        <button
                            onClick={() => setViewMode('calendar')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'calendar'
                                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <FaTh className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md transition-colors ${
                                viewMode === 'list'
                                    ? 'bg-white dark:bg-gray-700 text-primary-600 shadow-sm'
                                    : 'text-gray-600 dark:text-gray-400'
                            }`}
                        >
                            <FaList className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Botón crear actividad */}
                    {hasPermission('write') && (
                        <button
                            onClick={handleCreateActivity}
                            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                        >
                            <FaPlus className="w-4 h-4" />
                            <span className="hidden sm:inline">Nueva actividad</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros */}
            {showFilters && (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Búsqueda */}
                        <div className="relative">
                            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar actividades..."
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                            />
                        </div>

                        {/* Categoría */}
                        <select
                            value={filters.category}
                            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Todas las categorías</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.nombre}
                                </option>
                            ))}
                        </select>

                        {/* Estado */}
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        >
                            <option value="">Todos los estados</option>
                            <option value="1">Pendiente</option>
                            <option value="2">En Progreso</option>
                            <option value="3">Completada</option>
                            <option value="4">Cancelada</option>
                            <option value="5">Pausada</option>
                            <option value="6">Retrasada</option>
                        </select>

                        {/* Botón limpiar filtros */}
                        <button
                            onClick={() => setFilters({ search: '', category: '', status: '', assignedTo: '' })}
                            className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600"
                        >
                            Limpiar filtros
                        </button>
                    </div>
                </div>
            )}

            {/* Contenido principal */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendario */}
                {viewMode === 'calendar' && (
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                            <Calendar
                                onChange={handleDateClick}
                                value={selectedDate}
                                tileContent={tileContent}
                                tileClassName={tileClassName}
                                locale="es"
                                className={`w-full ${isDark ? 'dark-calendar' : ''}`}
                                prev2Label={null}
                                next2Label={null}
                                prevLabel={<FaChevronLeft className="w-4 h-4" />}
                                nextLabel={<FaChevronRight className="w-4 h-4" />}
                            />
                        </div>
                    </div>
                )}

                {/* Lista de actividades del día / Vista de lista completa */}
                <div className={viewMode === 'list' ? 'lg:col-span-3' : 'lg:col-span-1'}>
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                                {viewMode === 'calendar' 
                                    ? `Actividades del ${format(selectedDate, "d 'de' MMMM", { locale: es })}`
                                    : 'Todas las actividades'
                                }
                            </h2>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                                {viewMode === 'calendar' 
                                    ? `${getActivitiesForDate(selectedDate).length} actividad(es)`
                                    : `${filteredActivities.length} actividad(es)`
                                }
                            </span>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {viewMode === 'calendar' ? renderDayActivities() : (
                                <div className="space-y-3">
                                    {filteredActivities.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                            <FaCalendarAlt className="w-12 h-12 mx-auto mb-4 opacity-50" />
                                            <p>No se encontraron actividades</p>
                                        </div>
                                    ) : (
                                        filteredActivities.map(activity => (
                                            <ActivityCard
                                                key={activity.id}
                                                activity={activity}
                                                category={categories.find(cat => cat.id === activity.categoria_id)}
                                                onClick={() => handleActivityClick(activity)}
                                                showDate={true}
                                            />
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de actividad */}
            {isModalOpen && (
                <ActivityModal
                    activity={selectedActivity}
                    isOpen={isModalOpen}
                    isCreateMode={isCreateMode}
                    selectedDate={selectedDate}
                    categories={categories}
                    onClose={() => setIsModalOpen(false)}
                    onUpdate={handleActivityUpdate}
                    onCreate={handleActivityCreate}
                    onDelete={handleActivityDelete}
                />
            )}
        </div>
    );
};

export default ActivityCalendar;