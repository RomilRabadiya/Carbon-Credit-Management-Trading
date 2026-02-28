import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';

const VerificationsPage = ({ user, userRole }) => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    // For approve/reject modal
    const [actionModal, setActionModal] = useState(null); // { id, action: 'approve'|'reject' }
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const authHeader = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
    });

    const isVerifier = userRole === 'VERIFIER' || userRole === 'ADMIN';
    const isOrg = userRole === 'ORGANIZATION' || userRole === 'ADMIN';

    const fetchVerifications = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `${API_BASE}/api/verifications`;
            // Organizations only see their own; verifiers see all
            if (isOrg && !isVerifier && user?.organizationId) {
                url = `${API_BASE}/api/verifications/organization/${user.organizationId}`;
            }
            const res = await fetch(url, { headers: authHeader() });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || `Failed to load (${res.status})`);
            }
            const data = await res.json();
            setVerifications(Array.isArray(data) ? data : []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVerifications(); }, [user, userRole]);

    const handleAction = async () => {
        const { id, action } = actionModal;
        setActionLoading(true);
        setMsg(null);
        try {
            const method = action === 'approve' ? 'PUT' : 'POST';
            const res = await fetch(`${API_BASE}/api/verifications/${id}/${action}`, {
                method,
                headers: authHeader(),
                body: JSON.stringify({ remarks: remarks || (action === 'approve' ? 'Approved' : 'Rejected') })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || `Action failed (${res.status})`);
            }
            setMsg({ type: 'success', text: `Verification #${id} ${action}d successfully!` });
            setActionModal(null);
            setRemarks('');
            fetchVerifications();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setActionLoading(false);
        }
    };

    const statusColors = {
        PENDING: '#f59e0b',
        APPROVED: '#2e7d32',
        REJECTED: '#c62828',
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0 }}>
                    {isVerifier ? '🔍 All Verifications' : '📋 My Verifications'}
                </h2>
                <button
                    onClick={fetchVerifications}
                    style={{ padding: '8px 16px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    🔄 Refresh
                </button>
            </div>

            {!isVerifier && !isOrg && (
                <div style={{ padding: '12px 16px', backgroundColor: '#fff3e0', border: '1px solid #ffe0b2', borderRadius: '8px', marginBottom: '1rem', color: '#e65100' }}>
                    ⚠️ You need an ORGANIZATION or VERIFIER role to access verifications.
                </div>
            )}

            {msg && (
                <div style={{ padding: '10px 16px', marginBottom: '1rem', borderRadius: '8px', backgroundColor: msg.type === 'error' ? '#fdecea' : '#e8f5e9', color: msg.type === 'error' ? '#c62828' : '#2e7d32', border: `1px solid ${msg.type === 'error' ? '#ffcdd2' : '#a5d6a7'}` }}>
                    {msg.text}
                </div>
            )}

            {error && (
                <div style={{ padding: '10px 16px', marginBottom: '1rem', borderRadius: '8px', backgroundColor: '#fdecea', color: '#c62828', border: '1px solid #ffcdd2' }}>
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading verifications...</div>
            ) : verifications.length === 0 && !error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', backgroundColor: 'white', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
                    <p>No verification requests found.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {verifications.map(v => (
                        <div key={v.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.25rem 1.5rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            borderLeft: `4px solid ${statusColors[v.status] || '#90a4ae'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                                <div>
                                    <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                        Verification #{v.id}
                                    </div>
                                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                        Report ID: <strong>{v.reportId}</strong> &nbsp;|&nbsp;
                                        Org ID: <strong>{v.organizationId}</strong>
                                    </div>
                                    {v.carbonCreditsCalculated && (
                                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                            Credits Calculated: <strong>{v.carbonCreditsCalculated} tCO₂e</strong>
                                        </div>
                                    )}
                                    {v.remarks && (
                                        <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px', fontStyle: 'italic' }}>
                                            Remarks: {v.remarks}
                                        </div>
                                    )}
                                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                        Submitted: {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'}
                                        {v.verifiedAt && ` | Verified: ${new Date(v.verifiedAt).toLocaleDateString()}`}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <span style={{
                                        padding: '4px 14px',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: '700',
                                        color: 'white',
                                        backgroundColor: statusColors[v.status] || '#607d8b'
                                    }}>
                                        {v.status}
                                    </span>
                                    {isVerifier && v.status === 'PENDING' && (
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button
                                                onClick={() => setActionModal({ id: v.id, action: 'approve' })}
                                                style={{ padding: '6px 14px', backgroundColor: '#2e7d32', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                ✅ Approve
                                            </button>
                                            <button
                                                onClick={() => setActionModal({ id: v.id, action: 'reject' })}
                                                style={{ padding: '6px 14px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                            >
                                                ❌ Reject
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Approve/Reject Modal */}
            {actionModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0, textTransform: 'capitalize' }}>
                            {actionModal.action === 'approve' ? '✅' : '❌'} {actionModal.action} Verification #{actionModal.id}
                        </h3>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Remarks (optional)</label>
                            <textarea
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder={`Reason for ${actionModal.action}...`}
                                rows={3}
                                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setActionModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white' }}>Cancel</button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading}
                                style={{
                                    flex: 1, padding: '10px',
                                    backgroundColor: actionModal.action === 'approve' ? '#2e7d32' : '#c62828',
                                    color: 'white', border: 'none', borderRadius: '8px',
                                    cursor: actionLoading ? 'not-allowed' : 'pointer', fontWeight: '600'
                                }}
                            >
                                {actionLoading ? 'Processing...' : `Confirm ${actionModal.action}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default VerificationsPage;
