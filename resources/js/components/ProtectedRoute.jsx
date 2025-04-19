// Компонент для защиты маршрутов, требующих аутентификации
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function ProtectedRoute({ children }) {
    // Получаем состояние аутентификации и загрузки из контекста
    const { isAuthenticated, loading } = useAuth();

    // Показываем индикатор загрузки, если идет проверка аутентификации
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // Если пользователь не аутентифицирован, перенаправляем на страницу входа
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Если пользователь аутентифицирован, отображаем защищенный контент
    return children;
}

export default ProtectedRoute; 