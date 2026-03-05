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
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <h1 style={{ marginTop: 0 }}>Welcome, {user?.name || user?.email}! 👋</h1>
            <p style={{ color: '#64748b', lineHeight: '1.7', fontSize: '1.1rem' }}>
                You're logged in as <strong style={{ color: '#2e7d32' }}>{userRole || 'USER'}</strong>.
                {user?.organization ? ` Your organization is ${user.organization.name}.` : ' You have no organization linked yet.'}
            </p>

            <h3 style={{ marginTop: '2.5rem', marginBottom: '1.5rem', color: '#1e293b' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {dashboardCards.map(item => (
                    <div
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        style={{
                            padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                            borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s ease', display: 'flex', flexDirection: 'column', gap: '0.5rem'
                        }}
                        onMouseOver={e => {
                            e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.1)';
                            e.currentTarget.style.translate = '0 -4px';
                            e.currentTarget.style.borderColor = '#bbf7d0';
                        }}
                        onMouseOut={e => {
                            e.currentTarget.style.boxShadow = 'none';
                            e.currentTarget.style.translate = '0 0';
                            e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                    >
                        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>{item.label}</h3>
                        <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem', lineHeight: '1.5' }}>{item.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default HomePage;
