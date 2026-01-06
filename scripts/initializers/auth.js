/**
 * Auth Dropin Initializer
 *
 * Initializes the Commerce Auth dropin and bridges it with the BuildRight
 * persona system for ACO catalog view/price book resolution.
 *
 * Simplified architecture:
 * - Auth token cookie is source of truth (managed by Commerce dropin)
 * - Persona fetched fresh on each page load (fast mesh query, no caching)
 * - In-memory state only, no sessionStorage for persona
 *
 * @module scripts/initializers/auth
 */

import { events } from '@dropins/tools/event-bus.js';
import { setFetchGraphQlHeader } from '@dropins/tools/fetch-graphql.js';
import { initializePersona, initializePersonaByEmail } from '../services/mesh-client.js';

// In-memory auth state
let _currentCustomer = null;
let _hasBeenAuthenticated = false;

/**
 * Initialize the Auth Dropin
 * @param {Object} initializers - Dropin initializers from @dropins/tools
 */
export async function initializeAuthDropin(initializers) {
  console.log('[Auth] Initializing...');

  try {
    const { initialize } = await import('@dropins/storefront-auth/api.js');

    initializers.register(initialize, {
      langDefinitions: { default: {} }
    });

    setupAuthEventListeners();
    await initializeGuestPersonaIfNeeded();

    console.log('[Auth] Initialized');
  } catch (error) {
    console.error('[Auth] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Initialize guest persona if no auth token present
 */
async function initializeGuestPersonaIfNeeded() {
  try {
    const token = getAuthTokenFromCookie();
    if (token) {
      console.log('[Auth] Auth token found, will authenticate');
      return;
    }

    console.log('[Auth] No auth token, initializing guest persona...');
    await initializePersona('0');
  } catch (error) {
    console.error('[Auth] Failed to initialize guest persona:', error);
  }
}

/**
 * Set up auth event listeners
 */
function setupAuthEventListeners() {
  events.on('authenticated', async (isAuthenticated) => {
    console.log('[Auth] Authentication state:', isAuthenticated);

    if (isAuthenticated) {
      _hasBeenAuthenticated = true;
      await handleCustomerAuthenticated();
    } else if (_hasBeenAuthenticated) {
      _hasBeenAuthenticated = false;
      await handleCustomerLoggedOut();
    }
  }, { eager: true });
}

/**
 * Handle customer authentication
 */
async function handleCustomerAuthenticated() {
  try {
    const { getCustomerData } = await import('@dropins/storefront-auth/api.js');

    const token = getAuthTokenFromCookie();
    if (!token) {
      console.warn('[Auth] No auth token found');
      return;
    }

    // Set Authorization header for dropin GraphQL requests
    setFetchGraphQlHeader('Authorization', `Bearer ${token}`);

    const customer = await getCustomerData(token);

    // Check if token is valid - Commerce returns null for expired/invalid tokens
    if (!customer) {
      console.warn('[Auth] Token invalid or expired - Commerce returned null customer');
      clearInvalidAuthToken();
      await initializePersona('0'); // Fall back to guest
      return;
    }

    _currentCustomer = customer;
    console.log('[Auth] Customer:', customer.email, customer.firstName);

    // Initialize persona by email - this maps Commerce customer to BuildRight persona
    let persona = null;
    try {
      persona = await initializePersonaByEmail(customer.email);
      console.log('[Auth] Persona:', persona?.id, persona?.name || 'default');
    } catch (error) {
      console.warn('[Auth] Persona lookup failed:', error.message);
    }

    // Dispatch event for UI updates
    // Include full persona data from mesh for personalization
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: {
        user: {
          id: customer.id,
          email: customer.email,
          name: persona?.displayName || `${customer.firstName || ''} ${customer.lastName || ''}`.trim(),
          customerGroup: customer.groupUid,
          // Full persona from mesh - includes features, preferences, company info
          persona: persona || null
        }
      }
    }));

  } catch (error) {
    console.error('[Auth] Authentication failed:', error);
  }
}

/**
 * Handle customer logout
 */
async function handleCustomerLoggedOut() {
  console.log('[Auth] Customer logged out');

  _currentCustomer = null;

  // Clear commerce state using proper APIs
  await clearCommerceState();

  // Reinitialize guest persona
  try {
    await initializePersona('0');
    console.log('[Auth] Guest persona reinitialized');
  } catch (error) {
    console.error('[Auth] Failed to reinitialize guest persona:', error);
  }

  window.dispatchEvent(new CustomEvent('auth:logout', {
    detail: { previousUser: null }
  }));
}

/**
 * Clear commerce state on logout using proper APIs
 */
async function clearCommerceState() {
  // Use cart dropin's API to reset cart state (it manages its own storage)
  try {
    const { resetCart } = await import('@dropins/storefront-cart/api.js');
    await resetCart();
    console.log('[Auth] Cart state reset via dropin API');
  } catch (error) {
    console.warn('[Auth] Failed to reset cart:', error.message);
  }

  // Clear only the specific keys WE control
  const ourKeys = [
    'buildright_customer_context',  // Kevin persona company/location
  ];

  ourKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log('[Auth] Cleared:', key);
    }
  });
}

/**
 * Clear invalid auth token cookie
 * Called when Commerce returns null customer (token expired/invalid)
 */
function clearInvalidAuthToken() {
  document.cookie = 'auth_dropin_user_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
  console.log('[Auth] Cleared invalid auth token cookie');
}

/**
 * Get auth token from cookie
 */
function getAuthTokenFromCookie() {
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'auth_dropin_user_token') {
      return decodeURIComponent(value);
    }
  }
  return null;
}

/**
 * Get current authenticated customer
 */
export function getCurrentCustomer() {
  return _currentCustomer;
}

/**
 * Check if customer is authenticated
 */
export function isAuthenticated() {
  return _currentCustomer !== null;
}

/**
 * Trigger logout
 */
export async function logout() {
  try {
    const { revokeCustomerToken } = await import('@dropins/storefront-auth/api.js');
    await revokeCustomerToken();
  } catch (error) {
    console.error('[Auth] Logout failed:', error);
    await handleCustomerLoggedOut();
  }
}
