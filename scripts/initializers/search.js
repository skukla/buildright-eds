/**
 * Search/Product Discovery Dropin Initializer
 *
 * Initializes the Commerce Product Discovery dropin for product listing,
 * search, and filtering functionality.
 *
 * IMPORTANT: Product Discovery dropin has its OWN setEndpoint and setFetchGraphQlHeaders
 * functions in @dropins/storefront-product-discovery/api.js. These are SEPARATE from
 * @dropins/tools/fetch-graphql.js used by other dropins (Auth, Cart, etc.).
 *
 * @module scripts/initializers/search
 */

import { loadConfig } from '../site-config.js';
import { getPersonaHeaders } from '../services/mesh-client.js';

/**
 * Initialize the Product Discovery Dropin
 * @param {Object} initializers - Dropin initializers from @dropins/tools
 */
export async function initializeSearchDropin(initializers) {
  console.log('[Search Dropin] Initializing...');

  try {
    // Import Product Discovery dropin API - note: has its OWN endpoint/header config
    const { initialize, setEndpoint, setFetchGraphQlHeaders } = await import('@dropins/storefront-product-discovery/api.js');

    // Load config to get mesh endpoint
    const config = await loadConfig();
    const meshEndpoint = config.meshEndpoint;
    const acoConfig = config.aco || {};

    if (!meshEndpoint) {
      console.warn('[Search Dropin] No mesh endpoint configured');
    } else {
      // Set Product Discovery dropin's endpoint (separate from @dropins/tools)
      setEndpoint(meshEndpoint);
      console.log('[Search Dropin] Endpoint set:', meshEndpoint);
    }

    // Build headers for ACO queries
    // Persona headers come from persona service (initialized in index.js)
    // No fallbacks needed - persona service always returns valid guest persona for group '0'
    const personaHeaders = getPersonaHeaders();

    const headers = {
      ...personaHeaders
    };

    // ACO environment headers
    if (acoConfig.environmentId) {
      headers['AC-Environment-Id'] = acoConfig.environmentId;
    }
    if (acoConfig.sourceLocale) {
      headers['AC-Source-Locale'] = acoConfig.sourceLocale;
    }

    // Set Product Discovery dropin's headers
    setFetchGraphQlHeaders(headers);
    console.log('[Search Dropin] Headers set:', Object.keys(headers));

    // Listen for persona header updates
    window.addEventListener('personaHeadersUpdated', (event) => {
      const updatedHeaders = { ...headers };
      if (event.detail.catalogViewId) {
        updatedHeaders['AC-View-Id'] = event.detail.catalogViewId;
      }
      if (event.detail.priceBookId) {
        updatedHeaders['AC-Price-Book-Id'] = event.detail.priceBookId;
      }
      setFetchGraphQlHeaders(updatedHeaders);
      console.log('[Search Dropin] Updated headers:', Object.keys(updatedHeaders));
    });

    // Register Product Discovery dropin with initializers
    initializers.register(initialize, {
      langDefinitions: {
        default: {
          // Custom labels can go here
        }
      }
    });

    console.log('[Search Dropin] Registered');

  } catch (error) {
    console.error('[Search Dropin] Failed to initialize:', error);
    throw error;
  }
}

