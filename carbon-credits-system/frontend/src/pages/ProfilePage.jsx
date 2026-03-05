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
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', maxWidth: '540px', margin: '0 auto' }}>
            <h2 style={{ marginTop: 0 }}>My Profile</h2>
            <p style={{ color: '#64748b', marginBottom: '2rem' }}>Update your role and organization details here.</p>

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
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Organization Name:</label>
                            <input type="text" value={orgName} onChange={e => setOrgName(e.target.value)} required placeholder="GreenCorp Ltd." style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Address:</label>
                            <input type="text" value={orgAddress} onChange={e => setOrgAddress(e.target.value)} required placeholder="123 Eco Street" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.875rem' }}>Contact Email:</label>
                            <input type="email" value={orgContactEmail} onChange={e => setOrgContactEmail(e.target.value)} required placeholder="contact@greencorp.com" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
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

                <button type="submit" disabled={loading} style={{ padding: '10px 20px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: '600', width: '100%', marginTop: '10px' }}>
                    {loading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default ProfilePage;
