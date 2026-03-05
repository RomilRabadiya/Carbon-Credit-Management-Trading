import { useState, useEffect, useCallback } from 'react';
import { auditLedgerAPI } from '../api/auditLedgerClient';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to manage Audit Ledger state and operations
 * @param {string|number} userId - The current user's ID
 */
export const useAuditLedger = (userId) => {
    const { currentUser } = useAuth();
    const orgId = currentUser?.organizationId || currentUser?.organization?.id;

    const [transactions, setTransactions] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        type: 'ALL',           // ALL, ISSUED, TRADED, RETIRED
        status: 'ALL',         // ALL, PENDING, COMPLETED, CANCELLED
        startDate: null,
        endDate: null,
        searchText: '',
        pageSize: 10,
        page: 1,
    });
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        pageSize: 10,
    });

    /**
     * Fetch transactions from the API
     */
    const fetchTransactions = useCallback(async () => {
        if (!orgId) return;

        setLoading(true);
        setError(null);
        try {
            const params = {
                type: filters.type !== 'ALL' ? filters.type : undefined,
                status: filters.status !== 'ALL' ? filters.status : undefined,
                startDate: filters.startDate ? filters.startDate.toISOString() : undefined,
                endDate: filters.endDate ? filters.endDate.toISOString() : undefined,
                search: filters.searchText,
                page: filters.page,
                pageSize: filters.pageSize,
                orgId: orgId,
            };

            const res = await auditLedgerAPI.getTransactions(params);
            setTransactions(res.data.data || []);
            setPagination(res.data.pagination || {
                total: res.data.data?.length || 0,
                page: filters.page,
                pageSize: filters.pageSize
            });
        } catch (err) {
            const message = err.response?.data?.message || 'Failed to load transactions';
            // Only show toast if it's not a loading error during initial mount
            if (orgId) {
                setError(message);
                toast.error(message);
            }
        } finally {
            setLoading(false);
        }
    }, [orgId, filters, userId]); // Keep userId for hook interface but orgId is the driver

    /**
     * Fetch summary statistics
     */
    const fetchStats = useCallback(async () => {
        if (!orgId) return;

        try {
            const res = await auditLedgerAPI.getStatistics({ orgId });
            setStats(res.data);
        } catch (err) {
            console.error('Failed to load statistics:', err);
        }
    }, [orgId]);

    /**
     * Update a single filter value
     */
    const updateFilter = useCallback((key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key === 'page' ? value : 1, // Reset to page 1 when any other filter changes
        }));
    }, []);

    /**
     * Reset all filters to default values
     */
    const resetFilters = useCallback(() => {
        setFilters({
            type: 'ALL',
            status: 'ALL',
            startDate: null,
            endDate: null,
            searchText: '',
            pageSize: 10,
            page: 1,
        });
    }, []);

    // Effect to fetch transactions when filters or userId change
    useEffect(() => {
        fetchTransactions();
    }, [orgId, filters.type, filters.status, filters.startDate, filters.endDate, filters.page, filters.pageSize, fetchTransactions]);

    // Use a separate effect for search text with a simple debounce if needed, 
    // but for now, let's keep it simple as per the plan.
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchTransactions();
        }, 500);
        return () => clearTimeout(timer);
    }, [filters.searchText, fetchTransactions]);

    // Fetch stats on mount and when userId changes
    useEffect(() => {
        fetchStats();
    }, [orgId, fetchStats]);

    return {
        transactions,
        stats,
        loading,
        error,
        filters,
        pagination,
        fetchTransactions,
        fetchStats,
        updateFilter,
        resetFilters,
    };
};

export default useAuditLedger;
