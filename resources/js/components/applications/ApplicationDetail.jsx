// Компонент для отображения детальной информации о заявке
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';

function ApplicationDetail({ applicationId }) {
    // Состояние для хранения данных заявки и состояния загрузки
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Загрузка данных заявки при изменении ID
    useEffect(() => {
        fetchApplication();
    }, [applicationId]);
    
    // Функция загрузки данных заявки с сервера
    const fetchApplication = async () => {
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
        }
    };
    
    // Обработчик изменения статуса заявки
    const handleStatusChange = (newStatus) => {
        setApplication(prev => ({
            ...prev,
            status: newStatus,
            reviewed_at: prev.status === 'pending' && newStatus !== 'pending' ? new Date().toISOString() : prev.reviewed_at
        }));
    };
    
    // Отображение индикатора загрузки
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    // Отображение ошибки, если заявка не найдена или произошла ошибка
    if (error || !application) {
        return (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
                {error || 'Заявка не найдена'}
            </div>
        );
    }
    
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
                {/* Заголовок с информацией о заявке */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">{application.name}</h2>
                        <p className="text-slate-600">{application.email}</p>
                    </div>
                    <div className="mt-4 md:mt-0 md:ml-6 md:w-64">
                        <StatusDropdown 
                            applicationId={application.id}
                            currentStatus={application.status}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                </div>
                
                {/* Сообщение заявки */}
                <div className="bg-slate-50 p-4 rounded-md mb-6">
                    <h3 className="text-slate-700 font-medium mb-2">Сообщение</h3>
                    <p className="text-slate-800 whitespace-pre-line">{application.message}</p>
                </div>
                
                {/* Даты создания и обработки */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Дата создания</h3>
                        <p className="mt-1 text-slate-900">{formatDate(application.created_at)}</p>
                    </div>
                    <div>
                        <h3 className="text-sm font-medium text-slate-500">Дата обработки</h3>
                        <p className="mt-1 text-slate-900">{application.reviewed_at ? formatDate(application.reviewed_at) : '—'}</p>
                    </div>
                </div>
                
                {/* Дополнительная информация */}
                {application.metadata && (
                    <div className="border-t border-slate-200 pt-4">
                        <h3 className="text-slate-700 font-medium mb-2">Дополнительная информация</h3>
                        <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                            {application.metadata.ip_address && (
                                <>
                                    <dt className="text-sm font-medium text-slate-500">IP адрес</dt>
                                    <dd className="text-sm text-slate-900">{application.metadata.ip_address}</dd>
                                </>
                            )}
                            {application.metadata.browser && (
                                <>
                                    <dt className="text-sm font-medium text-slate-500">Браузер</dt>
                                    <dd className="text-sm text-slate-900">{application.metadata.browser}</dd>
                                </>
                            )}
                            {application.metadata.referrer && (
                                <>
                                    <dt className="text-sm font-medium text-slate-500">Источник</dt>
                                    <dd className="text-sm text-slate-900">{application.metadata.referrer}</dd>
                                </>
                            )}
                        </dl>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ApplicationDetail; 