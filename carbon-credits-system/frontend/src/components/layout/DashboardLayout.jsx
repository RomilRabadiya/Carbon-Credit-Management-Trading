import React from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

export default function DashboardLayout({ children, userRole, user, logout, notifications }) {
    return (
        <div className="flex h-screen overflow-hidden bg-gray-100">
            <Sidebar userRole={userRole} />
            <div className="flex-1 flex flex-col h-full overflow-hidden">
                <Navbar user={user} logout={logout} notifications={notifications} />
                <main className="p-6 flex-1 bg-gray-50 overflow-y-auto w-full">
                    {children}
                </main>
            </div>
        </div>
    );
}
