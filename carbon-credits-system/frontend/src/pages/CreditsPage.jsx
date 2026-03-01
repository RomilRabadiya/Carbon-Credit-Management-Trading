import React, { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8080';
const TRADE_API_BASE = 'http://localhost:8083';

const CreditsPage = ({ user }) => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [msg, setMsg] = useState(null);

    // For retire modal
    const [retireModal, setRetireModal] = useState(null); // creditId being retired
    const [beneficiary, setBeneficiary] = useState('');
    const [reason, setReason] = useState('');
    const [retireLoading, setRetireLoading] = useState(false);

    // For list modal
    const [listModal, setListModal] = useState(null); // creditId being listed
    const [listPrice, setListPrice] = useState('');
    const [listLoading, setListLoading] = useState(false);

    const authHeader = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
    });

    const fetchCredits = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use /me which reads the X-User-Id header injected by the API Gateway
            const res = await fetch(`${API_BASE}/api/credits/me`, {
                headers: authHeader()
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Failed to load credits (${res.status})`);
            }
            const data = await res.json();
            setCredits(data.credits || data || []);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [user]);

    const handleRetire = async () => {
        if (!beneficiary || !reason) {
            setMsg({ type: 'error', text: 'Beneficiary and reason are required.' });
            return;
        }
        setRetireLoading(true);
        setMsg(null);
        try {
            const res = await fetch(`${TRADE_API_BASE}/api/trading/retire/${retireModal}`, {
                method: 'POST',
                headers: { ...authHeader(), 'X-User-Id': user?.id?.toString() || "" },
                body: JSON.stringify({ beneficiary, reason })
            });
            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || `Retire failed (${res.status})`);
            }
            setMsg({ type: 'success', text: 'Credit retired successfully!' });
            setRetireModal(null);
            setBeneficiary('');
            setReason('');
            fetchCredits();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setRetireLoading(false);
        }
    };

    const handleList = async () => {
        if (!listPrice || isNaN(listPrice) || Number(listPrice) <= 0) {
            setMsg({ type: 'error', text: 'Please enter a valid positive price.' });
            return;
        }
        setListLoading(true);
        setMsg(null);
        try {
            const res = await fetch(`${TRADE_API_BASE}/api/trading/list`, {
                method: 'POST',
                headers: { ...authHeader(), 'X-User-Id': user?.id?.toString() || "" },
                body: JSON.stringify({ creditId: listModal, price: Number(listPrice) })
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Listing failed (${res.status})`);
            }
            setMsg({ type: 'success', text: 'Credit successfully listed for sale!' });
            setListModal(null);
            setListPrice('');
            fetchCredits();
        } catch (e) {
            setMsg({ type: 'error', text: e.message });
        } finally {
            setListLoading(false);
        }
    };

    const statusColors = {
        ACTIVE: '#2e7d32', // Was previously ISSUED
        LISTED: '#1565c0',
        SOLD: '#6a1b9a',
        RETIRED: '#c62828',
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1e293b' }}>My Carbon Credits</h2>
                <button
                    onClick={fetchCredits}
                    style={{ padding: '8px 16px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                >
                    🔄 Refresh
                </button>
            </div>

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
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading credits...</div>
            ) : credits.length === 0 && !error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', backgroundColor: 'white', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🌿</div>
                    <p>No credits found for your organization.</p>
                    <p style={{ fontSize: '0.875rem' }}>Credits are issued after a verification is approved.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {credits.map(credit => (
                        <div key={credit.id} style={{
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            padding: '1.25rem 1.5rem',
                            boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            flexWrap: 'wrap',
                            gap: '1rem'
                        }}>
                            <div>
                                <div style={{ fontWeight: '600', color: '#1e293b', marginBottom: '4px' }}>
                                    Credit #{credit.id} — <span style={{ fontFamily: 'monospace', fontSize: '0.875rem', color: '#64748b' }}>{credit.serialNumber || 'N/A'}</span>
                                </div>
                                <div style={{ fontSize: '0.85rem', color: '#64748b' }}>
                                    Amount: <strong>{credit.amount}</strong> tCO₂e &nbsp;|&nbsp;
                                    Project: <strong>{credit.projectType || 'N/A'}</strong>
                                </div>
                                <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '2px' }}>
                                    Issued: {credit.issuedAt ? new Date(credit.issuedAt).toLocaleDateString() : 'N/A'} &nbsp;|&nbsp;
                                    Expires: {credit.expiryDate ? new Date(credit.expiryDate).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    padding: '4px 12px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '600',
                                    color: 'white',
                                    backgroundColor: statusColors[credit.status] || '#607d8b'
                                }}>
                                    {credit.status}
                                </span>
                                {credit.status === 'ACTIVE' && (
                                    <div style={{ display: 'flex', gap: '8px' }}>
                                        <button
                                            onClick={() => setListModal(credit.id)}
                                            style={{ padding: '6px 14px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            List for Sale
                                        </button>
                                        <button
                                            onClick={() => setRetireModal(credit.id)}
                                            style={{ padding: '6px 14px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }}
                                        >
                                            Retire
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Retire Modal */}
            {retireModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0 }}>Retire Credit #{retireModal}</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>This action is permanent and cannot be undone.</p>
                        <div style={{ marginBottom: '12px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Beneficiary</label>
                            <input type="text" value={beneficiary} onChange={e => setBeneficiary(e.target.value)} placeholder="e.g. GreenFuture NGO" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>
                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Reason</label>
                            <textarea value={reason} onChange={e => setReason(e.target.value)} placeholder="e.g. Offsetting 2024 emissions" rows={3} style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0', resize: 'none' }} />
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => setRetireModal(null)} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white' }}>Cancel</button>
                            <button onClick={handleRetire} disabled={retireLoading} style={{ flex: 1, padding: '10px', backgroundColor: '#c62828', color: 'white', border: 'none', borderRadius: '8px', cursor: retireLoading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                                {retireLoading ? 'Retiring...' : 'Confirm Retire'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List for Sale Modal */}
            {listModal && (
                <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999 }}>
                    <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '440px', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}>
                        <h3 style={{ marginTop: 0 }}>List Credit #{listModal} for Sale</h3>
                        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Enter the price per tonne of CO₂e for this credit.</p>

                        <div style={{ marginBottom: '16px' }}>
                            <label style={{ display: 'block', marginBottom: '4px', fontWeight: '500' }}>Price ($ USD)</label>
                            <input type="number" step="0.01" min="0" value={listPrice} onChange={e => setListPrice(e.target.value)} placeholder="e.g. 50.00" style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                        </div>

                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button onClick={() => { setListModal(null); setListPrice(''); }} style={{ flex: 1, padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: 'white' }}>Cancel</button>
                            <button onClick={handleList} disabled={listLoading} style={{ flex: 1, padding: '10px', backgroundColor: '#1565c0', color: 'white', border: 'none', borderRadius: '8px', cursor: listLoading ? 'not-allowed' : 'pointer', fontWeight: '600' }}>
                                {listLoading ? 'Listing...' : 'Confirm Listing'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CreditsPage;
