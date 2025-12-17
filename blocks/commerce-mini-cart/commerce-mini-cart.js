/**
 * Commerce Mini Cart Block
 * 
 * Integration Pattern: Custom HTML + Dropin APIs
 * - Uses BuildRight's exact design (custom HTML/CSS)
 * - Wires to Commerce Cart Dropin APIs for functionality
 * - Listens to cart events for synchronization
 * 
 * Context-Aware Rendering:
 * - Header context: Populates #mini-cart-container with dropdown
 * - Standalone context: Renders standalone mini cart
 */

import { parseHTMLFragment } from '../../scripts/utils.js';

export default async function decorate(block) {
  console.log('[Commerce Mini Cart] Initializing...');

  const basePath = window.BASE_PATH || '/';

  // Determine if we're in header context (mini-cart in dropdown) or standalone
  const isHeaderContext = block.closest('header') !== null;
  const targetContainer = isHeaderContext ? document.getElementById('mini-cart-container') : block;

  if (!targetContainer) {
    console.error('[Commerce Mini Cart] Target container not found');
    return;
  }

  // Create BuildRight's exact mini cart HTML structure
  const miniCartHTML = `
    <div class="mini-cart" id="mini-cart">
      <div class="mini-cart-header">
        <div class="mini-cart-header-content">
          <h3 class="mini-cart-title">Shopping Cart</h3>
          <span class="mini-cart-item-count">0 items</span>
        </div>
        <button class="mini-cart-close" id="mini-cart-close" aria-label="Close cart">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6 6 18"/>
            <path d="m6 6 12 12"/>
          </svg>
        </button>
      </div>
      <div class="mini-cart-items" id="mini-cart-items">
        <!-- Cart items will be populated here -->
      </div>
      <div class="mini-cart-empty hidden" id="mini-cart-empty">
        <svg class="mini-cart-empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="8" cy="21" r="1"/>
          <circle cx="19" cy="21" r="1"/>
          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
        </svg>
        <p class="mini-cart-empty-title">Your cart is empty</p>
        <p class="mini-cart-empty-text">Browse our catalog to find products</p>
        <a href="${basePath}pages/catalog.html" class="mini-cart-empty-cta">Browse Catalog</a>
      </div>
      <div class="mini-cart-footer">
        <div class="mini-cart-subtotal">
          <span class="mini-cart-subtotal-label">Subtotal</span>
          <span class="mini-cart-total">$0.00</span>
        </div>
        <div class="mini-cart-actions">
          <a href="${basePath}pages/cart.html" class="btn btn-secondary btn-sm">View Cart</a>
          <a href="${basePath}pages/checkout.html" class="btn btn-cta btn-sm">Checkout</a>
        </div>
      </div>
    </div>
  `;

  // Populate the target container
  targetContainer.innerHTML = miniCartHTML;

  // Get references to the mini cart elements
  const miniCart = targetContainer.querySelector('#mini-cart');
  const miniCartItems = targetContainer.querySelector('#mini-cart-items');
  const miniCartEmpty = targetContainer.querySelector('#mini-cart-empty');
  const miniCartItemCount = targetContainer.querySelector('.mini-cart-item-count');
  const miniCartTotal = targetContainer.querySelector('.mini-cart-total');
  const closeBtn = targetContainer.querySelector('#mini-cart-close');

  // Import Cart Dropin APIs
  let cartApi;
  try {
    cartApi = await import('@dropins/storefront-cart/api.js');
    console.log('[Commerce Mini Cart] Cart Dropin APIs loaded');
  } catch (error) {
    console.error('[Commerce Mini Cart] Failed to load Cart Dropin APIs:', error);
    return;
  }

  const { getCartData, removeCartItems } = cartApi;

  // Import event bus for cart synchronization
  let eventBus;
  try {
    eventBus = await import('@dropins/tools/event-bus.js');
  } catch (error) {
    console.warn('[Commerce Mini Cart] Event bus not available:', error);
  }

  // Wire up cart toggle button (in header)
  const cartToggle = document.getElementById('cart-link-toggle');
  if (cartToggle && miniCart) {
    cartToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = miniCart.classList.contains('active');
      miniCart.classList.toggle('active');
      cartToggle.setAttribute('aria-expanded', !isActive);
    });
  }

  // Setup close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      miniCart.classList.remove('active');
      if (cartToggle) {
        cartToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Close mini cart when clicking outside
  document.addEventListener('click', (e) => {
    if (miniCart && cartToggle) {
      const cartLinkWrapper = cartToggle.closest('.cart-link-wrapper');
      if (!cartLinkWrapper?.contains(e.target)) {
        miniCart.classList.remove('active');
        cartToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  // Track if we're currently updating to prevent race conditions
  let isUpdating = false;

  /**
   * Update mini cart display with data from Commerce
   */
  async function updateMiniCart() {
    // Prevent concurrent updates
    if (isUpdating) return;
    isUpdating = true;

    try {
      // Get cart data from Commerce Dropin API
      let cart;
      try {
        cart = await getCartData();
      } catch (error) {
        // No cart ID found means guest user with empty cart - this is expected
        if (error.message?.includes('No cart ID found')) {
          console.log('[Commerce Mini Cart] No cart found (guest user with empty cart)');
          cart = null;
        } else {
          throw error; // Re-throw unexpected errors
        }
      }
      
      if (!miniCartItems || !miniCartEmpty) {
        console.warn('[Commerce Mini Cart] Elements not found');
        return;
      }

      // Extract cart data
      const items = cart?.items || [];
      const totals = cart?.prices || {};
      const subtotal = totals?.subtotal?.value || 0;
      const totalQuantity = cart?.total_quantity || 0;

      console.log('[Commerce Mini Cart] Cart data:', { itemCount: items.length, totalQuantity, subtotal });

      // Update count and total
      if (miniCartItemCount) {
        miniCartItemCount.textContent = `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`;
      }

      if (miniCartTotal) {
        miniCartTotal.textContent = `$${subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }

      // Show empty state or items
      if (items.length === 0) {
        miniCart.classList.add('mini-cart-empty-state');
        if (miniCartItems) miniCartItems.classList.add('hidden');
        if (miniCartEmpty) miniCartEmpty.classList.remove('hidden');
      } else {
        miniCart.classList.remove('mini-cart-empty-state');
        if (miniCartEmpty) miniCartEmpty.classList.add('hidden');
        if (miniCartItems) {
          miniCartItems.classList.remove('hidden');
          
          // Clear existing items completely
          while (miniCartItems.firstChild) {
            miniCartItems.removeChild(miniCartItems.firstChild);
          }

          const maxDisplayItems = 5;
          const itemsToDisplay = items.slice(0, maxDisplayItems);

          // Render items
          for (const item of itemsToDisplay) {
            const itemHTML = createItemHTML(item);
            if (itemHTML) {
              const fragment = parseHTMLFragment(itemHTML);
              miniCartItems.appendChild(fragment);
            }
          }

          // Show "more items" indicator
          if (items.length > maxDisplayItems) {
            const remainingCount = items.length - maxDisplayItems;
            const moreHTML = `<div class="mini-cart-more"><p>And ${remainingCount} more ${remainingCount === 1 ? 'item' : 'items'}</p></div>`;
            miniCartItems.appendChild(parseHTMLFragment(moreHTML));
          }
        }
      }
    } catch (error) {
      console.error('[Commerce Mini Cart] Error updating cart:', error);
    } finally {
      isUpdating = false;
    }
  }

  /**
   * Create HTML for a single cart item
   */
  function createItemHTML(item) {
    const escapeHtml = (text) => {
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    const name = item.product?.name || 'Unknown Product';
    const sku = item.product?.sku || item.sku || '';
    const quantity = item.quantity || 0;
    const price = item.prices?.row_total?.value || 0;
    const imageUrl = item.product?.image?.url || '';
    const hasImage = imageUrl && imageUrl.trim() !== '';

    return `
      <a href="${basePath}pages/product-detail.html?sku=${sku}" class="mini-cart-item mini-cart-item-link" data-item-id="${item.id}">
        <div class="mini-cart-item-image ${!hasImage ? 'mini-cart-item-image-placeholder image-placeholder-pattern' : ''}">
          ${hasImage ? `<img src="${imageUrl}" alt="${escapeHtml(name)}" onerror="this.parentElement.classList.add('mini-cart-item-image-placeholder', 'image-placeholder-pattern'); this.classList.add('hidden');">` : ''}
        </div>
        <div class="mini-cart-item-info">
          <div class="mini-cart-item-header-row">
            <div class="mini-cart-item-name-row">
              <div class="mini-cart-item-name">${escapeHtml(name)}</div>
            </div>
            <button class="mini-cart-item-remove" data-item-id="${item.id}" aria-label="Remove ${escapeHtml(name)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="mini-cart-item-details-row">
            <span class="mini-cart-item-quantity">Qty: ${quantity}</span>
            <span class="mini-cart-item-price">$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </a>
    `;
  }

  /**
   * Handle remove button clicks
   */
  targetContainer.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.mini-cart-item-remove');
    
    if (removeBtn) {
      // Prevent link navigation when clicking remove button
      e.preventDefault();
      e.stopPropagation();
      
      const itemId = removeBtn.getAttribute('data-item-id');
      
      if (itemId) {
        try {
          console.log('[Commerce Mini Cart] Removing item:', itemId);
          await removeCartItems([itemId]);
          // Cart will update via event listener
        } catch (error) {
          console.error('[Commerce Mini Cart] Error removing item:', error);
        }
      }
    }
  });

  // Listen for cart updates from Dropin events
  if (eventBus) {
    eventBus.events.on('cart/updated', (data) => {
      console.log('[Commerce Mini Cart] Cart updated event received');
      updateMiniCart();
    });

    eventBus.events.on('cart/initialized', () => {
      console.log('[Commerce Mini Cart] Cart initialized event received');
      updateMiniCart();
    });
  }

  // Initial load
  await updateMiniCart();
  
  console.log('[Commerce Mini Cart] Initialization complete');
}
