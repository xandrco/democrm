import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { formatDate } from '../../utils/helpers';
import StatusDropdown from './StatusDropdown';
import { useAuth } from '../../context/AuthContext';

// Create a completely separate Comments component using React.memo to prevent re-renders
const Comments = memo(({ applicationId }) => {
    const { isAuthenticated, user } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState('');
    const [commentsSortOrder, setCommentsSortOrder] = useState('newest');
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [authErrorVisible, setAuthErrorVisible] = useState(false);

    // Setup auth headers for API requests
    const setupAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    };

    // Function to fetch comments
    const fetchComments = useCallback(() => {
        if (!applicationId) return;
        
        setCommentsLoading(true);
        setCommentsError('');
        
        // Ensure auth headers are set
        setupAuthHeaders();
        
        const sort = commentsSortOrder === 'newest' ? 'newest' : 'oldest';
        axios.get(`/api/applications/${applicationId}/comments`, {
            params: { sort, per_page: 50 }
        })
        .then(response => {
            if (response.data && response.data.success) {
                setComments(response.data.data.data || []);
                // Hide auth error if request was successful
                setAuthErrorVisible(false);
            } else {
                setCommentsError('Не удалось загрузить комментарии');
            }
        })
        .catch(err => {
            console.error('Error fetching comments:', err);
            
            if (err.response && err.response.status === 401) {
                setCommentsError('Необходима авторизация для просмотра комментариев');
                setAuthErrorVisible(true);
            } else {
                setCommentsError('Произошла ошибка при загрузке комментариев');
            }
        })
        .finally(() => {
            setCommentsLoading(false);
        });
    }, [applicationId, commentsSortOrder]);

    // Handle comment submission
    const handleCommentSubmit = async (e) => {
        e.preventDefault();
        
        if (!newComment.trim() || !applicationId) return;
        
        if (!isAuthenticated) {
            setCommentError('Вы должны войти в систему, чтобы оставить комментарий');
            setAuthErrorVisible(true);
            return;
        }
        
        setSubmittingComment(true);
        setCommentError('');
        
        try {
            // Ensure auth headers are set before submitting
            const hasToken = setupAuthHeaders();
            if (!hasToken) {
                setCommentError('Ошибка авторизации. Пожалуйста, войдите заново.');
                setAuthErrorVisible(true);
                setSubmittingComment(false);
                return;
            }
            
            const response = await axios.post(`/api/applications/${applicationId}/comments`, {
                comment: newComment
            });
            
            if (response.data && response.data.success) {
                setNewComment('');
                setAuthErrorVisible(false);
                
                // Add new comment to the list based on current sort order
                if (commentsSortOrder === 'newest') {
                    setComments(prevComments => [response.data.data, ...prevComments]);
                } else {
                    setComments(prevComments => [...prevComments, response.data.data]);
                }
            } else {
                setCommentError('Не удалось отправить комментарий');
            }
        } catch (err) {
            console.error('Error submitting comment:', err);
            
            if (err.response && err.response.status === 401) {
                setCommentError('Вы не авторизованы. Пожалуйста, войдите в систему снова.');
                setAuthErrorVisible(true);
            } else if (err.response && err.response.data && err.response.data.errors) {
                const errorMessages = Object.values(err.response.data.errors)
                    .flat()
                    .join(', ');
                setCommentError(errorMessages);
            } else if (err.response && err.response.data && err.response.data.message) {
                setCommentError(err.response.data.message);
            } else {
                setCommentError('Произошла ошибка при отправке комментария');
            }
        } finally {
            setSubmittingComment(false);
        }
    };

    // Handle re-login when auth issues occur
    const handleRelogin = () => {
        window.location.href = '/login';
    };

    // Handle sort change WITHOUT using state that would trigger a re-render in parent
    const handleSortChange = (e) => {
        setCommentsSortOrder(e.target.value);
    };

    // Fetch comments on mount and when sort changes - internal to this component only
    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    return (
        <div className="mt-8 border-t pt-6">
            <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-medium text-gray-700">Комментарии</h4>
                <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Сортировка:</span>
                    <select 
                        className="text-sm border border-gray-300 rounded-md px-2 py-1" 
                        value={commentsSortOrder}
                        onChange={handleSortChange}
                    >
                        <option value="newest">Сначала новые</option>
                        <option value="oldest">Сначала старые</option>
                    </select>
                </div>
            </div>
            
            {/* Auth error message for quick relogin */}
            {authErrorVisible && (
                <div className="mb-6 bg-red-50 p-4 rounded-md">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">Проблема с авторизацией</h3>
                            <div className="mt-2 text-sm text-red-700">
                                <p>Ваша сессия могла истечь. Пожалуйста, войдите в систему снова.</p>
                            </div>
                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={handleRelogin}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Войти заново
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Add comment form */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
                {!isAuthenticated ? (
                    <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-3">
                        Вы должны войти в систему, чтобы оставлять комментарии.
                    </div>
                ) : (
                    <>
                        <div className="mb-3">
                            <textarea
                                className={`w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${commentError ? 'border-red-500' : 'border-gray-300'}`}
                                rows="3"
                                placeholder="Добавить комментарий..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                disabled={submittingComment}
                            ></textarea>
                            {commentError && (
                                <p className="mt-1 text-sm text-red-600">{commentError}</p>
                            )}
                        </div>
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
                                disabled={!newComment.trim() || submittingComment}
                            >
                                {submittingComment ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Отправка...
                                    </span>
                                ) : 'Отправить'}
                            </button>
                        </div>
                    </>
                )}
            </form>
            
            {/* Comments list */}
            {commentsLoading ? (
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                </div>
            ) : commentsError ? (
                <div className="bg-red-50 p-4 rounded-md text-red-700 text-center">
                    {commentsError}
                </div>
            ) : comments.length > 0 ? (
                <div className="space-y-4">
                    {comments.map(comment => (
                        <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-start">
                                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                                        {comment.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-gray-800">{comment.user.name}</p>
                                        <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-700 whitespace-pre-line">{comment.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-gray-500 text-center py-8">
                    Нет комментариев. Будьте первым, кто оставит комментарий!
                </div>
            )}
        </div>
    );
});

// Main application modal component
function ApplicationDetailModal({ isOpen, onClose, applicationId, onStatusChange }) {
    const { isAuthenticated, user } = useAuth();
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [shouldRefetch, setShouldRefetch] = useState(true);
    
    const fetchApplicationDetail = useCallback(async () => {
        if (!applicationId || !isOpen) return;
        
        setLoading(true);
        setError('');
        
        try {
            const response = await axios.get(`/api/applications/${applicationId}`);
            
            if (response.data && response.data.success) {
                setApplication(response.data.data);
            } else {
                setError('Не удалось загрузить данные заявки');
            }
        } catch (err) {
            console.error('Error fetching application:', err);
            setError('Произошла ошибка при загрузке данных');
        } finally {
            setLoading(false);
            setShouldRefetch(false);
        }
    }, [applicationId, isOpen]);
    
    useEffect(() => {
        if (shouldRefetch) {
            fetchApplicationDetail();
        }
    }, [fetchApplicationDetail, shouldRefetch]);
    
    useEffect(() => {
        if (isOpen && applicationId) {
            setShouldRefetch(true);
        }
    }, [isOpen, applicationId]);
    
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            
            const handleEscKey = (e) => {
                if (e.key === 'Escape') {
                    onClose();
                }
            };
            
            document.addEventListener('keydown', handleEscKey);
            
            return () => {
                document.body.style.overflow = 'auto';
                document.removeEventListener('keydown', handleEscKey);
            };
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isOpen, onClose]);
    
    const handleStatusChange = (newStatus) => {
        setApplication(prev => {
            if (!prev) return prev;
            
            return {
                ...prev,
                status: newStatus,
                reviewed_at: prev.status === 'pending' && newStatus !== 'pending' 
                    ? new Date().toISOString() 
                    : prev.reviewed_at
            };
        });
        
        if (onStatusChange && applicationId) {
            onStatusChange(applicationId, newStatus);
        }
    };
    
    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity z-40" aria-hidden="true">
                    <div className="absolute inset-0 bg-black opacity-60" onClick={onClose}></div>
                </div>

                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
                
                <div 
                    className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full relative z-50"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-[80vh] overflow-y-auto">
                        <div className="sm:flex sm:items-start">
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                                        Детали заявки
                                    </h3>
                                    <button 
                                        onClick={onClose}
                                        className="text-gray-500 hover:text-gray-700"
                                    >
                                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                                
                                <div className="min-h-[500px] transition-all duration-200">
                                    {loading ? (
                                        <div className="flex justify-center items-center h-64">
                                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                                        </div>
                                    ) : error ? (
                                        <div className="bg-red-50 p-4 rounded-md text-red-700">
                                            {error}
                                        </div>
                                    ) : application ? (
                                        <div>
                                            <div className="mb-6">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-gray-500">Имя</h4>
                                                        <p className="mt-1 text-gray-900 text-lg font-medium">{application.name}</p>
                                                    </div>
                                                    
                                                    <div className="mb-4">
                                                        <h4 className="text-sm font-medium text-gray-500">Email</h4>
                                                        <p className="mt-1 text-gray-900">{application.email}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="mb-6">
                                                    <StatusDropdown 
                                                        applicationId={application.id}
                                                        currentStatus={application.status}
                                                        onStatusChange={handleStatusChange}
                                                    />
                                                </div>
                                                
                                                <div className="mb-6">
                                                    <h4 className="text-sm font-medium text-gray-500">Сообщение</h4>
                                                    <div className="mt-1 p-4 bg-gray-50 rounded-md min-h-[60px]">
                                                        <p className="text-gray-800 whitespace-pre-line">{application.message}</p>
                                                    </div>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Дата создания</h4>
                                                        <p className="mt-1 text-gray-900">{formatDate(application.created_at)}</p>
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-medium text-gray-500">Дата обработки</h4>
                                                        <p className="mt-1 text-gray-900">{application.reviewed_at ? formatDate(application.reviewed_at) : '—'}</p>
                                                    </div>
                                                </div>
                                                
                                                {application.reviewer && (
                                                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Информация о рецензенте</h4>
                                                        <p className="text-gray-900">{application.reviewer.name}</p>
                                                        <p className="text-gray-600">{application.reviewer.email}</p>
                                                    </div>
                                                )}
                                                
                                                {application.metadata && (
                                                    <div className="mt-6">
                                                        <h4 className="text-sm font-medium text-gray-500 mb-2">Метаданные</h4>
                                                        <div className="bg-gray-50 p-4 rounded-md">
                                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                                {application.metadata.ip_address && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">IP адрес:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.ip_address}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.user_agent && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">User Agent:</span>
                                                                        <p className="text-sm text-gray-900 break-all">{application.metadata.user_agent}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.referer && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">Источник:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.referer}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.browser && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">Браузер:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.browser}</p>
                                                                    </div>
                                                                )}
                                                                {application.metadata.referrer && (
                                                                    <div>
                                                                        <span className="text-xs text-gray-500">Реферер:</span>
                                                                        <p className="text-sm text-gray-900">{application.metadata.referrer}</p>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                                
                                                {/* Properly memoized Comments component */}
                                                {application && <Comments applicationId={application.id} />}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="bg-yellow-50 p-4 rounded-md text-yellow-700">
                                            Заявка не найдена
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                        <button
                            type="button"
                            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                            onClick={onClose}
                        >
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ApplicationDetailModal; 