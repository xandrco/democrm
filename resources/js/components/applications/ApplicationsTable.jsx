// Компонент таблицы для отображения списка заявок
import React from 'react';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';

function ApplicationsTable({ applications, sortField, sortDirection, handleSort, onStatusChange, onViewApplication }) {
    // Функция для отображения индикатора сортировки
    const renderSortIndicator = (field) => {
        if (sortField === field) {
            return (
                <span className="ml-1 text-slate-500">
                    {sortDirection === 'asc' ? '↑' : '↓'}
                </span>
            );
        }
        return null;
    };
    
    // Функция для получения цвета статуса заявки
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-100 text-blue-800';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800';
            case 'approved':
                return 'bg-green-100 text-green-800';
            case 'rejected':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-slate-100 text-slate-800';
        }
    };
    
    // Функция для получения текстового представления статуса
    const getStatusLabel = (status) => {
        switch (status) {
            case 'pending':
                return 'Новая';
            case 'in_progress':
                return 'В обработке';
            case 'approved':
                return 'Решена';
            case 'rejected':
                return 'Отклонена';
            default:
                return status;
        }
    };
    
    // Обработчик изменения статуса заявки
    const handleApplicationStatusChange = (applicationId, newStatus) => {
        if (onStatusChange) {
            onStatusChange(applicationId, newStatus);
        }
    };
    
    // Обработчик просмотра деталей заявки
    const handleViewClick = (e, applicationId) => {
        e.preventDefault();
        if (onViewApplication) {
            onViewApplication(applicationId);
        }
    };
    
    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                    <tr>
                        {/* Заголовок столбца заявки (название задачи и email) */}
                        <th 
                            scope="col" 
                            className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            Заявка {renderSortIndicator('name')}
                        </th>
                        {/* Заголовок столбца статуса */}
                        <th 
                            scope="col" 
                            className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('status')}
                        >
                            Статус {renderSortIndicator('status')}
                        </th>
                        {/* Заголовок столбца даты создания */}
                        <th 
                            scope="col" 
                            className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('created_at')}
                        >
                            Дата создания {renderSortIndicator('created_at')}
                        </th>
                        {/* Заголовок столбца даты просмотра */}
                        <th 
                            scope="col" 
                            className="px-4 py-2 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('reviewed_at')}
                        >
                            Дата обновления {renderSortIndicator('reviewed_at')}
                        </th>
                        {/* Заголовок столбца действий */}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                    {/* Отображение списка заявок */}
                    {applications.map((application) => (
                        <tr key={application.id} className="hover:bg-slate-50/75">
                            {/* Ячейка с именем */}
                            <td 
                                onClick={(e) => handleViewClick(e, application.id)}
                                className="px-4 py-2 whitespace-nowrap text-sm cursor-pointer">
                                <p className="text-slate-900 font-medium">{application.name}</p>
                                <div className="flex items-center gap-1.5">
                                    <p className="text-slate-500 text-[13px]">{application.email}</p>
                                    {/* Comments count indicator */}
                                    {application.comments_count > 0 && (
                                        <div className="flex items-center text-[11px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                            <svg className="h-3 w-3 mr-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                            </svg>
                                            {application.comments_count}
                                        </div>
                                    )}
                                </div>
                            </td>
                            {/* Ячейка со статусом */}
                            <td className="px-4 py-2 whitespace-nowrap">
                                <div className="w-40">
                                    <StatusDropdown
                                        applicationId={application.id}
                                        currentStatus={application.status}
                                        onStatusChange={(newStatus) => handleApplicationStatusChange(application.id, newStatus)}
                                    />
                                </div>
                            </td>
                            {/* Ячейка с датой создания */}
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">
                                {formatDate(application.created_at)}
                            </td>
                            {/* Ячейка с датой просмотра */}
                            <td className="px-4 py-2 whitespace-nowrap text-sm text-slate-500">
                                {application.reviewed_at ? formatDate(application.reviewed_at) : '—'}
                            </td>
                            {/* Ячейка с кнопкой просмотра */}
                            <td className="px-4 py-2.5 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={(e) => handleViewClick(e, application.id)}
                                    className="bg-slate-100 rounded-md px-3 py-1.5 text-slate-700 hover:bg-slate-200 mr-3 cursor-pointer"
                                >
                                    Просмотр
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ApplicationsTable; 