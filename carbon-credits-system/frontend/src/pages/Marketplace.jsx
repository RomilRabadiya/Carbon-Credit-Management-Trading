import React, { useState, useEffect } from 'react';

const TRADE_API_BASE = 'http://localhost:8083';

const Marketplace = ({ user }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [buyLoading, setBuyLoading] = useState(null); // id of listing being bought
    const [msg, setMsg] = useState(null);

    const authHeader = () => ({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'X-User-Id': user?.id?.toString() || ""
    });

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${TRADE_API_BASE}/api/trading/listings`, {
                headers: authHeader()
            });
            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Failed to load listings (${res.status})`);
            }
            const data = await res.json();
            setListings(data);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleBuy = async (listingId, price) => {
        if (!user || (!user.organizationId && !user.id)) {
            setMsg({ type: 'error', text: 'You must be logged in and part of an organization to buy credits.' });
            return;
        }

        if (window.confirm(`Are you sure you want to buy this credit for $${price}?`)) {
            setBuyLoading(listingId);
            setMsg(null);
            try {
                const res = await fetch(`${TRADE_API_BASE}/api/trading/buy`, {
                    method: 'POST',
                    headers: authHeader(),
                    body: JSON.stringify({ listingId: listingId.toString() })
                });

                if (!res.ok) {
                    const errData = await res.json().catch(() => null);
                    throw new Error(errData?.message || errData?.error || `Purchase failed (${res.status})`);
                }

                setMsg({ type: 'success', text: `Successfully purchased credit from listing #${listingId}!` });
                // Refresh the listings
                fetchListings();
            } catch (e) {
                setMsg({ type: 'error', text: e.message });
            } finally {
                setBuyLoading(null);
            }
        }
    };

    const handleAddBalance = async () => {
        const amountStr = window.prompt("Enter amount to add to your balance (USD):");
        if (!amountStr) return;
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert("Invalid amount.");
            return;
        }

        const userId = user?.id;
        if (!userId) {
            alert("User ID missing. Please log in.");
            return;
        }

        try {
            const res = await fetch(`http://localhost:8080/api/users/${userId}/balance/add`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
                },
                body: JSON.stringify(amount)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => null);
                throw new Error(errData?.message || `Failed to add balance (${res.status})`);
            }

            alert(`Successfully added $${amount} to your wallet!`);
            // Refresh to ensure any UI depending on balance might update (if any)
        } catch (e) {
            alert(`Error: ${e.message}`);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ margin: 0, color: '#1e293b' }}>Carbon Credit Marketplace</h2>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={handleAddBalance}
                        style={{ padding: '8px 16px', backgroundColor: '#1565c0', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        💰 Add Funds
                    </button>
                    <button
                        onClick={fetchListings}
                        style={{ padding: '8px 16px', backgroundColor: '#2e7d32', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    >
                        🔄 Refresh
                    </button>
                </div>
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
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>Loading active listings...</div>
            ) : listings.length === 0 && !error ? (
                <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b', backgroundColor: 'white', borderRadius: '16px' }}>
                    <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛒</div>
                    <p>No active listings found in the marketplace.</p>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
                    {listings.map(listing => {
                        // Don't allow buying your own credits (UI fallback)
                        const isOwnListing = Number(listing.sellerId) === Number(user?.organizationId) || Number(listing.sellerId) === Number(user?.id);

                        return (
                            <div key={listing.id} style={{
                                backgroundColor: 'white',
                                borderRadius: '16px',
                                padding: '1.5rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '1rem',
                                border: '1px solid #e2e8f0'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                    <div>
                                        <div style={{ fontWeight: '700', fontSize: '1.25rem', color: '#1e293b' }}>
                                            Credit #{listing.creditId}
                                        </div>
                                        <div style={{ color: '#64748b', fontSize: '0.875rem' }}>Listing #{listing.id}</div>
                                    </div>
                                    <div style={{ backgroundColor: '#e8f5e9', color: '#2e7d32', padding: '4px 12px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.1rem' }}>
                                        ${listing.pricePerUnit} <span style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>/ tCO₂e</span>
                                    </div>
                                </div>

                                <div style={{ fontSize: '0.9rem', color: '#475569', backgroundColor: '#f8fafc', padding: '0.75rem', borderRadius: '8px' }}>
                                    <strong>Seller ID:</strong> {listing.sellerId}
                                </div>

                                <button
                                    onClick={() => handleBuy(listing.id, listing.pricePerUnit)}
                                    disabled={buyLoading === listing.id || isOwnListing}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: isOwnListing ? '#cbd5e1' : '#1565c0',
                                        color: isOwnListing ? '#64748b' : 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        cursor: (buyLoading === listing.id || isOwnListing) ? 'not-allowed' : 'pointer',
                                        fontWeight: '600',
                                        marginTop: 'auto',
                                        transition: 'background-color 0.2s'
                                    }}
                                >
                                    {isOwnListing
                                        ? "Your Listing"
                                        : (buyLoading === listing.id ? 'Processing...' : 'Buy Now')}
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Marketplace;
