import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';
import { useAuth } from '../../context/AuthContext';
import Comments from './Comments';

// Основной компонент модального окна
function ApplicationDetailModal({ isOpen, onClose, applicationId, onStatusChange }) {
    const { isAuthenticated, user } = useAuth();
    // Состояние для хранения данных заявки и управления модальным окном
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shouldRefetch, setShouldRefetch] = useState(true);
    const [isDeleting, setIsDeleting] = useState(false);
    
    // Настройка заголовков авторизации для запросов
    const setupAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    };
    
    // Загрузка деталей заявки с сервера
    const fetchApplicationDetail = useCallback(async () => {
        if (!applicationId || !isOpen) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.get(`/api/applications/${applicationId}`);
            
            if (response.data && response.data.success) {
                setApplication(response.data.data);
            } else {
                setError('Не удалось загрузить данные заявки');
            }
        } catch (err) {
            console.error('Error fetching application:', err);
            setError('Произошла ошибка при загрузке данных');
        } finally {
            setLoading(false);
            setShouldRefetch(false);
        }
    }, [applicationId, isOpen]);
    
    useEffect(() => {
        if (shouldRefetch) {
            fetchApplicationDetail();
        }
    }, [fetchApplicationDetail, shouldRefetch]);
    
    useEffect(() => {
        if (isOpen && applicationId) {
            setShouldRefetch(true);
        }
    }, [isOpen, applicationId]);
    
    // Обработка закрытия модального окна по клавише Esc
    useEffect(() => {
        const handleEscKey = (e) => {
            if (isOpen && e.key === 'Escape') {
                onClose();
            }
        };
        
        if (isOpen) {
            // Prevent body and html scrolling when modal is open
            document.body.style.overflow = 'hidden';
            document.documentElement.style.overflow = 'hidden';
            document.addEventListener('keydown', handleEscKey);
        }
        
        return () => {
            // Re-enable scrolling when modal is closed
            document.body.style.overflow = 'auto';
            document.documentElement.style.overflow = 'auto';
            document.removeEventListener('keydown', handleEscKey);
        };
    }, [isOpen, onClose]);
    
    // Обработчик изменения статуса заявки
    const handleStatusChange = (newStatus, updatedData) => {
        const now = new Date().toISOString();
        
        // Just update the status and reviewed_at in state without refetching
        setApplication(prev => {
            if (!prev) return prev;
            
            return {
                ...prev,
                status: newStatus,
                reviewed_at: now,
                reviewer: user // Add current user as reviewer
            };
        });
        
        // Pass to parent for updating the main list
        if (onStatusChange && applicationId) {
            onStatusChange(applicationId, newStatus, {
                status: newStatus,
                reviewed_at: now
            });
        }
    };
    
    // Обработчик удаления заявки
    const handleDeleteApplication = async () => {
        if (!window.confirm('Вы уверены, что хотите удалить эту заявку? Все связанные комментарии также будут удалены. Это действие нельзя отменить.')) {
            return;
        }
        
        if (!applicationId) return;
        
        setIsDeleting(true);
        
        try {
            const hasToken = setupAuthHeaders();
            if (!hasToken) {
                setIsDeleting(false);
                return;
            }
            
            const response = await axios.delete(`/api/applications/${applicationId}`);
            
            if (response.data && response.data.success) {
                onClose();
                
                if (typeof onStatusChange === 'function') {
                    onStatusChange(applicationId, null);
                }
            } else {
                console.error('Failed to delete application:', response.data);
            }
        } catch (err) {
            console.error('Error deleting application:', err);
        } finally {
            setIsDeleting(false);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen p-4 text-center">
                {/* Затемнение фона */}
                <div className="fixed inset-0 transition-opacity z-40" aria-hidden="true">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                {/* Модальное окно */}
                <div 
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white max-h-[80vh] overflow-y-auto">
                        <div className="flex bg-slate-50 justify-between items-center p-4 border-b border-slate-200">
                            <h3 className="text-base leading-6 font-medium text-slate-900">
                                Детали заявки
                            </h3>
                            <button 
                                onClick={onClose}
                                className="cursor-pointer text-slate-500 hover:text-slate-700"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="min-h-[500px] transition-all duration-200 p-4 sm:p-6">
                            {/* Отображение состояния загрузки */}
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 p-4 rounded-md text-red-700">
                                    {error}
                                </div>
                            ) : application ? (
                                <div>
                                    <div className="mb-6">
                                        <div className="mb-4">
                                            {/* Информация о заявке */}
                                            <div className="mb-4">
                                                <p className="mt-1 text-slate-900 text-lg font-medium">{application.name}</p>
                                                <p className="mt-1 text-slate-700 text-sm">Email:{application.email}</p>
                                            </div>

                                            {/* Сообщение заявки */}
                                            <div className="p-3 bg-slate-50 rounded-md min-h-[60px]">
                                                <h4 className="text-xs mb-0.5 font-medium text-slate-500">Сообщение</h4>
                                                <p className="text-slate-700 whitespace-pre-line">{application.message}</p>
                                            </div>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Выпадающий список статусов */}
                                            <div className="p-3 bg-slate-50 rounded-md min-h-[60px]">
                                                <h4 className="text-xs mb-1 font-medium text-slate-500">Статус</h4>
                                                <StatusDropdown 
                                                    applicationId={application.id}
                                                    currentStatus={application.status}
                                                    onStatusChange={handleStatusChange}
                                                />
                                                {application.reviewer && (
                                                    <p className="text-xs text-slate-500 mt-1">Изменено: {application.reviewed_at ? formatDate(application.reviewed_at) : '—'} ({application.reviewer.name})</p>
                                                )}
                                            </div>
                                        
                                            {/* Даты создания */}
                                            <div className="p-3 bg-slate-50 rounded-md min-h-[60px]">
                                                <h4 className="text-xs mb-1 font-medium text-slate-500">Дата создания</h4>
                                                <p className="mt-1 text-slate-700">{formatDate(application.created_at)}</p>
                                            </div>
                                        </div>
                                        
                                        {/* Метаданные заявки */}
                                        {application.metadata && (
                                            <div className="mt-4 bg-slate-50 p-3 rounded-md">
                                                <h4 className="text-xs mb-1 font-medium text-slate-500">Метаданные</h4>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                    {application.metadata.ip_address && (
                                                        <div>
                                                            <span className="text-xs text-slate-500">IP адрес:</span>
                                                            <p className="text-sm text-slate-700">{application.metadata.ip_address}</p>
                                                        </div>
                                                    )}
                                                    {application.metadata.user_agent && (
                                                        <div>
                                                            <span className="text-xs text-slate-500">User Agent:</span>
                                                            <p className="text-sm text-slate-700 break-all">{application.metadata.user_agent}</p>
                                                        </div>
                                                    )}
                                                    {application.metadata.referer && (
                                                        <div>
                                                            <span className="text-xs text-slate-500">Источник:</span>
                                                            <p className="text-sm text-slate-700">{application.metadata.referer}</p>
                                                        </div>
                                                    )}
                                                    {application.metadata.browser && (
                                                        <div>
                                                            <span className="text-xs text-slate-500">Браузер:</span>
                                                            <p className="text-sm text-slate-700">{application.metadata.browser}</p>
                                                        </div>
                                                    )}
                                                    {application.metadata.referrer && (
                                                        <div>
                                                            <span className="text-xs text-slate-500">Реферер:</span>
                                                            <p className="text-sm text-slate-700">{application.metadata.referrer}</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {/* Кнопки действий */}
                                        {isAuthenticated && application && (
                                            <button
                                                type="button"
                                                className="mt-4 cursor-pointer w-full inline-flex justify-center rounded-md shadow-xs border border-transparent px-4 py-3 bg-slate-50 hover:bg-slate-100 text-sm font-medium text-red-700 focus:outline-none focus:ring-1 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                                                onClick={handleDeleteApplication}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? (
                                                    <span className="flex items-center">
                                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                        </svg>
                                                        Удаление...
                                                    </span>
                                                ) : 'Удалить заявку'}
                                            </button>
                                        )}
                                        
                                        {/* Компонент комментариев */}
                                        {application && <Comments applicationId={application.id} />}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
                                    Заявка не найдена
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetailModal; 