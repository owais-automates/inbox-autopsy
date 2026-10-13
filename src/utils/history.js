/**
 * History Management - localStorage persistence for recent analyses.
 * Stores up to 5 most recent analyses with deduplication.
 */

const STORAGE_KEY = 'inbox-autopsy-history';
const MAX_HISTORY = 5;

/**
 * Save an analysis to history
 * @param {Object} analysis - The analysis result
 * @param {string} emailText - The original email text
 * @returns {Array} Updated history
 */
export function saveToHistory(analysis, emailText) {
  if (!analysis || !emailText?.trim()) return getHistory();

  try {
    const history = getHistory();
    const newEntry = {
      id: Date.now().toString(),
      emailText: emailText.trim(),
      scores: analysis.scores,
      meta: analysis.meta,
      preview: emailText.trim().slice(0, 60).replace(/\n/g, ' ') + (emailText.length > 60 ? '…' : ''),
      timestamp: new Date().toISOString(),
    };

    // Deduplicate: remove consecutive entries with identical email text
    const filtered = history.filter(entry => entry.emailText !== newEntry.emailText);

    // Add new entry at the beginning
    const updated = [newEntry, ...filtered].slice(0, MAX_HISTORY);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    // localStorage unavailable (private browsing, quota exceeded, etc.)
    console.warn('Failed to save history:', e);
    return getHistory();
  }
}

/**
 * Get history from localStorage
 * @returns {Array} History entries (most recent first)
 */
export function getHistory() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return [];
    // Validate each entry has required fields
    return parsed.filter(entry =>
      entry && typeof entry === 'object' &&
      typeof entry.id === 'string' &&
      typeof entry.emailText === 'string' &&
      entry.scores &&
      entry.meta &&
      entry.timestamp
    );
  } catch (e) {
    console.warn('Failed to load history:', e);
    return [];
  }
}

/**
 * Clear all history
 */
export function clearHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return [];
  } catch (e) {
    console.warn('Failed to clear history:', e);
    return getHistory();
  }
}

/**
 * Remove a specific entry from history
 * @param {string} id - History entry ID
 * @returns {Array} Updated history
 */
export function removeFromHistory(id) {
  try {
    const history = getHistory();
    const updated = history.filter(entry => entry.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to remove history entry:', e);
    return getHistory();
  }
}

/**
 * Restore an analysis from history
 * @param {string} id - History entry ID
 * @returns {Object|null} { emailText, analysis } or null if not found
 */
export function restoreFromHistory(id) {
  try {
    const history = getHistory();
    const entry = history.find(e => e.id === id);
    if (!entry) return null;

    // Reconstruct a minimal analysis object for display
    // Provide empty arrays for each category to match expected structure
    const emptyExplanations = {
      clarity: '',
      relevance: '',
      credibility: '',
      actionability: '',
    };
    const emptySuggestions = {
      clarity: [],
      relevance: [],
      credibility: [],
      actionability: [],
    };
    const analysis = {
      scores: entry.scores,
      explanations: emptyExplanations,
      suggestions: emptySuggestions,
      meta: entry.meta,
    };
    return { emailText: entry.emailText, analysis };
  } catch (e) {
    console.warn('Failed to restore from history:', e);
    return null;
  }
}