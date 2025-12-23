/**
 * Commerce Dropins Initializer Index
 * 
 * Initializes all Commerce dropins and coordinates their loading.
 * This file should be imported early in the page lifecycle.
 * 
 * @module scripts/initializers
 */

import { loadConfig } from '../site-config.js';

// Track initialization state
let _initialized = false;
let _initPromise = null;

/**
 * Check if Commerce Dropins should be enabled
 * @returns {Promise<boolean>}
 */
export async function shouldUseDropins() {
  const config = await loadConfig();
  return config.features?.useCommerceDropins === true;
}

/**
 * Initialize all Commerce Dropins
 * Call this once during page load
 */
export async function initializeDropins() {
  if (_initialized) {
    return;
  }
  
  if (_initPromise) {
    return _initPromise;
  }
  
  _initPromise = (async () => {
    const config = await loadConfig();
    
    // Check if dropins should be enabled
    if (!config.features?.useCommerceDropins) {
      console.log('[Dropins] Commerce Dropins disabled in config');
      return;
    }
    
    console.log('[Dropins] Initializing Commerce Dropins...');
    
    try {
      // Import dropin tools
      const { initializers } = await import('@dropins/tools/initializer.js');
      const { setEndpoint, setFetchGraphQlHeaders } = await import('@dropins/tools/fetch-graphql.js');
      
      // Configure GraphQL endpoint
      // ARCHITECTURE: All dropins now go through the mesh
      // - Mesh exposes ACO for Product Discovery (productSearch)
      // - Mesh exposes Commerce for Auth and Cart (createEmptyCart, generateCustomerToken)
      const meshEndpoint = config.meshEndpoint;
      const commerceEndpoint = config.commerceEndpoint;
      
      if (!meshEndpoint && !commerceEndpoint) {
        console.warn('[Dropins] No endpoints configured');
        return;
      }
      
      // Use mesh endpoint (preferred) or fallback to Commerce
      const endpoint = meshEndpoint || commerceEndpoint;
      setEndpoint(endpoint);
      console.log('[Dropins] Using endpoint:', endpoint);
      
      // Set initial headers (store code + persona headers if available)
      const headers = {};
      
      if (config.commerceStoreCode) {
        headers['Store'] = config.commerceStoreCode;
      }
      
      // Get persona headers from mesh client (if already initialized)
      const { getPersonaHeaders } = await import('../services/mesh-client.js');
      const personaHeaders = getPersonaHeaders();
      if (personaHeaders['X-Catalog-View-Id']) {
        headers['x-catalog-view-id'] = personaHeaders['X-Catalog-View-Id'];
      }
      if (personaHeaders['X-Price-Book-Id']) {
        headers['x-price-book-id'] = personaHeaders['X-Price-Book-Id'];
      }
      
      setFetchGraphQlHeaders(headers);
      console.log('[Dropins] Set headers:', Object.keys(headers));
      
      // Listen for persona header updates and update dropin headers
      window.addEventListener('personaHeadersUpdated', (event) => {
        const updatedHeaders = { ...headers };
        if (event.detail.catalogViewId) {
          updatedHeaders['x-catalog-view-id'] = event.detail.catalogViewId;
        }
        if (event.detail.priceBookId) {
          updatedHeaders['x-price-book-id'] = event.detail.priceBookId;
        }
        setFetchGraphQlHeaders(updatedHeaders);
        console.log('[Dropins] Updated persona headers:', Object.keys(updatedHeaders));
      });
      
      // Initialize individual dropins
      // All dropins now use the same mesh endpoint
      
      // Auth dropin
      const authInit = await import('./auth.js');
      await authInit.initializeAuthDropin(initializers);
      
      // Cart dropin
      const cartInit = await import('./cart.js');
      await cartInit.initializeCartDropin(initializers);
      
      // Product Discovery dropin
      const searchInit = await import('./search.js');
      await searchInit.initializeSearchDropin(initializers);
      
      // Mount all initializers
      initializers.mount();
      
      console.log('[Dropins] All Commerce Dropins initialized');
      _initialized = true;
      
      // Dispatch event for other modules to know dropins are ready
      window.dispatchEvent(new CustomEvent('dropins:initialized'));
      
    } catch (error) {
      console.error('[Dropins] Failed to initialize:', error);
      throw error;
    }
  })();
  
  return _initPromise;
}

/**
 * Check if dropins are initialized
 * @returns {boolean}
 */
export function areDropinsInitialized() {
  return _initialized;
}

/**
 * Wait for dropins to be initialized
 * @returns {Promise<void>}
 */
export function waitForDropins() {
  if (_initialized) {
    return Promise.resolve();
  }
  
  return new Promise((resolve) => {
    window.addEventListener('dropins:initialized', () => resolve(), { once: true });
  });
}

