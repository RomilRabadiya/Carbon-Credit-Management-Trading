import apiClient from './client';

export const auditLedgerAPI = {
    /**
     * Fetch transactions with filters
     * @param {Object} params - Query parameters for filtering and pagination
     */
    getTransactions: (params) =>
        apiClient.get('/audit/transactions/me', { params }),

    /**
     * Fetch single transaction details
     * @param {string|number} transactionId - The ID of the transaction
     */
    getTransactionDetail: (transactionId) =>
        apiClient.get(`/audit/transactions/${transactionId}`),

    /**
     * Fetch transaction statistics for the current user
     */
    getStatistics: (params) =>
        apiClient.get('/audit/transactions/stats', { params }),

    /**
     * Export transactions in the specified format
     * @param {string} format - The export format ('csv' or 'json')
     * @param {Object} params - Current filter parameters
     */
    exportTransactions: (format, params = {}) =>
        apiClient.get('/audit/transactions/export', {
            params: { ...params, format },
            responseType: format === 'pdf' ? 'blob' : 'text/csv'
        }),
};

export default auditLedgerAPI;
