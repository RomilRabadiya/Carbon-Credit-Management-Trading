import React, { useState } from 'react';
import { Search, Filter, X, Calendar, Activity } from 'lucide-react';

/**
 * Filtering and search panel for the Audit Ledger
 * @param {Object} filters - Current filter state
 * @param {Function} onFilterChange - Callback for filter updates
 * @param {Function} onReset - Callback to reset all filters
 */
export const FilterPanel = ({ filters, onFilterChange, onReset }) => {
    const [showAdvanced, setShowAdvanced] = useState(false);

    const transactionTypes = ['ALL', 'ISSUED', 'TRADED', 'RETIRED'];
    const transactionStatuses = ['ALL', 'PENDING', 'COMPLETED', 'CANCELLED'];

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-8 shadow-sm">
            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-green-600 transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by credit ID, transaction ID, or amount..."
                        value={filters.searchText}
                        onChange={(e) => onFilterChange('searchText', e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                    />
                </div>
            </div>

            {/* Quick Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Transaction Type */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Transaction Type
                    </label>
                    <div className="relative">
                        <select
                            value={filters.type}
                            onChange={(e) => onFilterChange('type', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none cursor-pointer"
                        >
                            {transactionTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0) + type.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Filter size={14} className="text-gray-400" />
                        </div>
                    </div>
                </div>

                {/* Status */}
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Status
                    </label>
                    <div className="relative">
                        <select
                            value={filters.status}
                            onChange={(e) => onFilterChange('status', e.target.value)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none appearance-none cursor-pointer"
                        >
                            {transactionStatuses.map(status => (
                                <option key={status} value={status}>
                                    {status.charAt(0) + status.slice(1).toLowerCase()}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                            <Activity size={14} className="text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Filters Toggle */}
            <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="flex items-center gap-2 text-green-600 hover:text-green-700 font-semibold text-sm mb-4 transition-colors"
            >
                <Calendar size={16} />
                {showAdvanced ? 'Hide' : 'Show'} Date Filters
            </button>

            {/* Advanced Filters (Dates) */}
            {showAdvanced && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            Start Date
                        </label>
                        <input
                            type="date"
                            value={filters.startDate ? filters.startDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => onFilterChange('startDate', e.target.value ? new Date(e.target.value) : null)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 mb-2">
                            End Date
                        </label>
                        <input
                            type="date"
                            value={filters.endDate ? filters.endDate.toISOString().split('T')[0] : ''}
                            onChange={(e) => onFilterChange('endDate', e.target.value ? new Date(e.target.value) : null)}
                            className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                        />
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-100">
                <button
                    onClick={onReset}
                    className="flex items-center gap-2 px-5 py-2 text-gray-600 hover:text-gray-800 font-medium border border-gray-300 rounded-lg hover:bg-gray-50 transition-all"
                >
                    <X size={16} />
                    Clear All
                </button>
            </div>
        </div>
    );
};

export default FilterPanel;
