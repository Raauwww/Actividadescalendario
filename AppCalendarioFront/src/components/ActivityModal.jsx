import React from 'react';

const ActivityModal = ({ 
    activity, 
    isOpen, 
    isCreateMode, 
    selectedDate, 
    categories, 
    onClose, 
    onUpdate, 
    onCreate, 
    onDelete 
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        {isCreateMode ? 'Crear Nueva Actividad' : 'Detalles de Actividad'}
                    </h2>
                    
                    <div className="text-center py-8">
                        <p className="text-gray-500 dark:text-gray-400">
                            Modal de actividad en desarrollo...
                        </p>
                        {activity && (
                            <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
                                <h3 className="font-semibold text-gray-900 dark:text-white">
                                    {activity.titulo}
                                </h3>
                                {activity.descripcion && (
                                    <p className="text-gray-600 dark:text-gray-300 mt-2">
                                        {activity.descripcion}
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                        >
                            Cerrar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ActivityModal;