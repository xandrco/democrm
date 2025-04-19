// Компонент фильтрации и поиска заявок
import React from 'react';

function ApplicationsFilter({ 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter, 
    handleSearchSubmit,
    refreshData
}) {
    // Список доступных статусов заявок
    const statuses = [
        { value: '', label: 'Все статусы' },
        { value: 'pending', label: 'Новая' },
        { value: 'in_progress', label: 'В обработке' },
        { value: 'approved', label: 'Решена' },
        { value: 'rejected', label: 'Отклонена' }
    ];
    
    // Обработчик изменения статуса фильтра
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };
    
    // Обработчик изменения поискового запроса с задержкой 0.5 секунды
    const handleSearchChange = (e) => {
        const newValue = e.target.value;
        setSearchTerm(newValue);
        
        if (handleSearchSubmit) {
            clearTimeout(window.searchTimeout);
            
            if (newValue === '') {
                handleSearchSubmit({ preventDefault: () => {} });
            } else {
                window.searchTimeout = setTimeout(() => {
                    handleSearchSubmit({ preventDefault: () => {} });
                }, 500);
            }
        }
    };
    
    return (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                {/* Поле поиска */}
                <div className="flex-1">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            placeholder="Поиск по имени или email..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                </div>
                
                {/* Фильтр по статусу */}
                <div className="w-full md:w-48">
                    <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                        Статус
                    </label>
                    <select
                        id="status-filter"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={statusFilter}
                        onChange={handleStatusChange}
                    >
                        {statuses.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                </div>
                
                {/* Кнопка обновления данных */}
                <div>
                    <button
                        type="button"
                        onClick={() => refreshData()}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                        </svg>
                        Обновить
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApplicationsFilter; 