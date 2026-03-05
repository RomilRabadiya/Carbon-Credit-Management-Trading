import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Sidebar({ userRole }) {
    const location = useLocation();

    const navItems = [
        { path: '/', label: 'Dashboard', show: true },
        { path: '/report', label: 'Submit Emission', show: userRole === 'ORGANIZATION' },
        { path: '/credits', label: 'My Credits', show: userRole === 'ORGANIZATION' },
        { path: '/marketplace', label: 'Marketplace', show: true },
        { path: '/verifications', label: 'Verifications', show: userRole === 'VERIFIER' },
        { path: '/profile', label: 'Profile', show: true },
    ].filter(item => item.show);

    return (
        <aside className="w-64 bg-black text-white p-6 flex flex-col h-full overflow-y-auto">
            <h2 className="text-xl font-bold mb-8">CarbonLedger</h2>

            <nav className="space-y-4 flex-1">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`block transition-colors ${isActive ? 'text-white font-bold' : 'text-gray-400 hover:text-gray-200'}`}
                        >
                            {item.label}
                        </Link>
                    )
                })}
            </nav>

            <div className="pt-6 border-t border-gray-800 text-sm text-gray-400 mt-auto">
                Logged in as: <span className="text-white font-medium">{userRole || 'Guest'}</span>
            </div>
        </aside>
    );
}
