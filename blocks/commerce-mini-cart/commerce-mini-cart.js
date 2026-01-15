/**
 * Commerce Mini Cart Block
 *
 * Integration Pattern: UI Container + Slots + Design Tokens (Level 2)
 * - Uses MiniCart dropin container for data and state management
 * - Dropin handles cart updates, events, and synchronization automatically
 * - Custom slots with .buildright-* classes for UI customization
 * - Click-outside behavior for closing (follows dropin best practices)
 *
 * Available MiniCart Slots (verified via DOM inspection):
 * - ProductList: Customize product list
 * - EmptyCart: Custom empty state UI
 * - ProductListFooter: Add content after products
 * - PreCheckoutSection: Add content before checkout
 *
 * Rendering:
 * - Content renders inside the block element (required for dropin inspector)
 * - Header integration wires up toggle button and click-outside handling
 *
 * @module blocks/commerce-mini-cart
 */

export default async function decorate(block) {
  console.log('[Commerce Mini Cart] Initializing with MiniCart container...');

  const basePath = window.BASE_PATH || '/';

  // Wait for dropins to be initialized
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import MiniCart container and render utility (parallel for performance)
    const [{ render }, miniCartModule] = await Promise.all([
      import('@dropins/storefront-cart/render.js'),
      import('@dropins/storefront-cart/containers/MiniCart.js'),
    ]);

    // MiniCart might be default or named export - handle both
    const MiniCart = miniCartModule.MiniCart || miniCartModule.default;
    console.log('[Commerce Mini Cart] MiniCart container loaded:', MiniCart);
    console.log('[Commerce Mini Cart] Module exports:', Object.keys(miniCartModule));

    // Create our own wrapper with .mini-cart class for CSS targeting
    // IMPORTANT: Render inside `block` (not targetContainer) so slots are inside
    // the block element with data-block-name for dropin inspector detection
    const miniCartWrapper = document.createElement('div');
    miniCartWrapper.className = 'mini-cart';
    block.appendChild(miniCartWrapper);

    // Render MiniCart container INSIDE our wrapper
    console.log('[Commerce Mini Cart] About to render, wrapper:', miniCartWrapper);
    console.log('[Commerce Mini Cart] render.render function:', typeof render.render);

    try {
      const renderFn = render.render(MiniCart, {
        routeProduct: (item) => `${basePath}pages/product-detail.html?sku=${item.product?.sku || item.sku}`,
        routeCart: () => `${basePath}pages/cart.html`,
        routeCheckout: () => `${basePath}pages/checkout.html`,
        routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
        slots: {
          // Custom empty cart UI with BuildRight styling
          EmptyCart: (ctx) => {
            const emptyCart = document.createElement('div');
            emptyCart.className = 'buildright-empty-cart';
            emptyCart.innerHTML = `
              <div class="buildright-empty-cart__icon">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <circle cx="9" cy="21" r="1"/>
                  <circle cx="20" cy="21" r="1"/>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                </svg>
              </div>
              <h3 class="buildright-empty-cart__heading">Your Shopping Cart is Empty</h3>
              <p class="buildright-empty-cart__message">Looks like you haven't added any items yet.</p>
              <a href="${basePath}pages/catalog.html" class="btn btn-primary buildright-empty-cart__cta">
                Continue Shopping
              </a>
            `;
            ctx.replaceWith(emptyCart);
          },
        },
      });
      console.log('[Commerce Mini Cart] renderFn:', renderFn);

      const miniCartInstance = await renderFn(miniCartWrapper);
      console.log('[Commerce Mini Cart] MiniCart instance:', miniCartInstance);
      console.log('[Commerce Mini Cart] Wrapper innerHTML after render:', miniCartWrapper.innerHTML.substring(0, 200));
    } catch (renderError) {
      console.error('[Commerce Mini Cart] Render error:', renderError);
      throw renderError;
    }

    console.log('[Commerce Mini Cart] MiniCart container rendered');

    // Post-render: Wire up toggle and click-outside handling
    setupHeaderIntegration(block);

    console.log('[Commerce Mini Cart] Initialization complete');

  } catch (error) {
    console.error('[Commerce Mini Cart] Failed to render MiniCart container:', error);

    // Fallback error message
    block.innerHTML = `
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
 * Wires up toggle button and click-outside handling
 */
function setupHeaderIntegration(block) {
  const miniCart = block.querySelector('.mini-cart') || block.querySelector('[class*="mini-cart"]');
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

