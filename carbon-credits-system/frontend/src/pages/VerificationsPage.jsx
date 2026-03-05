import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';

const VerificationsPage = ({ user, userRole }) => {
    const [verifications, setVerifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For approve/reject modal
    const [actionModal, setActionModal] = useState(null); // { id, action: 'approve'|'reject' }
    const [remarks, setRemarks] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    const isVerifier = userRole === 'VERIFIER' || userRole === 'ADMIN';
    const isOrg = userRole === 'ORGANIZATION' || userRole === 'ADMIN';

    const fetchVerifications = async () => {
        setLoading(true);
        setError(null);
        try {
            let url = `/verifications`;
            // Organizations only see their own; verifiers see all
            if (isOrg && !isVerifier && user?.organizationId) {
                url = `/verifications/organization/${user.organizationId}`;
            }
            const res = await apiClient.get(url);
            setVerifications(Array.isArray(res.data) ? res.data : []);
        } catch (e) {
            setError(e.response?.data?.message || e.message || 'Failed to load verifications');
            toast.error('Failed to load verifications');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchVerifications(); }, [user, userRole]);

    const handleAction = async () => {
        const { id, action } = actionModal;
        setActionLoading(true);
        try {
            const method = action === 'approve' ? 'put' : 'post';
            await apiClient[method](`/verifications/${id}/${action}`, {
                remarks: remarks || (action === 'approve' ? 'Approved' : 'Rejected')
            });

            toast.success(`Verification #${id} ${action}d successfully!`);
            setActionModal(null);
            setRemarks('');
            fetchVerifications();
        } catch (e) {
            toast.error(e.response?.data?.message || e.message || `Action failed`);
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
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 min-h-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 m-0">
                    {isVerifier ? '🔍 All Verifications' : '📋 My Verifications'}
                </h2>
                <button
                    onClick={fetchVerifications}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors border-none cursor-pointer flex items-center gap-2 shadow-sm"
                >
                    🔄 Refresh
                </button>
            </div>

            {!isVerifier && !isOrg && (
                <div className="px-4 py-3 mb-4 bg-orange-50 border border-orange-200 text-orange-700 rounded-lg flex items-center shadow-sm">
                    ⚠️ You need an ORGANIZATION or VERIFIER role to access verifications.
                </div>
            )}

            {error && (
                <div className="px-4 py-3 mb-6 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center shadow-sm">
                    ⚠️ {error}
                </div>
            )}

            {loading ? (
                <div className="text-center p-12 text-gray-500 animate-pulse">Loading verifications...</div>
            ) : verifications.length === 0 && !error ? (
                <div className="text-center p-12 text-gray-500 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col items-center justify-center">
                    <div className="text-5xl mb-4 opacity-50">📄</div>
                    <p className="text-lg font-medium">No verification requests found.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {verifications.map(v => {
                        const borderColorMap = {
                            PENDING: 'border-yellow-500',
                            APPROVED: 'border-green-600',
                            REJECTED: 'border-red-600'
                        };
                        const bgColorMap = {
                            PENDING: 'bg-yellow-500',
                            APPROVED: 'bg-green-600',
                            REJECTED: 'bg-red-600'
                        };
                        const activeBorderColor = borderColorMap[v.status] || 'border-gray-400';
                        const activeBgColor = bgColorMap[v.status] || 'bg-gray-500';

                        return (
                            <div key={v.id} className={`bg-white rounded-xl p-5 shadow-sm border border-gray-100 border-l-4 ${activeBorderColor} hover:shadow-md transition-shadow`}>
                                <div className="flex justify-between flex-wrap gap-4">
                                    <div className="space-y-1">
                                        <div className="font-bold text-gray-900 text-lg">
                                            Verification #{v.id}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            Report ID: <strong className="text-gray-700">{v.reportId}</strong> <span className="mx-2 text-gray-300">|</span>
                                            Org ID: <strong className="text-gray-700">{v.organizationId}</strong>
                                        </div>
                                        {v.carbonCreditsCalculated && (
                                            <div className="text-sm text-gray-500 mt-1">
                                                Credits Calculated: <strong className="text-blue-600">{v.carbonCreditsCalculated} tCO₂e</strong>
                                            </div>
                                        )}
                                        {v.remarks && (
                                            <div className="text-sm text-gray-500 italic mt-2 bg-gray-50 p-2 rounded border border-gray-100">
                                                Remarks: {v.remarks}
                                            </div>
                                        )}
                                        <div className="text-xs text-gray-400 mt-2">
                                            Submitted: {v.createdAt ? new Date(v.createdAt).toLocaleDateString() : 'N/A'}
                                            {v.verifiedAt && ` | Verified: ${new Date(v.verifiedAt).toLocaleDateString()}`}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 self-start md:self-center">
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold text-white shadow-sm ${activeBgColor}`}>
                                            {v.status}
                                        </span>
                                        {isVerifier && v.status === 'PENDING' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setActionModal({ id: v.id, action: 'approve' })}
                                                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white border-none rounded-lg cursor-pointer text-sm font-medium shadow-sm transition-colors flex items-center gap-1 active:scale-95"
                                                >
                                                    ✅ Approve
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ id: v.id, action: 'reject' })}
                                                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg cursor-pointer text-sm font-medium shadow-sm transition-colors flex items-center gap-1 active:scale-95"
                                                >
                                                    ❌ Reject
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Approve/Reject Modal */}
            {actionModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white p-8 rounded-2xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-gray-900 mb-2 capitalize flex items-center gap-2">
                            {actionModal.action === 'approve' ? '✅' : '❌'} {actionModal.action} Verification #{actionModal.id}
                        </h3>
                        <p className="text-gray-500 text-sm mb-6">Please provide a reason or remarks for this action.</p>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Remarks (optional)</label>
                            <textarea
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                                placeholder={`Reason for ${actionModal.action}...`}
                                rows={4}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:border-transparent outline-none resize-none transition-shadow ${actionModal.action === 'approve' ? 'focus:ring-green-500' : 'focus:ring-red-500'}"
                            />
                        </div>
                        <div className="flex gap-3 pt-2">
                            <button
                                onClick={() => setActionModal(null)}
                                className="flex-1 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium cursor-pointer transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAction}
                                disabled={actionLoading}
                                className={`flex-1 px-4 py-2.5 text-white border-none rounded-xl cursor-pointer font-medium shadow-sm flex items-center justify-center transition-colors
                                    ${actionModal.action === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                                    ${actionLoading ? 'opacity-70 cursor-wait' : ''}
                                `}
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
