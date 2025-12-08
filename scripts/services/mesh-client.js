/**
 * BuildRight Mesh Client
 * 
 * Client for calling the BuildRight Service API Mesh.
 * Follows the pattern from citisignal-nextjs for consistency.
 * 
 * Architecture:
 * - For development: Can call mesh directly (CORS enabled)
 * - For production: Should use a proxy (App Builder action or edge worker)
 * 
 * @module scripts/services/mesh-client
 */

// Mesh endpoint from buildright-service
const MESH_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql';

// Optional proxy endpoint for production (set via environment or config)
// In production EDS, this would be an App Builder action URL
const PROXY_ENDPOINT = window.BUILDRIGHT_MESH_PROXY || null;

/**
 * Get the effective mesh endpoint
 * Uses proxy if configured, otherwise direct mesh
 */
function getEndpoint() {
  return PROXY_ENDPOINT || MESH_ENDPOINT;
}

/**
 * Get persona headers from session storage
 * These headers are required for product queries
 * Headers are set by initializePersona() after fetching from mesh
 * 
 * @throws {Error} If headers are not set (must call initializePersona first)
 */
function getPersonaHeaders() {
  try {
    const personaData = sessionStorage.getItem('buildright_persona_headers');
    if (personaData) {
      return JSON.parse(personaData);
    }
  } catch (e) {
    console.warn('[MeshClient] Failed to parse persona headers:', e);
  }
  
  // No hardcoded defaults - headers must come from mesh
  throw new Error('Persona headers not set. Call initializePersona() first.');
}

/**
 * Set persona headers in session storage
 * Call this after fetching persona info
 * 
 * @param {Object} headers - { catalogViewId, priceBookId }
 */
export function setPersonaHeaders(headers) {
  const meshHeaders = {
    'X-Catalog-View-Id': headers.catalogViewId,
    'X-Price-Book-Id': headers.priceBookId
  };
  sessionStorage.setItem('buildright_persona_headers', JSON.stringify(meshHeaders));
  console.log('[MeshClient] Persona headers set:', meshHeaders);
}

/**
 * Execute a GraphQL query against the mesh
 * 
 * @param {string} query - GraphQL query string
 * @param {Object} variables - Query variables
 * @param {Object} options - Additional options
 * @param {boolean} options.includePersonaHeaders - Include persona headers (default: true for product queries)
 * @returns {Promise<Object>} Query result
 */
export async function meshQuery(query, variables = {}, options = {}) {
  const { includePersonaHeaders = true } = options;
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Add persona headers for product queries
  if (includePersonaHeaders) {
    const personaHeaders = getPersonaHeaders();
    Object.assign(headers, personaHeaders);
  }
  
  console.log('[MeshClient] Executing query:', {
    endpoint: getEndpoint(),
    headers: Object.keys(headers),
    variables
  });
  
  try {
    const response = await fetch(getEndpoint(), {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables })
    });
    
    if (!response.ok) {
      throw new Error(`Mesh request failed: ${response.status} ${response.statusText}`);
    }
    
    const result = await response.json();
    
    // Handle GraphQL errors
    if (result.errors) {
      // Filter out mesh validation noise
      const realErrors = result.errors.filter(err => 
        !err.message?.includes("Unknown type '_Any'") &&
        !err.message?.includes("Field '_entities'")
      );
      
      if (realErrors.length > 0) {
        console.error('[MeshClient] GraphQL errors:', realErrors);
        throw new Error(realErrors[0].message);
      }
    }
    
    return result.data;
  } catch (error) {
    console.error('[MeshClient] Request failed:', error);
    throw error;
  }
}

// ============================================
// GRAPHQL QUERIES
// ============================================

/**
 * Get persona by customer group ID
 * This should be called first to get catalog/pricing headers
 */
export const QUERY_GET_PERSONA = `
  query GetPersona($customerGroupId: String!) {
    BuildRight_personaForCustomer(customerGroupId: $customerGroupId) {
      id
      name
      tier
      catalogViewId
      priceBookId
      features
    }
  }
`;

/**
 * Get persona by persona ID
 */
export const QUERY_GET_PERSONA_BY_ID = `
  query GetPersonaById($personaId: String!) {
    BuildRight_personaById(personaId: $personaId) {
      id
      name
      tier
      catalogViewId
      priceBookId
      policies
      features
    }
  }
`;

/**
 * Search products
 */
export const QUERY_SEARCH_PRODUCTS = `
  query SearchProducts($phrase: String!, $pageSize: Int, $currentPage: Int) {
    BuildRight_searchProducts(phrase: $phrase, pageSize: $pageSize, currentPage: $currentPage) {
      totalCount
      items {
        sku
        name
        description
        imageUrl
        price {
          value
          currency
        }
        inStock
        category
        attributes {
          name
          value
        }
      }
      pageInfo {
        currentPage
        pageSize
        totalPages
      }
    }
  }
`;

/**
 * Get product by SKU
 */
export const QUERY_GET_PRODUCT = `
  query GetProduct($sku: String!) {
    BuildRight_getProductBySKU(sku: $sku) {
      sku
      name
      description
      imageUrl
      price {
        value
        currency
      }
      inStock
      category
      attributes {
        name
        value
      }
    }
  }
`;

/**
 * Generate BOM from template
 */
export const QUERY_GENERATE_BOM = `
  query GenerateBOM(
    $templateId: String!
    $variantId: String
    $packageId: String!
    $selectedPhases: [ConstructionPhase!]
  ) {
    BuildRight_generateBOMFromTemplate(
      templateId: $templateId
      variantId: $variantId
      packageId: $packageId
      selectedPhases: $selectedPhases
    ) {
      totalCost {
        value
        currency
      }
      lineItems {
        sku
        name
        quantity
        unit
        unitPrice {
          value
          currency
        }
        totalPrice {
          value
          currency
        }
        category
        phase
        specifications {
          brand
          qualityTier
          constructionPhase
        }
      }
      phases {
        phase
        lineItems {
          sku
          name
          quantity
          unitPrice {
            value
          }
          totalPrice {
            value
          }
        }
        totalCost {
          value
          currency
        }
        percentageOfTotal
      }
      metadata {
        templateId
        packageId
        squareFootage
        generatedAt
        personaId
        variantId
        selectedPhases
        appliedOverrides
      }
    }
  }
`;

// ============================================
// CONVENIENCE FUNCTIONS
// ============================================

/**
 * Fetch persona and set headers
 * Call this on app init or login
 * 
 * @param {string} customerGroupId - Customer group ID from Commerce
 * @returns {Promise<Object>} Persona data
 */
export async function initializePersona(customerGroupId) {
  console.log('[MeshClient] Initializing persona for customer group:', customerGroupId);
  
  const data = await meshQuery(QUERY_GET_PERSONA, { customerGroupId }, {
    includePersonaHeaders: false // Don't need persona headers to GET persona
  });
  
  const persona = data.BuildRight_personaForCustomer;
  
  if (persona) {
    // Store persona headers for future requests
    setPersonaHeaders({
      catalogViewId: persona.catalogViewId,
      priceBookId: persona.priceBookId
    });
    
    // Also store full persona info
    sessionStorage.setItem('buildright_persona', JSON.stringify(persona));
    
    console.log('[MeshClient] Persona initialized:', persona.name);
  }
  
  return persona;
}

/**
 * Search products using mesh
 * 
 * @param {string} phrase - Search phrase (use " " for all products)
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} Search results
 */
export async function searchProducts(phrase, options = {}) {
  const { pageSize = 20, currentPage = 1 } = options;
  
  const data = await meshQuery(QUERY_SEARCH_PRODUCTS, {
    phrase: phrase || ' ',
    pageSize,
    currentPage
  });
  
  return data.BuildRight_searchProducts;
}

/**
 * Get product by SKU using mesh
 * 
 * @param {string} sku - Product SKU
 * @returns {Promise<Object|null>} Product or null
 */
export async function getProductBySKU(sku) {
  const data = await meshQuery(QUERY_GET_PRODUCT, { sku });
  return data.BuildRight_getProductBySKU;
}

/**
 * Generate BOM from template using mesh
 * 
 * @param {Object} config - BOM configuration
 * @returns {Promise<Object>} BOM result
 */
export async function generateBOM(config) {
  const { templateId, variantId, packageId, selectedPhases } = config;
  
  // Map phase names to enum values
  const phaseMap = {
    'foundation_framing': 'FOUNDATION_FRAMING',
    'envelope': 'ENVELOPE',
    'interior_finish': 'INTERIOR_FINISH',
    'specialty': 'SPECIALTY'
  };
  
  const mappedPhases = selectedPhases?.map(p => phaseMap[p] || p.toUpperCase()) || null;
  
  const data = await meshQuery(QUERY_GENERATE_BOM, {
    templateId,
    variantId,
    packageId,
    selectedPhases: mappedPhases
  });
  
  return data.BuildRight_generateBOMFromTemplate;
}

// Export default for convenience
export default {
  meshQuery,
  setPersonaHeaders,
  initializePersona,
  searchProducts,
  getProductBySKU,
  generateBOM,
  // Queries for direct use
  queries: {
    GET_PERSONA: QUERY_GET_PERSONA,
    GET_PERSONA_BY_ID: QUERY_GET_PERSONA_BY_ID,
    SEARCH_PRODUCTS: QUERY_SEARCH_PRODUCTS,
    GET_PRODUCT: QUERY_GET_PRODUCT,
    GENERATE_BOM: QUERY_GENERATE_BOM
  }
};

