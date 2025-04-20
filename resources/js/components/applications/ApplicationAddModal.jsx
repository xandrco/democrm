// Компонент модального окна для добавления новой заявки
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ApplicationAddModal({ isOpen, onClose, onSuccess }) {
    // Состояние для хранения данных формы и ошибок
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: ''
    });
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Обработка закрытия модального окна по клавише Esc
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            
            const handleEscKey = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            
            document.addEventListener('keydown', handleEscKey);
            
            return () => {
                document.body.style.overflow = 'auto';
                document.documentElement.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEscKey);
            };
        } else {
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
        }
    }, [isOpen, onClose]);

    // Обработчик изменения полей формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Очищаем ошибку при изменении поля
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: null
            }));
        }
    };

    // Валидация формы
    const validate = () => {
        const newErrors = {};
        
        if (!formData.name.trim()) {
            newErrors.name = 'Введите название задачи';
        }
        
        if (!formData.email.trim()) {
            newErrors.email = 'Введите email';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
            newErrors.email = 'Неверный формат email';
        }
        
        if (!formData.message.trim()) {
            newErrors.message = 'Введите сообщение';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Обработчик отправки формы
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validate()) {
            return;
        }
        
        setIsSubmitting(true);
        try {
            const response = await axios.post('/api/applications', formData);
            setFormData({
                name: '',
                email: '',
                message: ''
            });
            onSuccess(response.data);
            onClose();
        } catch (error) {
            if (error.response && error.response.data && error.response.data.errors) {
                setErrors(error.response.data.errors);
            } else {
                setErrors({
                    general: 'Произошла ошибка при отправке заявки. Пожалуйста, попробуйте позже.'
                });
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                {/* Затемнение фона */}
                <div className="fixed inset-0 transition-opacity z-40" aria-hidden="true">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                {/* Модальное окно */}
                <div 
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle max-w-lg w-full relative z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                        <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                            Новая заявка
                        </h3>
                        
                        {/* Отображение общих ошибок */}
                        {errors.general && (
                            <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                                {errors.general}
                            </div>
                        )}
                        
                        <form onSubmit={handleSubmit}>
                            {/* Поле для имени */}
                            <div className="mb-4">
                                <label className="block text-slate-600 text-xs font-medium mb-1" htmlFor="name">
                                    Название задачи
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className={`w-full bg-white px-3 py-2 border ${errors.name ? 'border-red-500' : 'border-slate-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                <p className="mt-1 text-xs text-slate-500">Введите краткое название или тему задачи</p>
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>
                            
                            {/* Поле для email */}
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-slate-600 text-xs font-medium mb-1">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className={`w-full bg-white px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-slate-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                />
                                <p className="mt-1 text-xs text-slate-500">Укажите ваш рабочий email для связи</p>
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                                )}
                            </div>
                            
                            {/* Поле для сообщения */}
                            <div className="mb-4">
                                <label htmlFor="message" className="block text-slate-600 text-xs font-medium mb-1">
                                    Сообщение
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="4"
                                    value={formData.message}
                                    onChange={handleChange}
                                    className={`w-full bg-white px-3 py-2 border ${errors.message ? 'border-red-500' : 'border-slate-300'} rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
                                ></textarea>
                                <p className="mt-1 text-xs text-slate-500">Опишите подробности задачи, требования и сроки выполнения</p>
                                {errors.message && (
                                    <p className="mt-1 text-sm text-red-600">{errors.message}</p>
                                )}
                            </div>
                        </form>
                    </div>
                    
                    {/* Кнопки действий */}
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 flex flex-row-reverse gap-2 border-t border-slate-200">
                        <button
                            type="button"
                            className="cursor-pointer w-full inline-flex justify-center rounded-md border border-transparent px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm disabled:opacity-50"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Отправка...' : 'Отправить'}
                        </button>
                        <button
                            type="button"
                            className="cursor-pointer w-full inline-flex justify-center rounded-md border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
                            onClick={onClose}
                            disabled={isSubmitting}
                        >
                            Отмена
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationAddModal; 