/**
 * Commerce Mini Cart Block
 * 
 * Integration Pattern: UI Container + Configuration + Slots (Level 2)
 * - Uses MiniCart dropin container for data and state management
 * - Customizes UI via slots to match BuildRight design
 * - Dropin handles cart updates, events, and synchronization automatically
 * 
 * Context-Aware Rendering:
 * - Header context: Renders in #mini-cart-container with dropdown
 * - Standalone context: Renders standalone mini cart
 * 
 * @module blocks/commerce-mini-cart
 */

export default async function decorate(block) {
  console.log('[Commerce Mini Cart] Initializing with MiniCart container...');

  const basePath = window.BASE_PATH || '/';

  // Determine if we're in header context (mini-cart in dropdown) or standalone
  const isHeaderContext = block.closest('header') !== null;
  const targetContainer = isHeaderContext ? document.getElementById('mini-cart-container') : block;

  if (!targetContainer) {
    console.error('[Commerce Mini Cart] Target container not found');
    return;
  }

  // Wait for dropins to be initialized
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import MiniCart container and render utility
    const { render } = await import('@dropins/storefront-cart/render.js');
    const { MiniCart } = await import('@dropins/storefront-cart/containers/MiniCart.js');

    console.log('[Commerce Mini Cart] MiniCart container loaded');

    // Render MiniCart container with BuildRight customization via slots
    await render.render(MiniCart, {
      // Configuration options
      routeProduct: (item) => `${basePath}pages/product-detail.html?sku=${item.product?.sku || item.sku}`,
      routeCart: () => `${basePath}pages/cart.html`,
      routeCheckout: () => `${basePath}pages/checkout.html`,
      routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
      displayAllItems: false, // Limit to 5 items
      enableItemRemoval: true,
      hideHeading: true, // We provide custom heading via slot
      
      // Custom slots for BuildRight design
      slots: {
        /**
         * Custom heading with close button
         */
        Heading: () => {
          return `
            <div class="mini-cart-header">
              <div class="mini-cart-header-content">
                <h3 class="mini-cart-title">Shopping Cart</h3>
                <span class="mini-cart-item-count" data-cart-count></span>
              </div>
              <button class="mini-cart-close" id="mini-cart-close" aria-label="Close cart">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6 6 18"/>
                  <path d="m6 6 12 12"/>
                </svg>
              </button>
            </div>
          `;
        },

        /**
         * Custom empty cart state
         */
        EmptyCart: () => {
          return `
            <div class="mini-cart-empty">
              <svg class="mini-cart-empty-icon" xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="8" cy="21" r="1"/>
                <circle cx="19" cy="21" r="1"/>
                <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
              </svg>
              <p class="mini-cart-empty-title">Your cart is empty</p>
              <p class="mini-cart-empty-text">Browse our catalog to find products</p>
              <a href="${basePath}pages/catalog.html" class="mini-cart-empty-cta">Browse Catalog</a>
            </div>
          `;
        },

        /**
         * Custom cart item with BuildRight styling
         */
        CartItem: (context) => {
          const { item } = context;
          
          // Helper function to escape HTML
          const escapeHtml = (text) => {
            const div = document.createElement('div');
            div.textContent = text || '';
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
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M18 6 6 18"/>
                      <path d="m6 6 12 12"/>
                    </svg>
                  </button>
                </div>
                <div class="mini-cart-item-details-row">
                  <span class="mini-cart-item-quantity">Qty: ${quantity}</span>
                  <span class="mini-cart-item-price">$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              </div>
            </a>
          `;
        },

        /**
         * Custom footer with subtotal and action buttons
         */
        Footer: () => {
          return `
            <div class="mini-cart-footer">
              <div class="mini-cart-subtotal">
                <span class="mini-cart-subtotal-label">Subtotal</span>
                <span class="mini-cart-total" data-cart-total></span>
              </div>
              <div class="mini-cart-actions">
                <a href="${basePath}pages/cart.html" class="btn btn-secondary btn-sm">View Cart</a>
                <a href="${basePath}pages/checkout.html" class="btn btn-cta btn-sm">Checkout</a>
              </div>
            </div>
          `;
        }
      }
    })(targetContainer);

    console.log('[Commerce Mini Cart] MiniCart container rendered');

    // Post-render: Wire up close button and header integration
    setupHeaderIntegration(targetContainer);

    console.log('[Commerce Mini Cart] Initialization complete');

  } catch (error) {
    console.error('[Commerce Mini Cart] Failed to render MiniCart container:', error);
    
    // Fallback error message
    targetContainer.innerHTML = `
      <div class="mini-cart mini-cart-error">
        <div class="mini-cart-error-message">
          <p>Unable to load cart</p>
          <a href="${basePath}pages/cart.html" class="btn btn-cta btn-sm">View Full Cart</a>
        </div>
      </div>
    `;
  }
}

/**
 * Setup header integration for mini cart dropdown
 * Wires up toggle button, close button, and click-outside handling
 */
function setupHeaderIntegration(targetContainer) {
  const miniCart = targetContainer.querySelector('.mini-cart') || targetContainer.querySelector('[class*="mini-cart"]');
  const closeBtn = targetContainer.querySelector('#mini-cart-close');
  const cartToggle = document.getElementById('cart-link-toggle');

  if (!miniCart) {
    console.warn('[Commerce Mini Cart] Mini cart element not found for header integration');
    return;
  }

  // Wire up cart toggle button (in header)
  if (cartToggle) {
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
    if (cartToggle) {
      const cartLinkWrapper = cartToggle.closest('.cart-link-wrapper');
      if (!cartLinkWrapper?.contains(e.target)) {
        miniCart.classList.remove('active');
        cartToggle.setAttribute('aria-expanded', 'false');
      }
    }
  });

  console.log('[Commerce Mini Cart] Header integration complete');
}
