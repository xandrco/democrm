// Компонент пагинации для отображения навигации по страницам
import React from 'react';

function Pagination({ currentPage, totalPages, totalItems, perPage, setCurrentPage }) {
    // Функция для генерации номеров страниц с учетом текущей страницы
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        // Если общее количество страниц меньше или равно максимальному количеству для отображения
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            // Вычисляем начальную и конечную страницы для отображения
            let startPage = Math.max(1, currentPage - 2);
            let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);
            
            // Корректируем начальную страницу, если нужно показать больше страниц
            if (endPage - startPage < maxPagesToShow - 1) {
                startPage = Math.max(1, endPage - maxPagesToShow + 1);
            }
            
            // Добавляем первую страницу и многоточие, если нужно
            if (startPage > 1) {
                pageNumbers.push(1);
                if (startPage > 2) {
                    pageNumbers.push('...');
                }
            }
            
            // Добавляем номера страниц в диапазоне
            for (let i = startPage; i <= endPage; i++) {
                pageNumbers.push(i);
            }
            
            // Добавляем многоточие и последнюю страницу, если нужно
            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    pageNumbers.push('...');
                }
                pageNumbers.push(totalPages);
            }
        }
        
        return pageNumbers;
    };
    
    // Вычисляем начальный и конечный элементы текущей страницы
    const startItem = (currentPage - 1) * perPage + 1;
    const endItem = Math.min(startItem + perPage - 1, totalItems);
    
    return (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-slate-200 sm:px-6">
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    {/* Отображение информации о текущей странице */}
                    <p className="text-sm text-slate-700">
                        Показано <span className="font-medium">{startItem}</span> - <span className="font-medium">{endItem}</span> из{' '}
                        <span className="font-medium">{totalItems}</span> заявок
                    </p>
                </div>
                
                <div>
                    {/* Навигация по страницам */}
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        {/* Кнопка "Предыдущая страница" */}
                        <button
                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                            disabled={currentPage === 1}
                            className={`cursor-pointer relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium ${
                                currentPage === 1
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <span className="sr-only">Предыдущая</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                        
                        {/* Номера страниц */}
                        {getPageNumbers().map((pageNumber, index) => (
                            <React.Fragment key={index}>
                                {pageNumber === '...' ? (
                                    <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700">
                                        ...
                                    </span>
                                ) : (
                                    <button
                                        onClick={() => setCurrentPage(pageNumber)}
                                        className={`cursor-pointer relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                                            currentPage === pageNumber
                                                ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                                                : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                )}
                            </React.Fragment>
                        ))}
                        
                        {/* Кнопка "Следующая страница" */}
                        <button
                            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                            disabled={currentPage === totalPages}
                            className={`cursor-pointer relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium ${
                                currentPage === totalPages
                                    ? 'text-slate-300 cursor-not-allowed'
                                    : 'text-slate-500 hover:bg-slate-50'
                            }`}
                        >
                            <span className="sr-only">Следующая</span>
                            <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}

export default Pagination; 