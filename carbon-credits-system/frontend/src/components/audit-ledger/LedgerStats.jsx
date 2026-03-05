import React from 'react';
import { TrendingUp, TrendingDown, BarChart3, Activity } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

/**
 * Summary statistics cards for the Audit Ledger
 * @param {Object} stats - Statistics data from the custom hook
 * @param {boolean} loading - Loading state
 */
export const LedgerStats = ({ stats, loading }) => {
    if (loading || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="bg-gray-100 h-28 rounded-xl animate-pulse border border-gray-200"></div>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            label: 'Total Transactions',
            value: stats.totalTransactions || 0,
            icon: Activity,
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600',
            borderColor: 'border-blue-200',
        },
        {
            label: 'Credits Issued',
            value: (stats.creditIssued || 0).toLocaleString(),
            icon: Activity,
            bgColor: 'bg-green-50',
            textColor: 'text-green-700',
            borderColor: 'border-green-200',
        },
        {
            label: 'Credits Traded',
            value: (stats.creditTraded || 0).toLocaleString(),
            icon: TrendingUp,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-200',
        },
        {
            label: 'Credits Retired',
            value: (stats.creditRetired || 0).toLocaleString(),
            icon: TrendingDown,
            bgColor: 'bg-red-50',
            textColor: 'text-red-600',
            borderColor: 'border-red-200',
        },
        {
            label: 'Total Value',
            value: formatCurrency(stats.totalValue || 0),
            icon: BarChart3,
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600',
            borderColor: 'border-purple-200',
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {statCards.map((card, idx) => {
                const Icon = card.icon;
                return (
                    <div
                        key={idx}
                        className={`${card.bgColor} border ${card.borderColor} p-6 rounded-xl transition-all hover:shadow-md`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-600 mb-1">
                                    {card.label}
                                </p>
                                <p className={`text-2xl font-bold ${card.textColor}`}>
                                    {card.value}
                                </p>
                            </div>
                            <div className={`p-2 rounded-lg ${card.bgColor.replace('50', '100')} ${card.textColor}`}>
                                <Icon className="w-6 h-6" />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default LedgerStats;
