import React, { useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAuditLedger } from '../hooks/useAuditLedger';
import { formatDate, formatCurrency } from '../utils/formatters';

const parseJwtRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.authorities || null;
    } catch {
        return null;
    }
};

const HomePage = () => {
    const { currentUser: user } = useAuth();
    const navigate = useNavigate();

    const userRole = useMemo(() => {
        const token = localStorage.getItem('jwtToken');
        return token ? parseJwtRole(token) : (user?.role || null);
    }, [user]);

    const dashboardCards = [
        { path: '/report', label: '📊 Submit Emission', show: userRole === 'ORGANIZATION' || userRole === 'ADMIN', desc: 'Report your organization\'s carbon emissions' },
        { path: '/credits', label: '🌿 My Credits', show: userRole === 'ORGANIZATION' || userRole === 'ADMIN', desc: 'View and manage your carbon credits' },
        { path: '/marketplace', label: '🛒 Marketplace', show: true, desc: 'Buy and sell carbon credits on the open market' },
        { path: '/verifications', label: '🔍 Verifications', show: userRole === 'VERIFIER' || userRole === 'ORGANIZATION' || userRole === 'ADMIN', desc: 'Verify emission reports' },
        { path: '/audit-ledger', label: '🏛️ Audit Ledger', show: true, desc: 'View complete immutable transaction history' },
        { path: '/profile', label: '👤 Profile', show: true, desc: 'Update your account details and role' },
    ].filter(item => item.show);

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.name || user?.email}! 👋</h1>
            <p className="text-gray-600 text-lg mb-8">
                You're logged in as <strong className="text-green-700">{userRole || 'USER'}</strong>.
                {user?.organization ? ` Your organization is ${user.organization.name}.` : ' You have no organization linked yet.'}
            </p>

            <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardCards.map(item => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="p-6 bg-gray-50 border border-gray-200 rounded-xl cursor-pointer hover:bg-white hover:shadow-lg hover:-translate-y-1 hover:border-green-200 transition-all duration-300 flex flex-col gap-2 group"
                    >
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors">{item.label}</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
                    </div>
                ))}
            </div>

            {/* Recent Transactions Section */}
            <div className="mt-12 pt-8 border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
                    <Link to="/audit-ledger" className="text-green-600 hover:text-green-700 font-bold text-sm">
                        View Full Ledger →
                    </Link>
                </div>

                <RecentTransactions user={user} />
            </div>
        </div>
    );
};

const RecentTransactions = ({ user }) => {
    const { transactions, loading } = useAuditLedger(user?.id);
    const recentTxns = transactions?.slice(0, 5) || [];

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 bg-gray-50 animate-pulse rounded-xl border border-gray-100"></div>
                ))}
            </div>
        );
    }

    if (recentTxns.length === 0) {
        return (
            <div className="p-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200">
                <p className="text-gray-500 font-medium">No recent transactions recorded.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {recentTxns.map(tx => (
                <div key={tx.id} className="flex justify-between items-center p-4 bg-gray-50 hover:bg-white hover:shadow-sm border border-gray-200 rounded-xl transition-all">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">{tx.transactionType}</span>
                        <span className="text-sm font-bold text-gray-900">{formatDate(tx.transactionDate)}</span>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">{Number(tx.creditAmount).toLocaleString()} Units</p>
                        <p className="text-xs text-green-700 font-bold">{formatCurrency(tx.totalAmount || (tx.creditAmount * (tx.pricePerUnit || 0)))}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default HomePage;
