/**
 * Search Debug Utility (DISABLED)
 * 
 * This is a placeholder version with all debugging functionality disabled.
 */

// Dummy functions that do nothing
export const markUserInitiatedRequest = () => {
  // Function intentionally left empty
};

export const trackStateChange = (component, stateName, value) => {
  // Function intentionally left empty
  return {};
};

export const initSearchDebug = () => {
  // Function intentionally left empty
};

export const isSearchAllowed = () => true;

export default {
  markUserInitiatedRequest,
  trackStateChange,
  isSearchAllowed
}; 