/**
 * Mesh Integration Service
 * 
 * Bridges the BuildRight auth/persona system with the API Mesh.
 * Handles persona-to-customerGroupId mapping and mesh initialization.
 * 
 * @module scripts/services/mesh-integration
 */

import { initializePersona, setPersonaHeaders, searchProducts, getProductBySKU, generateBOM } from './mesh-client.js';
import { getPersona, CUSTOMER_GROUPS } from '../persona-config.js';

/**
 * Customer Group ID Mapping
 * Maps persona IDs to Adobe Commerce customer group IDs
 * These IDs are used by the mesh to determine pricing/catalog view
 */
const PERSONA_TO_CUSTOMER_GROUP_ID = {
  'sarah': '1',      // Production Builder
  'marcus': '2',     // General Contractor
  'lisa': '3',       // Remodeling Contractor
  'david': '4',      // DIY Homeowner
  'kevin': '5'       // Store Manager
};

/**
 * Default persona headers when mesh is unavailable
 * Used for fallback/development mode
 */
const FALLBACK_PERSONA_HEADERS = {
  'sarah': {
    catalogViewId: '22c02790-7c5e-474d-a3b6-c72b22203be5',
    priceBookId: 'Production-Builder'
  },
  'marcus': {
    catalogViewId: '7cba9c31-307b-4f9f-81e8-e51dc8d36f2e',
    priceBookId: 'Trade-Professional'
  },
  'lisa': {
    catalogViewId: '7cba9c31-307b-4f9f-81e8-e51dc8d36f2e',
    priceBookId: 'Trade-Professional'
  },
  'david': {
    catalogViewId: '0a4dbd61-64ae-47f6-b9c1-15d20f23b8a3',
    priceBookId: 'Retail-Registered'
  },
  'kevin': {
    catalogViewId: 'b8f3c2a1-9e5d-4f7a-8c6b-2d1e0f9a3b5c',
    priceBookId: 'Wholesale-Reseller'
  }
};

// Track if mesh is available
let meshAvailable = null;
let meshCheckPromise = null;

/**
 * Check if mesh endpoint is reachable
 */
async function checkMeshAvailability() {
  if (meshCheckPromise) return meshCheckPromise;
  
  meshCheckPromise = new Promise(async (resolve) => {
    try {
      // Try a simple persona query
      const result = await initializePersona('1');
      meshAvailable = !!result;
      console.log('[MeshIntegration] Mesh available:', meshAvailable);
      resolve(meshAvailable);
    } catch (error) {
      console.warn('[MeshIntegration] Mesh unavailable, using fallback:', error.message);
      meshAvailable = false;
      resolve(false);
    }
  });
  
  return meshCheckPromise;
}

/**
 * Initialize mesh for current persona
 * Should be called on login or app init
 * 
 * @param {string} personaId - Persona ID (e.g., 'sarah')
 * @returns {Promise<Object>} Persona data with mesh headers
 */
export async function initializeMeshForPersona(personaId) {
  console.log('[MeshIntegration] Initializing mesh for persona:', personaId);
  
  const persona = getPersona(personaId);
  if (!persona) {
    console.error('[MeshIntegration] Unknown persona:', personaId);
    return null;
  }
  
  // Get customer group ID for mesh
  const customerGroupId = PERSONA_TO_CUSTOMER_GROUP_ID[personaId];
  if (!customerGroupId) {
    console.error('[MeshIntegration] No customer group mapping for:', personaId);
    return null;
  }
  
  // Try to initialize via mesh
  try {
    const meshPersona = await initializePersona(customerGroupId);
    
    if (meshPersona) {
      console.log('[MeshIntegration] Mesh persona loaded:', meshPersona.name);
      
      // Merge mesh data with local persona
      return {
        ...persona,
        mesh: {
          catalogViewId: meshPersona.catalogViewId,
          priceBookId: meshPersona.priceBookId,
          features: meshPersona.features
        }
      };
    }
  } catch (error) {
    console.warn('[MeshIntegration] Failed to load from mesh, using fallback:', error.message);
  }
  
  // Fallback: Use hardcoded headers
  const fallback = FALLBACK_PERSONA_HEADERS[personaId];
  if (fallback) {
    setPersonaHeaders(fallback);
    console.log('[MeshIntegration] Using fallback headers for:', personaId);
    
    return {
      ...persona,
      mesh: fallback,
      usingFallback: true
    };
  }
  
  return persona;
}

/**
 * Get products from mesh (or fallback to mock)
 * 
 * @param {string} phrase - Search phrase
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Search results
 */
export async function getProducts(phrase = ' ', options = {}) {
  const isAvailable = await checkMeshAvailability();
  
  if (isAvailable) {
    try {
      return await searchProducts(phrase, options);
    } catch (error) {
      console.warn('[MeshIntegration] Product search failed, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock data
  return getMockProducts(phrase, options);
}

/**
 * Get product by SKU from mesh (or fallback)
 */
export async function getProduct(sku) {
  const isAvailable = await checkMeshAvailability();
  
  if (isAvailable) {
    try {
      return await getProductBySKU(sku);
    } catch (error) {
      console.warn('[MeshIntegration] Product fetch failed, falling back to mock:', error.message);
    }
  }
  
  // Fallback to mock data
  return getMockProductBySKU(sku);
}

/**
 * Generate BOM from mesh (or fallback to local calculation)
 * 
 * @param {Object} config - BOM configuration
 * @returns {Promise<Object>} BOM result
 */
export async function getBOM(config) {
  const isAvailable = await checkMeshAvailability();
  
  if (isAvailable) {
    try {
      return await generateBOM(config);
    } catch (error) {
      console.warn('[MeshIntegration] BOM generation failed, falling back to local:', error.message);
    }
  }
  
  // Fallback to local BOM calculation
  return getLocalBOM(config);
}

// ============================================
// FALLBACK FUNCTIONS (Use mock data)
// ============================================

/**
 * Get mock products (fallback when mesh unavailable)
 */
async function getMockProducts(phrase, options = {}) {
  // Dynamically import to avoid circular dependencies
  const { getProducts: loadMockProducts } = await import('../data-mock.js');
  
  const allProducts = await loadMockProducts();
  
  // Simple filtering
  const filtered = phrase && phrase.trim() !== ' '
    ? allProducts.filter(p => 
        p.name?.toLowerCase().includes(phrase.toLowerCase()) ||
        p.sku?.toLowerCase().includes(phrase.toLowerCase())
      )
    : allProducts;
  
  // Pagination
  const { pageSize = 20, currentPage = 1 } = options;
  const start = (currentPage - 1) * pageSize;
  const items = filtered.slice(start, start + pageSize);
  
  return {
    totalCount: filtered.length,
    items: items.map(transformMockProduct),
    pageInfo: {
      currentPage,
      pageSize,
      totalPages: Math.ceil(filtered.length / pageSize)
    }
  };
}

/**
 * Get mock product by SKU
 */
async function getMockProductBySKU(sku) {
  const { getProductBySKU: getMock } = await import('../data-mock.js');
  const product = await getMock(sku);
  return product ? transformMockProduct(product) : null;
}

/**
 * Get local BOM (fallback)
 */
async function getLocalBOM(config) {
  // Load pre-generated BOM from data files
  const { templateId, packageId } = config;
  
  try {
    const response = await fetch(`/data/boms/${templateId}-${packageId}.json`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.warn('[MeshIntegration] Failed to load local BOM:', error);
  }
  
  return null;
}

/**
 * Transform mock product to mesh format
 */
function transformMockProduct(mockProduct) {
  return {
    sku: mockProduct.sku,
    name: mockProduct.name,
    description: mockProduct.description || '',
    imageUrl: mockProduct.image || `/images/products/${mockProduct.sku}.png`,
    price: {
      value: mockProduct.price || 0,
      currency: 'USD'
    },
    inStock: mockProduct.inStock !== false,
    category: mockProduct.attributes?.product_category || mockProduct.category || 'General',
    attributes: mockProduct.attributes 
      ? Object.entries(mockProduct.attributes).map(([name, value]) => ({ name, value: String(value) }))
      : []
  };
}

// ============================================
// EXPORTS
// ============================================

export default {
  initializeMeshForPersona,
  getProducts,
  getProduct,
  getBOM,
  checkMeshAvailability
};

