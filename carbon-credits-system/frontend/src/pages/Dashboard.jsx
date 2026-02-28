import React, { useState } from 'react';
import { Leaf, LogOut } from 'lucide-react';
import EmissionReportForm from './EmissionReportForm';

const Dashboard = ({ user, onLogout, onUpdateUser }) => {
    // Simple state to toggle between views instead of react-router for student project
    const [currentView, setCurrentView] = useState('home');
    const [role, setRole] = useState('');
    const [orgName, setOrgName] = useState('');
    const [orgType, setOrgType] = useState('COMPANY'); // default
    const [orgAddress, setOrgAddress] = useState('');
    const [orgContactEmail, setOrgContactEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState({ type: '', text: '' });

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

            if (onUpdateUser) {
                onUpdateUser(updatedUser);
            }
        } catch (err) {
            setMsg({ type: 'error', text: err.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: 'var(--eco-bg)' }}>
            {/* Basic Navbar */}
            <nav style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '1rem 2rem',
                backgroundColor: 'white',
                boxShadow: 'var(--eco-shadow)'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--eco-primary)' }}>
                    <Leaf size={24} />
                    <h2 style={{ margin: 0, fontSize: '1.25rem' }}>Carbon Credit System</h2>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>

                    <button
                        onClick={() => setCurrentView('home')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: currentView === 'home' ? 'bold' : 'normal' }}
                    >
                        Home
                    </button>

                    <button
                        onClick={() => setCurrentView('report')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: currentView === 'report' ? 'bold' : 'normal' }}
                    >
                        Submit Emission
                    </button>

                    <button
                        onClick={() => setCurrentView('profile')}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: currentView === 'profile' ? 'bold' : 'normal' }}
                    >
                        Complete Profile
                    </button>

                    <span style={{ color: 'var(--eco-text)', fontWeight: '500' }}>
                        {user?.name ? `${user.name} (${user.email})` : user?.email}
                    </span>
                    <button
                        onClick={onLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            border: 'none',
                            backgroundColor: '#e53e3e', // Simple red for logout
                            color: 'white',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            fontWeight: '500',
                            transition: 'background-color 0.2s'
                        }}
                    >
                        <LogOut size={16} /> Logout
                    </button>
                </div>
            </nav>

            {/* Main Content Area */}
            <main style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>

                {currentView === 'home' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--eco-shadow)' }}>
                        <h1 style={{ color: 'var(--eco-text)', marginBottom: '1rem', marginTop: 0 }}>Welcome to your Dashboard!</h1>
                        <p style={{ color: 'var(--eco-text-secondary)', lineHeight: '1.6' }}>
                            Hello, {user?.name || user?.email}!
                            {user?.organizationId
                                ? ` You are connected to Organization ID: ${user.organizationId}.`
                                : ` You do not have an Organization ID assigned yet.`}
                        </p>
                        <p style={{ color: 'var(--eco-text-secondary)', lineHeight: '1.6' }}>
                            You can use the navigation bar above to switch between different views, such as submitting a new emission report.
                        </p>
                    </div>
                )}

                {currentView === 'report' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--eco-shadow)' }}>
                        <EmissionReportForm currentUser={user} />
                    </div>
                )}

                {currentView === 'profile' && (
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: 'var(--eco-shadow)', maxWidth: '600px', margin: '0 auto' }}>
                        <h2 style={{ marginTop: 0 }}>Complete Your Profile</h2>

                        {msg.text && (
                            <div style={{ color: msg.type === 'error' ? 'red' : 'green', marginBottom: '15px', padding: '10px', border: `1px solid ${msg.type === 'error' ? 'red' : 'green'}`, backgroundColor: msg.type === 'error' ? '#ffe6e6' : '#e6ffe6' }}>
                                {msg.text}
                            </div>
                        )}

                        <form onSubmit={handleCompleteProfile}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px' }}>Role:</label>
                                <select
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    required
                                    style={{ width: '100%', padding: '8px' }}
                                >
                                    <option value="">Select Role</option>
                                    <option value="USER">User (Standard)</option>
                                    <option value="ORGANIZATION">Organization</option>
                                </select>
                            </div>

                            {role === 'ORGANIZATION' && (
                                <div style={{ marginBottom: '15px', padding: '15px', border: '1px solid #ccc', borderRadius: '8px' }}>
                                    <h3 style={{ marginTop: 0 }}>Organization Details</h3>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Organization Name:</label>
                                        <input
                                            type="text"
                                            value={orgName}
                                            onChange={(e) => setOrgName(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Organization Type:</label>
                                        <select
                                            value={orgType}
                                            onChange={(e) => setOrgType(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '8px' }}
                                        >
                                            <option value="COMPANY">Company</option>
                                            <option value="NGO">NGO</option>
                                            <option value="GOVERNMENT">Government</option>
                                            <option value="OTHER">Other</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Address:</label>
                                        <input
                                            type="text"
                                            value={orgAddress}
                                            onChange={(e) => setOrgAddress(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '10px' }}>
                                        <label style={{ display: 'block', marginBottom: '5px' }}>Contact Email:</label>
                                        <input
                                            type="email"
                                            value={orgContactEmail}
                                            onChange={(e) => setOrgContactEmail(e.target.value)}
                                            required
                                            style={{ width: '100%', padding: '8px' }}
                                        />
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                style={{
                                    padding: '10px 15px',
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: loading ? 'not-allowed' : 'pointer'
                                }}
                            >
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
