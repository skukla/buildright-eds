// BuildRight Solutions - Mock Data Manager

let mockData = null;
let customerContext = {
  company: "Premium Commercial Builders Inc.",
  tier: "commercial_tier2",
  region: "Western",
  primary_warehouse: "warehouse_west",
  locations: ["Los Angeles", "Phoenix"]
};

// Load mock data from JSON file
async function loadMockData() {
  if (mockData) return mockData;
  
  try {
    const response = await fetch('data/mock-products.json');
    mockData = await response.json();
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
      return JSON.parse(stored);
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
  getPrimaryWarehouse
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
    getPrimaryWarehouse
  };
}

