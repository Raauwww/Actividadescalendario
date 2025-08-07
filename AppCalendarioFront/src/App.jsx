import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useAuth } from './contexts/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';

// Componente para rutas protegidas
const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Componente para rutas públicas (solo accesibles cuando no está autenticado)
const PublicRoute = ({ children }) => {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
                </div>
            </div>
        );
    }

    return !isAuthenticated ? children : <Navigate to="/dashboard" replace />;
};

// Componente interno que utiliza los contextos
const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                {/* Ruta raíz - redirige según el estado de autenticación */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                
                {/* Rutas públicas */}
                <Route 
                    path="/login" 
                    element={
                        <PublicRoute>
                            <Login />
                        </PublicRoute>
                    } 
                />
                
                {/* Rutas protegidas */}
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } 
                />
                
                {/* Ruta 404 - redirige al dashboard o login según autenticación */}
                <Route 
                    path="*" 
                    element={<Navigate to="/dashboard" replace />} 
                />
            </Routes>
        </Router>
    );
};

// Componente principal de la aplicación
const App = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <div className="font-sans antialiased">
                    <AppRoutes />
                </div>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;
