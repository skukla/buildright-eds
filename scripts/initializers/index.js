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
 * Get auth token from cookie
 * @returns {string|null}
 */
function getAuthTokenFromCookie() {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'auth_dropin_user_token') {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    console.warn('[Dropins] Error reading auth token:', error.message);
  }
  return null;
}

/**
 * Clear invalid auth token cookie
 * Called when Commerce returns null customer (token expired/invalid)
 */
function clearInvalidAuthToken() {
  document.cookie = 'auth_dropin_user_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  console.log('[Dropins] Cleared invalid auth token cookie');
}

/**
 * Get guest cart ID from cookie
 * The cart dropin stores guest cart ID in this cookie
 * @returns {string|null}
 */
function getGuestCartIdCookie() {
  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'DROPIN__CART__CART-ID') {
        return decodeURIComponent(value);
      }
    }
  } catch (error) {
    // Ignore parsing errors
  }
  return null;
}

/**
 * Clear stale guest cart cookie
 * Called when user is authenticated to prevent merge with invalid cart
 */
function clearGuestCartCookie() {
  document.cookie = 'DROPIN__CART__CART-ID=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  console.log('[Dropins] Cleared stale guest cart cookie');
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
  const token = getAuthTokenFromCookie();
  if (token) {
    console.log('[Dropins] Auth token found - user is authenticated');
    return true;
  }
  console.log('[Dropins] No auth token - guest user, skipping auth dropin');
  return false;
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

      // CRITICAL: Validate token BEFORE setting header and mounting
      // Cart dropin immediately tries authenticated operations on mount
      // If token is invalid, Commerce returns partial data with null Money.value
      let tokenValid = false;
      if (loadAuth) {
        const token = getAuthTokenFromCookie();
        if (token) {
          console.log('[Dropins] Validating auth token before mount...');

          try {
            // Validate token with direct GraphQL query (dropin API not ready before mount)
            const customerQuery = `query { customer { email firstname } }`;
            const response = await fetch(endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Store': config.commerceStoreCode || 'default',
              },
              body: JSON.stringify({ query: customerQuery }),
            });

            const result = await response.json();
            const customer = result?.data?.customer;

            if (customer?.email) {
              console.log('[Dropins] Token valid for:', customer.email);
              tokenValid = true;
              // Set the Authorization header for dropins
              const { setFetchGraphQlHeader } = await import('@dropins/tools/fetch-graphql.js');
              setFetchGraphQlHeader('Authorization', `Bearer ${token}`);

              // CRITICAL: Validate guest cart BEFORE mount to prevent merge errors
              // If guest cart is stale/invalid, Commerce returns null Money.value
              // which crashes the dropin. Only clear if cart is truly invalid.
              const guestCartId = getGuestCartIdCookie();
              if (guestCartId) {
                console.log('[Dropins] Validating guest cart before merge:', guestCartId);
                try {
                  const cartQuery = `query($id: String!) { cart(cart_id: $id) { id total_quantity } }`;
                  const cartResponse = await fetch(endpoint, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Store': config.commerceStoreCode || 'default',
                    },
                    body: JSON.stringify({
                      query: cartQuery,
                      variables: { id: guestCartId },
                    }),
                  });
                  const cartResult = await cartResponse.json();
                  const cart = cartResult?.data?.cart;
                  if (cart?.id) {
                    console.log('[Dropins] Guest cart valid, will merge:', cart.total_quantity, 'items');
                    // Valid cart - let dropin merge it
                  } else {
                    // Cart doesn't exist or is invalid
                    console.log('[Dropins] Guest cart invalid/expired, clearing to prevent merge errors');
                    clearGuestCartCookie();
                  }
                } catch (cartError) {
                  console.warn('[Dropins] Could not validate guest cart, clearing:', cartError.message);
                  clearGuestCartCookie();
                }
              }
            } else {
              // Token expired/invalid - Commerce returned null
              console.warn('[Dropins] Token invalid - clearing and mounting as guest');
              clearInvalidAuthToken();
            }
          } catch (error) {
            console.warn('[Dropins] Token validation failed:', error.message);
            clearInvalidAuthToken();
          }
        }
      }

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

