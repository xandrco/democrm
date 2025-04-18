import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function StatusDropdown({ applicationId, currentStatus, onStatusChange }) {
    const [status, setStatus] = useState(currentStatus || 'pending');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isLocalUpdate = useRef(false);
    
    useEffect(() => {
        if (currentStatus && currentStatus !== status && !isLocalUpdate.current) {
            setStatus(currentStatus);
        }
        isLocalUpdate.current = false;
    }, [currentStatus, status]);
    
    const statuses = [
        { value: 'pending', label: 'Новая' },
        { value: 'in_progress', label: 'В обработке' },
        { value: 'approved', label: 'Решена' },
        { value: 'rejected', label: 'Отклонена' }
    ];
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'approved':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'rejected':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };
    
    const handleStatusChange = async (e) => {
        const newStatus = e.target.value;
        
        isLocalUpdate.current = true;
        
        setStatus(newStatus);
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.put(`/api/applications/${applicationId}`, {
                status: newStatus
            });
            
            if (response.data && response.data.success) {
                if (onStatusChange) {
                    onStatusChange(newStatus);
                }
            } else {
                setError('Ошибка при обновлении статуса');
                setStatus(currentStatus);
            }
        } catch (err) {
            console.error('Error updating status:', err);
            setError('Не удалось обновить статус');
            setStatus(currentStatus);
            isLocalUpdate.current = false;
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="relative">
            <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-1">
                Статус заявки
            </label>
            <div className="mt-1 relative">
                <select
                    id="status-select"
                    className={`block w-full pl-3 pr-10 py-2 text-base border rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${getStatusClass(status)}`}
                    value={status}
                    onChange={handleStatusChange}
                    disabled={loading}
                >
                    {statuses.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                {loading && (
                    <div className="absolute right-2 top-2">
                        <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
            </div>
            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}

export default StatusDropdown; 