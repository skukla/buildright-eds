// BuildRight Solutions - Mock Data Manager

let mockData = null;
let customerContext = {
  company: null,
  location_id: null,
  tier: "base",
  region: null,
  primary_warehouse: null,
  isLoggedIn: false
};

// Load mock data from JSON file
async function loadMockData() {
  if (mockData) return mockData;
  
  try {
    // Use base path-aware path for GitHub Pages compatibility
    const basePath = window.BASE_PATH || '/';
    const dataPath = `${basePath}data/mock-products.json`;
    const response = await fetch(dataPath);
    if (!response.ok) {
      console.error(`Failed to load mock data: ${response.status} ${response.statusText} from ${dataPath}`);
      return null;
    }
    mockData = await response.json();
    if (!mockData || !mockData.products) {
      console.error('Invalid mock data structure');
      return null;
    }
    return mockData;
  } catch (error) {
    console.error('Error loading mock data:', error);
    return null;
  }
}

// Get all products
async function getProducts() {
  const data = await loadMockData();
  return data ? data.products : [];
}

// Get product by SKU
async function getProductBySKU(sku) {
  const products = await getProducts();
  return products.find(p => p.sku === sku);
}

// Filter products by project type
async function getProductsByProjectType(projectType) {
  const products = await getProducts();
  if (!projectType) return products;
  return products.filter(p => p.project_types && p.project_types.includes(projectType));
}

// Filter products by category
async function getProductsByCategory(category) {
  const products = await getProducts();
  if (!category) return products;
  return products.filter(p => p.category === category);
}

// Get categories
async function getCategories() {
  const data = await loadMockData();
  return data ? data.categories : [];
}

// Get warehouses
async function getWarehouses() {
  const data = await loadMockData();
  return data ? data.warehouses : [];
}

// Get customer context
function getCustomerContext() {
  // Try to load from localStorage first
  const stored = localStorage.getItem('buildright_customer_context');
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      
      // Migration 1: Convert old company names to new IDs
      if (parsed.company && typeof parsed.company === 'string') {
        // Check if it's an old full company name format
        if (parsed.company.includes(' ')) {
          localStorage.removeItem('buildright_customer_context');
          return customerContext;
        }
      }
      
      // Migration 2: Add tier if missing but company exists
      if (parsed.company && !parsed.tier) {
        const companyTierMap = {
          'premium_commercial': 'commercial_tier2',
          'coastal_residential': 'residential_builder',
          'elite_trade': 'pro_specialty'
        };
        
        const tier = companyTierMap[parsed.company] || 'base';
        const migrated = {
          ...parsed,
          tier: tier,
          isLoggedIn: true
        };
        
        localStorage.setItem('buildright_customer_context', JSON.stringify(migrated));
        return migrated;
      }
      
      return parsed;
    } catch (e) {
      console.error('Error parsing stored customer context:', e);
    }
  }
  return customerContext;
}

// Set customer context
function setCustomerContext(context) {
  customerContext = { ...customerContext, ...context };
  localStorage.setItem('buildright_customer_context', JSON.stringify(customerContext));
}

// Get price for product based on customer tier and quantity
function getPrice(product, quantity = 1) {
  if (!product || !product.pricing) return null;
  
  const context = getCustomerContext();
  const tier = context.tier || 'base';
  const tierPricing = product.pricing[tier] || product.pricing.base;
  
  if (typeof tierPricing === 'number') {
    return tierPricing;
  }
  
  // Find the right price tier based on quantity
  const breakpoints = Object.keys(tierPricing).sort((a, b) => {
    const aNum = parseInt(a.split('-')[0]) || parseInt(a.split('+')[0]);
    const bNum = parseInt(b.split('-')[0]) || parseInt(b.split('+')[0]);
    return bNum - aNum; // Sort descending
  });
  
  for (const breakpoint of breakpoints) {
    if (breakpoint.includes('+')) {
      const min = parseInt(breakpoint);
      if (quantity >= min) return tierPricing[breakpoint];
    } else {
      const [min, max] = breakpoint.split('-').map(Number);
      if (quantity >= min && quantity <= max) return tierPricing[breakpoint];
    }
  }
  
  // Fallback to first price
  return Object.values(tierPricing)[0];
}

// Get inventory for product at warehouse
function getInventory(product, warehouseId) {
  if (!product || !product.inventory) return 0;
  return product.inventory[warehouseId] || 0;
}

// Get inventory status (in-stock, low-stock, out-of-stock)
function getInventoryStatus(product, warehouseId) {
  const quantity = getInventory(product, warehouseId);
  if (quantity === 0) return 'out-of-stock';
  if (quantity < 50) return 'low-stock';
  return 'in-stock';
}

// Get primary warehouse for customer
function getPrimaryWarehouse() {
  const context = getCustomerContext();
  return context.primary_warehouse || 'warehouse_west';
}

// Get product image URL from Unsplash based on product category and name
function getProductImageUrl(product) {
  if (!product) return null;
  
  // First, check if product has image_url directly in the data
  if (product.image_url) {
    // Use base path-aware path for GitHub Pages compatibility
    const basePath = window.BASE_PATH || '/';
    return `${basePath}${product.image_url}`;
  }
  
  // Fallback to category/name-based mapping
  const category = product.category || '';
  const name = (product.name || '').toLowerCase();
  const sku = (product.sku || '').toLowerCase();
  
  // Structural materials - lumber, studs, joists, beams
  if (category === 'structural_materials') {
    // Studs (2x4, 2x6) - Stack of wooden boards/planks
    if (name.includes('stud') || name.includes('2x4') || name.includes('2x6')) {
      return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fit=crop&auto=format';
    }
    // Joists (2x8, 2x10) - Wood framing/construction
    if (name.includes('joist') || name.includes('2x8') || name.includes('2x10')) {
      return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&fit=crop&auto=format';
    }
    // Beams (2x12, larger) - Wooden beams
    if (name.includes('beam') || name.includes('2x12')) {
      return 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?w=800&q=80&fit=crop&auto=format';
    }
    // Default structural materials - stack of wooden boards
    return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fit=crop&auto=format';
  }
  
  // Windows & Doors
  if (category === 'windows_doors') {
    // Windows - modern window
    if (name.includes('window')) {
      return 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }
    // Doors - door installation
    if (name.includes('door')) {
      return 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    }
    // Default windows/doors image
    return 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Fasteners & Hardware
  if (category === 'fasteners_hardware') {
    // Construction fasteners hardware
    return 'https://images.unsplash.com/photo-1581244277943-fe4a9c777189?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Roofing
  if (category === 'roofing') {
    // Roofing construction shingles
    return 'https://images.unsplash.com/photo-1518736346281-76873166a64a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
  }
  
  // Framing & Drywall
  if (category === 'framing_drywall' || category === 'framing_insulation') {
    // Wood framing at construction site
    return 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80&fit=crop&auto=format';
  }
  
  // Default construction materials image - stack of wooden planks
  return 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80&fit=crop&auto=format';
}

// ES6 exports
export {
  loadMockData,
  getProducts,
  getProductBySKU,
  getProductsByProjectType,
  getProductsByCategory,
  getCategories,
  getWarehouses,
  getCustomerContext,
  setCustomerContext,
  getPrice,
  getInventory,
  getInventoryStatus,
  getPrimaryWarehouse,
  getProductImageUrl
};

// CommonJS exports (for compatibility)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    loadMockData,
    getProducts,
    getProductBySKU,
    getProductsByProjectType,
    getProductsByCategory,
    getCategories,
    getWarehouses,
    getCustomerContext,
    setCustomerContext,
    getPrice,
    getInventory,
    getInventoryStatus,
    getPrimaryWarehouse,
    getProductImageUrl
  };
}

