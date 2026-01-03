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
    
    // CRITICAL: Initialize guest persona for anonymous users
    // This ensures that EVERY page has persona headers set before any queries run
    await initializeGuestPersonaIfNeeded();
    
    console.log('[Auth Dropin] Registered');
    
  } catch (error) {
    console.error('[Auth Dropin] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Initialize guest persona if no persona is currently set
 * This ensures anonymous users can browse the catalog
 */
async function initializeGuestPersonaIfNeeded() {
  try {
    // Check if persona headers are already set (from cache or previous session)
    const existingHeaders = sessionStorage.getItem('buildright_persona_headers');
    if (existingHeaders) {
      console.log('[Auth Dropin] Persona headers already set, skipping guest initialization');
      return;
    }
    
    // Check if user is authenticated via token
    const token = getAuthTokenFromCookie();
    if (token) {
      console.log('[Auth Dropin] Auth token found, skipping guest initialization (will authenticate)');
      return;
    }
    
    // Initialize guest persona (customer group 0 = BuildRight-Default catalog view)
    console.log('[Auth Dropin] Initializing guest persona for anonymous user...');
    const { initializePersona } = await import('../services/mesh-client.js');
    await initializePersona('0'); // Customer group 0 = guest
    console.log('[Auth Dropin] Guest persona initialized');
    
  } catch (error) {
    console.error('[Auth Dropin] Failed to initialize guest persona:', error);
    // Don't throw - allow page to continue, but queries may fail
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

  // Clear customer context (company/location for Kevin persona)
  localStorage.removeItem('buildright_customer_context');
  
  // Reset catalog service first
  catalogService.reset();
  
  // Reinitialize catalog service with guest persona (customer group 0)
  // This ensures the site continues to work after logout
  try {
    await catalogService.initialize('guest');
    console.log('[Auth Dropin] Reinitialized guest persona after logout');
  } catch (error) {
    console.error('[Auth Dropin] Failed to reinitialize guest persona:', error);
  }
  
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

