// dateUtils.js - Utility functions for date handling

/**
 * Format a date object to YYYY-MM-DD string
 * @param {Date} date - The date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return '';
  
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};

/**
 * Format a date string to a localized display format
 * @param {string|Date} dateInput - Date string or object to format
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date for display
 */
export const formatDateForDisplay = (dateInput, locale = 'en-US') => {
  if (!dateInput) return 'N/A';
  
  let date;
  if (typeof dateInput === 'string') {
    // Handle ISO date strings by extracting just the date part
    if (dateInput.includes('T')) {
      date = new Date(dateInput.split('T')[0] + 'T00:00:00');
    } else {
      date = new Date(dateInput + 'T00:00:00');
    }
  } else if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    return 'Invalid Date';
  }
  
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Get current date as YYYY-MM-DD string
 * @returns {string} Current date in YYYY-MM-DD format
 */
export const getCurrentDate = () => {
  return formatDate(new Date());
};

/**
 * Check if a date is today
 * @param {string|Date} dateInput - Date to check
 * @returns {boolean} True if date is today
 */
export const isToday = (dateInput) => {
  const today = formatDate(new Date());
  const checkDate = formatDate(new Date(dateInput));
  return today === checkDate;
};

/**
 * Add days to a date
 * @param {Date} date - Starting date
 * @param {number} days - Number of days to add
 * @returns {Date} New date
 */
export const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};