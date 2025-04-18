import React from 'react';

function ApplicationsFilter({ 
    searchTerm, 
    setSearchTerm, 
    statusFilter, 
    setStatusFilter, 
    handleSearchSubmit,
    refreshData
}) {
    const statuses = [
        { value: '', label: 'Все статусы' },
        { value: 'pending', label: 'Новая' },
        { value: 'approved', label: 'Решена' },
        { value: 'rejected', label: 'Отклонена' }
    ];
    
    const handleStatusChange = (e) => {
        setStatusFilter(e.target.value);
    };
    
    return (
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex flex-col md:flex-row md:items-end space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1">
                    <form onSubmit={handleSearchSubmit} className="flex">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                placeholder="Поиск по имени или email..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Поиск
                        </button>
                    </form>
                </div>
                
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