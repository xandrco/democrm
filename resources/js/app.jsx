import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

document.addEventListener('DOMContentLoaded', () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
}); 