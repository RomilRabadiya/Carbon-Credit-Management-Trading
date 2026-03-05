import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';

const CreditsPage = ({ user }) => {
    const [credits, setCredits] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For retire modal
    const [retireModal, setRetireModal] = useState(null); // creditId being retired
    const [beneficiary, setBeneficiary] = useState('');
    const [reason, setReason] = useState('');
    const [retireLoading, setRetireLoading] = useState(false);

    // For list modal
    const [listModal, setListModal] = useState(null); // creditId being listed
    const [listPrice, setListPrice] = useState('');
    const [listLoading, setListLoading] = useState(false);

    const fetchCredits = async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiClient.get('/credits/me');
            setCredits(res.data?.credits || res.data || []);
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Failed to load credits');
            toast.error('Failed to load credits');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCredits();
    }, [user]);

    const handleRetire = async () => {
        if (!beneficiary || !reason) {
            toast.error('Beneficiary and reason are required.');
            return;
        }
        setRetireLoading(true);
        try {
            await apiClient.post(`/trading/retire/${retireModal}`,
                { beneficiary, reason },
                { headers: { 'X-User-Id': user?.id?.toString() || "" } }
            );

            toast.success('Credit retired successfully!');
            setRetireModal(null);
            setBeneficiary('');
            setReason('');
            fetchCredits();
        } catch (e) {
            toast.error(e.response?.data?.message || e.message || 'Failed to retire credit');
        } finally {
            setRetireLoading(false);
        }
    };

    const handleList = async () => {
        if (!listPrice || isNaN(listPrice) || Number(listPrice) <= 0) {
            toast.error('Please enter a valid positive price.');
            return;
        }
        setListLoading(true);
        try {
            await apiClient.post('/trading/list',
                { creditId: listModal, price: Number(listPrice) },
                { headers: { 'X-User-Id': user?.id?.toString() || "" } }
            );

            toast.success('Credit successfully listed for sale!');
            setListModal(null);
            setListPrice('');
            fetchCredits();
        } catch (e) {
            toast.error(e.response?.data?.message || e.message || 'Listing failed');
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">My Carbon Credits</h2>
                <button
                    onClick={fetchCredits}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors border-none cursor-pointer flex items-center gap-2 shadow-sm"
                >
                    🔄 Refresh
                </button>
            </div>

            {error && (
                <div className="px-4 py-3 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center shadow-sm">
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="text-center p-12 text-gray-500 animate-pulse">Loading credits...</div>
            ) : credits.length === 0 && !error ? (
                <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 opacity-50">🌿</div>
                    <p className="text-lg font-medium mb-1">No credits found for your organization.</p>
                    <p className="text-sm text-gray-400">Credits are issued after a verification is approved.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {credits.map(credit => (
                        <div key={credit.id} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex justify-between items-center flex-wrap gap-4 hover:shadow-md transition-shadow">
                            <div className="space-y-1">
                                <div className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                    Credit #{credit.id} <span className="text-gray-300 font-normal">—</span> <span className="font-mono text-sm text-gray-500 bg-gray-50 px-2 py-0.5 rounded">{credit.serialNumber || 'N/A'}</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    Amount: <strong className="text-gray-700">{credit.amount}</strong> tCO₂e
                                    <span className="mx-2 text-gray-300">|</span>
                                    Project: <strong className="text-gray-700">{credit.projectType || 'N/A'}</strong>
                                </div>
                                <div className="text-xs text-gray-400 mt-2">
                                    Issued: {credit.issuedAt ? new Date(credit.issuedAt).toLocaleDateString() : 'N/A'}
                                    <span className="mx-2 text-gray-300">|</span>
                                    Expires: {credit.expiryDate ? new Date(credit.expiryDate).toLocaleDateString() : 'N/A'}
                                </div>
                            </div>
                            <div className="flex items-center gap-4 self-start sm:self-center">
                                <span className={`px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm ${credit.status === 'ACTIVE' ? 'bg-green-600' :
                                        credit.status === 'LISTED' ? 'bg-blue-600' :
                                            credit.status === 'SOLD' ? 'bg-purple-600' :
                                                credit.status === 'RETIRED' ? 'bg-red-600' : 'bg-gray-500'
                                    }`}>
                                    {credit.status}
                                </span>
                                {credit.status === 'ACTIVE' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setListModal(credit.id)}
                                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-lg cursor-pointer text-sm font-medium shadow-sm transition-colors"
                                        >
                                            List for Sale
                                        </button>
                                        <button
                                            onClick={() => setRetireModal(credit.id)}
                                            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg cursor-pointer text-sm font-medium shadow-sm transition-colors"
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
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Retire Credit #{retireModal}</h3>
                        <p className="text-gray-500 text-sm mb-6">This action is permanent and cannot be undone.</p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Beneficiary</label>
                            <input
                                type="text"
                                value={beneficiary}
                                onChange={e => setBeneficiary(e.target.value)}
                                placeholder="e.g. GreenFuture NGO"
                                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-shadow"
                            />
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason</label>
                            <textarea
                                value={reason}
                                onChange={e => setReason(e.target.value)}
                                placeholder="e.g. Offsetting 2024 emissions"
                                rows={3}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none resize-none transition-shadow"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setRetireModal(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRetire}
                                disabled={retireLoading}
                                className={`flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-xl cursor-pointer font-medium shadow-sm flex items-center justify-center transition-colors ${retireLoading ? 'opacity-70 cursor-wait' : ''}`}
                            >
                                {retireLoading ? 'Retiring...' : 'Confirm Retire'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* List for Sale Modal */}
            {listModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">List Credit #{listModal} for Sale</h3>
                        <p className="text-gray-500 text-sm mb-6">Enter the price per tonne of CO₂e for this credit.</p>

                        <div className="mb-6 relative">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price ($ USD)</label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={listPrice}
                                    onChange={e => setListPrice(e.target.value)}
                                    placeholder="50.00"
                                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-shadow"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => { setListModal(null); setListPrice(''); }}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleList}
                                disabled={listLoading}
                                className={`flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white border-none rounded-xl cursor-pointer font-medium shadow-sm flex items-center justify-center transition-colors ${listLoading ? 'opacity-70 cursor-wait' : ''}`}
                            >
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
