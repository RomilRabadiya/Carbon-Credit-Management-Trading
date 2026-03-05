import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProfilePage = () => {
    const { currentUser: user, login } = useAuth();

    // Use fallback values to prevent undefined errors
    const [role, setRole] = useState(user?.role || '');
    const [orgName, setOrgName] = useState(user?.organization?.name || '');
    const [orgType, setOrgType] = useState(user?.organization?.type || 'COMPANY');
    const [orgAddress, setOrgAddress] = useState(user?.organization?.address || '');
    const [orgContactEmail, setOrgContactEmail] = useState(user?.organization?.contactEmail || '');
    const [loading, setLoading] = useState(false);

    const handleCompleteProfile = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const authToken = localStorage.getItem('jwtToken');
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

            // Update auth context with new user data
            login(updatedUser, authToken);
            toast.success('Profile updated successfully!');

        } catch (err) {
            toast.error(err.message || 'Error updating profile');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 m-0 mb-2">My Profile</h2>
            <p className="text-gray-500 mb-8">Update your role and organization details here.</p>

            <form onSubmit={handleCompleteProfile} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                    <select
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                    >
                        <option value="">Select Role</option>
                        <option value="USER">User (Standard)</option>
                        <option value="ORGANIZATION">Organization</option>
                        <option value="VERIFIER">Verifier</option>
                    </select>
                </div>

                {role === 'ORGANIZATION' && (
                    <div className="p-6 bg-gray-50 border border-gray-200 rounded-xl space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900 m-0 mb-4">Organization Details</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Name</label>
                            <input
                                type="text"
                                value={orgName}
                                onChange={e => setOrgName(e.target.value)}
                                required
                                placeholder="GreenCorp Ltd."
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <input
                                type="text"
                                value={orgAddress}
                                onChange={e => setOrgAddress(e.target.value)}
                                required
                                placeholder="123 Eco Street"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email</label>
                            <input
                                type="email"
                                value={orgContactEmail}
                                onChange={e => setOrgContactEmail(e.target.value)}
                                required
                                placeholder="contact@greencorp.com"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Organization Type</label>
                            <select
                                value={orgType}
                                onChange={(e) => setOrgType(e.target.value)}
                                required
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                            >
                                <option value="COMPANY">Company</option>
                                <option value="NGO">NGO</option>
                                <option value="GOVERNMENT">Government</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-xl text-white font-semibold shadow-sm transition-all ${loading ? 'bg-green-500/70 cursor-wait' : 'bg-green-600 hover:bg-green-700 cursor-pointer active:scale-[0.99] hover:shadow-md'
                            }`}
                    >
                        {loading ? 'Saving...' : 'Save Profile'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProfilePage;
