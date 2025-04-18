import React from 'react';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';

function ApplicationsTable({ applications, sortField, sortDirection, handleSort, onStatusChange }) {
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
    
    const handleApplicationStatusChange = (applicationId, newStatus) => {
        if (onStatusChange) {
            onStatusChange(applicationId, newStatus);
        }
    };
    
    return (
        <div className="overflow-x-auto mt-6">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('name')}
                        >
                            Имя {renderSortIndicator('name')}
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('email')}
                        >
                            Email {renderSortIndicator('email')}
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('status')}
                        >
                            Статус {renderSortIndicator('status')}
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('created_at')}
                        >
                            Дата создания {renderSortIndicator('created_at')}
                        </th>
                        <th 
                            scope="col" 
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                            onClick={() => handleSort('reviewed_at')}
                        >
                            Дата просмотра {renderSortIndicator('reviewed_at')}
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Действия
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {applications.map((application) => (
                        <tr key={application.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {application.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-40">
                                    <StatusDropdown
                                        applicationId={application.id}
                                        currentStatus={application.status}
                                        onStatusChange={(newStatus) => handleApplicationStatusChange(application.id, newStatus)}
                                    />
                                </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(application.created_at)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {application.reviewed_at ? formatDate(application.reviewed_at) : '—'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <a href={`/applications/${application.id}`} className="text-indigo-600 hover:text-indigo-900 mr-3">
                                    Просмотр
                                </a>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default ApplicationsTable; 