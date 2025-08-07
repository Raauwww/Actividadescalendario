import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authService } from '../services/api';

// Estado inicial
const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
};

// Tipos de acciones
const authActions = {
    SET_LOADING: 'SET_LOADING',
    LOGIN_SUCCESS: 'LOGIN_SUCCESS',
    LOGIN_FAILURE: 'LOGIN_FAILURE',
    LOGOUT: 'LOGOUT',
    UPDATE_USER: 'UPDATE_USER',
    CLEAR_ERROR: 'CLEAR_ERROR',
};

// Reducer para manejar el estado de autenticación
const authReducer = (state, action) => {
    switch (action.type) {
        case authActions.SET_LOADING:
            return {
                ...state,
                isLoading: action.payload,
            };

        case authActions.LOGIN_SUCCESS:
            return {
                ...state,
                user: action.payload.user,
                token: action.payload.token,
                isAuthenticated: true,
                isLoading: false,
                error: null,
            };

        case authActions.LOGIN_FAILURE:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: action.payload,
            };

        case authActions.LOGOUT:
            return {
                ...state,
                user: null,
                token: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            };

        case authActions.UPDATE_USER:
            return {
                ...state,
                user: { ...state.user, ...action.payload },
            };

        case authActions.CLEAR_ERROR:
            return {
                ...state,
                error: null,
            };

        default:
            return state;
    }
};

// Crear el contexto
const AuthContext = createContext();

// Hook personalizado para usar el contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe ser usado dentro de un AuthProvider');
    }
    return context;
};

// Provider del contexto
export const AuthProvider = ({ children }) => {
    const [state, dispatch] = useReducer(authReducer, initialState);

    // Verificar token al cargar la aplicación
    useEffect(() => {
        const initializeAuth = async () => {
            const token = localStorage.getItem('token');
            const storedUser = localStorage.getItem('user');

            if (token && storedUser) {
                try {
                    // Verificar si el token es válido
                    const response = await authService.verifyToken();
                    if (response.success) {
                        dispatch({
                            type: authActions.LOGIN_SUCCESS,
                            payload: {
                                user: JSON.parse(storedUser),
                                token,
                            },
                        });
                    } else {
                        // Token inválido
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        dispatch({ type: authActions.SET_LOADING, payload: false });
                    }
                } catch (error) {
                    // Error al verificar token
                    localStorage.removeItem('token');
                    localStorage.removeItem('user');
                    dispatch({ type: authActions.SET_LOADING, payload: false });
                }
            } else {
                dispatch({ type: authActions.SET_LOADING, payload: false });
            }
        };

        initializeAuth();
    }, []);

    // Función para iniciar sesión
    const login = async (credentials) => {
        try {
            dispatch({ type: authActions.SET_LOADING, payload: true });
            
            const response = await authService.login(credentials);
            
            if (response.success) {
                dispatch({
                    type: authActions.LOGIN_SUCCESS,
                    payload: response.data,
                });
                return { success: true };
            } else {
                dispatch({
                    type: authActions.LOGIN_FAILURE,
                    payload: response.message || 'Error al iniciar sesión',
                });
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Error de conexión';
            dispatch({
                type: authActions.LOGIN_FAILURE,
                payload: errorMessage,
            });
            return { success: false, message: errorMessage };
        }
    };

    // Función para registrarse
    const register = async (userData) => {
        try {
            dispatch({ type: authActions.SET_LOADING, payload: true });
            
            const response = await authService.register(userData);
            
            if (response.success) {
                dispatch({
                    type: authActions.LOGIN_SUCCESS,
                    payload: response.data,
                });
                return { success: true };
            } else {
                dispatch({
                    type: authActions.LOGIN_FAILURE,
                    payload: response.message || 'Error al registrarse',
                });
                return { success: false, message: response.message };
            }
        } catch (error) {
            const errorMessage = error.message || 'Error de conexión';
            dispatch({
                type: authActions.LOGIN_FAILURE,
                payload: errorMessage,
            });
            return { success: false, message: errorMessage };
        }
    };

    // Función para cerrar sesión
    const logout = async () => {
        try {
            await authService.logout();
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
        } finally {
            dispatch({ type: authActions.LOGOUT });
        }
    };

    // Función para actualizar perfil del usuario
    const updateUser = (userData) => {
        dispatch({
            type: authActions.UPDATE_USER,
            payload: userData,
        });
        
        // Actualizar localStorage
        const updatedUser = { ...state.user, ...userData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
    };

    // Función para limpiar errores
    const clearError = () => {
        dispatch({ type: authActions.CLEAR_ERROR });
    };

    // Función para cambiar contraseña
    const changePassword = async (passwords) => {
        try {
            const response = await authService.changePassword(passwords);
            return response;
        } catch (error) {
            throw error;
        }
    };

    // Función para obtener perfil actualizado
    const refreshProfile = async () => {
        try {
            const response = await authService.getProfile();
            if (response.success) {
                updateUser(response.data);
                return response;
            }
        } catch (error) {
            console.error('Error al actualizar perfil:', error);
            throw error;
        }
    };

    // Verificar permisos
    const hasPermission = (permission) => {
        if (!state.user) return false;
        
        // Los administradores tienen todos los permisos
        if (state.user.rol_nombre === 'Administrador') return true;
        
        return state.user.permisos && state.user.permisos[permission];
    };

    // Verificar si es administrador
    const isAdmin = () => {
        return state.user && state.user.rol_nombre === 'Administrador';
    };

    // Verificar si es supervisor
    const isSupervisor = () => {
        return state.user && (
            state.user.rol_nombre === 'Administrador' || 
            state.user.rol_nombre === 'Supervisor'
        );
    };

    const value = {
        // Estado
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        isLoading: state.isLoading,
        error: state.error,
        
        // Funciones
        login,
        register,
        logout,
        updateUser,
        clearError,
        changePassword,
        refreshProfile,
        hasPermission,
        isAdmin,
        isSupervisor,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};