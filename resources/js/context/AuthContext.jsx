/**
 * Контекст аутентификации пользователя
 * Предоставляет информацию о пользователе и функции аутентификации
 */
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

/**
 * Провайдер контекста аутентификации
 * 
 * @param {Object} props - свойства компонента
 * @param {React.ReactNode} props.children - дочерние компоненты
 */
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    /**
     * Эффект проверки статуса аутентификации при загрузке
     * Восстанавливает сессию пользователя по токену из localStorage
     */
    useEffect(() => {
        const checkAuthStatus = async () => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                try {
                    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    const response = await axios.get('/api/user');
                    setUser(response.data);
                } catch (error) {
                    console.error('Authentication error:', error);
                    localStorage.removeItem('auth_token');
                    delete axios.defaults.headers.common['Authorization'];
                }
            }
            setLoading(false);
        };

        checkAuthStatus();
    }, []);

    /**
     * Обработчик успешного входа в систему
     * 
     * @param {Object} userData - данные пользователя
     */
    const login = (userData) => {
        setUser(userData);
    };

    /**
     * Обработчик успешной регистрации
     * 
     * @param {Object} userData - данные пользователя
     */
    const register = (userData) => {
        setUser(userData);
    };

    /**
     * Выход из системы
     * Удаляет токен и информацию о пользователе
     */
    const logout = async () => {
        try {
            await axios.post('/api/logout');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem('auth_token');
            delete axios.defaults.headers.common['Authorization'];
            setUser(null);
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Хук для использования контекста аутентификации
 * 
 * @returns {Object} - объект с данными и функциями аутентификации
 */
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext; 