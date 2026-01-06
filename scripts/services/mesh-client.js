/**
 * BuildRight Mesh Client
 * 
 * Client for calling the BuildRight Service API Mesh.
 * Follows the pattern from citisignal-nextjs for consistency.
 * 
 * Architecture:
 * - For development: Can call mesh directly (CORS enabled)
 * - For production: Should use a proxy (App Builder action or edge worker)
 * 
 * Configuration:
 * - Mesh endpoint loaded from /config/env.json (EDS best practice)
 * - Config file can differ per branch for environment-specific endpoints
 * 
 * @module scripts/services/mesh-client
 */

import { getMeshEndpoint, getCommerceStoreCode } from '../site-config.js';
import * as queries from './queries.js';

// Re-export queries for backwards compatibility
export const QUERY_GET_PERSONA = queries.GET_PERSONA;
export const QUERY_GET_PERSONA_BY_ID = queries.GET_PERSONA_BY_ID;
export const QUERY_GET_PERSONA_BY_EMAIL = queries.GET_PERSONA_BY_EMAIL;
export const QUERY_SEARCH_PRODUCTS = queries.SEARCH_PRODUCTS;
export const QUERY_PRODUCT_SEARCH_FILTER = queries.PRODUCT_SEARCH_FILTER;
export const QUERY_PRODUCT_SEARCH_WITH_DROPIN = queries.PRODUCT_SEARCH_WITH_DROPIN;
export const QUERY_SEARCH_SUGGESTIONS = queries.SEARCH_SUGGESTIONS;
export const QUERY_GET_PRODUCT = queries.GET_PRODUCT;
export const QUERY_GENERATE_BOM = queries.GENERATE_BOM;
export const QUERY_GET_CATEGORY_BREADCRUMBS = queries.GET_CATEGORY_BREADCRUMBS;

// Cache for loaded endpoint
let _meshEndpoint = null;

/**
 * Get the effective mesh endpoint
 * Uses proxy if configured, otherwise loads from config
 * @returns {Promise<string>} The mesh endpoint URL
 */
async function getEndpoint() {
  // Check for proxy override first
  const proxyEndpoint = window.BUILDRIGHT_MESH_PROXY || null;
  if (proxyEndpoint) {
    return proxyEndpoint;
  }
  
  // Load from config if not cached
  if (!_meshEndpoint) {
    _meshEndpoint = await getMeshEndpoint();
    if (!_meshEndpoint) {
      throw new Error('Mesh endpoint not configured. Check /config/env.json');
    }
  }
  
  return _meshEndpoint;
}

// In-memory persona headers - set once per page load, no sessionStorage needed
let _personaHeaders = {};
let _currentPersona = null;
let _lastPersonaGroupId = null; // Track which group we initialized for

/**
 * Get persona headers for mesh requests
 * Headers are set by initializePersona() after fetching from mesh
 */
export function getPersonaHeaders() {
  return _personaHeaders;
}

/**
 * Get current persona data
 */
export function getCurrentPersona() {
  return _currentPersona;
}

/**
 * Set persona headers (in-memory only)
 * @param {Object} headers - { catalogViewId, priceBookId }
 */
export function setPersonaHeaders(headers) {
  _personaHeaders = {
    'AC-View-Id': headers.catalogViewId,
    'AC-Price-Book-Id': headers.priceBookId
  };
  console.log('[MeshClient] Persona headers set:', _personaHeaders);

  // Notify dropins to update their headers
  window.dispatchEvent(new CustomEvent('personaHeadersUpdated', {
    detail: {
      catalogViewId: headers.catalogViewId,
      priceBookId: headers.priceBookId
    }
  }));
}

/**
 * Execute a GraphQL query against the mesh
 * 
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables
 * @param {Object} options - Additional options
 * @param {boolean} options.includePersonaHeaders - Include persona headers (default: true for product queries)
 * @returns {Promise<Object>} Query result
 */
export async function meshQuery(query, variables = {}, options = {}) {
  const { includePersonaHeaders = true } = options;

  // Get store code for Commerce queries (from config/env.json)
  const storeCode = await getCommerceStoreCode();

  const headers = {
    'Content-Type': 'application/json',
    'Store': storeCode
  };

  // Add persona headers for product queries
  if (includePersonaHeaders) {
    const personaHeaders = getPersonaHeaders();
    Object.assign(headers, personaHeaders);
  }

  // Get endpoint (async - loaded from /config/env.json)
  const endpoint = await getEndpoint();
  
  console.log('[MeshClient] Executing query:', {
    endpoint,
    headers: Object.keys(headers),
    variables
  });
  
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      throw new Error(`Mesh request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle GraphQL errors
    if (result.errors) {
      // Filter out mesh validation noise
      const realErrors = result.errors.filter(err => 
        !err.message?.includes("Unknown type '_Any'") &&
        !err.message?.includes("Field '_entities'")
      );
      
      if (realErrors.length > 0) {
        console.error('[MeshClient] GraphQL errors:', realErrors);
        throw new Error(realErrors[0].message);
      }
    }
    
    return result.data;
  } catch (error) {
    console.error('[MeshClient] Request failed:', error);
    throw error;
  }
}

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Fetch persona and set headers
 * Call this on app init or login
 *
 * Skips fetch if already initialized with same customerGroupId (deduplication)
 *
 * @param {string} customerGroupId - Customer group ID from Commerce
 * @returns {Promise<Object>} Persona data
 */
export async function initializePersona(customerGroupId) {
  // Skip if already initialized with same group (avoid duplicate fetches)
  if (_currentPersona && _lastPersonaGroupId === customerGroupId) {
    console.log('[MeshClient] Persona already initialized for group:', customerGroupId);
    return _currentPersona;
  }

  console.log('[MeshClient] Fetching persona for customer group:', customerGroupId);

  const data = await meshQuery(queries.GET_PERSONA, { customerGroupId }, {
    includePersonaHeaders: false
  });

  const persona = data.BuildRight_personaForCustomer;

  if (persona) {
    _currentPersona = persona;
    _lastPersonaGroupId = customerGroupId;
    setPersonaHeaders({
      catalogViewId: persona.catalogViewId,
      priceBookId: persona.priceBookId
    });
    console.log('[MeshClient] Persona initialized:', persona.name);
  }

  return persona;
}

/**
 * Initialize persona by email address
 * Fetches fresh on each page load - no caching needed (fast query)
 *
 * @param {string} email - Customer email address
 * @returns {Promise<Object>} Persona data
 */
export async function initializePersonaByEmail(email) {
  console.log('[MeshClient] Fetching persona by email:', email);

  const data = await meshQuery(queries.GET_PERSONA_BY_EMAIL, { email }, {
    includePersonaHeaders: false
  });

  const persona = data.BuildRight_personaByEmail;

  if (persona) {
    _currentPersona = persona;
    setPersonaHeaders({
      catalogViewId: persona.catalogViewId,
      priceBookId: persona.priceBookId
    });
    console.log('[MeshClient] Persona initialized:', persona.name);
    console.log('[MeshClient] Persona data:', { 
      tier: persona.tier, 
      sections: persona.sections, 
      roleType: persona.roleType,
      useCase: persona.useCase
    });
  } else {
    console.warn('[MeshClient] No persona found for email:', email);
  }

  return persona;
}

/**
 * Search products using mesh
 * 
 * @param {string} phrase - Search phrase (use " " for all products)
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(phrase, options = {}) {
  const { pageSize = 20, currentPage = 1 } = options;
  
  const data = await meshQuery(queries.SEARCH_PRODUCTS, {
    phrase: phrase || ' ',
    pageSize,
    currentPage
  });
  
  return data.BuildRight_searchProducts;
}

/**
 * Get product by SKU using mesh
 * 
 * @param {string} sku - Product SKU
 * @returns {Promise<Object|null>} Product or null
 */
export async function getProductBySKU(sku) {
  const data = await meshQuery(queries.GET_PRODUCT, { sku });
  return data.BuildRight_getProductBySKU;
}

/**
 * Generate BOM from template using mesh
 * 
 * @param {Object} config - BOM configuration
 * @returns {Promise<Object>} BOM result
 */
export async function generateBOM(config) {
  const { templateId, variantId, packageId, selectedPhases } = config;
  
  // Map phase names to enum values
  const phaseMap = {
    'foundation_framing': 'FOUNDATION_FRAMING',
    'envelope': 'ENVELOPE',
    'interior_finish': 'INTERIOR_FINISH',
    'specialty': 'SPECIALTY'
  };
  
  const mappedPhases = selectedPhases?.map(p => phaseMap[p] || p.toUpperCase()) || null;
  
  const data = await meshQuery(queries.GENERATE_BOM, {
    templateId,
    variantId,
    packageId,
    selectedPhases: mappedPhases
  });
  
  return data.BuildRight_generateBOMFromTemplate;
}

/**
 * Search products with facets (consolidated query)
 * Similar to citisignal-nextjs useProductSearchFilter
 * 
 * @param {Object} options - Search options
 * @param {string} options.phrase - Search phrase
 * @param {Object} options.filter - Filter options
 * @param {Object} options.sort - Sort options { attribute, direction }
 * @param {number} options.limit - Page size
 * @param {number} options.page - Page number
 * @returns {Promise<Object>} Search results with products and facets
 */
export async function productSearchFilter(options = {}) {
  const { phrase, filter, sort, limit = 20, page = 1 } = options;
  
  const data = await meshQuery(queries.PRODUCT_SEARCH_FILTER, {
    phrase,
    filter,
    sort,
    limit,
    page
  });
  
  return data.BuildRight_productSearchFilter;
}

/**
 * Get search suggestions for autocomplete
 * Similar to citisignal-nextjs useSearchSuggestions
 * 
 * @param {string} phrase - Search phrase (min 2 chars)
 * @returns {Promise<Object>} Suggestions
 */
export async function searchSuggestions(phrase) {
  if (!phrase || phrase.length < 2) {
    return { suggestions: [], totalCount: 0 };
  }
  
  const data = await meshQuery(queries.SEARCH_SUGGESTIONS, { phrase });
  return data.BuildRight_searchSuggestions;
}

/**
 * Singleton promise for categories - ensures single fetch, shared across all consumers
 * @private
 */
let categoriesPromise = null;

/**
 * Get categories from ACO (with singleton promise caching)
 * First call initiates fetch, subsequent calls return same promise.
 * This eliminates race conditions between blocks needing category data.
 *
 * NOTE: Categories require persona headers (AC-View-Id) because ACO can show
 * different categories to different personas. Ensure dropins are initialized
 * before calling this function (scripts.js awaits initializeDropins first).
 *
 * @returns {Promise<Object>} Categories result
 */
export async function getCategories() {
  if (!categoriesPromise) {
    // Check sessionStorage first (persists across page navigations)
    try {
      const cached = sessionStorage.getItem('buildright_categories');
      if (cached) {
        const result = JSON.parse(cached);
        window.__acoCategories = result.categories || [];
        console.log('[MeshClient] Using cached categories:', window.__acoCategories.length);
        categoriesPromise = Promise.resolve(result);
        return categoriesPromise;
      }
    } catch (e) {
      console.warn('[MeshClient] Categories cache read failed:', e);
    }

    console.log('[MeshClient] Fetching categories from mesh');
    categoriesPromise = meshQuery(queries.GET_CATEGORIES, {})
      .then((data) => {
        const result = data.BuildRight_getCategories;
        // Cache in sessionStorage for subsequent page loads
        try {
          sessionStorage.setItem('buildright_categories', JSON.stringify(result));
        } catch (e) {
          console.warn('[MeshClient] Failed to cache categories:', e);
        }
        // Also populate window global for synchronous access after load
        window.__acoCategories = result.categories || [];
        console.log('[MeshClient] Categories fetched and cached:', window.__acoCategories.length);
        return result;
      })
      .catch((error) => {
        console.error('[MeshClient] Failed to fetch categories:', error);
        categoriesPromise = null; // Allow retry on failure
        return { categories: [] };
      });
  }
  return categoriesPromise;
}

/**
 * Get breadcrumb trail for a category
 * Returns hierarchical trail from root to specified category.
 * Source-agnostic: uses ACO (primary) or Commerce Catalog (fallback).
 *
 * NOTE: Breadcrumbs require persona headers (AC-View-Id). Ensure dropins
 * are initialized before calling (scripts.js awaits initializeDropins first).
 *
 * @param {string} slug - Category URL slug (e.g., "lumber", "structural-materials")
 * @returns {Promise<{trail: Array<{slug: string, name: string, url: string}>, source: string}>}
 *          Breadcrumb result with trail array (root first) and source indicator
 */
export async function getCategoryBreadcrumbs(slug) {
  try {
    const data = await meshQuery(queries.GET_CATEGORY_BREADCRUMBS, { slug });
    return data.BuildRight_getCategoryBreadcrumbs || { trail: [], source: 'unknown' };
  } catch (error) {
    console.error('[MeshClient] Failed to fetch breadcrumbs:', error);
    return { trail: [], source: 'unknown' };
  }
}

// ============================================
// CATEGORY NAME HELPERS
// Extracted from product-list.js for shared reuse
// ============================================

/**
 * Convert slug to title case (fallback when category name not available)
 * @param {string} slug - URL slug (e.g., "structural-materials")
 * @returns {string} - Title case (e.g., "Structural Materials")
 */
function slugToTitle(slug) {
  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get category display name from ACO category data
 * @param {string} slug - Category URL slug
 * @param {Array} categories - Categories array from getCategories()
 * @returns {string} - Category name or title-cased slug as fallback
 */
export function getCategoryDisplayName(slug, categories = []) {
  const normalizedSlug = slug.replace(/_/g, '-');
  const category = categories.find((c) => c.slug === slug || c.slug === normalizedSlug);
  if (category) {
    return category.name;
  }
  return slugToTitle(normalizedSlug);
}

// Export default for convenience
export default {
  meshQuery,
  setPersonaHeaders,
  getPersonaHeaders,
  initializePersona,
  initializePersonaByEmail,
  searchProducts,
  getProductBySKU,
  generateBOM,
  productSearchFilter,
  searchSuggestions,
  getCategories,
  getCategoryBreadcrumbs,
  getCategoryDisplayName,
  queries
};
