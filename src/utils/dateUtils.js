/**
 * Utility functions for date formatting
 */

/**
 * Format a date as relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted relative time or "Unknown"
 */
export const getRelativeTime = (date) => {
  if (!date) return 'Unknown';
  
  const now = new Date();
  const updateDate = new Date(date);
  const diffMs = now - updateDate;
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffSecs < 60) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else if (diffDays < 30) {
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  } else {
    return updateDate.toLocaleDateString();
  }
};
