import React from 'react';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
    const { user, logout } = useAuth();

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

            <main className="py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="bg-white p-8 rounded-lg shadow-lg">
                        <h2 className="text-2xl font-bold text-gray-800 mb-6">Панель управления</h2>
                        <p className="text-gray-600">
                            Приложение для управления заявками поступающими с сайта
                        </p>
                        
                        {/* Your dashboard content will go here */}
                        <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                            <p className="text-blue-800">Добро пожаловать в панель управления! Это авторизованная страница.</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Dashboard; 