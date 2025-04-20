// Компонент формы входа в систему
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Login({ onLogin }) {
    // Состояние для хранения данных формы и ошибок
    const [email, setEmail] = useState('admin@democrm.com');
    const [password, setPassword] = useState('password');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Обработчик отправки формы входа
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Отправка запроса на сервер для аутентификации
            const response = await axios.post('/api/login', {
                email,
                password
            });
            
            // Если получен токен, сохраняем его и обновляем заголовки axios
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                onLogin(response.data.user);
            } else {
                setError('Ошибка аутентификации. Пожалуйста, попробуйте снова.');
            }
        } catch (err) {
            // Обработка ошибок аутентификации
            setError(err.response?.data?.message || 'Ошибка входа. Пожалуйста, проверьте ваши данные.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-white">
            <div className="bg-slate-50 p-8 border border-slate-200 rounded-lg w-full max-w-md mx-4">
                <h1 className="text-xl font-bold text-center mb-6">Вход в CRM</h1>
                
                {/* Отображение ошибок, если они есть */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-slate-600 text-xs font-medium mb-1" htmlFor="email">
                            Электронная почта
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-slate-600 text-xs font-medium mb-1" htmlFor="password">
                            Пароль
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-600 transition-colors duration-200 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-opacity-50 mb-4"
                        disabled={loading}
                    >
                        {loading ? 'Выполняется вход...' : 'Войти'}
                    </button>
                </form>
                
                {/* Ссылка на страницу регистрации */}
                <div className="text-center mt-2">
                    <p className="text-slate-600">
                        Нет аккаунта?{' '}
                        <Link to="/register" className="text-blue-600 hover:underline">
                            Зарегистрироваться
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Login; 