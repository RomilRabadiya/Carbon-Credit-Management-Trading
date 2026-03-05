import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
        </div>
    );
};

export default HomePage;
