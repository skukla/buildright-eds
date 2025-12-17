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
      
      // Configure GraphQL endpoint - Commerce Dropins use Commerce directly (best practice)
      // BuildRight custom queries (ACO, persona, BOM) use the API Mesh
      const commerceEndpoint = config.commerceEndpoint;
      if (commerceEndpoint) {
        setEndpoint(commerceEndpoint);
        console.log('[Dropins] Using Commerce endpoint directly:', commerceEndpoint);
        
        // Set store code header if configured
        if (config.commerceStoreCode) {
          setFetchGraphQlHeaders({
            'Store': config.commerceStoreCode
          });
        }
      } else {
        console.warn('[Dropins] No Commerce endpoint configured');
        return;
      }
      
      // Initialize individual dropins
      // Auth dropin
      const authInit = await import('./auth.js');
      await authInit.initializeAuthDropin(initializers);
      
      // Cart dropin
      const cartInit = await import('./cart.js');
      await cartInit.initializeCartDropin(initializers);
      
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

