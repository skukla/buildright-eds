// Project Builder - Wizard logic and recommendation engine

import { getProducts, getProductsByProjectType, getPrice, getInventoryStatus, getPrimaryWarehouse } from './data-mock.js';

let recommendationsData = null;

// Load recommendations data
async function loadRecommendationsData() {
  if (recommendationsData) return recommendationsData;
  
  try {
    // Use base path to work with GitHub Pages and path-based routing
    const basePath = window.BASE_PATH || '/';
    const dataPath = `${basePath}data/project-recommendations.json`;
    const response = await fetch(dataPath);
    if (!response.ok) {
      console.error(`Failed to load recommendations data: ${response.status} ${response.statusText} from ${dataPath}`);
      return null;
    }
    recommendationsData = await response.json();
    return recommendationsData;
  } catch (error) {
    console.error('Error loading recommendations data:', error);
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
  // Ensure customItems array exists
  if (!state.customItems) {
    state.customItems = [];
  }
  // Add lastModified timestamp
  state.lastModified = new Date().toISOString();
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

  // Get products from mock data
  console.log('[Project Builder] Using mock data');
  
  // Get all products from mock data
  let products = await getProducts();
  
  // Filter by project type
  if (projectType) {
    products = await getProductsByProjectType(projectType);
  }
  
  // Filter out out-of-stock products - only recommend items that are actually available
  const primaryWarehouse = getPrimaryWarehouse();
  products = products.filter(product => {
    const status = getInventoryStatus(product, primaryWarehouse);
    // Include both 'in-stock' and 'low-stock' items, exclude only 'out-of-stock'
    return status !== 'out-of-stock';
  });
  
  console.log(`[Project Builder] Filtered to ${products.length} available products`);

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

    // Additional client-side filtering for complexity and budget
    
    // Filter by quality tier (complexity) if available in mock data
    if (complexity) {
      products = products.filter(p => {
        // Mock data may not have quality_tier, so we'll use a simple heuristic
        return true; // Keep all products when using mock data
      });
    }

    // Filter by price tier (budget) - REMOVED: This was filtering by individual product price
    // which doesn't make sense. Budget should control total bundle price, not individual product prices.
    // Individual products can be any price - the total quantity * price determines if it fits the budget.
    // Budget filtering is handled later when calculating bundle totals.

  // Get budget constraints
  const budgetConfig = recData.budgetRanges[budget] || recData.budgetRanges['5k_15k'];
  const complexityConfig = recData.complexityMultipliers[complexity] || recData.complexityMultipliers['moderate'];

  // Calculate max items based on complexity and budget
  const maxItems = Math.min(
    Math.floor(budgetConfig.maxItems * complexityConfig.itemCount),
    budgetConfig.maxItems
  );

  // Select products using category prioritization
  let finalProducts;
  
  if (products && products.length > 0) {
    // Apply category prioritization for mock data
    const preferredCategories = budgetConfig.preferredCategories || [];
    
    if (preferredCategories.length > 0) {
      // Prioritize preferred categories
      const selectedProducts = [];
      
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

      finalProducts = selectedProducts.slice(0, maxItems);
    } else {
      // No preferred categories, just take first maxItems
      finalProducts = products.slice(0, maxItems);
    }
  } else {
    // No products available
    finalProducts = [];
  }

  // Generate bundle items with quantities
  const bundleItems = [];
  let totalPrice = 0;

  for (const product of finalProducts) {
    // Calculate quantity based on complexity
    const baseQuantity = complexity === 'basic' ? 10 : complexity === 'moderate' ? 20 : 30;
    const quantity = Math.ceil(baseQuantity * complexityConfig.quantityMultiplier);
    
    // Get price - handle both ACO format (with price property) and mock format
    let unitPrice, price;
    if (product.price !== undefined) {
      // ACO format: product.price is already the unit price
      unitPrice = product.price;
      price = unitPrice * quantity;
    } else {
      // Mock format: use getPrice helper
      price = getPrice(product, quantity);
      unitPrice = price / quantity;
    }
    
    // Get inventory status - handle both ACO format and mock format
    let status;
    if (product.inventory?.available !== undefined) {
      // ACO format
      status = product.inventory.available ? 'in_stock' : 'out_of_stock';
    } else {
      // Mock format: use getInventoryStatus helper
      status = getInventoryStatus(product, primaryWarehouse);
    }
    
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
      unitPrice: unitPrice,
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

// Check inventory for all items in a bundle
export async function checkBundleInventory(bundle) {
  const { getProductBySKU, getInventory, getInventoryStatus, getPrimaryWarehouse } = await import('./data-mock.js');
  const primaryWarehouse = getPrimaryWarehouse();
  
  const inventoryResults = [];
  let hasOutOfStock = false;
  let hasLowStock = false;
  
  for (const item of bundle.items) {
    const product = await getProductBySKU(item.sku);
    if (!product) {
      inventoryResults.push({
        sku: item.sku,
        name: item.name,
        requestedQuantity: item.quantity,
        availableQuantity: 0,
        status: 'not-found',
        warehouse: primaryWarehouse,
        message: 'Product not found'
      });
      hasOutOfStock = true;
      continue;
    }
    
    const availableQuantity = getInventory(product, primaryWarehouse);
    const status = getInventoryStatus(product, primaryWarehouse);
    const canFulfill = availableQuantity >= item.quantity;
    
    if (!canFulfill) {
      hasOutOfStock = true;
    } else if (status === 'low-stock') {
      hasLowStock = true;
    }
    
    inventoryResults.push({
      sku: item.sku,
      name: item.name,
      requestedQuantity: item.quantity,
      availableQuantity: availableQuantity,
      status: canFulfill ? status : 'out-of-stock',
      warehouse: primaryWarehouse,
      message: canFulfill 
        ? (status === 'low-stock' ? `Low stock: ${availableQuantity} available` : 'In stock')
        : `Insufficient inventory: ${availableQuantity} available, ${item.quantity} requested`
    });
  }
  
  return {
    results: inventoryResults,
    hasOutOfStock,
    hasLowStock,
    allInStock: !hasOutOfStock && !hasLowStock
  };
}

// Add bundle to cart with inventory check
export async function addBundleToCart(bundle, options = {}) {
  const { skipInventoryCheck = false, showNotifications = true } = options;
  
  // Check inventory before adding to cart
  let inventoryCheck = null;
  if (!skipInventoryCheck) {
    inventoryCheck = await checkBundleInventory(bundle);
    
    // If there are out-of-stock items, we can either:
    // 1. Block adding to cart (strict mode)
    // 2. Allow adding with a warning (default)
    // For now, we'll allow adding but show warnings
  }
  
  // Get cart from localStorage
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  
  // Add bundle metadata with inventory status
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
    createdAt: bundle.createdAt,
    inventoryCheck: inventoryCheck ? {
      checkedAt: new Date().toISOString(),
      hasOutOfStock: inventoryCheck.hasOutOfStock,
      hasLowStock: inventoryCheck.hasLowStock
    } : null
  };

  cart.push(bundleEntry);
  localStorage.setItem('buildright_cart', JSON.stringify(cart));
  
  // Dispatch cart updated event
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  // Dispatch cart item added event for notification consistency
  window.dispatchEvent(new CustomEvent('cartItemAdded', {
    detail: {
      productName: bundle.bundleName || bundle.projectName || bundle.name || 'Project Kit',
      quantity: 1
    }
  }));
  
  return {
    cart,
    inventoryCheck
  };
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

// Update entire bundle in cart (for editing from Kit PDP)
export async function updateBundleInCart(bundleId, updatedBundleData, options = {}) {
  const { showNotifications = true } = options;
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  const index = cart.findIndex(item => item.type === 'bundle' && item.bundleId === bundleId);
  
  if (index === -1) {
    console.error(`Bundle ${bundleId} not found in cart`);
    return { success: false, error: 'Bundle not found in cart' };
  }
  
  // Check inventory before updating
  let inventoryCheck = null;
  const { checkBundleInventory } = await import('./project-builder.js');
  inventoryCheck = await checkBundleInventory(updatedBundleData);
  
  // Update the existing bundle entry
  cart[index] = {
    ...cart[index],
    items: updatedBundleData.items,
    customItems: updatedBundleData.customItems || [],
    totalPrice: updatedBundleData.totalPrice,
    itemCount: updatedBundleData.itemCount,
    projectName: updatedBundleData.projectName || updatedBundleData.name,
    updatedAt: new Date().toISOString(),
    inventoryStatus: inventoryCheck ? {
      hasOutOfStock: inventoryCheck.hasOutOfStock,
      hasLowStock: inventoryCheck.hasLowStock
    } : null
  };
  
  localStorage.setItem('buildright_cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
  
  // Dispatch notification event
  if (showNotifications) {
    window.dispatchEvent(new CustomEvent('cartItemAdded', {
      detail: {
        productName: updatedBundleData.bundleName || updatedBundleData.projectName || updatedBundleData.name || 'Project Kit',
        quantity: 1
      }
    }));
  }
  
  return {
    success: true,
    cart,
    inventoryCheck
  };
}

// Load bundle from cart into wizard state for editing
export function loadBundleIntoWizardState(cartBundle) {
  if (!cartBundle || cartBundle.type !== 'bundle') {
    console.error('Invalid bundle provided to loadBundleIntoWizardState');
    return false;
  }
  
  // Normalize items to ensure they have subtotal calculated
  const normalizedItems = (cartBundle.items || []).map(item => ({
    ...item,
    unitPrice: item.unitPrice || 0,
    quantity: item.quantity || 1,
    subtotal: item.subtotal || (item.unitPrice || 0) * (item.quantity || 1)
  }));
  
  // Normalize custom items if they exist
  const normalizedCustomItems = (cartBundle.customItems || []).map(item => ({
    ...item,
    unitPrice: item.unitPrice || 0,
    quantity: item.quantity || 1,
    subtotal: item.subtotal || (item.unitPrice || 0) * (item.quantity || 1)
  }));
  
  // Recalculate total price from normalized items
  const allItems = [...normalizedItems, ...normalizedCustomItems];
  const recalculatedTotal = allItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  const wizardState = {
    // Preserve original project configuration if available
    projectType: cartBundle.projectType || '',
    projectDetail: cartBundle.projectDetail || '',
    complexity: cartBundle.complexity || '',
    budget: cartBundle.budget || 0,
    
    // Load bundle data with normalized items
    bundle: {
      bundleId: cartBundle.bundleId,
      bundleName: cartBundle.bundleName || cartBundle.projectName || cartBundle.name || 'Project Kit',
      projectName: cartBundle.projectName,
      name: cartBundle.name || cartBundle.projectName,
      items: normalizedItems,
      totalPrice: recalculatedTotal,
      itemCount: allItems.length,
      createdAt: cartBundle.createdAt,
      inCart: true,  // Mark as being in cart
      isEditing: true  // Mark as editing mode
    },
    
    // Load normalized custom items if they exist
    customItems: normalizedCustomItems.length > 0 ? normalizedCustomItems : undefined,
    
    // Set to step 5 (Kit PDP)
    currentStep: 5
  };
  
  saveWizardState(wizardState);
  
  return true;
}

// Add custom item to kit
export async function addCustomItemToKit(sku, quantity = 1, reason = 'Added from catalog') {
  const state = getWizardState();
  if (!state.customItems) {
    state.customItems = [];
  }
  
  // Check if item already exists
  const existingIndex = state.customItems.findIndex(item => item.sku === sku);
  
  if (existingIndex >= 0) {
    // Update quantity
    state.customItems[existingIndex].quantity += quantity;
    state.customItems[existingIndex].subtotal = state.customItems[existingIndex].unitPrice * state.customItems[existingIndex].quantity;
  } else {
    // Fetch product details
    const { getProducts, getPrice, getInventoryStatus, getPrimaryWarehouse } = await import('./data-mock.js');
    const products = await getProducts();
    const product = products.find(p => p.sku === sku);
    
    if (product) {
      const unitPrice = getPrice(product, 1);
      const subtotal = unitPrice * quantity;
      
      state.customItems.push({
        sku: sku,
        name: product.name,
        category: product.category || 'Other',
        quantity: quantity,
        unitPrice: unitPrice,
        subtotal: subtotal,
        reason: reason,
        isCustom: true,
        inventoryStatus: getInventoryStatus(product, getPrimaryWarehouse())
      });
    } else {
      // Product not found - use placeholder
      state.customItems.push({
        sku: sku,
        name: `Product ${sku}`,
        category: 'Other',
        quantity: quantity,
        unitPrice: 0,
        subtotal: 0,
        reason: reason,
        isCustom: true,
        inventoryStatus: 'unknown'
      });
    }
  }
  
  saveWizardState(state);
  
  // Dispatch kit updated event to update sidebar if it exists
  window.dispatchEvent(new CustomEvent('kitUpdated'));
  
  return state;
}

// Remove custom item from kit
export function removeCustomItemFromKit(sku) {
  const state = getWizardState();
  if (!state.customItems) {
    return state;
  }
  
  state.customItems = state.customItems.filter(item => item.sku !== sku);
  saveWizardState(state);
  return state;
}

// Remove item from kit (handles both bundle items and custom items)
export function removeItemFromKit(sku) {
  const state = getWizardState();
  
  // Remove from custom items if it exists there
  if (state.customItems) {
    const customItemIndex = state.customItems.findIndex(item => item.sku === sku);
    if (customItemIndex !== -1) {
      state.customItems.splice(customItemIndex, 1);
      // If customItems array is empty, remove it
      if (state.customItems.length === 0) {
        delete state.customItems;
      }
      saveWizardState(state);
      return { removed: true, source: 'custom' };
    }
  }
  
  // Remove from bundle items if it exists there
  if (state.bundle && state.bundle.items) {
    const bundleItemIndex = state.bundle.items.findIndex(item => item.sku === sku);
    if (bundleItemIndex !== -1) {
      state.bundle.items.splice(bundleItemIndex, 1);
      
      // Recalculate bundle totals
      state.bundle.totalPrice = state.bundle.items.reduce((sum, item) => sum + (item.subtotal || 0), 0);
      state.bundle.itemCount = state.bundle.items.length;
      
      saveWizardState(state);
      return { removed: true, source: 'bundle' };
    }
  }
  
  return { removed: false, source: null };
}

// Update custom item quantity
export function updateCustomItemQuantity(sku, quantity) {
  const state = getWizardState();
  if (!state.customItems) {
    return state;
  }
  
  const item = state.customItems.find(i => i.sku === sku);
  if (item) {
    item.quantity = Math.max(1, quantity);
    item.subtotal = item.unitPrice * item.quantity;
    saveWizardState(state);
  }
  
  return state;
}

// Get full kit (bundle items + custom items)
export function getFullKit() {
  const state = getWizardState();
  const bundle = state.bundle;
  const customItems = state.customItems || [];
  
  if (!bundle) {
    return { items: customItems, itemCount: customItems.length, totalPrice: 0 };
  }
  
  // Combine bundle items with custom items
  const allItems = [...bundle.items, ...customItems];
  const totalPrice = allItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  
  return {
    ...bundle,
    items: allItems,
    itemCount: allItems.length,
    totalPrice: totalPrice
  };
}

// Check if kit has any items
export function hasKitItems() {
  const kit = getFullKit();
  return kit && kit.items && kit.items.length > 0;
}

