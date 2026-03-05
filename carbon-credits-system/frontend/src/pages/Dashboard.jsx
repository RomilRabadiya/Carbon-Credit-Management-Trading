import React, { useState, useMemo, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import DashboardLayout from '../components/layout/DashboardLayout';

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
    const [notifications, setNotifications] = useState([]);

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

    return (
        <DashboardLayout
            userRole={userRole}
            user={user}
            logout={logout}
            notifications={notifications}
        >
            <Outlet />
        </DashboardLayout>
    );
};

export default Dashboard;
