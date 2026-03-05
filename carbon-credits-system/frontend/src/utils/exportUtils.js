/**
 * Utilities for exporting data to various formats
 */

/**
 * Download a blob as a file
 * @param {Blob} blob - The blob data to download
 * @param {string} filename - The name of the file to save as
 */
export const downloadFile = (blob, filename) => {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
};

/**
 * Export data to CSV format and download it
 * @param {Array} data - Array of transaction objects
 * @param {string} filename - Optional filename
 */
export const exportToCSV = (data, filename = `audit-ledger-${new Date().toISOString().split('T')[0]}.csv`) => {
    if (!data || data.length === 0) return;

    const headers = ['Date', 'Type', 'Credit ID', 'Seller ID', 'Buyer ID', 'Amount', 'Price', 'Total', 'Status'];
    const rows = data.map(tx => [
        new Date(tx.transactionDate).toLocaleDateString(),
        tx.transactionType,
        tx.creditId,
        tx.sellerId,
        tx.buyerId || '',
        tx.creditAmount,
        tx.pricePerUnit || 0,
        (tx.totalAmount || (tx.creditAmount * (tx.pricePerUnit || 0))).toFixed(2),
        tx.status,
    ]);

    const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    downloadFile(blob, filename);
};

/**
 * Export data to JSON format and download it
 * @param {Array} data - Array of objects
 * @param {string} filename - Optional filename
 */
export const exportToJSON = (data, filename = `audit-ledger-${new Date().toISOString().split('T')[0]}.json`) => {
    if (!data || data.length === 0) return;

    const jsonContent = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonContent], { type: 'application/json' });
    downloadFile(blob, filename);
};
