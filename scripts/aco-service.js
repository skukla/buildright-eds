/**
 * Mock ACO Service Layer
 * Simulates Adobe Commerce Optimizer API behavior
 * 
 * NOTE: This is a MOCK for frontend development.
 * Production will connect to real ACO via API Mesh.
 * 
 * API signatures match expected ACO GraphQL format for seamless transition.
 */

import { getProducts as loadMockProducts } from './data-mock.js';
import { CUSTOMER_GROUPS } from './persona-config.js';

// Simulate network latency for realistic loading states
// Reduced to 100ms for snappier demo experience (production APIs are typically fast)
const MOCK_LATENCY_MS = 100;

class MockACOService {
  constructor() {
    this.products = [];
    this.initialized = false;
  }
  
  /**
   * Initialize service (load mock data)
   */
  async initialize() {
    if (this.initialized) return;
    
    console.log('[Mock ACO] Initializing...');
    
    try {
      this.products = await loadMockProducts();
      this.initialized = true;
      console.log(`[Mock ACO] Loaded ${this.products.length} products`);
    } catch (error) {
      console.error('[Mock ACO] Failed to initialize:', error);
      this.products = [];
    }
  }
  
  /**
   * Get products with filtering
   * Simulates ACO catalog query with triggered policies
   * 
   * @param {Object} options - Query options
   * @param {Object} options.filters - Attribute filters (e.g., {construction_phase: 'foundation_framing'})
   * @param {Object} options.userContext - User context (customerGroup, personaId)
   * @param {string} options.policy - Policy name to apply
   * @param {number} options.limit - Max results (default: 100)
   * @param {number} options.offset - Pagination offset (default: 0)
   * @returns {Promise<Object>} Query result with products, totalCount, facets
   */
  async getProducts(options = {}) {
    await this.initialize();
    await this._simulateLatency();
    
    const {
      filters = {},
      userContext = {},
      policy = null,
      limit = 100,
      offset = 0
    } = options;
    
    console.log('[Mock ACO] getProducts:', { filters, policy, userContext });
    
    let filteredProducts = [...this.products];
    
    // Apply triggered policy if specified
    if (policy) {
      filteredProducts = this._applyPolicy(filteredProducts, policy);
      console.log(`[Mock ACO] Policy "${policy}" filtered to ${filteredProducts.length} products`);
    }
    
    // Apply attribute filters
    Object.entries(filters).forEach(([attr, value]) => {
      // Map UI filter keys to product attribute keys
      const attrKey = attr === 'category' ? 'product_category' : attr;
      
      filteredProducts = filteredProducts.filter(product => {
        const attrValue = product.attributes?.[attrKey];
        
        // Handle array filter values (e.g., multiple categories selected)
        if (Array.isArray(value)) {
          // If the product attribute is also an array, check for intersection
          if (Array.isArray(attrValue)) {
            return value.some(v => attrValue.includes(v));
          }
          // If product attribute is single value, check if it's in the filter array
          return value.includes(attrValue);
        }
        
        // Handle array attributes (e.g., project_types)
        if (Array.isArray(attrValue)) {
          return attrValue.includes(value);
        }
        
        // Handle boolean attributes
        if (typeof value === 'boolean') {
          return attrValue === value;
        }
        
        // Handle string/number attributes
        return attrValue === value;
      });
    });
    
    console.log(`[Mock ACO] Attribute filters applied: ${filteredProducts.length} products`);
    
    // Apply customer group filtering (visibility rules)
    if (userContext.customerGroup) {
      // In production ACO, this would filter based on catalog view visibility
      // For mock, we log the context but show all products
      console.log(`[Mock ACO] Customer group: ${userContext.customerGroup}`);
    }
    
    // Pagination
    const totalCount = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);
    
    return {
      products: paginatedProducts,
      totalCount,
      offset,
      limit,
      facets: this._generateFacets(filteredProducts),
      appliedPolicy: policy,
      appliedFilters: filters
    };
  }
  
  /**
   * Get single product by SKU
   * 
   * @param {string} sku - Product SKU
   * @param {Object} userContext - User context for pricing
   * @returns {Promise<Object|null>} Product or null
   */
  async getProduct(sku, userContext = {}) {
    await this.initialize();
    await this._simulateLatency();
    
    const product = this.products.find(p => p.sku === sku);
    
    if (!product) {
      console.warn(`[Mock ACO] Product not found: ${sku}`);
      return null;
    }
    
    // Enrich with pricing if customer group provided
    if (userContext.customerGroup) {
      const pricing = await this.getPricing({
        productIds: [sku],
        customerGroup: userContext.customerGroup,
        quantity: 1
      });
      
      return {
        ...product,
        pricing: pricing.pricing[sku]
      };
    }
    
    return product;
  }
  
  /**
   * Get pricing for products (customer-group-specific)
   * Simulates ACO pricing API with price books
   * 
   * @param {Object} options - Pricing options
   * @param {Array<string>} options.productIds - Product SKUs
   * @param {string} options.customerGroup - Customer group ID
   * @param {number} options.quantity - Quantity for volume pricing
   * @returns {Promise<Object>} Pricing data
   */
  async getPricing(options = {}) {
    await this.initialize();
    await this._simulateLatency();
    
    const {
      productIds = [],
      customerGroup = CUSTOMER_GROUPS.US_RETAIL,
      quantity = 1
    } = options;
    
    console.log('[Mock ACO] getPricing:', { productIds, customerGroup, quantity });
    
    const pricing = {};
    
    productIds.forEach(sku => {
      const product = this.products.find(p => p.sku === sku);
      if (product) {
        pricing[sku] = this._calculatePrice(product, customerGroup, quantity);
      }
    });
    
    return {
      pricing,
      customerGroup,
      quantity
    };
  }
  
  /**
   * Apply triggered policy (CCDM filtering)
   * Maps policy names to filter functions
   * 
   * @private
   */
  _applyPolicy(products, policyName) {
    console.log(`[Mock ACO] Applying policy: ${policyName}`);
    
    // Define policy filters (from Phase 1 policy definitions)
    const policies = {
      // Construction phase policies (Marcus)
      'phase_foundation_framing': (p) => {
        return p.attributes?.construction_phase === 'foundation_framing';
      },
      'phase_envelope': (p) => {
        return p.attributes?.construction_phase === 'envelope';
      },
      'phase_interior_finish': (p) => {
        return p.attributes?.construction_phase === 'interior_finish';
      },
      
      // Quality tier policies (Marcus)
      'quality_builder_grade': (p) => {
        return p.attributes?.quality_tier === 'builder_grade';
      },
      'quality_professional': (p) => {
        return p.attributes?.quality_tier === 'professional';
      },
      'quality_premium': (p) => {
        return p.attributes?.quality_tier === 'premium';
      },
      
      // Deck builder policies (David)
      'deck_compatible': (p) => {
        return p.attributes?.deck_compatible === true;
      },
      'deck_rectangular': (p) => {
        const shapes = p.attributes?.deck_shape;
        if (Array.isArray(shapes)) {
          return shapes.includes('rectangular');
        }
        return shapes === 'rectangular';
      },
      'deck_l_shaped': (p) => {
        const shapes = p.attributes?.deck_shape;
        if (Array.isArray(shapes)) {
          return shapes.includes('l_shaped');
        }
        return shapes === 'l_shaped';
      },
      'deck_material_wood': (p) => {
        return p.attributes?.deck_material_type === 'wood';
      },
      'deck_material_composite': (p) => {
        return p.attributes?.deck_material_type === 'composite';
      },
      'deck_material_pvc': (p) => {
        return p.attributes?.deck_material_type === 'pvc';
      },
      
      // Package tier policies (Lisa)
      'package_good': (p) => {
        const tiers = p.attributes?.package_tier;
        if (Array.isArray(tiers)) {
          return tiers.includes('good');
        }
        return tiers === 'good';
      },
      'package_better': (p) => {
        const tiers = p.attributes?.package_tier;
        if (Array.isArray(tiers)) {
          return tiers.includes('better');
        }
        return tiers === 'better';
      },
      'package_best': (p) => {
        const tiers = p.attributes?.package_tier;
        if (Array.isArray(tiers)) {
          return tiers.includes('best');
        }
        return tiers === 'best';
      },
      
      // Room category policies (Lisa)
      'room_bathroom': (p) => {
        return p.attributes?.room_category === 'bathroom';
      },
      'room_kitchen': (p) => {
        return p.attributes?.room_category === 'kitchen';
      },
      
      // Store velocity policies (Kevin)
      'velocity_high': (p) => {
        return p.attributes?.store_velocity_category === 'high_volume';
      },
      'velocity_medium': (p) => {
        return p.attributes?.store_velocity_category === 'medium_volume';
      },
      'velocity_low': (p) => {
        return p.attributes?.store_velocity_category === 'low_volume';
      },
      
      // Restock priority policies (Kevin)
      'restock_high': (p) => {
        return p.attributes?.restock_priority === 'high';
      },
      'restock_medium': (p) => {
        return p.attributes?.restock_priority === 'medium';
      }
    };
    
    const policyFilter = policies[policyName];
    
    if (!policyFilter) {
      console.warn(`[Mock ACO] Unknown policy: ${policyName}`);
      return products;
    }
    
    return products.filter(policyFilter);
  }
  
  /**
   * Calculate price based on customer group and quantity
   * Implements 2-layer pricing: customer tier + volume tier
   * 
   * @private
   */
  _calculatePrice(product, customerGroup, quantity) {
    const basePrice = product.price || 0;
    
    // Customer group pricing multipliers (from Phase 1)
    const groupMultipliers = {
      [CUSTOMER_GROUPS.US_RETAIL]: 1.0,
      [CUSTOMER_GROUPS.RETAIL_REGISTERED]: 0.95,
      [CUSTOMER_GROUPS.TRADE_PROFESSIONAL]: 0.90,
      [CUSTOMER_GROUPS.PRODUCTION_BUILDER]: 0.85,
      [CUSTOMER_GROUPS.WHOLESALE_RESELLER]: 0.75
    };
    
    // Volume tier multipliers (stacks with customer tier)
    const volumeMultipliers = {
      '1-99': 1.0,
      '100-293': 0.95,  // 5% volume discount
      '294+': 0.88      // 12% volume discount (combined with customer group = up to 25% total)
    };
    
    // Determine volume tier
    let volumeTier = '1-99';
    if (quantity >= 294) {
      volumeTier = '294+';
    } else if (quantity >= 100) {
      volumeTier = '100-293';
    }
    
    // Calculate final price
    const groupMultiplier = groupMultipliers[customerGroup] || 1.0;
    const volumeMultiplier = volumeMultipliers[volumeTier];
    
    const unitPrice = basePrice * groupMultiplier * volumeMultiplier;
    const totalPrice = unitPrice * quantity;
    
    // Calculate savings (PROMOTIONS ONLY - not contract pricing)
    // 
    // Design Decision: Savings badges should only appear for promotional discounts
    // that beat the customer's contract price, not for the contract discount itself.
    // 
    // Why? Contract pricing is the customer's "normal" - showing "Save 20%" on every
    // product for Sarah (contractor with 20% discount) creates badge fatigue and
    // reduces the urgency signal for actual limited-time promotions.
    // 
    // Current state: No promotions engine implemented yet, so savings = 0
    // Future: When adding promotions, calculate as:
    //   contractPrice = basePrice * groupMultiplier * volumeMultiplier
    //   promotionalPrice = /* fetch from promotions engine */
    //   if (promotionalPrice < contractPrice) {
    //     savings = contractPrice - promotionalPrice
    //     savingsPercent = (savings / contractPrice) * 100
    //   }
    const retailPrice = basePrice;
    const contractPrice = unitPrice; // Customer's normal price
    const promotionalPrice = null; // TODO: Fetch from promotions engine when implemented
    
    // Only show savings if promotional price beats contract price
    const savings = promotionalPrice && promotionalPrice < contractPrice 
      ? contractPrice - promotionalPrice 
      : 0;
    const savingsPercent = savings > 0 
      ? (savings / contractPrice) * 100 
      : 0;
    
    // Build volume tiers array for PDP volume pricing display
    // Note: These show the volume discount percentages (5%, 12%) relative to
    // the customer's base contract price, not promotional savings badges.
    // This is informational pricing structure, not urgency messaging.
    const volumeTiers = [
      {
        minQuantity: 1,
        maxQuantity: 99,
        unitPrice: parseFloat((basePrice * groupMultiplier * 1.0).toFixed(2)),
        savingsPercent: 0 // No volume discount at base tier
      },
      {
        minQuantity: 100,
        maxQuantity: 293,
        unitPrice: parseFloat((basePrice * groupMultiplier * 0.95).toFixed(2)),
        savingsPercent: 5 // 5% volume discount vs base tier
      },
      {
        minQuantity: 294,
        maxQuantity: null,
        unitPrice: parseFloat((basePrice * groupMultiplier * 0.88).toFixed(2)),
        savingsPercent: 12 // 12% volume discount vs base tier
      }
    ];
    
    return {
      basePrice: parseFloat(basePrice.toFixed(2)),
      unitPrice: parseFloat(unitPrice.toFixed(2)),
      totalPrice: parseFloat(totalPrice.toFixed(2)),
      customerGroup,
      volumeTier,
      volumeTiers,  // Add volume tiers array for PDP display
      quantity,
      retailPrice: parseFloat(retailPrice.toFixed(2)),
      savings: parseFloat(savings.toFixed(2)),
      savingsPercent: parseFloat(savingsPercent.toFixed(1)),
      currency: 'USD'
    };
  }
  
  /**
   * Generate facets for filtering
   * Returns counts for each facet value
   * 
   * @private
   */
  _generateFacets(products) {
    const facets = {
      categories: {},
      construction_phase: {},
      quality_tier: {},
      deck_material_type: {},
      package_tier: {},
      room_category: {},
      store_velocity_category: {},
      restock_priority: {}
    };
    
    products.forEach(product => {
      // Attribute facets
      if (product.attributes) {
        // Category facet (from product_category attribute)
        if (product.attributes.product_category) {
          facets.categories[product.attributes.product_category] = 
            (facets.categories[product.attributes.product_category] || 0) + 1;
        }
        
        const singleValueAttrs = [
          'construction_phase',
          'quality_tier',
          'deck_material_type',
          'room_category',
          'store_velocity_category',
          'restock_priority'
        ];
        
        singleValueAttrs.forEach(attr => {
          const value = product.attributes[attr];
          if (value) {
            facets[attr][value] = (facets[attr][value] || 0) + 1;
          }
        });
        
        // Package tier (array attribute)
        if (Array.isArray(product.attributes.package_tier)) {
          product.attributes.package_tier.forEach(tier => {
            facets.package_tier[tier] = (facets.package_tier[tier] || 0) + 1;
          });
        }
      }
    });
    
    // Remove empty facets
    Object.keys(facets).forEach(key => {
      if (Object.keys(facets[key]).length === 0) {
        delete facets[key];
      }
    });
    
    return facets;
  }
  
  /**
   * Simulate network latency
   * @private
   */
  async _simulateLatency() {
    return new Promise(resolve => setTimeout(resolve, MOCK_LATENCY_MS));
  }
  
  /**
   * Get user context (mock)
   * In production, this would be part of API Mesh resolver
   * 
   * @param {string} userId - User ID
   * @returns {Promise<Object>} User context
   */
  async getUserContext(userId) {
    await this._simulateLatency();
    
    // In production, this would fetch from Adobe Commerce via API Mesh
    // For mock, return based on localStorage persona
    const personaId = localStorage.getItem('currentPersona');
    
    if (!personaId) {
      return {
        userId,
        customerGroup: CUSTOMER_GROUPS.US_RETAIL,
        personaId: null,
        policies: []
      };
    }
    
    // Dynamic import to avoid circular dependency
    const { getPersona } = await import('./persona-config.js');
    const persona = getPersona(personaId);
    
    if (!persona) {
      return {
        userId,
        customerGroup: CUSTOMER_GROUPS.US_RETAIL,
        personaId: null,
        policies: []
      };
    }
    
    return {
      userId,
      customerGroup: persona.customerGroup,
      personaId: persona.id,
      attributes: persona.attributes,
      policies: [] // Policies applied server-side in production
    };
  }
  
  /**
   * Search products
   * Simulates ACO search with relevance scoring
   * 
   * @param {string} query - Search query
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Search results
   */
  async searchProducts(query, options = {}) {
    await this.initialize();
    await this._simulateLatency();
    
    const {
      filters = {},
      userContext = {},
      limit = 20,
      offset = 0
    } = options;
    
    console.log('[Mock ACO] searchProducts:', { query, filters });
    
    if (!query || query.trim() === '') {
      return this.getProducts({ filters, userContext, limit, offset });
    }
    
    const searchTerm = query.toLowerCase();
    
    // Simple relevance scoring
    let results = this.products.map(product => {
      let score = 0;
      
      // Name match (highest weight)
      if (product.name?.toLowerCase().includes(searchTerm)) {
        score += 10;
      }
      
      // SKU match
      if (product.sku?.toLowerCase().includes(searchTerm)) {
        score += 8;
      }
      
      // Description match
      if (product.description?.toLowerCase().includes(searchTerm)) {
        score += 5;
      }
      
      // Category match
      if (product.category?.toLowerCase().includes(searchTerm)) {
        score += 3;
      }
      
      return { product, score };
    });
    
    // Filter to only matches
    results = results.filter(r => r.score > 0);
    
    // Sort by relevance
    results.sort((a, b) => b.score - a.score);
    
    // Extract products
    let filteredProducts = results.map(r => r.product);
    
    // Apply filters
    Object.entries(filters).forEach(([attr, value]) => {
      filteredProducts = filteredProducts.filter(product => {
        const attrValue = product.attributes?.[attr];
        if (Array.isArray(attrValue)) {
          return attrValue.includes(value);
        }
        return attrValue === value;
      });
    });
    
    const totalCount = filteredProducts.length;
    const paginatedProducts = filteredProducts.slice(offset, offset + limit);
    
    return {
      products: paginatedProducts,
      totalCount,
      offset,
      limit,
      query,
      facets: this._generateFacets(filteredProducts)
    };
  }
}

// Singleton instance
export const acoService = new MockACOService();

// Export class for testing
export { MockACOService };

