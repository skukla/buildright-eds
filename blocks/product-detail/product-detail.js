/**
 * Product Detail Block
 *
 * Renders product details using @dropins/storefront-pdp with BuildRight slot customization.
 * Routes through mesh adapter (dropin-pdp.js) for extensibility control.
 *
 * Follows the canonical slot pattern from product-list.js:
 * - Adobe dropin handles data fetching, state management
 * - BuildRight controls visual presentation via slot callbacks
 * - Mesh adapter intercepts queries for extensibility
 *
 * @module blocks/product-detail
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[ProductDetail]', ...args);

/**
 * Decorate the product-detail block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Extract SKU from URL query parameters
  const urlParams = new URLSearchParams(window.location.search);
  const sku = urlParams.get('sku');

  // Handle missing SKU parameter
  if (!sku) {
    log('No SKU provided in URL');
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Product Not Found',
      message: 'No product SKU specified.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
      ],
    }));
    return;
  }

  // Check if Commerce Dropins are enabled
  if (!config.features?.useCommerceDropins) {
    log('Commerce Dropins not enabled in config');
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Commerce Dropins Not Enabled',
      message: 'Please enable Commerce Dropins to view product details.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
      ],
    }));
    return;
  }

  // Show loading state immediately
  block.innerHTML = '<div class="pdp-loading"><div class="loading-spinner loading-spinner-lg"></div></div>';

  // Wait for dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import PDP dropin modules (parallel for performance)
    const [{ render }, { default: ProductDetails }] = await Promise.all([
      import('@dropins/storefront-pdp/render.js'),
      import('@dropins/storefront-pdp/containers/ProductDetails.js'),
    ]);

    log('Rendering ProductDetails for SKU:', sku);

    // Clear loading state before rendering dropin
    block.innerHTML = '';

    // Render ProductDetails with BuildRight slot customization
    await render.render(ProductDetails, {
      sku,
      hideSku: false,
      hideQuantity: false,
      hideShortDescription: true,
      slots: {
        /**
         * Image Slot - BuildRight styled image wrapper
         */
        Image: (ctx) => {
          log('Image slot:', ctx.data?.url);
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-pdp-image-wrapper';

          const img = document.createElement('img');
          img.className = 'buildright-pdp-image';
          img.src = ctx.data?.url || '/images/placeholder-product.jpg';
          img.alt = ctx.data?.label || 'Product image';
          img.loading = 'eager';

          wrapper.appendChild(img);
          ctx.replaceWith(wrapper);
        },

        /**
         * Title Slot - BuildRight header with product name
         */
        Title: (ctx) => {
          log('Title slot:', ctx.data);
          const header = document.createElement('div');
          header.className = 'buildright-pdp-header';

          const name = document.createElement('h1');
          name.className = 'buildright-pdp-name';
          name.textContent = ctx.data || 'Product';

          header.appendChild(name);
          ctx.replaceWith(header);
        },

        /**
         * SKU Slot - BuildRight SKU display
         */
        Sku: (ctx) => {
          log('Sku slot:', ctx.data);
          const skuEl = document.createElement('div');
          skuEl.className = 'buildright-pdp-sku';
          skuEl.textContent = ctx.data || '';
          ctx.replaceWith(skuEl);
        },

        /**
         * Price Slot - BuildRight pricing display
         * Handles multiple price structures from ACO/Commerce
         */
        Price: (ctx) => {
          log('Price slot:', ctx.data);
          const priceContainer = document.createElement('div');
          priceContainer.className = 'buildright-pdp-pricing';

          // Extract price from various possible structures
          const priceValue = ctx.data?.final?.amount?.value
            || ctx.data?.regular?.amount?.value
            || ctx.data?.value
            || 0;
          const currency = ctx.data?.final?.amount?.currency
            || ctx.data?.regular?.amount?.currency
            || 'USD';

          const priceEl = document.createElement('div');
          priceEl.className = 'buildright-pdp-price-value';
          priceEl.textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency,
          }).format(priceValue);

          priceContainer.appendChild(priceEl);
          ctx.replaceWith(priceContainer);
        },

        /**
         * Actions Slot - BuildRight add-to-cart actions
         */
        Actions: (ctx) => {
          log('Actions slot');
          const actions = document.createElement('div');
          actions.className = 'buildright-pdp-actions';
          ctx.appendChild(actions);
        },
      },
    })(block);

    log('ProductDetails rendered successfully');

    // Subscribe to cart events for notifications
    const { events } = await import('@dropins/tools/event-bus.js');
    events.on('cart/updated', () => {
      log('Cart updated event received');
    });
  } catch (error) {
    console.error('[ProductDetail] Failed to render:', error);
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Unable to Load Product',
      message: 'Please try again or browse our catalog.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
      ],
    }));
  }
}
