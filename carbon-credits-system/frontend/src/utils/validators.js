/**
 * Input validation utilities
 */

/**
 * Validate date range
 * @param {Date} start - Start date
 * @param {Date} end - End date
 * @returns {boolean} - True if valid, false otherwise
 */
export const isValidDateRange = (start, end) => {
    if (!start || !end) return true;
    return new Date(start) <= new Date(end);
};

/**
 * Sanitize search input to prevent basic XSS or injection
 * @param {string} input - Search query
 * @returns {string} - Sanitized string
 */
export const sanitizeSearch = (input) => {
    if (!input) return '';
    return input.trim().replace(/[<>]/g, '');
};

/**
 * Check if a value is a valid numeric string or number
 * @param {any} val - Value to check
 */
export const isNumeric = (val) => {
    return !isNaN(parseFloat(val)) && isFinite(val);
};
