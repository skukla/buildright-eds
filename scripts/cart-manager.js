// Cart Manager - Shopping cart functionality

// Quantity limits
const MIN_QUANTITY = 1;
const MAX_QUANTITY = 9999;

// Get cart from localStorage
function getCart() {
  try {
    return JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  } catch (e) {
    return [];
  }
}

// Save cart to localStorage
function saveCart(cart) {
  localStorage.setItem('buildright_cart', JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('cartUpdated'));
}

// Add item to cart (with max quantity validation)
function addToCart(sku, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.sku === sku);

  if (existingItem) {
    // Clamp to max quantity
    existingItem.quantity = Math.min(existingItem.quantity + quantity, MAX_QUANTITY);
  } else {
    cart.push({ sku, quantity: Math.min(quantity, MAX_QUANTITY) });
  }

  saveCart(cart);
  return cart;
}

// Remove item from cart
function removeFromCart(identifier) {
  // Filter out items by SKU or bundleId
  const cart = getCart().filter(item => {
    // Check if it's a bundle removal
    if (item.bundleId) {
      return item.bundleId !== identifier;
    }
    // Otherwise check SKU
    return item.sku !== identifier;
  });
  saveCart(cart);
  return cart;
}

// Update item quantity in cart (with min/max validation)
function updateCartItem(sku, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.sku === sku);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(sku);
    }
    // Clamp quantity to valid range
    item.quantity = Math.max(MIN_QUANTITY, Math.min(MAX_QUANTITY, quantity));
    saveCart(cart);
  }

  return cart;
}

// Clear cart
function clearCart() {
  saveCart([]);
  return [];
}

// Get cart item count
function getCartItemCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

// Listen for add to cart events
window.addEventListener('addToCart', (e) => {
  const { sku, quantity, productName } = e.detail;
  addToCart(sku, quantity);
  
  // Dispatch event for notification system (notification only, no auto-open)
  window.dispatchEvent(new CustomEvent('cartItemAdded', {
    detail: {
      sku,
      productName: productName || 'Product',
      quantity: quantity || 1
    }
  }));
});

// Export for use in other scripts (ES6 modules)
export {
  getCart,
  saveCart,
  addToCart,
  removeFromCart,
  updateCartItem,
  clearCart,
  getCartItemCount
};

// Also export for CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getCart,
    saveCart,
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCartItemCount
  };
}

