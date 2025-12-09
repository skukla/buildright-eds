/**
 * Live Search Service
 * Provides typeahead/autocomplete functionality using the catalog service
 * 
 * Similar to citisignal-nextjs useSearchSuggestions hook but adapted for vanilla JS
 */

import { catalogService } from './catalog-service.js';

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  minChars: 2,           // Minimum characters before searching
  debounceMs: 300,       // Debounce delay in milliseconds
  maxSuggestions: 5,     // Maximum number of suggestions to show
  cacheTimeMs: 30000,    // Cache results for 30 seconds
};

// ============================================
// CACHE
// ============================================

const searchCache = new Map();

function getCachedResults(phrase) {
  const cached = searchCache.get(phrase.toLowerCase());
  if (cached && Date.now() - cached.timestamp < CONFIG.cacheTimeMs) {
    return cached.results;
  }
  return null;
}

function setCachedResults(phrase, results) {
  searchCache.set(phrase.toLowerCase(), {
    results,
    timestamp: Date.now()
  });
  
  // Clean old cache entries (keep last 50)
  if (searchCache.size > 50) {
    const oldestKey = searchCache.keys().next().value;
    searchCache.delete(oldestKey);
  }
}

// ============================================
// DEBOUNCE
// ============================================

let debounceTimer = null;

function debounce(fn, delay) {
  return (...args) => {
    clearTimeout(debounceTimer);
    return new Promise((resolve) => {
      debounceTimer = setTimeout(async () => {
        const result = await fn(...args);
        resolve(result);
      }, delay);
    });
  };
}

// ============================================
// SEARCH FUNCTIONS
// ============================================

/**
 * Search for product suggestions
 * Uses catalogService.searchSuggestions when available (mesh),
 * falls back to searchProducts for mock data
 * 
 * @param {string} phrase - Search phrase
 * @returns {Promise<Array>} Array of product suggestions
 */
async function searchSuggestions(phrase) {
  if (!phrase || phrase.length < CONFIG.minChars) {
    return [];
  }
  
  // Check cache first
  const cached = getCachedResults(phrase);
  if (cached) {
    console.log('[LiveSearch] Cache hit for:', phrase);
    return cached;
  }
  
  // Ensure catalog service is initialized
  if (!catalogService.isInitialized) {
    console.warn('[LiveSearch] Catalog service not initialized');
    return [];
  }
  
  try {
    console.log('[LiveSearch] Fetching suggestions for:', phrase);
    
    let suggestions = [];
    
    // Try dedicated searchSuggestions first (uses mesh when available)
    try {
      const result = await catalogService.searchSuggestions(phrase);
      
      if (result.suggestions?.length > 0) {
        suggestions = result.suggestions.map(item => ({
          id: item.sku,
          sku: item.sku,
          name: item.name,
          price: item.price ? parseFloat(item.price) : null,
          image: item.image || null,
          category: null,
          url: `${window.BASE_PATH || '/'}pages/product-detail.html?sku=${item.sku}`
        }));
      }
    } catch (suggestError) {
      console.warn('[LiveSearch] searchSuggestions failed, falling back to searchProducts:', suggestError.message);
      
      // Fallback to regular search
      const result = await catalogService.searchProducts(phrase, {
        pageSize: CONFIG.maxSuggestions,
        currentPage: 1
      });
      
      suggestions = (result.items || []).map(item => ({
        id: item.sku,
        sku: item.sku,
        name: item.name,
        price: item.price?.value || item.price || null,
        image: item.imageUrl || item.image || null,
        category: item.category || null,
        url: `${window.BASE_PATH || '/'}pages/product-detail.html?sku=${item.sku}`
      }));
    }
    
    // Cache results
    setCachedResults(phrase, suggestions);
    
    return suggestions;
  } catch (error) {
    console.error('[LiveSearch] Error fetching suggestions:', error);
    return [];
  }
}

// Debounced version
const debouncedSearch = debounce(searchSuggestions, CONFIG.debounceMs);

// ============================================
// LIVE SEARCH SERVICE
// ============================================

class LiveSearchService {
  constructor() {
    this.listeners = new Set();
    this.currentQuery = '';
    this.isSearching = false;
    this.suggestions = [];
  }
  
  /**
   * Subscribe to search updates
   * @param {Function} callback - Called with { query, suggestions, isSearching }
   * @returns {Function} Unsubscribe function
   */
  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }
  
  /**
   * Notify all listeners of state change
   */
  notify() {
    const state = {
      query: this.currentQuery,
      suggestions: this.suggestions,
      isSearching: this.isSearching
    };
    this.listeners.forEach(callback => callback(state));
  }
  
  /**
   * Perform a search
   * @param {string} query - Search query
   */
  async search(query) {
    this.currentQuery = query;
    
    if (!query || query.length < CONFIG.minChars) {
      this.suggestions = [];
      this.isSearching = false;
      this.notify();
      return;
    }
    
    this.isSearching = true;
    this.notify();
    
    try {
      this.suggestions = await debouncedSearch(query);
    } catch (error) {
      console.error('[LiveSearch] Search error:', error);
      this.suggestions = [];
    }
    
    this.isSearching = false;
    this.notify();
  }
  
  /**
   * Clear search state
   */
  clear() {
    this.currentQuery = '';
    this.suggestions = [];
    this.isSearching = false;
    this.notify();
  }
  
  /**
   * Get current state
   */
  getState() {
    return {
      query: this.currentQuery,
      suggestions: this.suggestions,
      isSearching: this.isSearching
    };
  }
}

// ============================================
// SINGLETON EXPORT
// ============================================

export const liveSearchService = new LiveSearchService();

export {
  searchSuggestions,
  debouncedSearch,
  CONFIG as LIVE_SEARCH_CONFIG
};

export default liveSearchService;

