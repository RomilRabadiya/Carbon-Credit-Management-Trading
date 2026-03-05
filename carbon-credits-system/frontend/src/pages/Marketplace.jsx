import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';

const Marketplace = ({ user }) => {
    const [listings, setListings] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [buyLoading, setBuyLoading] = useState(null);

    const fetchListings = async () => {
        setLoading(true);
        setError(null);
        try {
            // Use the API Gateway route (port 8080 captures /api/trading/**)
            const res = await apiClient.get('/trading/listings', {
                headers: { 'X-User-Id': user?.id?.toString() || "" }
            });
            setListings(res.data);
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Failed to load listings');
            toast.error('Failed to load listings');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchListings();
    }, []);

    const handleBuy = async (listingId, price) => {
        if (!user || (!user.organizationId && !user.id)) {
            toast.error('You must be logged in and part of an organization to buy credits.');
            return;
        }

        if (window.confirm(`Are you sure you want to buy this credit for $${price}?`)) {
            setBuyLoading(listingId);
            try {
                const res = await apiClient.post('/trading/buy',
                    { listingId: listingId.toString() },
                    { headers: { 'X-User-Id': user?.id?.toString() || "" } }
                );

                toast.success(`Successfully purchased credit from listing #${listingId}!`);
                fetchListings(); // Refresh the listings
            } catch (e) {
                toast.error(e.response?.data?.message || e.response?.data?.error || e.message || `Purchase failed`);
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
            toast.warning("Invalid amount.");
            return;
        }

        const userId = user?.id;
        if (!userId) {
            toast.error("User ID missing. Please log in.");
            return;
        }

        try {
            await apiClient.post(`/users/${userId}/balance/add`, amount, {
                headers: { 'Content-Type': 'application/json' }
            });
            toast.success(`Successfully added $${amount} to your wallet!`);
        } catch (e) {
            toast.error(e.response?.data?.message || `Failed to add balance`);
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
