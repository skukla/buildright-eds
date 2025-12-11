/**
 * Auth Dropin Initializer
 * 
 * Initializes the Commerce Auth dropin and bridges it with the BuildRight
 * persona system for ACO catalog view/price book resolution.
 * 
 * @module scripts/initializers/auth
 */

import { events } from '@dropins/tools/event-bus.js';
import { initializeMeshForEmail } from '../services/mesh-integration.js';
import { catalogService } from '../services/catalog-service.js';

// Track auth state
let _currentCustomer = null;

/**
 * Initialize the Auth Dropin
 * @param {Object} initializers - Dropin initializers from @dropins/tools
 */
export async function initializeAuthDropin(initializers) {
  console.log('[Auth Dropin] Initializing...');
  
  try {
    // Import auth dropin API
    const { initialize, getCustomerData } = await import('@dropins/storefront-auth/api.js');
    
    // Register auth dropin with initializers
    initializers.register(initialize, {
      langDefinitions: {
        default: {
          // Custom labels can go here
        }
      }
    });
    
    // Listen for authentication events
    setupAuthEventListeners();
    
    console.log('[Auth Dropin] Registered');
    
  } catch (error) {
    console.error('[Auth Dropin] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Set up event listeners for auth events
 */
function setupAuthEventListeners() {
  // Listen for authenticated event
  events.on('authenticated', async (isAuthenticated) => {
    console.log('[Auth Dropin] Authentication state changed:', isAuthenticated);
    
    if (isAuthenticated) {
      await handleCustomerAuthenticated();
    } else {
      await handleCustomerLoggedOut();
    }
  }, { eager: true });
  
  console.log('[Auth Dropin] Event listeners registered');
}

/**
 * Handle customer authentication
 * Bridges Commerce auth with BuildRight persona system
 */
async function handleCustomerAuthenticated() {
  try {
    // Get customer data from Commerce
    const { getCustomerData } = await import('@dropins/storefront-auth/api.js');
    
    // Get auth token from cookie
    const token = getAuthTokenFromCookie();
    if (!token) {
      console.warn('[Auth Dropin] No auth token found');
      return;
    }
    
    const customer = await getCustomerData(token);
    _currentCustomer = customer;
    
    console.log('[Auth Dropin] Customer authenticated:', customer?.email);
    
    // Bridge to BuildRight persona system
    // This calls the persona action via API Mesh to get ACO context
    if (customer?.email) {
      try {
        const meshData = await initializeMeshForEmail(customer.email);
        console.log('[Auth Dropin] Persona initialized:', meshData?.persona?.name || 'default');
        
        // Store persona info in sessionStorage for other modules
        sessionStorage.setItem('buildright_persona_email', customer.email);
        
      } catch (personaError) {
        console.warn('[Auth Dropin] Persona lookup failed, using default:', personaError.message);
      }
    }
    
    // Dispatch event for BuildRight UI updates
    window.dispatchEvent(new CustomEvent('auth:login', {
      detail: { 
        user: {
          id: customer?.id,
          email: customer?.email,
          name: `${customer?.firstname || ''} ${customer?.lastname || ''}`.trim(),
          customerGroup: customer?.group_id
        }
      }
    }));
    
  } catch (error) {
    console.error('[Auth Dropin] Failed to handle authentication:', error);
  }
}

/**
 * Handle customer logout
 */
async function handleCustomerLoggedOut() {
  console.log('[Auth Dropin] Customer logged out');
  
  _currentCustomer = null;
  
  // Clear persona cache
  sessionStorage.removeItem('buildright_persona');
  sessionStorage.removeItem('buildright_persona_headers');
  sessionStorage.removeItem('buildright_persona_email');
  
  // Reset catalog service to use default persona
  catalogService.reset();
  
  // Dispatch event for BuildRight UI updates
  window.dispatchEvent(new CustomEvent('auth:logout', {
    detail: { previousUser: null }
  }));
}

/**
 * Get auth token from cookie
 * @returns {string|null}
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
 * @returns {Object|null}
 */
export function getCurrentCustomer() {
  return _currentCustomer;
}

/**
 * Check if a customer is currently authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return _currentCustomer !== null;
}

/**
 * Programmatically trigger logout
 */
export async function logout() {
  try {
    const { revokeCustomerToken } = await import('@dropins/storefront-auth/api.js');
    await revokeCustomerToken();
    // Event listener will handle the rest
  } catch (error) {
    console.error('[Auth Dropin] Logout failed:', error);
    // Force local logout even if API fails
    await handleCustomerLoggedOut();
  }
}

