// Cart Manager - Shopping cart functionality

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

// Add item to cart
function addToCart(sku, quantity = 1) {
  const cart = getCart();
  const existingItem = cart.find(item => item.sku === sku);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    cart.push({ sku, quantity });
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

// Update item quantity in cart
function updateCartItem(sku, quantity) {
  const cart = getCart();
  const item = cart.find(item => item.sku === sku);

  if (item) {
    if (quantity <= 0) {
      return removeFromCart(sku);
    }
    item.quantity = quantity;
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
  const { sku, quantity } = e.detail;
  addToCart(sku, quantity);
  
  // Open mini-cart to show the added item
  window.dispatchEvent(new CustomEvent('openMiniCart', {
    detail: { sku }
  }));
  
  // Show notification
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #10b981; color: white; padding: 1rem 1.5rem; border-radius: 0.5rem; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10000; font-family: system-ui, -apple-system, sans-serif; font-size: 0.875rem; font-weight: 500;';
  notification.textContent = 'Item added to cart!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
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

