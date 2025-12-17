/**
 * Commerce Fetch Adapter
 * 
 * Adapts Commerce Dropin GraphQL queries to work with the BuildRight API Mesh,
 * which prefixes Commerce operations with "Commerce_" to avoid schema conflicts with ACO.
 * 
 * The Commerce Dropins send unprefixed queries (e.g., "cart", "generateCustomerToken"),
 * but our mesh expects "Commerce_cart", "Commerce_generateCustomerToken", etc.
 * 
 * This adapter:
 * 1. Intercepts all GraphQL requests from Dropins
 * 2. Transforms query/mutation names by adding "Commerce_" prefix
 * 3. Forwards to the mesh
 * 4. Returns the response unchanged
 * 
 * @module scripts/commerce-fetch-adapter
 */

/**
 * List of Commerce GraphQL operations that need prefixing
 * Based on https://developer.adobe.com/commerce/webapi/graphql/
 */
const COMMERCE_OPERATIONS = new Set([
  // Queries
  'cart',
  'customer',
  'customerCart',
  'customerOrders',
  'customerPaymentTokens',
  'countries',
  'country',
  'availableStores',
  'storeConfig',
  
  // Mutations - Auth
  'generateCustomerToken',
  'revokeCustomerToken',
  
  // Mutations - Cart
  'createEmptyCart',
  'createGuestCart',
  'addProductsToCart',
  'addSimpleProductsToCart',
  'addVirtualProductsToCart',
  'addDownloadableProductsToCart',
  'addBundleProductsToCart',
  'addConfigurableProductsToCart',
  'updateCartItems',
  'removeItemFromCart',
  'applyCouponToCart',
  'removeCouponFromCart',
  'mergeCarts',
  
  // Mutations - Checkout
  'setShippingAddressesOnCart',
  'setBillingAddressOnCart',
  'setShippingMethodsOnCart',
  'setPaymentMethodOnCart',
  'setGuestEmailOnCart',
  'placeOrder',
  
  // Mutations - Customer
  'createCustomer',
  'updateCustomer',
  'changeCustomerPassword',
  'requestPasswordResetEmail',
  'resetPassword'
]);

/**
 * Transform GraphQL query/mutation to add Commerce_ prefix
 * @param {string} query - The original GraphQL query
 * @returns {string} - The transformed query with Commerce_ prefix
 */
function transformQuery(query) {
  let transformed = query;
  
  // For each Commerce operation, replace it with Commerce_ prefixed version
  COMMERCE_OPERATIONS.forEach(operation => {
    // Match the operation name in query/mutation definitions
    // Pattern: (query|mutation) {operationName or {operationName
    const patterns = [
      new RegExp(`(query|mutation)\\s+${operation}([\\s({])`, 'g'),
      new RegExp(`(query|mutation)\\s*\\{\\s*${operation}([\\s({])`, 'g'),
      new RegExp(`\\{\\s*${operation}([\\s({])`, 'g')
    ];
    
    patterns.forEach(pattern => {
      transformed = transformed.replace(pattern, (match, prefix, suffix) => {
        if (prefix) {
          return `${prefix} Commerce_${operation}${suffix || ''}`;
        }
        return `{ Commerce_${operation}${suffix || ''}`;
      });
    });
  });
  
  return transformed;
}

/**
 * Create a custom fetch function for Dropins that adapts queries to the mesh
 * @param {string} endpoint - The mesh GraphQL endpoint
 * @param {Function} originalFetch - The original fetch function to use
 * @returns {Function} - Custom fetch function
 */
export function createCommerceFetchAdapter(endpoint, originalFetch) {
  return async (url, options = {}) => {
    let transformedUrl = url;
    let transformedOptions = { ...options };
    
    // Handle GET requests with query parameters in URL
    if (typeof url === 'string' && url.includes('?query=')) {
      try {
        const urlObj = new URL(url);
        const queryParam = urlObj.searchParams.get('query');
        
        if (queryParam) {
          const decodedQuery = decodeURIComponent(queryParam);
          const transformedQuery = transformQuery(decodedQuery);
          
          // Log transformation for debugging (only in development)
          if (window.location.hostname === 'localhost') {
            if (decodedQuery !== transformedQuery) {
              console.log('[Commerce Adapter] Transformed GET query:', {
                original: decodedQuery.substring(0, 100) + '...',
                transformed: transformedQuery.substring(0, 100) + '...'
              });
            }
          }
          
          urlObj.searchParams.set('query', encodeURIComponent(transformedQuery));
          transformedUrl = urlObj.toString();
        }
      } catch (error) {
        console.warn('[Commerce Adapter] Failed to parse GET request URL:', error);
      }
    }
    
    // Handle POST requests with JSON body
    if (transformedOptions.body && typeof transformedOptions.body === 'string') {
      try {
        const body = JSON.parse(transformedOptions.body);
        
        if (body.query) {
          // Transform the query
          const transformedQuery = transformQuery(body.query);
          
          // Log transformation for debugging (only in development)
          if (window.location.hostname === 'localhost') {
            if (body.query !== transformedQuery) {
              console.log('[Commerce Adapter] Transformed POST query:', {
                original: body.query.substring(0, 100) + '...',
                transformed: transformedQuery.substring(0, 100) + '...'
              });
            }
          }
          
          // Create new request with transformed query
          transformedOptions.body = JSON.stringify({
            ...body,
            query: transformedQuery
          });
        }
      } catch (error) {
        console.warn('[Commerce Adapter] Failed to parse POST request body:', error);
      }
    }
    
    // Forward to mesh endpoint using original fetch (not the overridden one)
    // Use transformedUrl for GET requests, or endpoint for POST requests
    const finalUrl = transformedUrl !== url ? transformedUrl : endpoint;
    return originalFetch(finalUrl, transformedOptions);
  };
}

