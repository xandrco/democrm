/**
 * Форматирование даты в строку вида YYYY-MM-DD HH:MM
 * 
 * @param {string} dateString - строка с датой в формате ISO
 * @returns {string} - отформатированная дата
 */
export const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    
    if (isNaN(date.getTime())) {
        return '';
    }
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
};