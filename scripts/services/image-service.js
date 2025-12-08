/**
 * Image Service - Strategy Pattern for Product Images
 * 
 * Mirrors the catalog-service.js pattern to provide consistent
 * image resolution with easy migration path to AEM Assets.
 * 
 * Usage:
 *   import { imageService } from './services/image-service.js';
 *   
 *   // Initialize (typically done by auth.js)
 *   await imageService.initialize();
 *   
 *   // Get image URLs
 *   const url = imageService.getProductImage('SKU-001');
 *   const templateUrl = imageService.getTemplateImage('sedona');
 * 
 * Strategies:
 *   - LocalStrategy: Uses local files, Unsplash, hardcoded demo URLs
 *   - AEMAssetsStrategy: (Future) Uses AEM Assets Dynamic Media
 */

// ============================================================================
// LOCAL STRATEGY - Demo/Development
// ============================================================================

const LocalStrategy = {
  name: 'local',
  
  /**
   * Initialize the local strategy
   */
  async initialize() {
    console.log('[ImageService] Initialized with LocalStrategy');
    return true;
  },
  
  /**
   * Get product image URL
   * @param {string} sku - Product SKU
   * @param {Object} options - Image options
   * @param {string} options.size - 'thumbnail' | 'small' | 'medium' | 'large'
   * @param {string} options.fallbackCategory - Category for fallback image
   * @returns {string} Image URL
   */
  getProductImage(sku, options = {}) {
    if (!sku) return this.getPlaceholder('product');
    
    // SKU-based local path (primary)
    const localPath = `${window.BASE_PATH || '/'}images/products/${sku}.png`;
    
    // For local strategy, we return the local path
    // The UI handles onerror with placeholder CSS
    return localPath;
  },
  
  /**
   * Get template/floor plan image URL
   * @param {string} templateId - Template ID (e.g., 'sedona', 'mesa')
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getTemplateImage(templateId, options = {}) {
    // Template images are stored locally
    const basePath = window.BASE_PATH || '/';
    
    // Check for template-specific images
    const templateImages = {
      'sedona': `${basePath}images/templates/sedona.jpg`,
      'mesa': `${basePath}images/templates/mesa.jpg`,
      'canyon': `${basePath}images/templates/canyon.jpg`,
      'desert-bloom': `${basePath}images/templates/desert-bloom.jpg`,
      'sunrise': `${basePath}images/templates/sunrise.jpg`,
      'vista': `${basePath}images/templates/vista.jpg`,
    };
    
    return templateImages[templateId] || `${basePath}images/templates/default-floorplan.png`;
  },
  
  /**
   * Get variant image URL (e.g., covered patio, 3-car garage)
   * @param {string} variantName - Variant name
   * @param {Object} options - Image options
   * @returns {string} Image URL with optional positioning hints
   */
  getVariantImage(variantName, options = {}) {
    // Curated Unsplash images for variants
    const variantImages = {
      'Covered Patio': {
        url: 'https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop',
        position: 'center 60%'
      },
      'Extended Garage': {
        url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&h=300&fit=crop',
        position: 'center'
      },
      '3-Car Garage': {
        url: 'https://images.unsplash.com/photo-1486006920555-c77dcf18193c?w=400&h=300&fit=crop',
        position: 'center'
      },
      'Upgraded Kitchen': {
        url: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
        position: 'center'
      },
      'Primary Suite Expansion': {
        url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=400&h=300&fit=crop',
        position: 'center'
      },
      'Home Office': {
        url: 'https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=400&h=300&fit=crop',
        position: 'center'
      },
      'Bonus Room': {
        url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
        position: 'center'
      },
      'Solar Package': {
        url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        position: 'center'
      }
    };
    
    const match = variantImages[variantName];
    if (match) {
      return options.includePosition ? match : match.url;
    }
    
    // Default house image
    return options.includePosition 
      ? { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop', position: 'center' }
      : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop';
  },
  
  /**
   * Get package image URL (material packages)
   * @param {string} packageId - Package ID
   * @param {string} tier - Quality tier
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getPackageImage(packageId, tier, options = {}) {
    // Curated Unsplash images for package tiers
    const tierImages = {
      'builder_grade': 'https://images.unsplash.com/photo-1723257129172-6315cde654da?w=400&h=300&fit=crop&q=80',
      'premium': 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop&q=80',
      'luxury': 'https://images.unsplash.com/photo-1628745277862-bc0b2d68c50c?w=400&h=300&fit=crop&q=80',
    };
    
    return tierImages[tier] || tierImages['builder_grade'];
  },
  
  /**
   * Get construction phase image URL
   * @param {string} phaseName - Phase name
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getPhaseImage(phaseName, options = {}) {
    const phaseImages = {
      'Foundation & Framing': 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop',
      'Envelope': 'https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=400&h=300&fit=crop',
      'Interior Finish': 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=400&h=300&fit=crop',
      'Specialty': 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop',
    };
    
    return phaseImages[phaseName] || 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop';
  },
  
  /**
   * Get category image URL
   * @param {string} category - Product category
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getCategoryImage(category, options = {}) {
    const basePath = window.BASE_PATH || '/';
    
    const categoryImages = {
      'structural_materials': `${basePath}images/categories/structural.jpg`,
      'windows_doors': `${basePath}images/categories/windows-doors.jpg`,
      'fasteners_hardware': `${basePath}images/categories/fasteners.jpg`,
      'roofing': `${basePath}images/categories/roofing.jpg`,
      'framing_drywall': `${basePath}images/categories/drywall.jpg`,
      'plumbing': `${basePath}images/categories/plumbing.jpg`,
      'electrical': `${basePath}images/categories/electrical.jpg`,
      'hvac': `${basePath}images/categories/hvac.jpg`,
    };
    
    return categoryImages[category] || `${basePath}images/categories/default.jpg`;
  },
  
  /**
   * Get placeholder URL for a given type
   * @param {string} type - 'product' | 'template' | 'category'
   * @returns {string} Placeholder URL or null (use CSS placeholder)
   */
  getPlaceholder(type = 'product') {
    // Return null to signal that CSS placeholder should be used
    // This keeps the diagonal lines pattern consistent
    return null;
  }
};


// ============================================================================
// AEM ASSETS STRATEGY - Production (Future)
// ============================================================================

const AEMAssetsStrategy = {
  name: 'aem-assets',
  
  // Configuration (set during initialize)
  config: {
    deliveryUrl: null,      // e.g., 'https://delivery.adobeassets.com'
    dynamicMediaUrl: null,  // e.g., 'https://s7d1.scene7.com'
    assetPrefix: null,      // e.g., '/content/dam/buildright'
  },
  
  /**
   * Initialize AEM Assets strategy
   * @param {Object} config - AEM Assets configuration
   */
  async initialize(config = {}) {
    this.config = {
      deliveryUrl: config.deliveryUrl || process.env.AEM_ASSETS_DELIVERY_URL,
      dynamicMediaUrl: config.dynamicMediaUrl || process.env.DYNAMIC_MEDIA_URL,
      assetPrefix: config.assetPrefix || '/content/dam/buildright',
    };
    
    if (!this.config.deliveryUrl) {
      console.warn('[ImageService] AEM Assets delivery URL not configured');
      return false;
    }
    
    console.log('[ImageService] Initialized with AEMAssetsStrategy');
    return true;
  },
  
  /**
   * Get product image URL from AEM Assets
   * @param {string} sku - Product SKU
   * @param {Object} options - Image options
   * @returns {string} Dynamic Media optimized URL
   */
  getProductImage(sku, options = {}) {
    if (!sku) return this.getPlaceholder('product');
    
    const { size = 'medium', format = 'webp', quality = 80 } = options;
    
    // Size presets for Dynamic Media
    const sizePresets = {
      thumbnail: { width: 80, height: 80 },
      small: { width: 200, height: 200 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
    };
    
    const { width, height } = sizePresets[size] || sizePresets.medium;
    
    // Dynamic Media URL with smart crop and optimization
    // Format: https://delivery.adobeassets.com/dm/{assetPath}?width=400&format=webp&crop=smart
    const assetPath = `${this.config.assetPrefix}/products/${sku}`;
    
    return `${this.config.deliveryUrl}/dm${assetPath}?width=${width}&height=${height}&format=${format}&quality=${quality}&crop=smart`;
  },
  
  /**
   * Get template image URL from AEM Assets
   */
  getTemplateImage(templateId, options = {}) {
    const { format = 'webp', quality = 80 } = options;
    const assetPath = `${this.config.assetPrefix}/templates/${templateId}`;
    
    return `${this.config.deliveryUrl}/dm${assetPath}?width=600&format=${format}&quality=${quality}`;
  },
  
  /**
   * Get variant image - falls back to local for now
   * (Variants might not be in AEM Assets initially)
   */
  getVariantImage(variantName, options = {}) {
    // For now, delegate to local strategy for variants
    return LocalStrategy.getVariantImage(variantName, options);
  },
  
  /**
   * Get package image - falls back to local for now
   */
  getPackageImage(packageId, tier, options = {}) {
    return LocalStrategy.getPackageImage(packageId, tier, options);
  },
  
  /**
   * Get phase image - falls back to local for now
   */
  getPhaseImage(phaseName, options = {}) {
    return LocalStrategy.getPhaseImage(phaseName, options);
  },
  
  /**
   * Get category image from AEM Assets
   */
  getCategoryImage(category, options = {}) {
    const { format = 'webp', quality = 80 } = options;
    const assetPath = `${this.config.assetPrefix}/categories/${category}`;
    
    return `${this.config.deliveryUrl}/dm${assetPath}?width=400&format=${format}&quality=${quality}`;
  },
  
  /**
   * Get placeholder - AEM Assets might have its own placeholder
   */
  getPlaceholder(type = 'product') {
    // Could return an AEM-hosted placeholder, or null for CSS
    return null;
  }
};


// ============================================================================
// IMAGE SERVICE - Main Class
// ============================================================================

class ImageService {
  constructor() {
    this.strategy = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the image service
   * @param {Object} options - Configuration options
   * @param {string} options.strategy - 'local' | 'aem-assets' | 'auto'
   * @param {Object} options.aemConfig - AEM Assets configuration (if using aem-assets)
   */
  async initialize(options = {}) {
    if (this.initialized) return;
    
    const { strategy = 'auto', aemConfig = {} } = options;
    
    if (strategy === 'aem-assets') {
      // Force AEM Assets strategy
      const success = await AEMAssetsStrategy.initialize(aemConfig);
      if (success) {
        this.strategy = AEMAssetsStrategy;
      } else {
        console.warn('[ImageService] AEM Assets init failed, falling back to local');
        await LocalStrategy.initialize();
        this.strategy = LocalStrategy;
      }
    } else if (strategy === 'local') {
      // Force local strategy
      await LocalStrategy.initialize();
      this.strategy = LocalStrategy;
    } else {
      // Auto-detect: check if AEM Assets is configured
      const aemConfigured = aemConfig.deliveryUrl || 
                           (typeof process !== 'undefined' && process.env?.AEM_ASSETS_DELIVERY_URL);
      
      if (aemConfigured) {
        const success = await AEMAssetsStrategy.initialize(aemConfig);
        if (success) {
          this.strategy = AEMAssetsStrategy;
        } else {
          await LocalStrategy.initialize();
          this.strategy = LocalStrategy;
        }
      } else {
        await LocalStrategy.initialize();
        this.strategy = LocalStrategy;
      }
    }
    
    this.initialized = true;
  }
  
  /**
   * Get the active strategy name
   * @returns {string} 'local' | 'aem-assets' | 'none'
   */
  getActiveStrategy() {
    return this.strategy?.name || 'none';
  }
  
  /**
   * Check if using AEM Assets (production mode)
   * @returns {boolean}
   */
  isUsingAEMAssets() {
    return this.strategy?.name === 'aem-assets';
  }
  
  // ========================================================================
  // Proxy methods to active strategy
  // ========================================================================
  
  /**
   * Get product image URL
   * @param {string} sku - Product SKU
   * @param {Object} options - size, format, quality options
   * @returns {string|null} Image URL or null for CSS placeholder
   */
  getProductImage(sku, options = {}) {
    this._ensureInitialized();
    return this.strategy.getProductImage(sku, options);
  }
  
  /**
   * Get template/floor plan image URL
   * @param {string} templateId - Template ID
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getTemplateImage(templateId, options = {}) {
    this._ensureInitialized();
    return this.strategy.getTemplateImage(templateId, options);
  }
  
  /**
   * Get variant image URL
   * @param {string} variantName - Variant name
   * @param {Object} options - includePosition returns {url, position}
   * @returns {string|Object} Image URL or {url, position} object
   */
  getVariantImage(variantName, options = {}) {
    this._ensureInitialized();
    return this.strategy.getVariantImage(variantName, options);
  }
  
  /**
   * Get package image URL
   * @param {string} packageId - Package ID
   * @param {string} tier - Quality tier
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getPackageImage(packageId, tier, options = {}) {
    this._ensureInitialized();
    return this.strategy.getPackageImage(packageId, tier, options);
  }
  
  /**
   * Get construction phase image URL
   * @param {string} phaseName - Phase name
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getPhaseImage(phaseName, options = {}) {
    this._ensureInitialized();
    return this.strategy.getPhaseImage(phaseName, options);
  }
  
  /**
   * Get category image URL
   * @param {string} category - Product category
   * @param {Object} options - Image options
   * @returns {string} Image URL
   */
  getCategoryImage(category, options = {}) {
    this._ensureInitialized();
    return this.strategy.getCategoryImage(category, options);
  }
  
  /**
   * Get placeholder URL
   * @param {string} type - Placeholder type
   * @returns {string|null} Placeholder URL or null for CSS placeholder
   */
  getPlaceholder(type = 'product') {
    this._ensureInitialized();
    return this.strategy.getPlaceholder(type);
  }
  
  /**
   * Ensure service is initialized (lazy init with local strategy)
   * @private
   */
  _ensureInitialized() {
    if (!this.initialized) {
      // Synchronous fallback to local strategy
      this.strategy = LocalStrategy;
      this.initialized = true;
      console.warn('[ImageService] Auto-initialized with LocalStrategy (call initialize() for full setup)');
    }
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

export const imageService = new ImageService();

// Export strategies for testing
export { LocalStrategy, AEMAssetsStrategy };

// Default export
export default imageService;

