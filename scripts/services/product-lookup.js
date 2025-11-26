/**
 * Product Lookup Service
 * 
 * Provides intelligent product lookup from ACO catalog by attributes, not hardcoded SKUs.
 * This allows the BOM calculator to find products dynamically based on requirements.
 * 
 * @module scripts/services/product-lookup
 */

// Cache for ACO products to avoid repeated API calls
let productCache = null;
let cacheTimestamp = null;
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Get OAuth token from buildright-aco
 * This assumes buildright-aco is a sibling repository
 */
async function getAccessToken() {
  // Import from sibling repo (absolute path)
  const acoPath = '/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco/utils/oauth-token-manager.js';
  
  // Change to ACO directory so .env is loaded correctly
  const originalCwd = process.cwd();
  process.chdir('/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco');
  
  try {
    const { getAccessToken } = await import(acoPath);
    const token = await getAccessToken();
    return token;
  } finally {
    process.chdir(originalCwd);
  }
}

/**
 * Query all products from ACO with caching
 * 
 * @returns {Promise<Array>} Array of all products
 */
async function getAllProducts() {
  // Check cache
  if (productCache && cacheTimestamp && (Date.now() - cacheTimestamp < CACHE_TTL_MS)) {
    console.log('[ProductLookup] Using cached products');
    return productCache;
  }
  
  console.log('[ProductLookup] Fetching products from ACO...');
  
  const accessToken = await getAccessToken();
  const endpoint = 'https://na1-sandbox.api.commerce.adobe.com/X2duJmy3FaTKf1Mmr4GiQY/graphql';
  
  let allProducts = [];
  let currentPage = 1;
  let totalPages = 1;
  
  do {
    const query = {
      query: `
        query Q($page_size: Int, $current_page: Int) {
          productSearch(phrase: " ", page_size: $page_size, current_page: $current_page) {
            total_count
            page_info {
              current_page
              total_pages
            }
            items {
              productView {
                __typename
                sku
                name
                ... on SimpleProductView {
                  price {
                    final {
                      amount {
                        value
                        currency
                      }
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        page_size: 200,
        current_page: currentPage
      }
    };
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'AC-Environment-Id': 'X2duJmy3FaTKf1Mmr4GiQY',
        'AC-Source-Locale': 'en-US',
        'AC-Price-Book-Id': 'US-Retail'
      },
      body: JSON.stringify(query)
    });
    
    if (!response.ok) {
      throw new Error(`ACO query failed: ${response.status} ${response.statusText}`);
    }
    
    const responseData = await response.json();
    const data = responseData?.data?.productSearch;
    const items = data?.items || [];
    
    items.forEach(item => {
      if (item.productView) {
        allProducts.push(item.productView);
      }
    });
    
    if (data?.page_info) {
      totalPages = data.page_info.total_pages;
    }
    
    currentPage++;
  } while (currentPage <= totalPages);
  
  console.log(`[ProductLookup] Fetched ${allProducts.length} products from ACO`);
  
  // Cache results
  productCache = allProducts;
  cacheTimestamp = Date.now();
  
  return allProducts;
}

/**
 * Find product by name pattern
 * 
 * @param {string} namePattern - Name or partial name to search for
 * @param {Object} filters - Additional filters
 * @param {string} [filters.tier] - Quality tier (builder_grade, professional, premium, luxury)
 * @returns {Promise<Object|null>} Matching product or null
 */
export async function findProductByName(namePattern, filters = {}) {
  const products = await getAllProducts();
  const pattern = namePattern.toLowerCase();
  
  let matches = products.filter(p => 
    p.name && p.name.toLowerCase().includes(pattern)
  );
  
  // Apply tier filter if specified
  if (filters.tier && matches.length > 1) {
    const tierPatterns = {
      'builder_grade': /builder|standard|basic/i,
      'professional': /professional|pro\b/i,
      'premium': /premium|upgraded/i,
      'luxury': /luxury|executive|designer/i
    };
    
    const tierPattern = tierPatterns[filters.tier];
    if (tierPattern) {
      const tierMatches = matches.filter(p => tierPattern.test(p.name));
      if (tierMatches.length > 0) {
        matches = tierMatches;
      }
    }
  }
  
  if (matches.length === 0) {
    console.warn(`[ProductLookup] No product found matching: ${namePattern}`, filters);
    return null;
  }
  
  if (matches.length > 1) {
    console.warn(`[ProductLookup] Multiple products found for: ${namePattern}, using first match`);
    console.warn(`  Matches: ${matches.map(m => m.name).join(', ')}`);
  }
  
  return matches[0];
}

/**
 * Find product by category and attributes
 * 
 * @param {Object} criteria - Search criteria
 * @param {string} criteria.category - Product category keyword (e.g., 'concrete', 'window', 'door')
 * @param {string} [criteria.tier] - Quality tier
 * @param {string} [criteria.type] - Product type keyword (e.g., 'ready-mix', 'double hung')
 * @returns {Promise<Object|null>} Matching product or null
 */
export async function findProductByCategory(criteria) {
  const products = await getAllProducts();
  const { category, tier, type } = criteria;
  
  let matches = products.filter(p => {
    if (!p.name) return false;
    const name = p.name.toLowerCase();
    
    // Must match category
    if (!name.includes(category.toLowerCase())) {
      return false;
    }
    
    // If type specified, must match
    if (type && !name.includes(type.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Apply tier filter
  if (tier && matches.length > 1) {
    const tierPatterns = {
      'builder_grade': /builder|standard|basic/i,
      'professional': /professional|pro\b/i,
      'premium': /premium|upgraded/i,
      'luxury': /luxury|executive|designer/i
    };
    
    const tierPattern = tierPatterns[tier];
    if (tierPattern) {
      const tierMatches = matches.filter(p => tierPattern.test(p.name));
      if (tierMatches.length > 0) {
        matches = tierMatches;
      }
    }
  }
  
  if (matches.length === 0) {
    console.warn(`[ProductLookup] No product found for criteria:`, criteria);
    return null;
  }
  
  if (matches.length > 1) {
    console.warn(`[ProductLookup] Multiple products found, using first:`, {
      criteria,
      matches: matches.map(m => m.name)
    });
  }
  
  return matches[0];
}

/**
 * Get product price
 * 
 * @param {Object} product - Product object
 * @returns {number} Price value or 0 if not available
 */
export function getProductPrice(product) {
  return product?.price?.final?.amount?.value || 0;
}

/**
 * Clear product cache (useful for testing)
 */
export function clearCache() {
  productCache = null;
  cacheTimestamp = null;
}

export default {
  findProductByName,
  findProductByCategory,
  getProductPrice,
  clearCache
};

