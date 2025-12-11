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

import { getMeshEndpoint } from '../site-config.js';
import * as queries from './queries.js';

// Re-export queries for backwards compatibility
export const QUERY_GET_PERSONA = queries.GET_PERSONA;
export const QUERY_GET_PERSONA_BY_ID = queries.GET_PERSONA_BY_ID;
export const QUERY_GET_PERSONA_BY_EMAIL = queries.GET_PERSONA_BY_EMAIL;
export const QUERY_SEARCH_PRODUCTS = queries.SEARCH_PRODUCTS;
export const QUERY_PRODUCT_SEARCH_FILTER = queries.PRODUCT_SEARCH_FILTER;
export const QUERY_SEARCH_SUGGESTIONS = queries.SEARCH_SUGGESTIONS;
export const QUERY_GET_PRODUCT = queries.GET_PRODUCT;
export const QUERY_GENERATE_BOM = queries.GENERATE_BOM;

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

/**
 * Get persona headers from session storage
 * These headers are required for product queries
 * Headers are set by initializePersona() after fetching from mesh
 * 
 * @throws {Error} If headers are not set (must call initializePersona first)
 */
function getPersonaHeaders() {
  try {
    const personaData = sessionStorage.getItem('buildright_persona_headers');
    if (personaData) {
      return JSON.parse(personaData);
    }
  } catch (e) {
    console.warn('[MeshClient] Failed to parse persona headers:', e);
  }
  
  // No hardcoded defaults - headers must come from mesh
  throw new Error('Persona headers not set. Call initializePersona() first.');
}

/**
 * Set persona headers in session storage
 * Call this after fetching persona info
 * 
 * @param {Object} headers - { catalogViewId, priceBookId }
 */
export function setPersonaHeaders(headers) {
  const meshHeaders = {
    'X-Catalog-View-Id': headers.catalogViewId,
    'X-Price-Book-Id': headers.priceBookId
  };
  sessionStorage.setItem('buildright_persona_headers', JSON.stringify(meshHeaders));
  console.log('[MeshClient] Persona headers set:', meshHeaders);
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
  
  const headers = {
    'Content-Type': 'application/json'
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
 * Uses sessionStorage caching to avoid redundant mesh queries.
 * Force refresh by passing { forceRefresh: true } in options.
 * 
 * @param {string} customerGroupId - Customer group ID from Commerce
 * @param {Object} options - { forceRefresh: boolean }
 * @returns {Promise<Object>} Persona data
 */
export async function initializePersona(customerGroupId, options = {}) {
  const { forceRefresh = false } = options;
  
  // Check cache first (unless force refresh requested)
  if (!forceRefresh) {
    try {
      const cachedPersona = sessionStorage.getItem('buildright_persona');
      const cachedHeaders = sessionStorage.getItem('buildright_persona_headers');
      
      if (cachedPersona && cachedHeaders) {
        const persona = JSON.parse(cachedPersona);
        console.log('[MeshClient] Using cached persona:', persona.name);
        return persona;
      }
    } catch (e) {
      console.warn('[MeshClient] Cache read failed, fetching fresh:', e);
    }
  }
  
  console.log('[MeshClient] Fetching persona from mesh for:', customerGroupId);
  
  const data = await meshQuery(queries.GET_PERSONA, { customerGroupId }, {
    includePersonaHeaders: false // Don't need persona headers to GET persona
  });
  
  const persona = data.BuildRight_personaForCustomer;
  
  if (persona) {
    // Store persona headers for future requests
    setPersonaHeaders({
      catalogViewId: persona.catalogViewId,
      priceBookId: persona.priceBookId
    });
    
    // Also store full persona info
    sessionStorage.setItem('buildright_persona', JSON.stringify(persona));
    
    console.log('[MeshClient] Persona fetched and cached:', persona.name);
  }
  
  return persona;
}

/**
 * Initialize persona by email address
 * This is the recommended approach - calls the persona action which
 * internally decides whether to use JSON or Commerce data source.
 * 
 * @param {string} email - Customer email address
 * @param {Object} options - Options { forceRefresh: boolean }
 * @returns {Promise<Object>} Persona data
 */
export async function initializePersonaByEmail(email, options = {}) {
  const { forceRefresh = false } = options;
  
  // Check cache first (unless force refresh requested)
  if (!forceRefresh) {
    try {
      const cachedPersona = sessionStorage.getItem('buildright_persona');
      const cachedHeaders = sessionStorage.getItem('buildright_persona_headers');
      const cachedEmail = sessionStorage.getItem('buildright_persona_email');
      
      // Only use cache if it's for the same email
      if (cachedPersona && cachedHeaders && cachedEmail === email) {
        const persona = JSON.parse(cachedPersona);
        console.log('[MeshClient] Using cached persona for:', email, '-', persona.name);
        return persona;
      }
    } catch (e) {
      console.warn('[MeshClient] Cache read failed, fetching fresh:', e);
    }
  }
  
  console.log('[MeshClient] Fetching persona by email:', email);
  
  const data = await meshQuery(queries.GET_PERSONA_BY_EMAIL, { email }, {
    includePersonaHeaders: false // Don't need persona headers to GET persona
  });
  
  const persona = data.BuildRight_personaByEmail;
  
  if (persona) {
    // Store persona headers for future requests
    setPersonaHeaders({
      catalogViewId: persona.catalogViewId,
      priceBookId: persona.priceBookId
    });
    
    // Store full persona info and email for cache validation
    sessionStorage.setItem('buildright_persona', JSON.stringify(persona));
    sessionStorage.setItem('buildright_persona_email', email);
    
    console.log('[MeshClient] Persona fetched and cached:', persona.name);
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

// Export default for convenience
export default {
  meshQuery,
  setPersonaHeaders,
  initializePersona,
  initializePersonaByEmail,
  searchProducts,
  getProductBySKU,
  generateBOM,
  productSearchFilter,
  searchSuggestions,
  queries
};
