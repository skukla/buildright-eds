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
function removeFromCart(sku) {
  const cart = getCart().filter(item => item.sku !== sku);
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
  
  // Show notification
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--color-success); color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000;';
  notification.textContent = 'Item added to cart!';
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
});

// Export for use in other scripts
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

