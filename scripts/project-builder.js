// Project Builder - Wizard logic and recommendation engine

import { getProducts, getProductsByProjectType, getProductsByCategory, getPrice, getInventoryStatus, getPrimaryWarehouse } from './data-mock.js';

let recommendationsData = null;

// Get base path for GitHub Pages subdirectory support
function getBasePath() {
  // Use global function if available (from app.js), otherwise calculate locally
  if (typeof window.getBasePath === 'function') {
    try {
      return window.getBasePath();
    } catch (e) {
      console.warn('Error calling window.getBasePath:', e);
    }
  }
  
  // Calculate base path from current location
  const pathname = window.location.pathname;
  const pathParts = pathname.split('/').filter(p => p);
  
  // If we're in a subdirectory (not root), return the base path
  if (pathParts.length > 0 && pathParts[0] !== 'pages') {
    return `/${pathParts[0]}/`;
  }
  
  // Root deployment
  return '/';
}

// Load recommendations data
async function loadRecommendationsData() {
  if (recommendationsData) return recommendationsData;
  
  try {
    // Use absolute path from site root for GitHub Pages compatibility
    const basePath = getBasePath();
    const normalizedBasePath = basePath === '/' ? '' : basePath.replace(/\/$/, ''); // Remove trailing slash
    const dataPath = `${normalizedBasePath}/data/project-recommendations.json`.replace('//', '/');
    
    const response = await fetch(dataPath);
    if (!response.ok) {
      console.error(`Failed to load recommendations data: ${response.status} ${response.statusText} from ${dataPath}`);
      // Try fallback path if basePath approach fails
      if (basePath !== '/') {
        const fallbackPath = '/data/project-recommendations.json';
        const fallbackResponse = await fetch(fallbackPath);
        if (fallbackResponse.ok) {
          recommendationsData = await fallbackResponse.json();
          return recommendationsData;
        }
      }
      return null;
    }
    recommendationsData = await response.json();
    return recommendationsData;
  } catch (error) {
    console.error('Error loading recommendations data:', error);
    // Try fallback path on error
    if (getBasePath() !== '/') {
      try {
        const fallbackPath = '/data/project-recommendations.json';
        const fallbackResponse = await fetch(fallbackPath);
        if (fallbackResponse.ok) {
          recommendationsData = await fallbackResponse.json();
          return recommendationsData;
        }
      } catch (fallbackError) {
        console.error('Fallback path also failed:', fallbackError);
      }
    }
    return null;
  }
}

// Get wizard state from sessionStorage
export function getWizardState() {
  try {
    return JSON.parse(sessionStorage.getItem('buildright_wizard_state') || '{}');
  } catch (e) {
    return {};
  }
}

// Save wizard state to sessionStorage
export function saveWizardState(state) {
  sessionStorage.setItem('buildright_wizard_state', JSON.stringify(state));
}

// Clear wizard state
export function clearWizardState() {
  sessionStorage.removeItem('buildright_wizard_state');
}

// Generate bundle recommendations based on wizard selections
export async function generateBundle(wizardState) {
  const { projectType, projectDetail, complexity, budget } = wizardState;
  
  if (!projectType || !complexity || !budget) {
    return null;
  }

  const recData = await loadRecommendationsData();
  if (!recData) return null;

  // Get all products
  let products = await getProducts();
  
  // Filter by project type
  if (projectType) {
    products = await getProductsByProjectType(projectType);
  }

  // Determine categories based on project type and detail
  let targetCategories = [];
  if (projectDetail && recData.roomCategories[projectDetail]) {
    targetCategories = recData.roomCategories[projectDetail];
  } else if (recData.projectTypeCategories[projectType]) {
    targetCategories = [
      ...recData.projectTypeCategories[projectType].primary,
      ...recData.projectTypeCategories[projectType].secondary
    ];
  }

  // Filter products by categories
  if (targetCategories.length > 0) {
    products = products.filter(p => targetCategories.includes(p.category));
  }

  // Get budget constraints
  const budgetConfig = recData.budgetRanges[budget] || recData.budgetRanges['5k_15k'];
  const complexityConfig = recData.complexityMultipliers[complexity] || recData.complexityMultipliers['moderate'];

  // Calculate max items based on complexity and budget
  const maxItems = Math.min(
    Math.floor(budgetConfig.maxItems * complexityConfig.itemCount),
    budgetConfig.maxItems
  );

  // Select products (prioritize preferred categories)
  const selectedProducts = [];
  const preferredCategories = budgetConfig.preferredCategories || [];
  
  // First, add products from preferred categories
  for (const category of preferredCategories) {
    if (selectedProducts.length >= maxItems) break;
    const categoryProducts = products.filter(p => p.category === category);
    const count = Math.ceil(maxItems * 0.3); // 30% from each preferred category
    selectedProducts.push(...categoryProducts.slice(0, count));
  }

  // Fill remaining slots with other products
  const remaining = maxItems - selectedProducts.length;
  if (remaining > 0) {
    const otherProducts = products.filter(p => 
      !selectedProducts.find(sp => sp.sku === p.sku)
    );
    selectedProducts.push(...otherProducts.slice(0, remaining));
  }

  // Limit to maxItems
  const finalProducts = selectedProducts.slice(0, maxItems);

  // Generate bundle items with quantities
  const bundleItems = [];
  const primaryWarehouse = getPrimaryWarehouse();
  let totalPrice = 0;

  for (const product of finalProducts) {
    // Calculate quantity based on complexity
    const baseQuantity = complexity === 'basic' ? 10 : complexity === 'moderate' ? 20 : 30;
    const quantity = Math.ceil(baseQuantity * complexityConfig.quantityMultiplier);
    
    const price = getPrice(product, quantity);
    const status = getInventoryStatus(product, primaryWarehouse);
    
    // Get reason for inclusion
    let reason = 'Recommended for your project';
    if (projectDetail && recData.itemReasons[projectDetail] && recData.itemReasons[projectDetail][product.category]) {
      reason = recData.itemReasons[projectDetail][product.category];
    } else if (recData.projectTypeCategories[projectType]?.primary.includes(product.category)) {
      reason = `Essential ${product.category.replace('_', ' ')} for ${projectType.replace('_', ' ')}`;
    }

    bundleItems.push({
      sku: product.sku,
      name: product.name,
      category: product.category,
      quantity: quantity,
      unitPrice: price / quantity,
      subtotal: price,
      reason: reason,
      inventoryStatus: status
    });

    totalPrice += price;
  }

  // Check if we're within budget
  if (totalPrice > budgetConfig.maxTotalPrice) {
    // Reduce quantities to fit budget
    const reductionFactor = budgetConfig.maxTotalPrice / totalPrice;
    bundleItems.forEach(item => {
      item.quantity = Math.max(1, Math.floor(item.quantity * reductionFactor));
      item.subtotal = item.unitPrice * item.quantity;
    });
    totalPrice = bundleItems.reduce((sum, item) => sum + item.subtotal, 0);
  }

  // Generate bundle name
  const projectTypeName = projectType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  const projectDetailName = projectDetail ? projectDetail.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()) : '';
  const complexityName = complexity.charAt(0).toUpperCase() + complexity.slice(1);
  const bundleName = `${projectDetailName || projectTypeName} ${complexityName} Project Kit`;

  // Generate bundle ID
  const bundleId = `bundle-${projectType}-${projectDetail || 'general'}-${complexity}-${Date.now()}`;

  return {
    bundleId,
    bundleName,
    projectType,
    projectDetail,
    complexity,
    budget,
    items: bundleItems,
    itemCount: bundleItems.length,
    totalPrice: Math.round(totalPrice * 100) / 100,
    createdAt: new Date().toISOString()
  };
}

// Add bundle to cart
export function addBundleToCart(bundle) {
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  
  // Add bundle metadata
  const bundleEntry = {
    type: 'bundle',
    bundleId: bundle.bundleId,
    bundleName: bundle.bundleName,
    projectType: bundle.projectType,
    projectDetail: bundle.projectDetail,
    complexity: bundle.complexity,
    budget: bundle.budget,
    items: bundle.items.map(item => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    totalPrice: bundle.totalPrice,
    itemCount: bundle.itemCount,
    createdAt: bundle.createdAt
  };

  cart.push(bundleEntry);
  localStorage.setItem('buildright_cart', JSON.stringify(cart));
  
  // Dispatch cart updated event
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  return cart;
}

// Get bundle from cart by bundleId
export function getBundleFromCart(bundleId) {
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  return cart.find(item => item.type === 'bundle' && item.bundleId === bundleId);
}

// Remove bundle from cart
export function removeBundleFromCart(bundleId) {
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  const filtered = cart.filter(item => !(item.type === 'bundle' && item.bundleId === bundleId));
  localStorage.setItem('buildright_cart', JSON.stringify(filtered));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  return filtered;
}

// Update bundle item quantity in cart
export function updateBundleItemQuantity(bundleId, sku, quantity) {
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  const bundle = cart.find(item => item.type === 'bundle' && item.bundleId === bundleId);
  
  if (bundle) {
    const item = bundle.items.find(i => i.sku === sku);
    if (item) {
      item.quantity = Math.max(1, quantity);
      // Recalculate bundle total
      bundle.totalPrice = bundle.items.reduce((sum, i) => sum + (i.unitPrice * i.quantity), 0);
      localStorage.setItem('buildright_cart', JSON.stringify(cart));
      window.dispatchEvent(new CustomEvent('cartUpdated'));
    }
  }
  
  return cart;
}

