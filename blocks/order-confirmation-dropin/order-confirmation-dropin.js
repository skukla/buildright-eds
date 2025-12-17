/**
 * Order Confirmation Dropin Block
 * 
 * Integration Pattern: Dropin UI Container
 * - Renders Commerce Order Confirmation Dropin with full UI
 * - Retrieves order number from URL query parameter
 * - Configures routing for next actions
 * 
 * @module blocks/order-confirmation-dropin
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

/**
 * Decorate the order-confirmation-dropin block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Get order number from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('order');

  if (!orderNumber) {
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Order Not Found',
      message: 'No order number was provided in the URL.',
      buttons: [{ text: 'View Order History', href: `${basePath}pages/order-history.html`, primary: false }]
    }));
    return;
  }

  // Check if Commerce Dropins are enabled
  if (!config.features?.useCommerceDropins) {
    // Fallback: Show basic success message
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'success',
      icon: 'check-circle',
      title: 'Thank You for Your Order!',
      message: `Your order <strong>${orderNumber}</strong> has been placed successfully.`,
      buttons: [
        { text: 'Continue Shopping', href: `${basePath}pages/catalog.html`, primary: true },
        { text: 'View Order History', href: `${basePath}pages/order-history.html`, primary: false }
      ]
    }));
    return;
  }

  // Wait for Commerce Dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import and render Order Confirmation container
    const { render } = await import('@dropins/storefront-order/render.js');
    const OrderConfirmation = (await import('@dropins/storefront-order/containers/OrderConfirmation.js')).default;

    await render(OrderConfirmation, {
      orderRef: orderNumber,
      routeContinueShopping: () => `${basePath}pages/catalog.html`,
      routeOrderHistory: () => `${basePath}pages/order-history.html`,
      routeSupport: () => `${basePath}pages/support.html`,
    })(block);

    console.log('[Order Confirmation Dropin] Rendered for order:', orderNumber);

  } catch (error) {
    console.error('[Order Confirmation Dropin] Failed to render:', error);
    
    // User-friendly message (never expose technical errors to customers)
    // Note: This is a partial success - order placed but details unavailable
    const userMessage = `Your order <strong>${orderNumber}</strong> was placed successfully!<br>We couldn\'t load the full details right now, but you\'ll receive an email confirmation shortly.`;
    
    // In development, optionally append technical details
    const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const debugInfo = isDevelopment ? `<br><small style="color: var(--color-text-disabled); margin-top: 0.5rem; display: block;">Dev Info: ${error.message}</small>` : '';
    
    // Show error state with fallback success message
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'check-circle',  // Use success icon since order was placed
      title: 'Order placed successfully',
      message: userMessage + debugInfo,
      buttons: [
        { text: 'Continue Shopping', href: `${basePath}pages/catalog.html`, primary: true },
        { text: 'View Order History', href: `${basePath}pages/order-history.html`, primary: false }
      ]
    }));
  }
}

