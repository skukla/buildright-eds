/**
 * Cart Block
 *
 * Renders shopping cart using @dropins/storefront-cart with BuildRight slot customization.
 * Routes through mesh adapter (dropin-cart.js) for extensibility control.
 *
 * Follows the canonical slot pattern from product-detail.js:
 * - Adobe dropin handles data fetching, state management
 * - BuildRight controls visual presentation via slot callbacks
 * - Mesh adapter intercepts queries for extensibility
 *
 * @module blocks/cart
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[Cart]', ...args);

/**
 * Emit custom cart events for cross-component communication
 * @param {string} eventName - Event name (cart:loading, cart:loaded, cart:error)
 * @param {Object} detail - Event detail payload
 */
function emitCartEvent(eventName, detail = {}) {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
  log(`Event emitted: ${eventName}`, detail);
}

/**
 * Decorate the cart block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Check if Commerce Dropins are enabled
  if (!config.features?.useCommerceDropins) {
    log('Commerce Dropins not enabled in config');
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Commerce Dropins Not Enabled',
      message: 'Please enable Commerce Dropins to use the shopping cart.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
      ],
    }));
    return;
  }

  // Show loading state immediately - emit loading event
  emitCartEvent('cart:loading');
  block.innerHTML = `
    <div class="buildright-cart-loading">
      <div class="loading-spinner loading-spinner-lg"></div>
      <p class="buildright-cart-loading-text">Loading your cart...</p>
    </div>
  `;

  // Wait for dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import Cart dropin modules (parallel for performance)
    const [{ render }, { CartSummaryList }] = await Promise.all([
      import('@dropins/storefront-cart/render.js'),
      import('@dropins/storefront-cart/containers/CartSummaryList.js'),
    ]);

    log('Rendering CartSummaryList');

    // Clear loading state before rendering dropin
    block.innerHTML = '';

    // Render CartSummaryList with BuildRight slot customization
    await render.render(CartSummaryList, {
      routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
      hideHeading: false,
      hideFooter: false,
      enableRemoveItem: true,
      enableUpdateItemQuantity: true,
      slots: {
        /**
         * EmptyCart Slot - BuildRight styled empty cart message
         */
        EmptyCart: (ctx) => {
          log('EmptyCart slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-cart-empty';

          const icon = document.createElement('div');
          icon.className = 'buildright-cart-empty-icon';
          icon.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <circle cx="8" cy="21" r="1"/>
              <circle cx="19" cy="21" r="1"/>
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
            </svg>
          `;

          const title = document.createElement('h2');
          title.className = 'buildright-cart-empty-title';
          title.textContent = 'Your Cart is Empty';

          const message = document.createElement('p');
          message.className = 'buildright-cart-empty-message';
          message.textContent = 'Looks like you haven\'t added any items yet.';

          const ctaLink = document.createElement('a');
          ctaLink.href = `${basePath}pages/catalog.html`;
          ctaLink.className = 'btn btn-primary buildright-cart-empty-cta';
          ctaLink.textContent = 'Browse Catalog';

          wrapper.appendChild(icon);
          wrapper.appendChild(title);
          wrapper.appendChild(message);
          wrapper.appendChild(ctaLink);

          ctx.replaceWith(wrapper);
        },

        /**
         * CartItem Slot - BuildRight styled cart item row
         */
        Item: (ctx) => {
          log('CartItem slot:', ctx.data?.name);
          const item = ctx.data;
          if (!item) return;

          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-cart-item';

          // Image container
          const imageContainer = document.createElement('div');
          imageContainer.className = 'buildright-cart-item-image';
          const img = document.createElement('img');
          img.src = item.image?.url || '/images/placeholder-product.jpg';
          img.alt = item.name || 'Product image';
          img.loading = 'lazy';
          imageContainer.appendChild(img);

          // Details container
          const details = document.createElement('div');
          details.className = 'buildright-cart-item-details';

          const name = document.createElement('h3');
          name.className = 'buildright-cart-item-name';
          name.textContent = item.name || 'Product';

          const sku = document.createElement('p');
          sku.className = 'buildright-cart-item-sku';
          sku.textContent = `SKU: ${item.sku || ''}`;

          details.appendChild(name);
          details.appendChild(sku);

          // Price container
          const priceContainer = document.createElement('div');
          priceContainer.className = 'buildright-cart-item-price';

          const priceValue = item.price?.value || item.prices?.price?.value || 0;
          const currency = item.price?.currency || item.prices?.price?.currency || 'USD';

          const price = document.createElement('span');
          price.className = 'buildright-cart-item-price-value';
          price.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
          }).format(priceValue);

          priceContainer.appendChild(price);

          wrapper.appendChild(imageContainer);
          wrapper.appendChild(details);
          wrapper.appendChild(priceContainer);

          ctx.appendChildren(wrapper);
        },

        /**
         * CartSummary Slot - BuildRight styled order summary
         */
        Summary: (ctx) => {
          log('CartSummary slot');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-cart-summary';
          ctx.appendChild(wrapper);
        },
      },
    })(block);

    log('CartSummaryList rendered successfully');

    // Emit success event
    emitCartEvent('cart:loaded');

    // Subscribe to cart events for notifications
    const { events } = await import('@dropins/tools/event-bus.js');
    events.on('cart/updated', (cartData) => {
      log('Cart updated event received', cartData);
    });

  } catch (error) {
    console.error('[Cart] Failed to render:', error);

    // Emit error event
    emitCartEvent('cart:error', { error: error.message });

    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Unable to Load Cart',
      message: 'We couldn\'t load your shopping cart. Please try again or continue browsing.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
      ],
    }));
  }
}
