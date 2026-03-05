import React, { useState } from 'react';
import { toast } from 'react-toastify';
import apiClient from '../api/client';

const EmissionReportForm = ({ currentUser }) => {
    const [projectId, setProjectId] = useState('');
    const [projectType, setProjectType] = useState('REFORESTATION');
    const [areaHectares, setAreaHectares] = useState('');
    const [volumeM3, setVolumeM3] = useState('');
    const [evidenceUrl, setEvidenceUrl] = useState('');
    const [latitude, setLatitude] = useState('');
    const [longitude, setLongitude] = useState('');

    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Basic Validation
        if (!currentUser?.id) {
            toast.error("Your profile does not have a User ID! Please login again.");
            setLoading(false);
            return;
        }

        try {
            // Include userId directly from currentUser
            const payload = {
                projectId: projectId ? parseInt(projectId) : null,
                userId: currentUser.id,
                projectType,
                areaHectares: projectType === 'REFORESTATION' ? parseFloat(areaHectares) : null,
                volumeM3: projectType === 'METHANE_CAPTURE' ? parseFloat(volumeM3) : null,
                evidenceUrl,
                latitude: latitude ? parseFloat(latitude) : null,
                longitude: longitude ? parseFloat(longitude) : null
            };

            const response = await apiClient.post('/emissions', payload);
            const data = response.data;

            toast.success(`Report Submitted Successfully! Report ID: ${data.id}, Status: ${data.status}`);

            // Clear form
            setProjectId('');
            setAreaHectares('');
            setVolumeM3('');
            setEvidenceUrl('');
            setLatitude('');
            setLongitude('');

        } catch (error) {
            toast.error(error.response?.data?.message || error.message || 'Failed to submit report.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 max-w-2xl mx-auto w-full">
            <h2 className="text-2xl font-bold text-gray-900 m-0 mb-6">Submit Emission Report</h2>

            <div className="mb-6 px-4 py-3 bg-green-50 text-green-800 border border-green-200 rounded-lg text-sm flex items-center gap-2">
                <strong className="font-semibold">User ID:</strong> {currentUser?.id || 'Not Set'}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                    <input
                        type="number"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                        placeholder="e.g., 101"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
                    <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                    >
                        <option value="REFORESTATION">Reforestation</option>
                        <option value="METHANE_CAPTURE">Methane Capture</option>
                    </select>
                </div>

                {projectType === 'REFORESTATION' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Area (Hectares) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            value={areaHectares}
                            onChange={(e) => setAreaHectares(e.target.value)}
                            required
                            placeholder="Amount in hectares"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                        />
                    </div>
                )}

                {projectType === 'METHANE_CAPTURE' && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Volume (M³) <span className="text-red-500">*</span></label>
                        <input
                            type="number"
                            step="0.01"
                            value={volumeM3}
                            onChange={(e) => setVolumeM3(e.target.value)}
                            required
                            placeholder="Volume captured in Cubic Meters"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                        />
                    </div>
                )}

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monitoring Evidence URL</label>
                    <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        placeholder="https://..."
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            placeholder="e.g., 34.0522"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                        />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            placeholder="e.g., -118.2437"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-shadow bg-white text-gray-900"
                        />
                    </div>
                </div>

                <div className="pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition-all shadow-sm ${loading ? 'bg-green-500/70 cursor-wait' : 'bg-green-600 hover:bg-green-700 cursor-pointer active:scale-[0.99] hover:shadow-md'
                            }`}
                    >
                        {loading ? 'Submitting...' : 'Submit Report'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EmissionReportForm;
