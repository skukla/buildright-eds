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
      // ARCHITECTURE: Product Discovery dropin uses ACO endpoint directly
      // Auth/Cart dropins use mesh endpoint (routes to Commerce)
      // Per Adobe docs: ACO requires AC-* headers (AC-Environment-Id, AC-View-Id, AC-Price-Book-Id)
      const meshEndpoint = config.meshEndpoint;
      const acoEndpoint = config.aco?.endpoint;
      const acoConfig = config.aco || {};

      if (!meshEndpoint && !acoEndpoint) {
        console.warn('[Dropins] No endpoints configured');
        return;
      }

      // Use mesh endpoint for all dropins
      // Mesh routes ACO queries (productSearch) and Commerce queries (cart, auth)
      // ACO headers are still required for Product Discovery to work
      const endpoint = meshEndpoint || acoEndpoint;
      setEndpoint(endpoint);
      console.log('[Dropins] Using endpoint:', endpoint);

      // Set ACO headers per Adobe Commerce Optimizer documentation
      // See: https://experienceleague.adobe.com/developer/commerce/storefront/setup/configuration/commerce-configuration/
      const headers = {};

      // ACO requires these specific headers (AC-* format, not x-* format)
      if (acoConfig.environmentId) {
        headers['AC-Environment-Id'] = acoConfig.environmentId;
      }
      if (acoConfig.sourceLocale) {
        headers['AC-Source-Locale'] = acoConfig.sourceLocale;
      }

      // Initialize persona BEFORE getting headers
      // This ensures the persona service resolves the correct catalog view UUID
      const { getPersonaHeaders, initializePersona } = await import('../services/mesh-client.js');

      try {
        // Initialize default/guest persona first (customer group 0)
        // This fetches persona data from mesh and stores headers in sessionStorage
        await initializePersona('0');
        console.log('[Dropins] Default persona initialized from mesh');
      } catch (error) {
        console.warn('[Dropins] Failed to initialize persona from mesh:', error.message);
        // Continue with fallback headers from config
      }

      // Now getPersonaHeaders() will have the correct UUID values from persona service
      const personaHeaders = getPersonaHeaders();

      // AC-View-Id: Use persona catalog view (UUID) or fallback to config
      const viewId = personaHeaders['AC-View-Id'] || acoConfig.defaultViewId;
      if (viewId) {
        headers['AC-View-Id'] = viewId;
      }

      // AC-Price-Book-Id: Use persona price book or fallback to config
      const priceBookId = personaHeaders['AC-Price-Book-Id'] || acoConfig.defaultPriceBookId;
      if (priceBookId) {
        headers['AC-Price-Book-Id'] = priceBookId;
      }

      // Also include store code for Commerce compatibility
      if (config.commerceStoreCode) {
        headers['Store'] = config.commerceStoreCode;
      }

      setFetchGraphQlHeaders(headers);
      console.log('[Dropins] Set ACO headers:', Object.keys(headers));

      // Listen for persona header updates and update dropin headers
      window.addEventListener('personaHeadersUpdated', (event) => {
        const updatedHeaders = { ...headers };
        if (event.detail.catalogViewId) {
          updatedHeaders['AC-View-Id'] = event.detail.catalogViewId;
        }
        if (event.detail.priceBookId) {
          updatedHeaders['AC-Price-Book-Id'] = event.detail.priceBookId;
        }
        setFetchGraphQlHeaders(updatedHeaders);
        console.log('[Dropins] Updated ACO headers:', Object.keys(updatedHeaders));
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

