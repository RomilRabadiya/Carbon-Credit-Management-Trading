import React, { useState } from 'react';
import { LogOut, Bell } from 'lucide-react';

export default function Navbar({ user, logout, notifications = [] }) {
    const [showNotifications, setShowNotifications] = useState(false);

    return (
        <div className="bg-white shadow p-4 flex justify-end items-center gap-6">
            <span className="text-sm text-gray-500 hidden sm:block">
                {user?.name || user?.email}
            </span>

            {/* Notifications Dropdown */}
            <div className="relative">
                <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-500 hover:text-gray-700 transition-colors bg-transparent border-none cursor-pointer"
                >
                    <Bell size={20} />
                    {notifications.length > 0 && (
                        <span className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1.5 py-0.5 text-xs font-bold leading-none translate-x-1/4 -translate-y-1/4">
                            {notifications.length}
                        </span>
                    )}
                </button>

                {showNotifications && (
                    <div className="absolute top-full right-0 mt-2 w-80 bg-white shadow-lg rounded-xl z-50 overflow-hidden border border-gray-100">
                        <div className="px-4 py-3 border-b border-gray-100 font-semibold bg-gray-50 text-gray-800">
                            Notifications
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-4 text-center text-sm text-gray-500">
                                    No recent notifications.
                                </div>
                            ) : (
                                notifications.map((notif, idx) => (
                                    <div key={idx} className="p-4 border-b border-gray-50 text-sm hover:bg-gray-50 transition-colors">
                                        <strong className="block text-gray-800 mb-1">{notif.title}</strong>
                                        <span className="text-gray-600">{notif.message}</span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                )}
            </div>

            <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors text-sm font-medium border-none cursor-pointer"
            >
                <LogOut size={16} /> Logout
            </button>
        </div>
    );
}
