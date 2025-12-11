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
  
  async initialize(identifier, options = {}) {
    const { initializePersonaByEmail, initializePersona } = await import('./mesh-client.js');
    const { isProductionMode = false, email: providedEmail } = options;
    
    // Handle guest/unauthenticated users
    if (identifier === 'guest' || !identifier) {
      console.log('[CatalogService] Initializing guest persona via action');
      // Call persona action with NOT_LOGGED_IN customer group
      // Action returns the default public catalog view
      const persona = await initializePersona(NOT_LOGGED_IN_GROUP, options);
      return persona;
    }
    
    // Determine email for persona lookup
    // Priority: 1) Provided email, 2) Demo mapping
    let email = providedEmail;
    
    if (!email && !isProductionMode) {
      // Demo mode: map persona ID to email
      email = DEMO_EMAIL_MAPPING[identifier];
    }
    
    if (email) {
      // Use email-based lookup (calls persona action which handles JSON/Commerce data source)
      console.log('[CatalogService] Initializing persona by email:', email);
      const persona = await initializePersonaByEmail(email, options);
      if (persona) {
        return persona;
      }
      console.warn('[CatalogService] Email lookup returned no persona');
    }
    
    // Fallback: try customer group lookup
    const customerGroupId = isProductionMode ? identifier : DEMO_PERSONA_MAPPING[identifier];
    if (customerGroupId) {
      console.log('[CatalogService] Falling back to customer group ID:', customerGroupId);
      const persona = await initializePersona(customerGroupId, options);
      return persona;
    }
    
    // Last resort: use guest/public
    console.warn('[CatalogService] No persona found, using guest/public');
    const persona = await initializePersona(NOT_LOGGED_IN_GROUP, options);
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
  },
  
  async searchWithFacets(options = {}) {
    const { productSearchFilter } = await import('./mesh-client.js');
    return productSearchFilter(options);
  },
  
  async searchSuggestions(phrase) {
    const { searchSuggestions } = await import('./mesh-client.js');
    return searchSuggestions(phrase);
  }
};

/**
 * Mock Strategy - Local mock data
 */
const MockStrategy = {
  name: 'mock',
  
  async initialize(identifier, options = {}) {
    // Mock doesn't need real initialization
    const { isProductionMode = false } = options;
    const customerGroupId = resolveCustomerGroupId(identifier, isProductionMode);
    console.log('[MockStrategy] Using mock data for:', identifier, '(group:', customerGroupId, ')');
    return { id: identifier, customerGroupId, name: 'Mock Persona' };
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
  },
  
  async searchWithFacets(options = {}) {
    const { phrase, filter, sort, limit = 20, page = 1 } = options;
    const mockData = await loadMockProducts();
    
    // Filter by phrase
    let filtered = phrase && phrase.trim()
      ? mockData.filter(p => 
          p.name?.toLowerCase().includes(phrase.toLowerCase()) ||
          p.sku?.toLowerCase().includes(phrase.toLowerCase())
        )
      : mockData;
    
    // Apply filters
    if (filter?.product_category?.length) {
      filtered = filtered.filter(p => 
        filter.product_category.includes(p.attributes?.product_category)
      );
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const items = filtered.slice(start, start + limit);
    const totalCount = filtered.length;
    const totalPages = Math.ceil(totalCount / limit);
    
    // Generate mock facets from available data
    const categoryFacets = mockData.reduce((acc, p) => {
      const cat = p.attributes?.product_category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});
    
    return {
      products: {
        items: items.map(transformMockProduct),
        totalCount,
        hasMoreItems: page < totalPages,
        currentPage: page,
        pageInfo: {
          currentPage: page,
          pageSize: limit,
          totalPages
        }
      },
      facets: {
        facets: [{
          key: 'product_category',
          title: 'Category',
          type: 'scalar',
          attributeCode: 'product_category',
          options: Object.entries(categoryFacets).map(([name, count]) => ({
            id: name,
            name,
            count
          }))
        }],
        totalCount
      },
      totalCount
    };
  },
  
  async searchSuggestions(phrase) {
    if (!phrase || phrase.length < 2) {
      return { suggestions: [], totalCount: 0 };
    }
    
    const mockData = await loadMockProducts();
    const filtered = mockData.filter(p => 
      p.name?.toLowerCase().includes(phrase.toLowerCase()) ||
      p.sku?.toLowerCase().includes(phrase.toLowerCase())
    ).slice(0, 5);
    
    return {
      suggestions: filtered.map(p => ({
        id: p.sku,
        name: p.name,
        sku: p.sku,
        urlKey: p.sku.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        price: p.price?.final?.amount?.value?.toFixed(2) || null,
        image: p.images?.[0]?.url || null
      })),
      totalCount: filtered.length
    };
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Map frontend persona IDs to Commerce customer emails
 * This is used to call the persona action which then queries Commerce
 * for the customer's ACO attributes (aco_catalog_view_id, aco_price_book_id)
 * 
 * Note: 'guest' is NOT included - guests use default public catalog view
 */
const DEMO_EMAIL_MAPPING = {
  'sarah': 'sarah.martinez@sunbelthomes.com',
  'marcus': 'marcus.johnson@johnsonconstruction.com',
  'lisa': 'lisa.chen@chendesignbuild.com',
  'david': 'david.thompson@email.com',
  'kevin': 'kevin.rodriguez@precisionlumber.com'
};

/**
 * Customer group ID for unauthenticated users in Commerce
 */
const NOT_LOGGED_IN_GROUP = '0';

/**
 * Map frontend persona IDs to Commerce customer group IDs
 * DEPRECATED: Use DEMO_EMAIL_MAPPING instead for persona action calls
 * Kept for backwards compatibility with older code paths
 */
const DEMO_PERSONA_MAPPING = {
  'sarah': '1',      // Production Builder
  'marcus': '2',     // General Contractor
  'lisa': '3',       // Remodeling Contractor
  'david': '4',      // DIY Homeowner
  'kevin': '5',      // Store Manager
  'guest': '4'       // Unauthenticated users see DIY Homeowner catalog (public view)
};

/**
 * Resolve customer group ID from either:
 * - Demo mode: persona ID ("sarah") → customer group ("1")
 * - Production mode: customer group ID passed directly ("1")
 * 
 * @param {string} identifier - Either persona ID or customer group ID
 * @param {boolean} isProductionMode - If true, identifier is already a customer group ID
 * @returns {string|null} Customer group ID
 */
function resolveCustomerGroupId(identifier, isProductionMode = false) {
  if (isProductionMode) {
    // Production: identifier IS the customer group ID from Commerce
    return identifier;
  }
  
  // Demo: map persona ID to customer group ID
  return DEMO_PERSONA_MAPPING[identifier] || null;
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
    this.initializing = null; // Promise to prevent concurrent initialization
    this.personaData = null;
  }
  
  /**
   * Check if service is initialized
   */
  get isInitialized() {
    return this.initialized;
  }
  
  /**
   * Initialize the catalog service with a strategy
   * Automatically selects mesh if available, falls back to mock
   * 
   * Includes deduplication - if called multiple times concurrently,
   * only one initialization occurs and all callers await the same promise.
   * 
   * @param {string} identifier - Persona ID (demo) or Customer Group ID (production)
   * @param {Object} options - Configuration options
   * @param {string} options.forceStrategy - Force a specific strategy ('mesh' or 'mock')
   * @param {boolean} options.isProductionMode - If true, identifier is a customer group ID from Commerce
   * 
   * @example
   * // Demo mode (persona ID)
   * await catalogService.initialize('sarah');
   * 
   * @example
   * // Production mode (customer group ID from Commerce Auth)
   * await catalogService.initialize(user.group_id, { isProductionMode: true });
   */
  async initialize(identifier, options = {}) {
    // Already initialized - return immediately
    if (this.initialized) {
      console.log('[CatalogService] Already initialized, skipping');
      return;
    }
    
    // Initialization in progress - wait for it
    if (this.initializing) {
      console.log('[CatalogService] Initialization in progress, waiting...');
      return this.initializing;
    }
    
    // Start initialization and store the promise
    this.initializing = this._doInitialize(identifier, options);
    
    try {
      await this.initializing;
    } finally {
      this.initializing = null;
    }
  }
  
  /**
   * Internal initialization logic
   */
  async _doInitialize(identifier, options = {}) {
    const { forceStrategy, isProductionMode = false } = options;
    
    // If strategy is forced, use it
    if (forceStrategy === 'mock') {
      this.strategy = MockStrategy;
      this.personaData = await this.strategy.initialize(identifier, { isProductionMode });
      this.initialized = true;
      console.log('[CatalogService] Initialized with MockStrategy (forced)');
      return;
    }
    
    // Try mesh first
    if (forceStrategy !== 'mock') {
      try {
        this.strategy = MeshStrategy;
        this.personaData = await this.strategy.initialize(identifier, { isProductionMode });
        this.initialized = true;
        console.log('[CatalogService] Initialized with MeshStrategy');
        return;
      } catch (error) {
        console.warn('[CatalogService] Mesh unavailable, falling back to mock:', error.message);
      }
    }
    
    // Fallback to mock
    this.strategy = MockStrategy;
    this.personaData = await this.strategy.initialize(identifier, { isProductionMode });
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
  
  /**
   * Search products with facets (consolidated query)
   * Similar to citisignal-nextjs useProductSearchFilter
   * 
   * @param {Object} options - Search options
   * @param {string} options.phrase - Search phrase
   * @param {Object} options.filter - Filter options
   * @param {Object} options.sort - Sort options { attribute, direction }
   * @param {number} options.limit - Page size
   * @param {number} options.page - Page number
   * @returns {Promise<Object>} Search results with products and facets
   */
  async searchWithFacets(options = {}) {
    if (!this.initialized) {
      throw new Error('CatalogService not initialized. Call initialize() first.');
    }
    return this.strategy.searchWithFacets(options);
  }
  
  /**
   * Get search suggestions for autocomplete
   * Similar to citisignal-nextjs useSearchSuggestions
   * 
   * @param {string} phrase - Search phrase (min 2 chars)
   * @returns {Promise<Object>} Suggestions
   */
  async searchSuggestions(phrase) {
    if (!this.initialized) {
      throw new Error('CatalogService not initialized. Call initialize() first.');
    }
    return this.strategy.searchSuggestions(phrase);
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
  resolveCustomerGroupId,
  DEMO_PERSONA_MAPPING
};

export default catalogService;

