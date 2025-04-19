/**
 * Основной файл React приложения
 * Подключает bootstrap.js для настройки axios и стили
 */
import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

/**
 * Инициализация React приложения
 * Рендеринг главного компонента App в DOM-элемент с id="app"
 */
document.addEventListener('DOMContentLoaded', () => {
    const appElement = document.getElementById('app');
    if (appElement) {
        const root = createRoot(appElement);
        root.render(<App />);
    }
}); 