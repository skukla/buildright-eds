/**
 * Cart Page Block
 * 
 * API-only integration with Commerce Cart Dropin.
 * Uses BuildRight's exact HTML structure and styling.
 * Wires to Dropin APIs for data and operations.
 */

import { loadConfig } from '../../scripts/site-config.js';
import { events } from '@dropins/tools/event-bus.js';

export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Wait for Commerce Dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  // Import Cart Dropin APIs
  const cartModule = await import('../../scripts/initializers/cart.js');
  const { 
    getCart, 
    updateQuantity, 
    removeFromCart, 
    getCartItemCount, 
    waitForCart 
  } = cartModule;

  // Wait for cart to be initialized
  await waitForCart();

  // Create cart layout structure
  block.innerHTML = `
    <div class="cart-layout">
      <!-- Cart Items -->
      <div class="cart-items-wrapper">
        <div id="cart-items" class="cart-items-list">
          <!-- Cart items will be populated by JavaScript -->
        </div>
        <div id="empty-cart" class="cart-empty-state" style="display: none;">
          <div class="empty-cart-icon">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="9" cy="21" r="1"/>
              <circle cx="20" cy="21" r="1"/>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
            </svg>
          </div>
          <h2 class="empty-cart-title">Your cart is empty</h2>
          <p class="empty-cart-text">Start adding products to your cart to see them here.</p>
          <a href="${basePath}pages/catalog.html" class="btn btn-primary">Browse Catalog</a>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="cart-summary-wrapper">
        <div class="cart-summary">
          <h2 class="cart-summary-title">Order Summary</h2>
          <div class="summary-items">
            <!-- Summary items populated by JavaScript -->
          </div>
          
          <div class="promo-code-section">
            <label for="promo-code" class="promo-label">Promo Code</label>
            <div class="promo-input-group">
              <input type="text" id="promo-code" class="promo-input" placeholder="Enter code">
              <button class="btn btn-secondary btn-sm" id="apply-promo">Apply</button>
            </div>
            <div class="promo-message promo-success" style="display: none;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
              <span></span>
            </div>
          </div>
          
          <div class="summary-totals">
            <div class="summary-row">
              <span>Subtotal</span>
              <span class="subtotal">$0.00</span>
            </div>
            <div class="summary-row summary-discount" style="display: none;">
              <span>
                Discount
                <span class="discount-badge"></span>
              </span>
              <span class="discount-amount">$0.00</span>
            </div>
            <div class="summary-row">
              <span>Estimated Savings</span>
              <span class="savings">$0.00</span>
            </div>
            <div class="summary-row summary-shipping">
              <span>Shipping</span>
              <span class="shipping-amount">Free</span>
            </div>
            <div class="summary-row summary-total">
              <span>Total</span>
              <span class="total-amount">$0.00</span>
            </div>
          </div>
          
          <div class="summary-actions">
            <a href="${basePath}pages/checkout.html" class="btn btn-cta btn-lg">Proceed to Checkout</a>
          </div>
        </div>
      </div>
    </div>
  `;

  // Get DOM elements
  const itemsContainer = block.querySelector('#cart-items');
  const emptyCart = block.querySelector('#empty-cart');
  const cartSummary = block.querySelector('.cart-summary');

  /**
   * Format currency
   */
  function formatCurrency(value) {
    return `$${Number(value).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  /**
   * Render cart items
   */
  async function renderCartItems() {
    try {
      const cart = await getCart();
      
      console.log('[Cart Page] Rendering cart:', cart);

      // Check if cart is empty
      if (!cart || !cart.items || cart.items.length === 0) {
        itemsContainer.style.display = 'none';
        emptyCart.style.display = 'block';
        cartSummary.style.display = 'none';
        return;
      }

      // Show cart items
      itemsContainer.style.display = 'flex';
      emptyCart.style.display = 'none';
      cartSummary.style.display = 'block';

      // Clear existing items
      itemsContainer.innerHTML = '';

      // Render each item
      cart.items.forEach(item => {
        const card = createCartItemCard(item);
        itemsContainer.appendChild(card);
      });

      // Update summary
      updateSummary(cart);

    } catch (error) {
      console.error('[Cart Page] Failed to render cart:', error);
    }
  }

  /**
   * Create cart item card
   */
  function createCartItemCard(item) {
    const card = document.createElement('div');
    card.className = 'cart-item-card cart-item-clickable';
    card.dataset.itemId = item.id;
    card.dataset.href = `${basePath}pages/product-detail.html?sku=${item.product.sku}`;

    // Get item image
    const imageUrl = item.product.image?.url || item.product.thumbnail?.url || '';
    
    // Calculate prices
    const unitPrice = item.prices?.price?.value || 0;
    const totalPrice = item.prices?.row_total?.value || (unitPrice * item.quantity);

    card.innerHTML = `
      <div class="cart-item-main">
        <div class="cart-item-image-wrapper">
          ${imageUrl ? `
            <img src="${imageUrl}" alt="${item.product.name}" class="cart-item-img" 
                 onerror="this.parentElement.innerHTML='<div class=\\'cart-item-image-placeholder\\'><svg width=\\'40\\' height=\\'40\\' viewBox=\\'0 0 24 24\\' fill=\\'none\\' stroke=\\'currentColor\\' stroke-width=\\'1.5\\'><rect x=\\'3\\' y=\\'3\\' width=\\'18\\' height=\\'18\\' rx=\\'2\\'/><circle cx=\\'8.5\\' cy=\\'8.5\\' r=\\'1.5\\'/><path d=\\'M21 15l-5-5L5 21\\'/></svg></div>'">
          ` : `
            <div class="cart-item-image-placeholder">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          `}
        </div>
        <div class="cart-item-details">
          <div class="cart-item-header">
            <div class="cart-item-title-group">
              <h3 class="cart-item-title">${item.product.name}</h3>
            </div>
            <button class="cart-item-remove" data-item-id="${item.id}" aria-label="Remove item">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <p class="cart-item-meta">SKU: ${item.product.sku}</p>
          <p class="cart-item-price">${formatCurrency(unitPrice)} per unit</p>
          
          <div class="cart-item-footer">
            <div class="quantity-controls">
              <button class="qty-btn qty-decrease" data-item-id="${item.id}" ${item.quantity <= 1 ? 'disabled' : ''}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14"/>
                </svg>
              </button>
              <div class="qty-display">${item.quantity}</div>
              <button class="qty-btn qty-increase" data-item-id="${item.id}">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 5v14M5 12h14"/>
                </svg>
              </button>
            </div>
            <div class="cart-item-total">${formatCurrency(totalPrice)}</div>
          </div>
        </div>
      </div>
    `;

    return card;
  }

  /**
   * Update order summary
   */
  function updateSummary(cart) {
    const subtotalEl = block.querySelector('.subtotal');
    const savingsEl = block.querySelector('.savings');
    const totalEl = block.querySelector('.total-amount');
    const discountRow = block.querySelector('.summary-discount');
    const discountAmount = block.querySelector('.discount-amount');
    const discountBadge = block.querySelector('.discount-badge');

    // Update subtotal
    const subtotal = cart.prices?.subtotal_excluding_tax?.value || 0;
    subtotalEl.textContent = formatCurrency(subtotal);

    // Update total
    const total = cart.prices?.grand_total?.value || 0;
    totalEl.textContent = formatCurrency(total);

    // Update discount if present
    if (cart.prices?.discounts && cart.prices.discounts.length > 0) {
      const discount = cart.prices.discounts[0];
      discountRow.style.display = 'flex';
      discountAmount.textContent = `-${formatCurrency(discount.amount.value)}`;
      discountBadge.textContent = discount.label;
    } else {
      discountRow.style.display = 'none';
    }

    // Calculate savings (could be from discounts or volume pricing)
    const savings = subtotal - total;
    if (savings > 0) {
      savingsEl.textContent = formatCurrency(savings);
    } else {
      savingsEl.textContent = '$0.00';
    }
  }

  /**
   * Handle quantity decrease
   */
  async function handleQuantityDecrease(itemId) {
    try {
      const cart = await getCart();
      const item = cart.items.find(i => i.id === itemId);
      if (item && item.quantity > 1) {
        await updateQuantity(itemId, item.quantity - 1);
        console.log('[Cart Page] Decreased quantity for item:', itemId);
      }
    } catch (error) {
      console.error('[Cart Page] Failed to decrease quantity:', error);
    }
  }

  /**
   * Handle quantity increase
   */
  async function handleQuantityIncrease(itemId) {
    try {
      const cart = await getCart();
      const item = cart.items.find(i => i.id === itemId);
      if (item) {
        const MAX_QUANTITY = 9999;
        if (item.quantity < MAX_QUANTITY) {
          await updateQuantity(itemId, item.quantity + 1);
          console.log('[Cart Page] Increased quantity for item:', itemId);
        }
      }
    } catch (error) {
      console.error('[Cart Page] Failed to increase quantity:', error);
    }
  }

  /**
   * Handle remove item
   */
  async function handleRemoveItem(itemId) {
    try {
      await removeFromCart(itemId);
      console.log('[Cart Page] Removed item:', itemId);
    } catch (error) {
      console.error('[Cart Page] Failed to remove item:', error);
    }
  }

  /**
   * Handle promo code application
   */
  async function handleApplyPromo() {
    const promoInput = block.querySelector('#promo-code');
    const promoMessage = block.querySelector('.promo-message');
    const promoMessageText = promoMessage.querySelector('span');
    const code = promoInput.value.trim();

    if (!code) {
      promoMessage.className = 'promo-message promo-error';
      promoMessage.style.display = 'flex';
      promoMessageText.textContent = 'Please enter a promo code';
      setTimeout(() => {
        promoMessage.style.display = 'none';
      }, 3000);
      return;
    }

    // TODO: Implement applyCoupon from Cart Dropin API
    // For now, show a message
    console.log('[Cart Page] Apply promo code:', code);
    promoMessage.className = 'promo-message promo-success';
    promoMessage.style.display = 'flex';
    promoMessageText.textContent = `Promo code "${code}" applied`;
    
    // Hide message after 3 seconds
    setTimeout(() => {
      promoMessage.style.display = 'none';
    }, 3000);
  }

  // Event delegation for cart actions
  block.addEventListener('click', async (e) => {
    const decreaseBtn = e.target.closest('.qty-decrease');
    const increaseBtn = e.target.closest('.qty-increase');
    const removeBtn = e.target.closest('.cart-item-remove');
    const clickableCard = e.target.closest('.cart-item-clickable');
    const applyPromoBtn = e.target.closest('#apply-promo');

    if (decreaseBtn && !decreaseBtn.disabled) {
      e.stopPropagation();
      const itemId = decreaseBtn.dataset.itemId;
      await handleQuantityDecrease(itemId);
    } else if (increaseBtn) {
      e.stopPropagation();
      const itemId = increaseBtn.dataset.itemId;
      await handleQuantityIncrease(itemId);
    } else if (removeBtn) {
      e.stopPropagation();
      const itemId = removeBtn.dataset.itemId;
      await handleRemoveItem(itemId);
    } else if (applyPromoBtn) {
      e.stopPropagation();
      await handleApplyPromo();
    } else if (clickableCard && !e.target.closest('button') && !e.target.closest('.quantity-controls')) {
      // Navigate to product detail page
      window.location.href = clickableCard.dataset.href;
    }
  });

  // Listen for cart updates from Dropin
  const unsubscribeUpdated = events.on('cart/updated', (cartData) => {
    console.log('[Cart Page] Cart updated event received:', cartData);
    renderCartItems();
  });

  const unsubscribeData = events.on('cart/data', (cartData) => {
    console.log('[Cart Page] Cart data event received:', cartData);
    renderCartItems();
  });

  // Initial render
  await renderCartItems();

  // Cleanup on unmount (if needed)
  return () => {
    unsubscribeUpdated();
    unsubscribeData();
  };
}

