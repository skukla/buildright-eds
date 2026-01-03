/**
 * Checkout Block
 *
 * Renders checkout flow using @dropins/storefront-checkout with BuildRight slot customization.
 * Routes through mesh adapter (dropin-checkout.js) for extensibility control.
 *
 * Follows the canonical slot pattern from cart.js:
 * - Adobe dropin handles data fetching, state management
 * - BuildRight controls visual presentation via slot callbacks
 * - Mesh adapter intercepts mutations for extensibility
 *
 * Slots Customized:
 * - ShippingMethods - Radio list with .buildright-checkout-shipping
 * - PaymentMethods - Payment options with .buildright-checkout-payment
 * - OrderSummary - Cart items summary with .buildright-checkout-summary
 * - ShippingAddress - Address form with .buildright-checkout-address
 * - BillingAddress - Billing form with .buildright-checkout-billing
 * - PlaceOrderButton - Action area with .buildright-checkout-actions
 *
 * @module blocks/checkout
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[Checkout]', ...args);

/**
 * Emit custom checkout events for cross-component communication
 * @param {string} eventName - Event name (checkout:loading, checkout:loaded, checkout:error)
 * @param {Object} detail - Event detail payload
 */
function emitCheckoutEvent(eventName, detail = {}) {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
  log(`Event emitted: ${eventName}`, detail);
}

/**
 * Decorate the checkout block
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
      message: 'Please enable Commerce Dropins to use checkout.',
      buttons: [
        { text: 'Return to Cart', href: `${basePath}pages/cart.html`, primary: true },
      ],
    }));
    return;
  }

  // Show loading state immediately - emit loading event
  emitCheckoutEvent('checkout:loading');
  block.innerHTML = `
    <div class="buildright-checkout-loading">
      <div class="loading-spinner loading-spinner-lg"></div>
      <p class="buildright-checkout-loading-text">Preparing your checkout...</p>
    </div>
  `;

  // Wait for dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import Checkout dropin modules
    const { render } = await import('@dropins/storefront-checkout/render.js');
    const Checkout = (await import('@dropins/storefront-checkout/containers/Checkout.js')).default;

    log('Rendering Checkout');

    // Clear loading state before rendering dropin
    block.innerHTML = '';

    // Render Checkout with BuildRight slot customization
    await render.render(Checkout, {
      routeCart: () => `${basePath}pages/cart.html`,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
      onOrderSuccess: (orderData) => {
        log('Order placed successfully:', orderData);
        // Redirect to order confirmation page
        window.location.href = `${basePath}pages/order-confirmation.html?orderNumber=${orderData.orderNumber || orderData.order_number || ''}`;
      },
      onOrderError: (error) => {
        console.error('[Checkout] Order error:', error);
        log('Order placement failed:', error?.message || 'Unknown error');
        // Error is displayed in the dropin UI - no redirect needed
      },
      slots: {
        /**
         * ShippingAddress Slot - BuildRight styled address form
         */
        ShippingAddress: (ctx) => {
          log('ShippingAddress slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-checkout-address';
          ctx.appendChild(wrapper);
        },

        /**
         * ShippingMethods Slot - BuildRight styled shipping options
         */
        ShippingMethods: (ctx) => {
          log('ShippingMethods slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-checkout-shipping';
          ctx.appendChild(wrapper);
        },

        /**
         * BillingAddress Slot - BuildRight styled billing form
         */
        BillingAddress: (ctx) => {
          log('BillingAddress slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-checkout-billing';
          ctx.appendChild(wrapper);
        },

        /**
         * PaymentMethods Slot - BuildRight styled payment options
         */
        PaymentMethods: (ctx) => {
          log('PaymentMethods slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-checkout-payment';
          ctx.appendChild(wrapper);
        },

        /**
         * OrderSummary Slot - BuildRight styled cart summary
         */
        OrderSummary: (ctx) => {
          log('OrderSummary slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-checkout-summary';
          ctx.appendChild(wrapper);
        },

        /**
         * PlaceOrderButton Slot (Actions) - BuildRight styled action area
         */
        PlaceOrder: (ctx) => {
          log('PlaceOrder slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-checkout-actions';
          ctx.appendChild(wrapper);
        },
      },
    })(block);

    log('Checkout rendered successfully');

    // Emit success event
    emitCheckoutEvent('checkout:loaded');

    // Subscribe to checkout events for notifications
    const { events } = await import('@dropins/tools/event-bus.js');
    events.on('checkout/updated', (checkoutData) => {
      log('Checkout updated event received', checkoutData);
    });

    events.on('checkout/order-placed', (orderData) => {
      log('Order placed event received', orderData);
    });

  } catch (error) {
    console.error('[Checkout] Failed to render:', error);

    // Emit error event
    emitCheckoutEvent('checkout:error', { error: error.message });

    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Unable to Load Checkout',
      message: 'We couldn\'t load the checkout. Please try again or return to your cart.',
      buttons: [
        { text: 'Return to Cart', href: `${basePath}pages/cart.html`, primary: true },
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html` },
      ],
    }));
  }
}
