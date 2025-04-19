// Компонент формы регистрации нового пользователя
import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Register({ onRegister }) {
    // Состояние для хранения данных формы и ошибок
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [error, setError] = useState('');
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    // Обработчик отправки формы регистрации
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setErrors({});

        try {
            // Отправка запроса на сервер для регистрации
            const response = await axios.post('/api/register', {
                name,
                email,
                password,
                password_confirmation: passwordConfirmation
            });
            
            // Если получен токен, сохраняем его и обновляем заголовки axios
            if (response.data.token) {
                localStorage.setItem('auth_token', response.data.token);
                axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
                
                // Получаем данные пользователя после успешной регистрации
                try {
                    const userResponse = await axios.get('/api/user');
                    onRegister(userResponse.data);
                } catch (userError) {
                    onRegister({ name, email });
                }
            } else {
                setError('Ошибка регистрации. Пожалуйста, попробуйте снова.');
            }
        } catch (err) {
            // Обработка ошибок валидации и других ошибок
            if (err.response?.data?.errors) {
                setErrors(err.response.data.errors);
            } else {
                setError(err.response?.data?.message || 'Ошибка регистрации. Пожалуйста, попробуйте снова.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-bold text-center mb-6">Регистрация в Mini CRM</h1>
                
                {/* Отображение общих ошибок */}
                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-md mb-4">
                        {error}
                    </div>
                )}
                
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                            Имя пользователя
                        </label>
                        <input
                            id="name"
                            type="text"
                            className={`w-full px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {/* Отображение ошибок валидации для поля имени */}
                        {errors.name && (
                            <p className="text-red-500 text-xs mt-1">{errors.name[0]}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Электронная почта
                        </label>
                        <input
                            id="email"
                            type="email"
                            className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {/* Отображение ошибок валидации для поля email */}
                        {errors.email && (
                            <p className="text-red-500 text-xs mt-1">{errors.email[0]}</p>
                        )}
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Пароль
                        </label>
                        <input
                            id="password"
                            type="password"
                            className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength="8"
                        />
                        {/* Отображение ошибок валидации для поля пароля */}
                        {errors.password && (
                            <p className="text-red-500 text-xs mt-1">{errors.password[0]}</p>
                        )}
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password_confirmation">
                            Подтверждение пароля
                        </label>
                        <input
                            id="password_confirmation"
                            type="password"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            minLength="8"
                        />
                    </div>
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 mb-4"
                        disabled={loading}
                    >
                        {loading ? 'Регистрация...' : 'Зарегистрироваться'}
                    </button>
                </form>
                
                {/* Ссылка на страницу входа */}
                <div className="text-center mt-2">
                    <p className="text-gray-600">
                        Уже есть аккаунт?{' '}
                        <Link to="/login" className="text-blue-600 hover:underline">
                            Войти
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default Register; 