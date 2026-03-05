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
        <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', border: '1px solid #ccc', borderRadius: '8px', backgroundColor: '#fff' }}>
            <h2>Submit Emission Report</h2>

            <div style={{ marginBottom: '15px', padding: '10px', backgroundColor: '#e2f0d9', borderRadius: '4px' }}>
                <strong>User ID:</strong> {currentUser?.id || 'Not Set'}
            </div>

            <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Project ID:</label>
                    <input
                        type="number"
                        value={projectId}
                        onChange={(e) => setProjectId(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Project Type:</label>
                    <select
                        value={projectType}
                        onChange={(e) => setProjectType(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    >
                        <option value="REFORESTATION">Reforestation</option>
                        <option value="METHANE_CAPTURE">Methane Capture</option>
                    </select>
                </div>

                {projectType === 'REFORESTATION' && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Area (Hectares):</label>
                        <input
                            type="number"
                            step="0.01"
                            value={areaHectares}
                            onChange={(e) => setAreaHectares(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                )}

                {projectType === 'METHANE_CAPTURE' && (
                    <div style={{ marginBottom: '15px' }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Volume (M3):</label>
                        <input
                            type="number"
                            step="0.01"
                            value={volumeM3}
                            onChange={(e) => setVolumeM3(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                )}

                <div style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Monitoring Evidence URL:</label>
                    <input
                        type="url"
                        value={evidenceUrl}
                        onChange={(e) => setEvidenceUrl(e.target.value)}
                        style={{ width: '100%', padding: '8px' }}
                    />
                </div>

                <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Latitude:</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={latitude}
                            onChange={(e) => setLatitude(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '5px' }}>Longitude:</label>
                        <input
                            type="number"
                            step="0.000001"
                            value={longitude}
                            onChange={(e) => setLongitude(e.target.value)}
                            style={{ width: '100%', padding: '8px' }}
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '10px 15px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer'
                    }}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
        </div>
    );
};

export default EmissionReportForm;
