import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAuditLedger } from '../hooks/useAuditLedger';
import LedgerStats from '../components/audit-ledger/LedgerStats';
import FilterPanel from '../components/audit-ledger/FilterPanel';
import TransactionTable from '../components/audit-ledger/TransactionTable';
import TransactionModal from '../components/audit-ledger/TransactionModal';
import ExportButton from '../components/audit-ledger/ExportButton';
import Pagination from '../components/audit-ledger/Pagination';
import { RefreshCcw } from 'lucide-react';

/**
 * Audit Ledger Page component
 * Displays transaction history with stats, filters, and export options.
 */
const AuditLedgerPage = () => {
    const { currentUser } = useAuth();
    const [selectedTransaction, setSelectedTransaction] = useState(null);
    const [modalOpen, setModalOpen] = useState(false);

    // Custom hook for data fetching and state management
    const {
        transactions,
        stats,
        loading,
        error,
        filters,
        pagination,
        fetchTransactions,
        updateFilter,
        resetFilters,
    } = useAuditLedger(currentUser?.id);

    // Event handlers
    const handleViewDetail = (transaction) => {
        setSelectedTransaction(transaction);
        setModalOpen(true);
    };

    const handlePageChange = (newPage) => {
        updateFilter('page', newPage);
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 bg-white min-h-screen">
            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div className="animate-in slide-in-from-left duration-500">
                    <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Audit Ledger</h1>
                    <p className="mt-2 text-lg text-gray-500 font-medium">
                        Complete transparent records of every transaction in the ecosystem.
                    </p>
                </div>

                <div className="flex items-center gap-3 animate-in slide-in-from-right duration-500">
                    <button
                        onClick={() => fetchTransactions()}
                        disabled={loading}
                        className="p-2.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-xl border border-gray-200 transition-all active:rotate-180"
                        title="Refresh Data"
                    >
                        <RefreshCcw size={20} className={loading ? 'animate-spin' : ''} />
                    </button>
                    <ExportButton data={transactions} loading={loading} />
                </div>
            </div>

            {/* Stats section */}
            <LedgerStats stats={stats} loading={loading} />

            {/* Error display */}
            {error && (
                <div className="mb-8 p-6 bg-red-50 border-2 border-red-100 rounded-2xl flex items-center gap-4 animate-in shake duration-500">
                    <div className="p-3 bg-red-100 rounded-xl text-red-600 font-bold">!</div>
                    <div>
                        <p className="text-sm font-bold text-red-900">Communication Error</p>
                        <p className="text-xs text-red-700 font-medium">{error}</p>
                    </div>
                    <button
                        onClick={() => fetchTransactions()}
                        className="ml-auto px-4 py-1.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-700 transition-all"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Filter section */}
            <FilterPanel
                filters={filters}
                onFilterChange={updateFilter}
                onReset={resetFilters}
            />

            {/* Data section */}
            <div className="mt-10 animate-in fade-in duration-700">
                <TransactionTable
                    transactions={transactions}
                    loading={loading}
                    onViewDetail={handleViewDetail}
                />

                {/* Pagination section */}
                {!loading && transactions.length > 0 && (
                    <Pagination
                        total={pagination.total}
                        page={pagination.page}
                        pageSize={pagination.pageSize}
                        onPageChange={handlePageChange}
                    />
                )}
            </div>

            {/* Detailed view modal */}
            <TransactionModal
                transaction={selectedTransaction}
                isOpen={modalOpen}
                onClose={() => {
                    setModalOpen(false);
                    // Clear selected transaction after modal animation finishes
                    setTimeout(() => setSelectedTransaction(null), 300);
                }}
            />

            {/* SEO helper */}
            <footer className="mt-12 pt-8 border-t border-gray-100 text-center text-gray-400 text-[10px] uppercase font-bold tracking-widest">
                Carbon Credits Management System • Secure Blockchain Records • Compliance Verified
            </footer>
        </div>
    );
};

export default AuditLedgerPage;
