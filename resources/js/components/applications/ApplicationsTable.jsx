// Компонент таблицы для отображения списка заявок
import React from 'react';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';

function ApplicationsTable({ applications, sortField, sortDirection, handleSort, onStatusChange, onViewApplication }) {
    // Функция для отображения индикатора сортировки
    const renderSortIndicator = (field) => {
        if (sortField === field) {
            return (
                <span className="ml-1 text-gray-500">
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
                return 'bg-gray-100 text-gray-800';
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
        <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {/* Заголовок столбца имени */}
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            Имя {renderSortIndicator('name')}
                        </th>
                        {/* Заголовок столбца email */}
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('email')}
                        >
                            Email {renderSortIndicator('email')}
                        </th>
                        {/* Заголовок столбца статуса */}
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('status')}
                        >
                            Статус {renderSortIndicator('status')}
                        </th>
                        {/* Заголовок столбца даты создания */}
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('created_at')}
                        >
                            Дата создания {renderSortIndicator('created_at')}
                        </th>
                        {/* Заголовок столбца даты просмотра */}
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('reviewed_at')}
                        >
                            Дата просмотра {renderSortIndicator('reviewed_at')}
                        </th>
                        {/* Заголовок столбца действий */}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {/* Отображение списка заявок */}
                    {applications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                            {/* Ячейка с именем */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {application.name}
                            </td>
                            {/* Ячейка с email */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.email}
                            </td>
                            {/* Ячейка со статусом */}
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-40">
                                    <StatusDropdown
                                        applicationId={application.id}
                                        currentStatus={application.status}
                                        onStatusChange={(newStatus) => handleApplicationStatusChange(application.id, newStatus)}
                                    />
                                </div>
                            </td>
                            {/* Ячейка с датой создания */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(application.created_at)}
                            </td>
                            {/* Ячейка с датой просмотра */}
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.reviewed_at ? formatDate(application.reviewed_at) : '—'}
                            </td>
                            {/* Ячейка с кнопкой просмотра */}
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <button 
                                    onClick={(e) => handleViewClick(e, application.id)}
                                    className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
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