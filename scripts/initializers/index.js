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
 * Check if auth dropin should be initialized based on auth token presence.
 *
 * Returns true for authenticated users (auth token cookie exists),
 * false for guest users (no cookie). Guest users can still log in
 * via the login-form block which doesn't require the auth dropin.
 *
 * Cookie name: auth_dropin_user_token (per initializers/auth.js:208)
 *
 * @returns {boolean} true if auth dropin should be loaded
 */
export function shouldInitializeAuth() {
  try {
    const cookies = document.cookie;
    if (!cookies) {
      console.log('[Dropins] No auth token - guest user, skipping auth dropin');
      return false;
    }

    const hasAuthToken = cookies.split(';').some((cookie) =>
      cookie.trim().startsWith('auth_dropin_user_token=')
    );

    if (hasAuthToken) {
      console.log('[Dropins] Auth token found - user is authenticated');
      return true;
    }

    console.log('[Dropins] No auth token - guest user, skipping auth dropin');
    return false;
  } catch (error) {
    // Handle malformed cookies gracefully - default to guest user behavior
    console.warn('[Dropins] Error checking auth token:', error.message);
    return false;
  }
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
      // Import dropin tools and mesh client in parallel for performance
      const [
        { initializers },
        { setEndpoint, setFetchGraphQlHeaders },
        { getPersonaHeaders, initializePersona },
      ] = await Promise.all([
        import('@dropins/tools/initializer.js'),
        import('@dropins/tools/fetch-graphql.js'),
        import('../services/mesh-client.js'),
      ]);

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

      // Initialize persona BEFORE getting headers
      // This ensures the persona service resolves the correct catalog view UUID
      // Persona service always returns valid persona (guest for group '0')

      // Initialize default/guest persona first (customer group 0)
      // This fetches persona data from mesh and stores headers in sessionStorage
      await initializePersona('0');
      console.log('[Dropins] Default persona initialized from mesh');

      // Initialize catalog service with guest persona
      // This is the SINGLE initialization point - all blocks should use the service without re-initializing
      // The catalog service wraps mesh-client for product queries (search, get product, BOM, etc.)
      const { catalogService } = await import('../services/catalog-service.js');
      if (!catalogService.isInitialized) {
        await catalogService.initialize('guest');
        console.log('[Dropins] Catalog service initialized with guest persona');
      }

      // Now getPersonaHeaders() will have the correct UUID values from persona service
      // No fallbacks needed - persona service always returns valid guest persona
      const personaHeaders = getPersonaHeaders();

      // Set ACO headers per Adobe Commerce Optimizer documentation
      // See: https://experienceleague.adobe.com/developer/commerce/storefront/setup/configuration/commerce-configuration/
      const headers = {
        ...personaHeaders
      };

      // ACO requires these specific headers (AC-* format, not x-* format)
      if (acoConfig.environmentId) {
        headers['AC-Environment-Id'] = acoConfig.environmentId;
      }
      if (acoConfig.sourceLocale) {
        headers['AC-Source-Locale'] = acoConfig.sourceLocale;
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
      
      // Check if auth dropin should be loaded based on token presence
      const loadAuth = shouldInitializeAuth();

      // Initialize individual dropins in parallel
      // Cart and search always load; auth loads only for authenticated users
      const dropinImports = [
        import('./cart.js'),
        import('./search.js'),
      ];

      // Only import auth dropin if user is authenticated
      if (loadAuth) {
        dropinImports.push(import('./auth.js'));
      }

      const [cartInit, searchInit, authInit] = await Promise.all(dropinImports);

      // Initialize dropins - cart and search always, auth conditionally
      const initPromises = [
        cartInit.initializeCartDropin(initializers),
        searchInit.initializeSearchDropin(initializers),
      ];

      if (loadAuth && authInit) {
        initPromises.push(authInit.initializeAuthDropin(initializers));
      }

      await Promise.all(initPromises);
      
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

