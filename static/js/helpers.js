/**
 * Hackpixel - Pure Helper Functions
 * Factored out for standalone testability: sorting, filtering, and safe localStorage management.
 */

const STORAGE_KEY = "hackIdeas.recent";
const MAX_RECENT_ENTRIES = 5;

/**
 * Filters an array of idea cards by technology stack substring.
 * @param {Array} ideas - Array of idea card objects.
 * @param {string} query - Case-insensitive tech search term.
 * @returns {Array} Filtered idea cards.
 */
function filterIdeasByStack(ideas, query) {
  if (!Array.isArray(ideas)) return [];
  const cleanQuery = (query || "").trim().toLowerCase();
  if (!cleanQuery) return [...ideas];

  return ideas.filter((idea) => {
    if (!idea || !Array.isArray(idea.stack)) return false;
    return idea.stack.some((tech) =>
      typeof tech === "string" && tech.toLowerCase().includes(cleanQuery)
    );
  });
}

/**
 * Sorts ideas by either total_score (descending) or estimated_hours (ascending).
 * @param {Array} ideas - Array of idea card objects.
 * @param {string} sortMode - 'score_desc' | 'hours_asc'
 * @returns {Array} A new sorted array (non-mutating).
 */
function sortIdeas(ideas, sortMode = "score_desc") {
  if (!Array.isArray(ideas)) return [];
  const copy = [...ideas];

  copy.sort((a, b) => {
    const scoreA = typeof a.total_score === "number" ? a.total_score : 0;
    const scoreB = typeof b.total_score === "number" ? b.total_score : 0;
    const hoursA = typeof a.estimated_hours === "number" ? a.estimated_hours : 0;
    const hoursB = typeof b.estimated_hours === "number" ? b.estimated_hours : 0;

    if (sortMode === "hours_asc") {
      return hoursA - hoursB;
    }
    // Default: 'score_desc' (highest score first)
    return scoreB - scoreA;
  });

  return copy;
}

/**
 * Safely reads recent ideas from localStorage with try/catch guard.
 * @param {string} key - localStorage key
 * @returns {Array} Array of stored idea summaries, or empty array on error/absence.
 */
function getRecentIdeas(key = STORAGE_KEY) {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.warn("Malformed data in localStorage for key:", key);
      return [];
    }
    return parsed;
  } catch (err) {
    console.warn("Failed to read recent ideas from localStorage:", err);
    return [];
  }
}

/**
 * Prepends a new entry to recent ideas and caps the list to MAX_RECENT_ENTRIES.
 * Stores strictly the form input, top idea title, score, and timestamp.
 * @param {Object} entry - { formInput, topIdeaTitle, topIdeaScore, date }
 * @param {string} key - localStorage key
 * @param {number} max - Maximum entries to keep
 * @returns {Array} Updated array of recent entries
 */
function saveRecentIdea(entry, key = STORAGE_KEY, max = MAX_RECENT_ENTRIES) {
  try {
    if (typeof window === "undefined" || !window.localStorage) {
      return [];
    }
    const existing = getRecentIdeas(key);
    const sanitizedEntry = {
      date: entry.date || new Date().toLocaleString(),
      formInput: {
        hours_remaining: entry.formInput.hours_remaining,
        theme: entry.formInput.theme || null,
        team_size: entry.formInput.team_size,
        skill_level: entry.formInput.skill_level,
        preferred_stack: entry.formInput.preferred_stack || [],
        tone: entry.formInput.tone,
        demo_style: entry.formInput.demo_style,
        risk_appetite: entry.formInput.risk_appetite,
      },
      topIdeaTitle: entry.topIdeaTitle || "Untitled Project",
      topIdeaScore: typeof entry.topIdeaScore === "number" ? entry.topIdeaScore : null,
    };

    const updated = [sanitizedEntry, ...existing].slice(0, max);
    window.localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  } catch (err) {
    console.warn("Failed to save recent idea to localStorage:", err);
    return [];
  }
}

/**
 * Clears all recent entries from localStorage.
 * @param {string} key - localStorage key
 * @returns {boolean} Success status
 */
function clearRecentIdeas(key = STORAGE_KEY) {
  try {
    if (typeof window !== "undefined" && window.localStorage) {
      window.localStorage.removeItem(key);
    }
    return true;
  } catch (err) {
    console.warn("Failed to clear recent ideas from localStorage:", err);
    return false;
  }
}

/**
 * Paginates an array of items.
 * @param {Array} items - Array of items to paginate.
 * @param {number} page - Current 1-based page index.
 * @param {number} pageSize - Number of items per page.
 * @returns {Object} { pageItems, currentPage, totalPages, totalItems, startIndex, endIndex }
 */
function paginate(items, page = 1, pageSize = 3) {
  if (!Array.isArray(items)) {
    return { pageItems: [], currentPage: 1, totalPages: 1, totalItems: 0, startIndex: 0, endIndex: 0 };
  }
  const totalItems = items.length;
  const size = Math.max(1, parseInt(pageSize, 10) || 3);
  const totalPages = Math.max(1, Math.ceil(totalItems / size));
  const validPage = Math.min(Math.max(1, parseInt(page, 10) || 1), totalPages);
  const startIndex = (validPage - 1) * size;
  const endIndex = Math.min(startIndex + size, totalItems);
  const pageItems = items.slice(startIndex, endIndex);

  return {
    pageItems,
    currentPage: validPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
  };
}

// Export for Node/testing environments if available, otherwise attach to window
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    filterIdeasByStack,
    sortIdeas,
    paginate,
    getRecentIdeas,
    saveRecentIdea,
    clearRecentIdeas,
    STORAGE_KEY,
    MAX_RECENT_ENTRIES,
  };
} else if (typeof window !== "undefined") {
  window.HackpixelHelpers = {
    filterIdeasByStack,
    sortIdeas,
    paginate,
    getRecentIdeas,
    saveRecentIdea,
    clearRecentIdeas,
    STORAGE_KEY,
    MAX_RECENT_ENTRIES,
  };
}
