import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';

function ApplicationDetailModal({ isOpen, onClose, applicationId, onStatusChange }) {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shouldRefetch, setShouldRefetch] = useState(true);
    
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
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            const handleEscKey = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            
            document.addEventListener('keydown', handleEscKey);
            
            return () => {
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEscKey);
            };
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, onClose]);
    
    const handleStatusChange = (newStatus) => {
        setApplication(prev => {
            if (!prev) return prev;
            
            return {
                ...prev,
                status: newStatus,
                reviewed_at: prev.status === 'pending' && newStatus !== 'pending' 
                    ? new Date().toISOString() 
                    : prev.reviewed_at
            };
        });
        
        if (onStatusChange && applicationId) {
            onStatusChange(applicationId, newStatus);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity z-40" aria-hidden="true">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div 
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Детали заявки
                                    </h3>
                                    <button 
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="min-h-[500px] transition-all duration-200">
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
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-gray-500">Имя</h4>
                                                        <p className="mt-1 text-gray-900 text-lg font-medium">{application.name}</p>
                                                    </div>
                                                    
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                                        <p className="mt-1 text-gray-900">{application.email}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-6">
                                                    <StatusDropdown 
                                                        applicationId={application.id}
                                                        currentStatus={application.status}
                                                        onStatusChange={handleStatusChange}
                                                    />
                                                </div>
                                                
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-medium text-gray-500">Сообщение</h4>
                                                    <div className="mt-1 p-4 bg-gray-50 rounded-md min-h-[60px]">
                                                        <p className="text-gray-800 whitespace-pre-line">{application.message}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Дата создания</h4>
                                                        <p className="mt-1 text-gray-900">{formatDate(application.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Дата обработки</h4>
                                                        <p className="mt-1 text-gray-900">{application.reviewed_at ? formatDate(application.reviewed_at) : '—'}</p>
                                                    </div>
                                                </div>
                                                
                                                {application.reviewer && (
                                                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Информация о рецензенте</h4>
                                                        <p className="text-gray-900">{application.reviewer.name}</p>
                                                        <p className="text-gray-600">{application.reviewer.email}</p>
                                                    </div>
                                                )}
                                                
                                                {application.metadata && (
                                                    <div className="mt-6">
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Метаданные</h4>
                                                        <div className="bg-gray-50 p-4 rounded-md">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {application.metadata.ip_address && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">IP адрес:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.ip_address}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.user_agent && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">User Agent:</span>
                                                                        <p className="text-sm text-gray-900 break-all">{application.metadata.user_agent}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.referer && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">Источник:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.referer}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.browser && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">Браузер:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.browser}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.referrer && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">Реферер:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.referrer}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
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
                    
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetailModal; 