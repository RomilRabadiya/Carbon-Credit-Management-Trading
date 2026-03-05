import React, { useState, useMemo, useEffect } from 'react';
import { Leaf, LogOut, Bell } from 'lucide-react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

// Decode JWT payload (no verification — just for UI use)
const parseJwtRole = (token) => {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role || payload.authorities || null;
    } catch {
        return null;
    }
};

const Dashboard = () => {
    const { currentUser: user, logout } = useAuth();
    const location = useLocation();

    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        if (!user || typeof user.id === 'undefined' || user.id === null) return;

        let ws = null;
        try {
            ws = new WebSocket(`ws://localhost:8084/ws/notifications?userId=${user.id}`);

            ws.onopen = () => { };

            ws.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    setNotifications(prev => [notification, ...prev]);
                    toast.info(`New Notification: ${notification.title}`);
                } catch (error) {
                    console.error('Failed to parse notification:', event.data);
                }
            };

            ws.onerror = (error) => { };

            ws.onclose = () => { };
        } catch (error) {
            console.error('Dashboard Socket Init Failed');
        }

        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            } else if (ws) {
                ws.onopen = () => ws.close();
            }
        };
    }, [user?.id]);

    // Parse role from token
    const userRole = useMemo(() => {
        const token = localStorage.getItem('jwtToken');
        return token ? parseJwtRole(token) : null;
    }, []);

    const navItems = [
        { path: '/', label: '🏠 Home', show: true },
        { path: '/report', label: '📊 Submit Emission', show: userRole === 'ORGANIZATION' || userRole === 'ADMIN' },
        { path: '/credits', label: '🌿 My Credits', show: userRole === 'ORGANIZATION' || userRole === 'ADMIN' },
        { path: '/marketplace', label: '🛒 Marketplace', show: true },
        { path: '/verifications', label: '🔍 Verifications', show: userRole === 'VERIFIER' || userRole === 'ORGANIZATION' || userRole === 'ADMIN' },
        { path: '/profile', label: '👤 Profile', show: true },
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
                    {navItems.map(item => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    background: isActive ? '#e8f5e9' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: '6px 14px',
                                    borderRadius: '8px',
                                    fontWeight: isActive ? '700' : '400',
                                    color: isActive ? '#2e7d32' : '#475569',
                                    fontSize: '0.875rem',
                                    transition: 'all 0.15s',
                                    textDecoration: 'none'
                                }}
                            >
                                {item.label}
                            </Link>
                        );
                    })}
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

                    {/* Notifications Dropdown */}
                    <div style={{ position: 'relative' }}>
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', display: 'flex', alignItems: 'center', padding: '0 8px' }}
                        >
                            <Bell size={20} color="#475569" />
                            {notifications.length > 0 && (
                                <span style={{
                                    position: 'absolute', top: '-5px', right: '0px', background: '#e53e3e', color: 'white',
                                    borderRadius: '50%', padding: '2px 6px', fontSize: '10px', fontWeight: 'bold'
                                }}>
                                    {notifications.length}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <div style={{
                                position: 'absolute', top: '100%', right: '0', marginTop: '10px',
                                width: '300px', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                borderRadius: '12px', zIndex: 1000, overflow: 'hidden'
                            }}>
                                <div style={{ padding: '12px 16px', borderBottom: '1px solid #e2e8f0', fontWeight: '600', backgroundColor: '#f8fafc' }}>
                                    Notifications
                                </div>
                                <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                    {notifications.length === 0 ? (
                                        <div style={{ padding: '16px', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                            No recent notifications.
                                        </div>
                                    ) : (
                                        notifications.map((notif, idx) => (
                                            <div key={idx} style={{ padding: '12px 16px', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem' }}>
                                                <strong style={{ display: 'block', color: '#1e293b', marginBottom: '4px' }}>{notif.title}</strong>
                                                <span style={{ color: '#475569' }}>{notif.message}</span>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={logout}
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
                <Outlet />
            </main>
        </div>
    );
};

export default Dashboard;
