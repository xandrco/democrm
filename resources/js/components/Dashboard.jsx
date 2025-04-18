import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ApplicationsTable from './applications/ApplicationsTable';
import ApplicationsFilter from './applications/ApplicationsFilter';
import Pagination from './common/Pagination';

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
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Панель управления</h2>
                        
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
        </div>
    );
}

export default Dashboard; 