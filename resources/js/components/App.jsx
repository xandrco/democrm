// Основной компонент приложения, отвечающий за маршрутизацию и аутентификацию
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../context/AuthContext';
import Login from './auth/Login';
import Register from './auth/Register';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard';

function App() {
    return (
        // Обертка для предоставления контекста аутентификации всем компонентам
        <AuthProvider>
            <Router>
                <Routes>
                    {/* Маршрут для страницы входа */}
                    <Route path="/login" element={<LoginWrapper />} />
                    {/* Маршрут для страницы регистрации */}
                    <Route path="/register" element={<RegisterWrapper />} />
                    {/* Защищенный маршрут для панели управления */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    {/* Перенаправление на главную страницу для несуществующих маршрутов */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </Router>
        </AuthProvider>
    );
}

// Компонент-обертка для страницы входа с проверкой аутентификации
function LoginWrapper() {
    const { isAuthenticated, loading, login } = useAuth();

    // Показываем индикатор загрузки во время проверки аутентификации
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если пользователь уже аутентифицирован, перенаправляем на главную страницу
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Отображаем форму входа для неаутентифицированных пользователей
    return <Login onLogin={login} />;
}

// Компонент-обертка для страницы регистрации с проверкой аутентификации
function RegisterWrapper() {
    const { isAuthenticated, loading, register } = useAuth();

    // Показываем индикатор загрузки во время проверки аутентификации
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если пользователь уже аутентифицирован, перенаправляем на главную страницу
    if (isAuthenticated) {
        return <Navigate to="/" replace />;
    }

    // Отображаем форму регистрации для неаутентифицированных пользователей
    return <Register onRegister={register} />;
}

export default App; 