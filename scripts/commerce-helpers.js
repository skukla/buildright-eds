/**
 * Commerce Helpers
 * 
 * Utility functions for bridging ACO products with Commerce Cart Dropin.
 * Since products come from ACO (not Commerce Catalog Service), we need
 * to add items to cart by SKU only.
 * 
 * @module scripts/commerce-helpers
 */

import { loadConfig } from './site-config.js';

/**
 * Add a product to cart using Commerce Cart Dropin
 * Falls back to local cart manager if dropins not enabled
 * 
 * @param {Object} product - Product from ACO
 * @param {string} product.sku - Product SKU (required)
 * @param {number} quantity - Quantity to add (default: 1)
 * @returns {Promise<Object>} Cart data
 */
export async function addProductToCart(product, quantity = 1) {
  const config = await loadConfig();
  
  if (!product?.sku) {
    throw new Error('Product SKU is required');
  }
  
  console.log('[Commerce] Adding to cart:', product.sku, 'qty:', quantity);
  
  if (config.features?.useCommerceDropins) {
    // Use Commerce Cart Dropin
    try {
      const { addToCart } = await import('./initializers/cart.js');
      return await addToCart(product.sku, quantity);
    } catch (error) {
      console.error('[Commerce] Dropin cart failed, falling back to local:', error);
      return addToLocalCart(product, quantity);
    }
  } else {
    // Use local cart manager
    return addToLocalCart(product, quantity);
  }
}

/**
 * Add multiple products to cart (e.g., from BOM)
 * 
 * @param {Array<{sku: string, quantity: number}>} items - Items to add
 * @returns {Promise<Object>} Cart data
 */
export async function addMultipleToCart(items) {
  const config = await loadConfig();
  
  if (!items?.length) {
    throw new Error('Items array is required');
  }
  
  console.log('[Commerce] Adding multiple items to cart:', items.length);
  
  if (config.features?.useCommerceDropins) {
    try {
      const { addMultipleToCart: dropinAddMultiple } = await import('./initializers/cart.js');
      return await dropinAddMultiple(items);
    } catch (error) {
      console.error('[Commerce] Dropin bulk add failed, falling back to local:', error);
      // Fall back to local cart, adding items one by one
      for (const item of items) {
        await addToLocalCart({ sku: item.sku }, item.quantity);
      }
      return getLocalCart();
    }
  } else {
    // Use local cart manager
    for (const item of items) {
      await addToLocalCart({ sku: item.sku }, item.quantity);
    }
    return getLocalCart();
  }
}

/**
 * Add product to local cart (fallback for demo mode)
 * 
 * @param {Object} product - Product data
 * @param {number} quantity - Quantity
 * @returns {Promise<Object>} Cart data
 */
async function addToLocalCart(product, quantity) {
  const { addToCart, getCart } = await import('./cart-manager.js');

  // Local cart manager uses simple (sku, quantity) signature
  addToCart(product.sku, quantity);

  return getCart();
}

/**
 * Get local cart data
 * @returns {Promise<Object>}
 */
async function getLocalCart() {
  const { getCart } = await import('./cart-manager.js');
  return getCart();
}

/**
 * Get cart item count
 * Works with both Commerce Dropin and local cart
 * 
 * @returns {Promise<number>} Total quantity in cart
 */
export async function getCartItemCount() {
  const config = await loadConfig();
  
  if (config.features?.useCommerceDropins) {
    try {
      const { getCartTotalQuantity } = await import('./initializers/cart.js');
      return getCartTotalQuantity();
    } catch (error) {
      // Fall back to local cart
    }
  }
  
  const cart = await getLocalCart();
  return cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
}

/**
 * Navigate to cart page
 */
export function goToCart() {
  const basePath = window.BASE_PATH || '/';
  window.location.href = `${basePath}pages/cart.html`;
}

/**
 * Navigate to checkout page
 */
export function goToCheckout() {
  const basePath = window.BASE_PATH || '/';
  window.location.href = `${basePath}pages/checkout.html`;
}

/**
 * Show add-to-cart success notification
 * 
 * @param {Object} product - Product that was added
 * @param {number} quantity - Quantity added
 */
export function showAddToCartNotification(product, quantity = 1) {
  // Dispatch event for notification handling
  window.dispatchEvent(new CustomEvent('cart:notification', {
    detail: {
      type: 'added',
      product,
      quantity
    }
  }));
  
  // Also try to import and use the cart-notification module
  import('./cart-notification.js')
    .then(module => {
      if (module.showCartNotification) {
        module.showCartNotification(product.name || product.sku, quantity);
      }
    })
    .catch(() => {
      // Notification module not available, event was dispatched above
    });
}

/**
 * Create Add to Cart button for a product
 * Use this in product tiles and PDP to ensure consistent behavior
 * 
 * @param {Object} product - Product from ACO
 * @param {Object} options - Button options
 * @param {string} options.label - Button label (default: "Add to Cart")
 * @param {string} options.className - Additional CSS classes
 * @returns {HTMLButtonElement}
 */
export function createAddToCartButton(product, options = {}) {
  const {
    label = 'Add to Cart',
    className = ''
  } = options;
  
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `add-to-cart-btn ${className}`.trim();
  button.textContent = label;
  button.dataset.sku = product.sku;
  
  // Icon (optional)
  const icon = document.createElement('span');
  icon.className = 'btn-icon';
  icon.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <path d="M6 6h15l-1.5 9h-12z"/>
    <circle cx="9" cy="20" r="1"/>
    <circle cx="18" cy="20" r="1"/>
  </svg>`;
  button.insertBefore(icon, button.firstChild);
  
  // Click handler
  button.addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Adding...';
    
    try {
      await addProductToCart(product, 1);
      // Note: Toast notification is handled by dropin's cart/product/added event
      // See scripts/initializers/cart.js

      button.textContent = 'Added!';
      button.classList.add('success');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('success');
        button.disabled = false;
      }, 1500);
      
    } catch (error) {
      console.error('[Commerce] Failed to add to cart:', error);
      button.textContent = 'Error';
      button.classList.add('error');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.classList.remove('error');
        button.disabled = false;
      }, 2000);
    }
  });
  
  return button;
}

export default {
  addProductToCart,
  addMultipleToCart,
  getCartItemCount,
  goToCart,
  goToCheckout,
  showAddToCartNotification,
  createAddToCartButton
};

