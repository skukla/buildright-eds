/**
 * Cart Dropin Initializer
 * 
 * Initializes the Commerce Cart dropin for BuildRight.
 * Since products come from ACO, items are added by SKU.
 * 
 * @module scripts/initializers/cart
 */

import { events } from '@dropins/tools/event-bus.js';

// Track cart state
let _cartData = null;
let _cartInitialized = false;

/**
 * Initialize the Cart Dropin
 * @param {Object} initializers - Dropin initializers from @dropins/tools
 */
export async function initializeCartDropin(initializers) {
  console.log('[Cart Dropin] Initializing...');
  
  try {
    // Import cart dropin API
    const { initialize } = await import('@dropins/storefront-cart/api.js');
    
    // Register cart dropin with initializers
    // Language keys follow Cart.* namespace (see @dropins/storefront-cart/i18n/en_US.json.d.ts)
    initializers.register(initialize, {
      langDefinitions: {
        default: {
          Cart: {
            EmptyCart: {
              heading: 'Your Shopping Cart is Empty',
              cta: 'Continue Shopping',
            },
            MiniCart: {
              heading: 'Shopping Cart ({count})',
              subtotal: 'Subtotal',
              cartLink: 'View Full Cart',
              checkoutLink: 'Checkout',
            },
          },
        },
      },
      // Don't disable guest cart - allow anonymous shopping
      disableGuestCart: false,
    });
    
    // Listen for cart events
    setupCartEventListeners();
    
    console.log('[Cart Dropin] Registered');
    
  } catch (error) {
    console.error('[Cart Dropin] Failed to initialize:', error);
    throw error;
  }
}

/**
 * Set up event listeners for cart events
 */
function setupCartEventListeners() {
  // Listen for cart initialization
  events.on('cart/initialized', (cart) => {
    console.log('[Cart Dropin] Cart initialized:', cart?.id);
    _cartData = cart;
    _cartInitialized = true;
    updateCartBadge();
  }, { eager: true });

  // Listen for dropin errors - these can occur during cart operations
  // when Commerce returns malformed data (e.g., null Money.value on empty carts)
  events.on('cart/error', (error) => {
    console.warn('[Cart Dropin] Cart error (non-fatal):', error?.message || error);
  }, { eager: true });

  // Listen for cart updates
  events.on('cart/updated', (cart) => {
    console.log('[Cart Dropin] Cart updated, items:', cart?.items?.length || 0);
    _cartData = cart;
    updateCartBadge();
  }, { eager: true });

  // Listen for cart data
  events.on('cart/data', (cart) => {
    _cartData = cart;
    updateCartBadge();
  }, { eager: true });

  // Listen for cart merge success
  events.on('cart/merged', ({ oldCartItems }) => {
    console.log('[Cart Dropin] Cart merged, previous items:', oldCartItems?.length || 0);
  }, { eager: true });

  // Listen for product added
  events.on('cart/product/added', () => {
    console.log('[Cart Dropin] Product added to cart');
    showCartNotification('added');
  }, { eager: true });

  // Listen for product updated
  events.on('cart/product/updated', () => {
    console.log('[Cart Dropin] Product updated in cart');
  }, { eager: true });

  // Listen for cart reset (after order placed)
  events.on('cart/reset', () => {
    console.log('[Cart Dropin] Cart reset');
    _cartData = null;
    updateCartBadge();
  }, { eager: true });

  console.log('[Cart Dropin] Event listeners registered');
}

/**
 * Update cart badge in header
 */
function updateCartBadge() {
  const itemCount = _cartData?.items?.length || 0;
  const totalQuantity = _cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  
  // Dispatch event for header to update badge
  window.dispatchEvent(new CustomEvent('cart:updated', {
    detail: { 
      itemCount,
      totalQuantity,
      cart: _cartData
    }
  }));
  
  // Also update any cart badges directly
  const badges = document.querySelectorAll('.cart-badge, [data-cart-badge]');
  badges.forEach(badge => {
    badge.textContent = totalQuantity > 0 ? totalQuantity : '';
    badge.classList.toggle('has-items', totalQuantity > 0);
  });
}

/**
 * Show cart notification
 * @param {string} type - Notification type ('added', 'updated', 'removed')
 */
function showCartNotification(type) {
  // Dispatch event for notification handling
  window.dispatchEvent(new CustomEvent('cart:notification', {
    detail: { type }
  }));
}

/**
 * Add product to cart by SKU
 * This is the main integration point for BuildRight since products come from ACO
 * 
 * @param {string} sku - Product SKU
 * @param {number} quantity - Quantity to add (default: 1)
 * @param {Object} options - Optional product options
 * @returns {Promise<Object>} Cart data
 */
export async function addToCart(sku, quantity = 1, options = {}) {
  console.log('[Cart Dropin] Adding to cart:', { sku, quantity });
  
  try {
    const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
    
    const item = {
      sku,
      quantity,
      ...options
    };
    
    const cart = await addProductsToCart([item]);
    return cart;
    
  } catch (error) {
    console.error('[Cart Dropin] Failed to add to cart:', error);
    throw error;
  }
}

/**
 * Add multiple products to cart
 * Useful for adding entire BOM line items
 * 
 * @param {Array<{sku: string, quantity: number}>} items - Items to add
 * @returns {Promise<Object>} Cart data
 */
export async function addMultipleToCart(items) {
  console.log('[Cart Dropin] Adding multiple items:', items.length);
  
  try {
    const { addProductsToCart } = await import('@dropins/storefront-cart/api.js');
    const cart = await addProductsToCart(items);
    return cart;
    
  } catch (error) {
    console.error('[Cart Dropin] Failed to add items to cart:', error);
    throw error;
  }
}

/**
 * Update cart item quantity
 * 
 * @param {string} uid - Cart item UID
 * @param {number} quantity - New quantity
 * @returns {Promise<Object>} Cart data
 */
export async function updateQuantity(uid, quantity) {
  try {
    const { updateProductsFromCart } = await import('@dropins/storefront-cart/api.js');
    const cart = await updateProductsFromCart([{ uid, quantity }]);
    return cart;
    
  } catch (error) {
    console.error('[Cart Dropin] Failed to update quantity:', error);
    throw error;
  }
}

/**
 * Remove item from cart
 * 
 * @param {string} uid - Cart item UID
 * @returns {Promise<Object>} Cart data
 */
export async function removeFromCart(uid) {
  return updateQuantity(uid, 0);
}

/**
 * Get current cart data
 * @returns {Object|null}
 */
export function getCart() {
  return _cartData;
}

/**
 * Get cart item count
 * @returns {number}
 */
export function getCartItemCount() {
  return _cartData?.items?.length || 0;
}

/**
 * Get total quantity in cart
 * @returns {number}
 */
export function getCartTotalQuantity() {
  return _cartData?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
}

/**
 * Check if cart is initialized
 * @returns {boolean}
 */
export function isCartInitialized() {
  return _cartInitialized;
}

/**
 * Wait for cart to be initialized
 * @returns {Promise<Object|null>}
 */
export function waitForCart() {
  if (_cartInitialized) {
    return Promise.resolve(_cartData);
  }
  
  return new Promise((resolve) => {
    const unsubscribe = events.on('cart/initialized', (cart) => {
      unsubscribe.off();
      resolve(cart);
    });
  });
}

