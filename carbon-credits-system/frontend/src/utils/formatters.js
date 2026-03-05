/**
 * Data formatting utilities
 */

/**
 * Format a date string or object to a readable local date
 * @param {string|Date} date - Date to format
 * @param {boolean} includeTime - Whether to include time in the output
 */
export const formatDate = (date, includeTime = false) => {
    if (!date) return '-';
    const d = new Date(date);
    if (isNaN(d.getTime())) return '-';

    if (includeTime) {
        return d.toLocaleString();
    }
    return d.toLocaleDateString();
};

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency symbol (default: $)
 */
export const formatCurrency = (amount, currency = '$') => {
    const val = Number(amount) || 0;
    return `${currency}${val.toFixed(2)}`;
};

/**
 * Format credit units
 * @param {number} units - Number of units
 */
export const formatUnits = (units) => {
    const val = Number(units) || 0;
    return `${val.toLocaleString()} units`;
};

/**
 * Capitalize first letter of a string
 * @param {string} str - String to capitalize
 */
export const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};
