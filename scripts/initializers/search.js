/**
 * Search/Product Discovery Dropin Initializer
 * 
 * Initializes the Commerce Product Discovery dropin for product listing,
 * search, and filtering functionality.
 * 
 * @module scripts/initializers/search
 */

/**
 * Initialize the Product Discovery Dropin
 * @param {Object} initializers - Dropin initializers from @dropins/tools
 */
export async function initializeSearchDropin(initializers) {
  console.log('[Search Dropin] Initializing...');
  
  try {
    // Import Product Discovery dropin API
    const { initialize } = await import('@dropins/storefront-product-discovery/api.js');
    
    // Register Product Discovery dropin with initializers
    // Note: Endpoint should already be set to mesh endpoint before this is called
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

