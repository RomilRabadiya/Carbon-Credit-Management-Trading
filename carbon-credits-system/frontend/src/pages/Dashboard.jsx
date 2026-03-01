import React, { useState, useMemo } from 'react';
import { Leaf, LogOut } from 'lucide-react';
import EmissionReportForm from './EmissionReportForm';
import CreditsPage from './CreditsPage';
import VerificationsPage from './VerificationsPage';
import Marketplace from './Marketplace';

// Decode JWT payload (no verification — just for UI use)
const parseJwtRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.authorities || null;
    } catch {
        return null;
    }
};

const Dashboard = ({ user, onLogout, onUpdateUser }) => {
    const [currentView, setCurrentView] = useState('home');
    const [role, setRole] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('COMPANY');
    const [orgAddress, setOrgAddress] = useState('');
    const [orgContactEmail, setOrgContactEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

    // Parse role from token
    const userRole = useMemo(() => {
        const token = localStorage.getItem('auth_token');
        return token ? parseJwtRole(token) : null;
    }, []);

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMsg({ type: '', text: '' });

        try {
            const authToken = localStorage.getItem('auth_token');
            const res = await fetch('http://localhost:8080/api/users/complete-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': authToken ? `Bearer ${authToken}` : ''
                },
                body: JSON.stringify({
                    role: role,
                    organization: role === 'ORGANIZATION' ? {
                        name: orgName,
                        type: orgType,
                        address: orgAddress,
                        contactEmail: orgContactEmail
                    } : null
                })
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || 'Failed to complete profile');
            }

            const updatedUser = await res.json();
            setMsg({ type: 'success', text: 'Profile updated successfully!' });
            if (onUpdateUser) onUpdateUser(updatedUser);
        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    const navItems = [
        { id: 'home', label: '🏠 Home', show: true },
        { id: 'report', label: '📊 Submit Emission', show: userRole === 'ORGANIZATION' || userRole === 'ADMIN' },
        { id: 'credits', label: '🌿 My Credits', show: userRole === 'ORGANIZATION' || userRole === 'ADMIN' },
        { id: 'marketplace', label: '🛒 Marketplace', show: true },
        { id: 'verifications', label: '🔍 Verifications', show: userRole === 'VERIFIER' || userRole === 'ORGANIZATION' || userRole === 'ADMIN' },
        { id: 'profile', label: '👤 Profile', show: true },
    ].filter(item => item.show);

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--eco-bg)' }}>
            {/* Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.85rem 2rem',
                backgroundColor: 'white',
                boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--eco-primary)' }}>
                    <Leaf size={24} />
                    <h2 style={{ margin: 0, fontSize: '1.15rem' }}>Carbon Credit System</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            style={{
                                background: currentView === item.id ? '#e8f5e9' : 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: '6px 14px',
                                borderRadius: '8px',
                                fontWeight: currentView === item.id ? '700' : '400',
                                color: currentView === item.id ? '#2e7d32' : '#475569',
                                fontSize: '0.875rem',
                                transition: 'all 0.15s'
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {userRole && (
                        <span style={{ fontSize: '0.75rem', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#e8f5e9', color: '#2e7d32', fontWeight: '700' }}>
                            {userRole}
                        </span>
                    )}
                    <span style={{ color: 'var(--eco-text-secondary)', fontSize: '0.875rem' }}>
                        {user?.name || user?.email}
                    </span>
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex', alignItems: 'center', gap: '0.4rem',
                            padding: '6px 14px', border: 'none', backgroundColor: '#e53e3e',
                            color: 'white', borderRadius: '8px', cursor: 'pointer', fontSize: '0.875rem'
                        }}
                    >
                        <LogOut size={14} /> Logout
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

                {/* Home */}
                {currentView === 'home' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                        <h1 style={{ marginTop: 0 }}>Welcome, {user?.name || user?.email}! 👋</h1>
                        <p style={{ color: '#64748b', lineHeight: '1.7' }}>
                            You're logged in as <strong style={{ color: '#2e7d32' }}>{userRole || 'USER'}</strong>.
                            {user?.organizationId ? ` Your Organization ID is ${user.organizationId}.` : ' You have no organization linked yet.'}
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
                            {navItems.filter(n => n.id !== 'home').map(item => (
                                <button
                                    key={item.id}
                                    onClick={() => setCurrentView(item.id)}
                                    style={{
                                        padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0',
                                        borderRadius: '12px', cursor: 'pointer', textAlign: 'left',
                                        transition: 'box-shadow 0.15s', fontSize: '1rem', fontWeight: '600'
                                    }}
                                    onMouseOver={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                    onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Emission Report */}
                {currentView === 'report' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
                        <EmissionReportForm currentUser={user} />
                    </div>
                )}

                {/* Credits */}
                {currentView === 'credits' && (
                    <CreditsPage user={user} />
                )}

                {/* Verifications */}
                {currentView === 'verifications' && (
                    <VerificationsPage user={user} userRole={userRole} />
                )}

                {/* Marketplace */}
                {currentView === 'marketplace' && (
                    <Marketplace user={user} />
                )}

                {/* Profile */}
                {currentView === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: '540px', margin: '0 auto' }}>
                        <h2 style={{ marginTop: 0 }}>Complete Your Profile</h2>

                        {msg.text && (
                            <div style={{ color: msg.type === 'error' ? '#c62828' : '#2e7d32', marginBottom: '15px', padding: '10px 14px', border: `1px solid ${msg.type === 'error' ? '#ffcdd2' : '#a5d6a7'}`, backgroundColor: msg.type === 'error' ? '#fdecea' : '#e8f5e9', borderRadius: '8px' }}>
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handleCompleteProfile}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: '500' }}>Role:</label>
                                <select value={role} onChange={(e) => setRole(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                    <option value="">Select Role</option>
                                    <option value="USER">User (Standard)</option>
                                    <option value="ORGANIZATION">Organization</option>
                                    <option value="VERIFIER">Verifier</option>
                                </select>
                            </div>

                            {role === 'ORGANIZATION' && (
                                <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                                    <h3 style={{ marginTop: 0, fontSize: '0.95rem' }}>Organization Details</h3>
                                    {[
                                        { label: 'Organization Name', value: orgName, setter: setOrgName, type: 'text', placeholder: 'GreenCorp Ltd.' },
                                        { label: 'Address', value: orgAddress, setter: setOrgAddress, type: 'text', placeholder: '123 Eco Street' },
                                        { label: 'Contact Email', value: orgContactEmail, setter: setOrgContactEmail, type: 'email', placeholder: 'contact@greencorp.com' },
                                    ].map(field => (
                                        <div key={field.label} style={{ marginBottom: '10px' }}>
                                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>{field.label}:</label>
                                            <input type={field.type} value={field.value} onChange={e => field.setter(e.target.value)} required placeholder={field.placeholder} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                                        </div>
                                    ))}
                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Organization Type:</label>
                                        <select value={orgType} onChange={(e) => setOrgType(e.target.value)} required style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                                            <option value="COMPANY">Company</option>
                                            <option value="NGO">NGO</option>
                                            <option value="GOVERNMENT">Government</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                                {loading ? 'Saving...' : 'Save Profile'}
                            </button>
                        </form>
                    </div>
                )}
            </main>
        </div>
    );
};

export default Dashboard;
