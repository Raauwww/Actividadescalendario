import axios from 'axios';

// Configuración base de axios
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
    baseURL: API_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las peticiones
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
api.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response?.status === 401) {
            // Token expirado o inválido
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

// Servicios de autenticación
export const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/auth/login', credentials);
            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    register: async (userData) => {
        try {
            const response = await api.post('/auth/register', userData);
            if (response.data.success) {
                const { token, user } = response.data.data;
                localStorage.setItem('token', token);
                localStorage.setItem('user', JSON.stringify(user));
            }
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Error al hacer logout:', error);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
    },

    getProfile: async () => {
        try {
            const response = await api.get('/auth/profile');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    changePassword: async (passwords) => {
        try {
            const response = await api.post('/auth/change-password', passwords);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    verifyToken: async () => {
        try {
            const response = await api.get('/auth/verify-token');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },
};

// Servicios de usuarios
export const userService = {
    getUsers: async (params = {}) => {
        try {
            const response = await api.get('/users', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    getUser: async (id) => {
        try {
            const response = await api.get(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    createUser: async (userData) => {
        try {
            const response = await api.post('/users', userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    updateUser: async (id, userData) => {
        try {
            const response = await api.put(`/users/${id}`, userData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/users/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },
};

// Servicios de actividades
export const activityService = {
    getActivities: async (params = {}) => {
        try {
            const response = await api.get('/activities', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    getActivity: async (id) => {
        try {
            const response = await api.get(`/activities/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    createActivity: async (activityData) => {
        try {
            const response = await api.post('/activities', activityData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    updateActivity: async (id, activityData) => {
        try {
            const response = await api.put(`/activities/${id}`, activityData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    deleteActivity: async (id) => {
        try {
            const response = await api.delete(`/activities/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    updateActivityStatus: async (id, status, times = {}) => {
        try {
            const response = await api.patch(`/activities/${id}/status`, {
                status,
                ...times
            });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },
};

// Servicios de categorías
export const categoryService = {
    getCategories: async () => {
        try {
            const response = await api.get('/categories');
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    createCategory: async (categoryData) => {
        try {
            const response = await api.post('/categories', categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    updateCategory: async (id, categoryData) => {
        try {
            const response = await api.put(`/categories/${id}`, categoryData);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    deleteCategory: async (id) => {
        try {
            const response = await api.delete(`/categories/${id}`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },
};

// Servicios de notificaciones
export const notificationService = {
    getNotifications: async (params = {}) => {
        try {
            const response = await api.get('/notifications', { params });
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },

    markAsRead: async (id) => {
        try {
            const response = await api.patch(`/notifications/${id}/read`);
            return response.data;
        } catch (error) {
            throw error.response?.data || { message: 'Error de conexión' };
        }
    },
};

export default api;