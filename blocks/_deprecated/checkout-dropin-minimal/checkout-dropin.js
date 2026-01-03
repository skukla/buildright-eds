/**
 * Checkout Dropin Block
 * 
 * Integration Pattern: Dropin UI Container
 * - Renders Commerce Checkout Dropin with full UI
 * - Configures routing and callbacks
 * - Handles order success/error states
 * 
 * @module blocks/checkout-dropin
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

/**
 * Decorate the checkout-dropin block
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
      message: 'Please enable Commerce Dropins to proceed with checkout.',
      buttons: [{ text: 'Return to Cart', href: `${basePath}pages/cart.html`, primary: false }]
    }));
    return;
  }

  // Wait for Commerce Dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import and render Checkout container
    const { render } = await import('@dropins/storefront-checkout/render.js');
    const Checkout = (await import('@dropins/storefront-checkout/containers/Checkout.js')).default;

    await render(Checkout, {
      routeCart: () => `${basePath}pages/cart.html`,
      routeSignIn: () => `${basePath}pages/login.html`,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.topLevelSku || product.sku}`,
      onOrderSuccess: (order) => {
        console.log('[Checkout Dropin] Order placed successfully:', order.number);
        // Redirect to order confirmation
        window.location.href = `${basePath}pages/order-confirmation.html?order=${order.number}`;
      },
      onOrderError: (error) => {
        console.error('[Checkout Dropin] Order failed:', error);
        // Error is handled by the dropin UI
      },
    })(block);

    console.log('[Checkout Dropin] Commerce Checkout Dropin rendered');

  } catch (error) {
    console.error('[Checkout Dropin] Failed to render:', error);
    
    // User-friendly message (never expose technical errors to customers)
    const userMessage = 'We\'re unable to process your checkout right now.<br>Please return to your cart and try again.';
    
    // In development, optionally append technical details
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const debugInfo = isDevelopment ? `<br><small style="color: var(--color-text-disabled); margin-top: 0.5rem; display: block;">Dev Info: ${error.message}</small>` : '';
    
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Something went wrong',
      message: userMessage + debugInfo,
      buttons: [{ text: 'Return to Cart', href: `${basePath}pages/cart.html`, primary: false }]
    }));
  }
}

