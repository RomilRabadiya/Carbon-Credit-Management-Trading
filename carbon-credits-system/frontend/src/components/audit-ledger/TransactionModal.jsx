import React from 'react';
import { X, Copy, Download, Building2, User, CreditCard, Calendar } from 'lucide-react';
import { toast } from 'react-toastify';
import { formatDate, formatCurrency } from '../../utils/formatters';

/**
 * Detailed modal view for a single transaction
 */
export const TransactionModal = ({ transaction, isOpen, onClose }) => {
    if (!isOpen || !transaction) return null;

    const copyToClipboard = (text, label) => {
        navigator.clipboard.writeText(text);
        toast.success(`${label} copied to clipboard!`);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            {/* Modal Content */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-300">
                {/* Header */}
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900">Transaction Details</h3>
                        <p className="text-xs text-gray-500 font-mono mt-1">ID: {transaction.id}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-8 overflow-y-auto max-h-[calc(90vh-160px)] custom-scrollbar">
                    {/* Key Info Grid */}
                    <div className="grid grid-cols-2 gap-8 mb-8">
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Type</p>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-700 border border-blue-100">
                                {transaction.transactionType}
                            </span>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Status</p>
                            <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-50 text-green-700 border border-green-100">
                                {transaction.status}
                            </span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Transaction Date */}
                        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                            <Calendar className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</p>
                                <p className="text-sm font-semibold text-gray-900">{formatDate(transaction.timestamp || transaction.transactionDate, true)}</p>
                            </div>
                        </div>

                        {/* Credit Info */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard size={18} className="text-green-600" />
                                Credit Information
                            </h4>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Credit ID</p>
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-mono font-bold text-gray-900">CC-{String(transaction.creditId).padStart(4, '0')}</p>
                                        <button onClick={() => copyToClipboard(`CC-${String(transaction.creditId).padStart(4, '0')}`, 'Credit ID')} className="text-gray-400 hover:text-green-600 transition-colors">
                                            <Copy size={14} />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Amount</p>
                                    <p className="text-sm font-bold text-gray-900">{Number(transaction.creditAmount).toLocaleString()} units</p>
                                </div>
                            </div>
                        </div>

                        {/* Parties */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                <Building2 size={18} className="text-blue-600" />
                                Parties Involved
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(transaction.sourceOrganizationId || transaction.sellerId) && (
                                    <div className="p-4 bg-blue-50/50 border border-blue-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User size={14} className="text-blue-600" />
                                            <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Source / Seller</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{transaction.sellerName || `Organization #${transaction.sourceOrganizationId || transaction.sellerId}`}</p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {transaction.sourceOrganizationId || transaction.sellerId}</p>
                                    </div>
                                )}
                                {(transaction.destinationOrganizationId || transaction.buyerId) && (
                                    <div className="p-4 bg-green-50/50 border border-green-100 rounded-xl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <User size={14} className="text-green-600" />
                                            <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Destination / Buyer</span>
                                        </div>
                                        <p className="text-sm font-bold text-gray-900">{transaction.buyerName || `Organization #${transaction.destinationOrganizationId || transaction.buyerId}`}</p>
                                        <p className="text-[10px] text-gray-500 font-mono mt-1">ID: {transaction.destinationOrganizationId || transaction.buyerId}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Financials */}
                        <div className="p-6 bg-gray-900 rounded-2xl text-white">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Financial Summary</p>
                            <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-400">Price per Unit</span>
                                    <span className="font-semibold">{formatCurrency(transaction.pricePerUnit || 0)}</span>
                                </div>
                                <div className="h-px bg-gray-800 w-full"></div>
                                <div className="flex justify-between items-end">
                                    <span className="text-sm text-gray-400 font-bold">Total Settlement Amount</span>
                                    <span className="text-2xl font-black text-green-400">
                                        {formatCurrency(transaction.totalAmount || (transaction.creditAmount * (transaction.pricePerUnit || 0)) || 0)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Additional info for retirements */}
                        {(transaction.beneficiary || transaction.reason || transaction.remarks) && (
                            <div className="p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Additional Details</p>
                                {transaction.beneficiary && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Beneficiary</p>
                                        <p className="text-sm text-gray-900 font-medium">{transaction.beneficiary}</p>
                                    </div>
                                )}
                                {transaction.reason && (
                                    <div className="mb-4">
                                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Reason</p>
                                        <p className="text-sm text-gray-900 italic leading-relaxed">"{transaction.reason}"</p>
                                    </div>
                                )}
                                {transaction.remarks && (
                                    <div>
                                        <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Remarks / Logs</p>
                                        <p className="text-sm text-gray-900 italic leading-relaxed text-blue-600">"{transaction.remarks}"</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 text-gray-600 hover:text-gray-900 font-bold text-sm transition-colors"
                    >
                        Close
                    </button>
                    <button
                        onClick={() => toast.info('Receipt generation feature coming soon.')}
                        className="px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-green-200 transition-all flex items-center gap-2"
                    >
                        <Download size={16} />
                        Download Receipt
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TransactionModal;
