/**
 * Настройка Axios для HTTP запросов
 * Конфигурация заголовков и перехватчиков ответов
 */
import axios from 'axios';

// Глобальная регистрация axios
window.axios = axios;
// Установка заголовка для AJAX-запросов
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
// Включение отправки куки с запросами для поддержки сессий
window.axios.defaults.withCredentials = true;

/**
 * Настройка авторизации по токену
 * Добавление токена из локального хранилища в заголовки запросов
 */
const token = localStorage.getItem('auth_token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

/**
 * Перехватчик ответов от сервера
 * При получении ошибки авторизации (401) удаляет токен из хранилища
 */
axios.interceptors.response.use(
    response => response,
    error => {
        if (error.response && error.response.status === 401) {
            localStorage.removeItem('auth_token');
            delete window.axios.defaults.headers.common['Authorization'];
        }
        return Promise.reject(error);
    }
);
