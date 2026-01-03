/**
 * Cart Dropin Block
 * 
 * Integration Pattern: Dropin UI Container
 * - Renders Commerce Cart Dropin with full UI
 * - Configures routing and callbacks
 * - Handles empty/error states
 * 
 * @module blocks/cart-dropin
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

/**
 * Decorate the cart-dropin block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Check if Commerce Dropins are enabled
  if (!config.features?.useCommerceDropins) {
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Commerce Dropins Not Enabled',
      message: 'Please enable Commerce Dropins to use the shopping cart.',
      buttons: [{ text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true }]
    }));
    return;
  }

  // Wait for Commerce Dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import and render CartSummaryList container (full cart page view)
    const { render } = await import('@dropins/storefront-cart/render.js');
    const { CartSummaryList } = await import('@dropins/storefront-cart/containers/CartSummaryList.js');

    await render.render(CartSummaryList, {
      routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
      hideHeading: false,
      hideFooter: false,
      enableRemoveItem: true,
      enableUpdateItemQuantity: true,
    })(block);

    console.log('[Cart Dropin] Commerce CartSummaryList rendered');

  } catch (error) {
    console.error('[Cart Dropin] Failed to render:', error);
    
    // User-friendly message (never expose technical errors to customers)
    const userMessage = 'We\'re unable to load your shopping cart right now.<br>Please try again or continue browsing.';
    
    // In development, optionally append technical details
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const debugInfo = isDevelopment ? `<br><small style="color: var(--color-text-disabled); margin-top: 0.5rem; display: block;">Dev Info: ${error.message}</small>` : '';
    
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Something went wrong',
      message: userMessage + debugInfo,
      buttons: [{ text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true }]
    }));
  }
}

