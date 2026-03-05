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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">Carbon Credit Marketplace</h2>
                <div className="flex gap-3">
                    <button
                        onClick={handleAddBalance}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors border-none cursor-pointer flex items-center gap-2"
                    >
                        💰 Add Funds
                    </button>
                    <button
                        onClick={fetchListings}
                        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors border-none cursor-pointer flex items-center gap-2"
                    >
                        🔄 Refresh
                    </button>
                </div>
            </div>

            {error && (
                <div className="px-4 py-3 mb-6 rounded-lg bg-red-50 text-red-700 border border-red-200 flex items-center gap-2">
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="text-center p-12 text-gray-500 animate-pulse">Loading active listings...</div>
            ) : listings.length === 0 && !error ? (
                <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 opacity-50">🛒</div>
                    <p className="text-lg font-medium">No active listings found in the marketplace.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {listings.map(listing => {
                        // Don't allow buying your own credits (UI fallback)
                        const isOwnListing = Number(listing.sellerId) === Number(user?.organizationId) || Number(listing.sellerId) === Number(user?.id);

                        return (
                            <div key={listing.id} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex flex-col gap-4 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start gap-4">
                                    <div className="min-w-0">
                                        <div className="font-bold text-xl text-gray-900 mb-1 truncate">
                                            Credit #{listing.creditId}
                                        </div>
                                        <div className="text-gray-500 text-sm truncate">Listing #{listing.id}</div>
                                    </div>
                                    <div className="shrink-0 bg-green-50 text-green-700 px-3 py-1 rounded-full font-bold text-lg whitespace-nowrap self-start">
                                        ${listing.pricePerUnit} <span className="text-xs font-normal">/ tCO₂e</span>
                                    </div>
                                </div>

                                <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100 break-all">
                                    <strong className="text-gray-900">Seller ID:</strong> {listing.sellerId}
                                </div>

                                <button
                                    onClick={() => handleBuy(listing.id, listing.pricePerUnit)}
                                    disabled={buyLoading === listing.id || isOwnListing}
                                    className={`w-full p-3 rounded-lg font-bold transition-colors mt-auto border-none select-none flex items-center justify-center ${isOwnListing
                                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer active:scale-[0.98]'
                                        } ${buyLoading === listing.id ? 'opacity-70 cursor-wait' : ''}`}
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
