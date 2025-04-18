import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationsTable from './applications/ApplicationsTable';
import ApplicationsFilter from './applications/ApplicationsFilter';
import Pagination from './common/Pagination';
import ApplicationAddModal from './applications/ApplicationAddModal';
import ApplicationDetailModal from './applications/ApplicationDetailModal';

function Dashboard() {
    const { user, logout } = useAuth();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    
    const [sortField, setSortField] = useState('created_at');
    const [sortDirection, setSortDirection] = useState('desc');
    
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const perPage = 25;
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);

    const [exportLoading, setExportLoading] = useState(false);

    useEffect(() => {
        fetchApplications();
    }, [currentPage, sortField, sortDirection, statusFilter, searchTerm]);

    const handleSearchSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }
        setCurrentPage(1);
        fetchApplications();
    };

    const handleSort = (field) => {
        setCurrentPage(1);
        
        if (field === sortField) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const fetchApplications = async () => {
        setLoading(true);
        setError('');
        
        try {
            const params = {
                page: currentPage,
                per_page: perPage,
                sort_by: sortField,
                sort_direction: sortDirection,
            };
            
            if (statusFilter) {
                params.status = statusFilter;
            }
            
            params.search = searchTerm;
            
            Object.keys(params).forEach(key => {
                if (params[key] === undefined || params[key] === null) {
                    delete params[key];
                }
            });
            
            const response = await axios.get('/api/applications', { params });
            
            if (response.data && response.data.success) {
                const apiData = response.data.data;
                
                if (apiData.data && Array.isArray(apiData.data)) {
                    setApplications(apiData.data);
                    setTotalPages(apiData.last_page || 1);
                    setTotalItems(apiData.total || apiData.data.length);
                } else if (Array.isArray(apiData)) {
                    setApplications(apiData);
                    setTotalPages(1);
                    setTotalItems(apiData.length);
                } else {
                    console.warn('Unexpected API data format:', apiData);
                    setApplications([]);
                    setTotalPages(1);
                    setTotalItems(0);
                }
            } else {
                console.warn('API response missing success flag or data:', response.data);
                setApplications([]);
                setTotalPages(1);
                setTotalItems(0);
            }
        } catch (err) {
            console.error('Error fetching applications:', err);
            setError('Не удалось загрузить заявки. Пожалуйста, попробуйте позже.');
            setApplications([]);
            setTotalPages(1);
            setTotalItems(0);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        logout();
    };

    const handleApplicationStatusChange = (applicationId, newStatus) => {
        if (newStatus === null) {
            const updatedApplications = applications.filter(app => app.id !== applicationId);
            setApplications(updatedApplications);
            return;
        }
        
        const updatedApplications = applications.map(app => {
            if (app.id === applicationId) {
                return {
                    ...app,
                    status: newStatus,
                    reviewed_at: app.status === 'pending' && newStatus !== 'pending' 
                        ? new Date().toISOString() 
                        : app.reviewed_at
                };
            }
            return app;
        });
        
        setApplications(updatedApplications);
    };

    const handleAddApplicationSuccess = (newApplication) => {
        fetchApplications();
    };
    
    const handleViewApplication = (applicationId) => {
        setSelectedApplicationId(applicationId);
        setIsDetailModalOpen(true);
    };

    const handleExportToCsv = async () => {
        setExportLoading(true);
        
        try {
            const token = localStorage.getItem('auth_token');
            if (token) {
                axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            }
            
            const params = {
                format: 'csv',
                sort_by: sortField,
                sort_direction: sortDirection,
            };
            
            if (statusFilter) {
                params.status = statusFilter;
            }
            
            if (searchTerm) {
                params.search = searchTerm;
            }
            
            const response = await axios.get('/api/applications/export', {
                params,
                responseType: 'blob'
            });
            
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            
            const date = new Date().toISOString().split('T')[0];
            a.download = `applications-${date}.csv`;
            
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err) {
            console.error('Error exporting applications to CSV:', err);
            setError('Не удалось экспортировать данные. Пожалуйста, попробуйте позже.');
        } finally {
            setExportLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            <nav className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center">
                            <h1 className="text-xl font-semibold">Mini CRM</h1>
                        </div>
                        <div className="flex items-center">
                            <span className="text-gray-700 mr-4">
                                {user?.name || user?.email}
                            </span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Выйти
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <main className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-gray-800">Панель управления</h2>
                            <div className="flex space-x-3">
                                <button
                                    onClick={handleExportToCsv}
                                    disabled={exportLoading || loading || applications.length === 0}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md text-sm flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {exportLoading ? (
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    ) : (
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
                                        </svg>
                                    )}
                                    Экспорт CSV
                                </button>
                                
                                <button
                                    onClick={() => setIsAddModalOpen(true)}
                                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm flex items-center"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                                    </svg>
                                    Добавить заявку
                                </button>
                            </div>
                        </div>
                        
                        <ApplicationsFilter
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            statusFilter={statusFilter}
                            setStatusFilter={setStatusFilter}
                            handleSearchSubmit={handleSearchSubmit}
                            refreshData={fetchApplications}
                        />
                        
                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-4">
                                {error}
                            </div>
                        )}
                        
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                <ApplicationsTable
                                    applications={applications}
                                    sortField={sortField}
                                    sortDirection={sortDirection}
                                    handleSort={handleSort}
                                    onStatusChange={handleApplicationStatusChange}
                                    onViewApplication={handleViewApplication}
                                />
                                
                                {applications.length === 0 && !loading && (
                                    <div className="bg-gray-50 p-4 rounded-md text-center text-gray-500 mt-4">
                                        Заявки не найдены. Измените параметры поиска или фильтрации.
                                    </div>
                                )}
                                
                                {totalPages > 1 && (
                                    <div className="mt-6">
                                        <Pagination
                                            currentPage={currentPage}
                                            totalPages={totalPages}
                                            totalItems={totalItems}
                                            perPage={perPage}
                                            setCurrentPage={setCurrentPage}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </main>
            
            <ApplicationAddModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={handleAddApplicationSuccess}
            />
            
            <ApplicationDetailModal
                isOpen={isDetailModalOpen}
                onClose={() => setIsDetailModalOpen(false)}
                applicationId={selectedApplicationId}
                onStatusChange={handleApplicationStatusChange}
            />
        </div>
    );
}

export default Dashboard; 