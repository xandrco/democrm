import axios from 'axios';

window.axios = axios;
window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;

const token = localStorage.getItem('auth_token');
if (token) {
    window.axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

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
