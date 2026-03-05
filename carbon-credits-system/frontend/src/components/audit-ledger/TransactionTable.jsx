import React from 'react';
import { ChevronRight, FileText, ExternalLink } from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/formatters';

const typeStyles = {
    ISSUED: 'bg-blue-100 text-blue-800 border-blue-200',
    TRADED: 'bg-purple-100 text-purple-800 border-purple-200',
    RETIRED: 'bg-red-100 text-red-800 border-red-200',
    EMISSION_REPORTED: 'bg-orange-100 text-orange-800 border-orange-200',
    VERIFICATION_COMPLETED: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    CREDIT_ISSUED: 'bg-green-100 text-green-800 border-green-200',
    TRADE: 'bg-purple-100 text-purple-800 border-purple-200',
};

const statusStyles = {
    PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    CANCELLED: 'bg-gray-100 text-gray-800 border-gray-200',
};

/**
 * Data table for displaying audit ledger transactions
 */
export const TransactionTable = ({ transactions, loading, onViewDetail }) => {
    if (loading) {
        return (
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-6 border-b border-gray-100 bg-gray-50/50">
                    <div className="h-6 w-48 bg-gray-200 animate-pulse rounded"></div>
                </div>
                <div className="divide-y divide-gray-100">
                    {[1, 2, 3, 4, 5].map(i => (
                        <div key={i} className="p-6 bg-white animate-pulse flex justify-between">
                            <div className="space-y-2">
                                <div className="h-4 w-32 bg-gray-100 rounded"></div>
                                <div className="h-3 w-48 bg-gray-50 rounded"></div>
                            </div>
                            <div className="h-10 w-10 bg-gray-100 rounded-lg"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!transactions || transactions.length === 0) {
        return (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                <div className="bg-white p-4 rounded-full shadow-sm w-fit mx-auto mb-4 border border-gray-100">
                    <FileText className="w-10 h-10 text-gray-300" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No transactions found</h3>
                <p className="text-gray-500 max-w-xs mx-auto">
                    Try adjusting your filters or search terms to find what you're looking for.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            {/* Desktop View */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Type</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Credit ID</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Value</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {transactions.map((tx) => (
                            <tr key={tx.id} className="hover:bg-gray-50/80 transition-colors group">
                                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                    {formatDate(tx.timestamp || tx.transactionDate)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${typeStyles[tx.transactionType]}`}>
                                        {tx.transactionType}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm font-mono text-gray-600">
                                    {tx.transactionId || `TX-${tx.id}`}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-semibold">
                                    {tx.creditAmount.toLocaleString()}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-900 font-bold">
                                    {formatCurrency(tx.totalAmount || (tx.creditAmount * (tx.pricePerUnit || 0)) || 0)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusStyles[tx.status]}`}>
                                        {tx.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        onClick={() => onViewDetail(tx)}
                                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all inline-flex items-center"
                                        title="View Details"
                                    >
                                        <ChevronRight size={20} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View */}
            <div className="md:hidden divide-y divide-gray-100">
                {transactions.map((tx) => (
                    <div
                        key={tx.id}
                        className="p-5 flex items-center justify-between hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        onClick={() => onViewDetail(tx)}
                    >
                        <div className="space-y-1">
                            <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${typeStyles[tx.transactionType]}`}>
                                    {tx.transactionType}
                                </span>
                                <span className="text-xs text-gray-500 font-medium">
                                    {formatDate(tx.transactionDate)}
                                </span>
                            </div>
                            <p className="text-sm font-bold text-gray-900">
                                {Number(tx.creditAmount || 0).toLocaleString()} units • {tx.transactionId || `TX-${tx.id}`}
                            </p>
                            <p className="text-xs text-green-700 font-bold">
                                {formatCurrency(tx.totalAmount || (tx.creditAmount * (tx.pricePerUnit || 0)))}
                            </p>
                        </div>
                        <ChevronRight size={18} className="text-gray-300" />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TransactionTable;
