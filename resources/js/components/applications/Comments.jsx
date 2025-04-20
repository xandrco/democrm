import React, { useState, useEffect, useCallback, memo } from 'react';
import axios from 'axios';
import { formatDate } from '../../utils/helpers';
import { useAuth } from '../../context/AuthContext';

// Компонент для отображения и управления комментариями
const Comments = memo(({ applicationId }) => {
    const { isAuthenticated, user } = useAuth();
    // Состояние для хранения комментариев и их загрузки
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [commentsError, setCommentsError] = useState('');
    const [commentsSortOrder, setCommentsSortOrder] = useState('newest');
    const [newComment, setNewComment] = useState('');
    const [submittingComment, setSubmittingComment] = useState(false);
    const [commentError, setCommentError] = useState('');
    const [authErrorVisible, setAuthErrorVisible] = useState(false);
    const [deletingCommentId, setDeletingCommentId] = useState(null);

    // Настройка заголовков авторизации для запросов
    const setupAuthHeaders = () => {
        const token = localStorage.getItem('auth_token');
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            return true;
        }
        return false;
    };

    // Загрузка комментариев с сервера
    const fetchComments = useCallback(() => {
        if (!applicationId) return;
        
        setCommentsLoading(true);
        setCommentsError('');
        
        setupAuthHeaders();
        
        const sort = commentsSortOrder === 'newest' ? 'newest' : 'oldest';
        axios.get(`/api/applications/${applicationId}/comments`, {
            params: { sort, per_page: 50 }
        })
        .then(response => {
            if (response.data && response.data.success) {
                setComments(response.data.data.data || []);
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

    // Обработчик отправки нового комментария
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

    // Обработчик повторной авторизации
    const handleRelogin = () => {
        window.location.href = '/login';
    };

    // Обработчик изменения порядка сортировки комментариев
    const handleSortChange = (e) => {
        setCommentsSortOrder(e.target.value);
    };

    useEffect(() => {
        fetchComments();
    }, [fetchComments]);

    // Обработчик удаления комментария
    const handleDeleteComment = async (commentId) => {
        if (!window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
            return;
        }

        if (!isAuthenticated || !user) {
            setAuthErrorVisible(true);
            return;
        }

        if (deletingCommentId) return;
        
        setDeletingCommentId(commentId);
        
        try {
            const hasToken = setupAuthHeaders();
            if (!hasToken) {
                setAuthErrorVisible(true);
                setDeletingCommentId(null);
                return;
            }
            
            const response = await axios.delete(`/api/comments/${commentId}`);
            
            if (response.data && response.data.success) {
                setComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
                setAuthErrorVisible(false);
            } else {
                console.error('Failed to delete comment:', response.data);
            }
        } catch (err) {
            console.error('Error deleting comment:', err);
            
            if (err.response && err.response.status === 403) {
                setCommentError('У вас нет прав для удаления этого комментария');
            } else if (err.response && err.response.status === 401) {
                setAuthErrorVisible(true);
            }
        } finally {
            setDeletingCommentId(null);
        }
    };

    return (
        <div className="mt-8 border-t border-slate-200 pt-4">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-medium text-slate-700">
                    Комментарии {comments.length > 0 && `(${comments.length})`}
                </h4>
                <div className="flex items-center">
                    <select 
                        className="text-sm border border-slate-300 rounded-md px-2 py-1.5" 
                        value={commentsSortOrder}
                        onChange={handleSortChange}
                    >
                        <option value="newest">Сначала новые</option>
                        <option value="oldest">Сначала старые</option>
                    </select>
                </div>
            </div>
            
            {/* Отображение ошибки авторизации */}
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
                                    className="cursor-pointer inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                    Войти заново
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Форма добавления нового комментария */}
            <form onSubmit={handleCommentSubmit} className="mb-6">
                {!isAuthenticated ? (
                    <div className="bg-yellow-50 p-4 rounded-md text-yellow-700 mb-3">
                        Вы должны войти в систему, чтобы оставлять комментарии.
                    </div>
                ) : (
                    <>
                        <div className="mb-3">
                            <textarea
                                className={`w-full px-3 py-2 text-sm text-slate-700 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 ${commentError ? 'border-red-500' : 'border-slate-300'}`}
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
                                className="cursor-pointer px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200"
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
            
            {/* Отображение списка комментариев */}
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
                        <div key={comment.id} className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    <div className="bg-blue-100 text-blue-700 rounded-full h-8 w-8 flex items-center justify-center mr-2">
                                        {comment.user.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm text-slate-800">{comment.user.name}</p>
                                        <p className="text-xs text-slate-500">{formatDate(comment.created_at)}</p>
                                    </div>
                                </div>
                                
                                {/* Кнопка удаления комментария (только для владельца) */}
                                {isAuthenticated && user && user.id === comment.user_id && (
                                    <button 
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="cursor-pointer text-red-700 hover:text-red-800 transition-colors duration-200"
                                        disabled={deletingCommentId === comment.id}
                                        title="Удалить комментарий"
                                    >
                                        {deletingCommentId === comment.id ? (
                                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        ) : (
                                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        )}
                                    </button>
                                )}
                            </div>
                            <p className="text-slate-700 whitespace-pre-line">{comment.comment}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-slate-500 text-center py-8 text-[13px]">
                    Нет комментариев. Будьте первым, кто оставит комментарий!
                </div>
            )}
        </div>
    );
});

export default Comments; 