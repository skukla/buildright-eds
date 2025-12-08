/**
 * Catalog Service
 * 
 * Strategy pattern implementation for product data access.
 * Provides a unified interface that can use either:
 * - MeshStrategy: Real ACO data via API Mesh
 * - MockStrategy: Local mock data for offline/development
 * 
 * The consuming code doesn't need to know which strategy is active.
 * 
 * @module scripts/services/catalog-service
 */

// ============================================
// SERVICE INTERFACE
// ============================================

/**
 * @typedef {Object} Product
 * @property {string} sku
 * @property {string} name
 * @property {string} description
 * @property {string} imageUrl
 * @property {{value: number, currency: string}} price
 * @property {boolean} inStock
 * @property {string} category
 * @property {Array<{name: string, value: string}>} attributes
 */

/**
 * @typedef {Object} SearchResult
 * @property {number} totalCount
 * @property {Product[]} items
 * @property {{currentPage: number, pageSize: number, totalPages: number}} pageInfo
 */

/**
 * @typedef {Object} BOMResult
 * @property {{value: number, currency: string}} totalCost
 * @property {Array} lineItems
 * @property {Array} phases
 * @property {Object} metadata
 */

// ============================================
// STRATEGY IMPLEMENTATIONS
// ============================================

/**
 * Mesh Strategy - Real ACO data via API Mesh
 */
const MeshStrategy = {
  name: 'mesh',
  
  async initialize(personaId) {
    const { initializePersona, setPersonaHeaders } = await import('./mesh-client.js');
    const customerGroupId = getCustomerGroupId(personaId);
    
    if (!customerGroupId) {
      throw new Error(`No customer group mapping for persona: ${personaId}`);
    }
    
    const persona = await initializePersona(customerGroupId);
    return persona;
  },
  
  async searchProducts(phrase, options = {}) {
    const { searchProducts } = await import('./mesh-client.js');
    return searchProducts(phrase, options);
  },
  
  async getProduct(sku) {
    const { getProductBySKU } = await import('./mesh-client.js');
    return getProductBySKU(sku);
  },
  
  async generateBOM(config) {
    const { generateBOM } = await import('./mesh-client.js');
    return generateBOM(config);
  }
};

/**
 * Mock Strategy - Local mock data
 */
const MockStrategy = {
  name: 'mock',
  
  async initialize(personaId) {
    // Mock doesn't need real initialization
    console.log('[MockStrategy] Using mock data for persona:', personaId);
    return { id: personaId, name: 'Mock Persona' };
  },
  
  async searchProducts(phrase, options = {}) {
    const mockData = await loadMockProducts();
    
    // Filter by phrase
    const filtered = phrase && phrase.trim()
      ? mockData.filter(p => 
          p.name?.toLowerCase().includes(phrase.toLowerCase()) ||
          p.sku?.toLowerCase().includes(phrase.toLowerCase())
        )
      : mockData;
    
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
  },
  
  async getProduct(sku) {
    const mockData = await loadMockProducts();
    const product = mockData.find(p => p.sku === sku);
    return product ? transformMockProduct(product) : null;
  },
  
  async generateBOM(config) {
    // Load pre-generated BOM from data files
    const { templateId, packageId } = config;
    
    try {
      const response = await fetch(`/data/boms/${templateId}-${packageId}.json`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('[MockStrategy] Failed to load BOM:', error);
    }
    
    return null;
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map frontend persona IDs to Commerce customer group IDs
 * This mapping is frontend-specific (demo persona names)
 */
function getCustomerGroupId(personaId) {
  const mapping = {
    'sarah': '1',      // Production Builder
    'marcus': '2',     // General Contractor
    'lisa': '3',       // Remodeling Contractor
    'david': '4',      // DIY Homeowner
    'kevin': '5'       // Store Manager
  };
  return mapping[personaId];
}

/**
 * Load mock product data
 */
async function loadMockProducts() {
  try {
    const response = await fetch('/data/mock-products.json');
    if (response.ok) {
      const data = await response.json();
      return data.products || data;
    }
  } catch (error) {
    console.warn('[CatalogService] Failed to load mock products:', error);
  }
  return [];
}

/**
 * Transform mock product to standard format
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
// CATALOG SERVICE (Strategy Selector)
// ============================================

class CatalogService {
  constructor() {
    this.strategy = null;
    this.initialized = false;
    this.personaData = null;
  }
  
  /**
   * Initialize the catalog service with a strategy
   * Automatically selects mesh if available, falls back to mock
   * 
   * @param {string} personaId - Persona ID for initialization
   * @param {Object} options - Configuration options
   * @param {string} options.forceStrategy - Force a specific strategy ('mesh' or 'mock')
   */
  async initialize(personaId, options = {}) {
    const { forceStrategy } = options;
    
    // If strategy is forced, use it
    if (forceStrategy === 'mock') {
      this.strategy = MockStrategy;
      this.personaData = await this.strategy.initialize(personaId);
      this.initialized = true;
      console.log('[CatalogService] Initialized with MockStrategy (forced)');
      return;
    }
    
    // Try mesh first
    if (forceStrategy !== 'mock') {
      try {
        this.strategy = MeshStrategy;
        this.personaData = await this.strategy.initialize(personaId);
        this.initialized = true;
        console.log('[CatalogService] Initialized with MeshStrategy');
        return;
      } catch (error) {
        console.warn('[CatalogService] Mesh unavailable, falling back to mock:', error.message);
      }
    }
    
    // Fallback to mock
    this.strategy = MockStrategy;
    this.personaData = await this.strategy.initialize(personaId);
    this.initialized = true;
    console.log('[CatalogService] Initialized with MockStrategy (fallback)');
  }
  
  /**
   * Get the active strategy name
   */
  getActiveStrategy() {
    return this.strategy?.name || 'none';
  }
  
  /**
   * Check if using real data (mesh)
   */
  isUsingRealData() {
    return this.strategy?.name === 'mesh';
  }
  
  /**
   * Search products
   * @param {string} phrase - Search phrase
   * @param {Object} options - Search options
   * @returns {Promise<SearchResult>}
   */
  async searchProducts(phrase, options = {}) {
    if (!this.initialized) {
      throw new Error('CatalogService not initialized. Call initialize() first.');
    }
    return this.strategy.searchProducts(phrase, options);
  }
  
  /**
   * Get product by SKU
   * @param {string} sku - Product SKU
   * @returns {Promise<Product|null>}
   */
  async getProduct(sku) {
    if (!this.initialized) {
      throw new Error('CatalogService not initialized. Call initialize() first.');
    }
    return this.strategy.getProduct(sku);
  }
  
  /**
   * Generate BOM from template
   * @param {Object} config - BOM configuration
   * @returns {Promise<BOMResult|null>}
   */
  async generateBOM(config) {
    if (!this.initialized) {
      throw new Error('CatalogService not initialized. Call initialize() first.');
    }
    return this.strategy.generateBOM(config);
  }
}

// ============================================
// SINGLETON INSTANCE
// ============================================

export const catalogService = new CatalogService();

// Export for direct access if needed
export {
  CatalogService,
  MeshStrategy,
  MockStrategy,
  getCustomerGroupId
};

export default catalogService;

