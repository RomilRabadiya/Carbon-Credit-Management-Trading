import React, { useState } from 'react';
import { Download, FileText, FileCode, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { exportToCSV, exportToJSON } from '../../utils/exportUtils';

/**
 * Animated export button with format selection
 */
export const ExportButton = ({ data, loading }) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleExport = (format) => {
        if (!data || data.length === 0) {
            toast.warning('No transaction data to export.');
            return;
        }

        try {
            if (format === 'csv') {
                exportToCSV(data);
            } else if (format === 'json') {
                exportToJSON(data);
            }
            toast.success(`Succesfully exported as ${format.toUpperCase()}`);
        } catch (error) {
            console.error('Export failed:', error);
            toast.error('Failed to generate export file.');
        } finally {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                disabled={loading}
                className={`
                    flex items-center gap-3 px-5 py-2.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400
                    text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-green-200
                    active:scale-95 border-none cursor-pointer
                `}
            >
                <Download size={18} />
                <span>Export Ledger</span>
                <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <>
                    <div
                        className="fixed inset-0 z-10"
                        onClick={() => setIsOpen(false)}
                    ></div>
                    <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl z-20 py-2 animate-in fade-in slide-in-from-top-4 duration-200">
                        <p className="px-4 py-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 mb-1">
                            Select Format
                        </p>
                        <button
                            onClick={() => handleExport('csv')}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-700 transition-colors font-semibold text-sm"
                        >
                            <FileText size={18} className="text-blue-600" />
                            <span>Export as CSV</span>
                        </button>
                        <button
                            onClick={() => handleExport('json')}
                            className="w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 text-gray-700 transition-colors font-semibold text-sm"
                        >
                            <FileCode size={18} className="text-purple-600" />
                            <span>Export as JSON</span>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default ExportButton;
