/**
 * Order Confirmation Block
 *
 * Renders order confirmation using @dropins/storefront-order with BuildRight slot customization.
 * Routes through mesh adapter (dropin-order.js) for extensibility control.
 *
 * Follows the canonical slot pattern from cart.js and checkout.js:
 * - Adobe dropin handles data fetching, state management
 * - BuildRight controls visual presentation via slot callbacks
 * - Mesh adapter intercepts queries for extensibility
 *
 * Slots Customized:
 * - OrderHeader - Success banner with .buildright-order-header
 * - OrderItems - Product list with .buildright-order-items
 * - OrderTotals - Price breakdown with .buildright-order-totals
 * - ShippingInfo - Shipping address with .buildright-order-shipping
 *
 * @module blocks/order-confirmation
 */

import { loadConfig } from '../../scripts/site-config.js';
import { createStateMessage } from '../state-message/state-message.js';

// Debug mode - set to true for verbose logging during development
const DEBUG = true;
const log = (...args) => DEBUG && console.log('[OrderConfirmation]', ...args);

/**
 * Create loading state HTML with accessible text
 * @param {string} message - Loading message to display
 * @returns {string} HTML string for loading state
 */
function createLoadingState(message = 'Loading your order...') {
  return `
    <div class="buildright-order-loading">
      <div class="loading-spinner loading-spinner-lg"></div>
      <p class="buildright-order-loading-text">${message}</p>
    </div>
  `;
}

/**
 * Emit custom order events for cross-component communication
 * @param {string} eventName - Event name (order:loading, order:loaded, order:error)
 * @param {Object} detail - Event detail payload
 */
function emitOrderEvent(eventName, detail = {}) {
  document.dispatchEvent(new CustomEvent(eventName, { detail }));
  log(`Event emitted: ${eventName}`, detail);
}

/**
 * Get order number from URL parameters
 * Supports both ?order= and ?orderNumber= formats, plus guest token
 * @returns {Object} { orderNumber, token }
 */
function getOrderNumberFromURL() {
  const urlParams = new URLSearchParams(window.location.search);
  const orderNumber = urlParams.get('orderNumber') || urlParams.get('order') || urlParams.get('number');
  const token = urlParams.get('token') || urlParams.get('guest_token');
  return { orderNumber, token };
}

/**
 * Create a section slot with BuildRight styling
 * Reduces duplication across similar slot handlers
 * @param {string} slotName - Name for logging
 * @param {string} className - CSS class for the wrapper
 * @param {string} title - Section title text
 * @returns {Function} Slot handler function
 */
function createSectionSlot(slotName, className, title) {
  return (ctx) => {
    log(`${slotName} slot rendered`);
    const wrapper = document.createElement('div');
    wrapper.className = className;

    const sectionTitle = document.createElement('h2');
    sectionTitle.className = 'buildright-order-section-title';
    sectionTitle.textContent = title;

    wrapper.appendChild(sectionTitle);
    ctx.appendChild(wrapper);
  };
}

/**
 * Render fallback success message when dropins are disabled
 * @param {HTMLElement} block
 * @param {string} orderNumber
 * @param {string} basePath
 */
function renderFallbackSuccess(block, orderNumber, basePath) {
  log('Rendering fallback success message for order:', orderNumber);

  block.innerHTML = '';
  block.appendChild(createStateMessage({
    type: 'success',
    icon: 'check-circle',
    title: 'Thank You for Your Order!',
    message: orderNumber
      ? `Your order <strong>#${orderNumber}</strong> has been placed successfully. You will receive an email confirmation shortly.`
      : 'Your order has been placed successfully. You will receive an email confirmation shortly.',
    buttons: [
      { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
      { text: 'View Order History', href: `${basePath}pages/account.html` },
    ],
  }));
}

/**
 * Decorate the order-confirmation block
 * @param {HTMLElement} block - The block element to decorate
 */
export default async function decorate(block) {
  const config = await loadConfig();
  const basePath = window.BASE_PATH || '/';

  // Get order number from URL
  const { orderNumber, token } = getOrderNumberFromURL();
  log('Order params:', { orderNumber, hasToken: !!token });

  // Check for missing order number
  if (!orderNumber && !token) {
    log('No order number or token in URL');
    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'alert-circle',
      title: 'Order Not Found',
      message: 'We couldn\'t find your order. Please check your order confirmation email or view your order history.',
      buttons: [
        { text: 'View Order History', href: `${basePath}pages/account.html`, primary: true },
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html` },
      ],
    }));
    return;
  }

  // Check if Commerce Dropins are enabled
  if (!config.features?.useCommerceDropins) {
    log('Commerce Dropins not enabled - showing fallback');
    renderFallbackSuccess(block, orderNumber, basePath);
    return;
  }

  // Show loading state immediately - emit loading event
  emitOrderEvent('order:loading', { orderNumber });
  block.innerHTML = createLoadingState('Fetching your order details...');

  // Wait for dropins to initialize
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();

  try {
    // Import Order dropin modules
    const { render } = await import('@dropins/storefront-order/render.js');
    const OrderConfirmation = (await import('@dropins/storefront-order/containers/OrderConfirmation.js')).default;

    log('Rendering OrderConfirmation', { orderNumber });

    // Clear loading state before rendering dropin
    block.innerHTML = '';

    // Build render options
    const renderOptions = {
      orderNumber,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
      routeOrderHistory: () => `${basePath}pages/account.html`,
      slots: {
        /**
         * OrderHeader Slot - BuildRight styled success banner
         */
        OrderHeader: (ctx) => {
          log('OrderHeader slot rendered');
          const wrapper = document.createElement('div');
          wrapper.className = 'buildright-order-header';

          // Success icon
          const icon = document.createElement('div');
          icon.className = 'buildright-order-success-icon';
          icon.innerHTML = `
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          `;

          // Title
          const title = document.createElement('h1');
          title.className = 'buildright-order-header-title';
          title.textContent = 'Thank You for Your Order!';

          // Order number
          const orderNum = document.createElement('p');
          orderNum.className = 'buildright-order-header-number';
          orderNum.textContent = `Order #${orderNumber}`;

          // Confirmation message
          const message = document.createElement('p');
          message.className = 'buildright-order-header-message';
          message.textContent = 'You will receive an email confirmation shortly.';

          wrapper.appendChild(icon);
          wrapper.appendChild(title);
          wrapper.appendChild(orderNum);
          wrapper.appendChild(message);

          ctx.replaceWith(wrapper);
        },

        // OrderItems Slot - BuildRight styled product list
        OrderItems: createSectionSlot('OrderItems', 'buildright-order-items', 'Order Items'),

        // OrderTotals Slot - BuildRight styled price breakdown
        OrderTotals: createSectionSlot('OrderTotals', 'buildright-order-totals', 'Order Summary'),

        // ShippingInfo Slot - BuildRight styled shipping address
        ShippingInfo: createSectionSlot('ShippingInfo', 'buildright-order-shipping', 'Shipping Information'),

        // ShippingAddress Slot - alias for ShippingInfo
        ShippingAddress: createSectionSlot('ShippingAddress', 'buildright-order-shipping', 'Delivery Address'),

        // Items Slot - alias for OrderItems (dropin may use either name)
        Items: createSectionSlot('Items', 'buildright-order-items', 'Items Ordered'),

        // Totals Slot - alias for OrderTotals (dropin may use either name)
        Totals: createSectionSlot('Totals', 'buildright-order-totals', 'Order Total'),

        // Shipping Slot - alias for ShippingInfo (dropin may use different name)
        Shipping: createSectionSlot('Shipping', 'buildright-order-shipping', 'Shipping Details'),
      },
    };

    // Add guest token if present
    if (token) {
      renderOptions.token = token;
      log('Guest order mode with token');
    }

    // Render the dropin
    await render.render(OrderConfirmation, renderOptions)(block);

    log('OrderConfirmation rendered successfully');

    // Emit success event
    emitOrderEvent('order:loaded', { orderNumber });

    // Subscribe to order events for analytics
    const { events } = await import('@dropins/tools/event-bus.js');
    events.on('order/confirmed', (orderData) => {
      log('Order confirmed event received', orderData);
    });

    events.on('order/details', (orderData) => {
      log('Order details event received', orderData);
    });

  } catch (error) {
    console.error('[OrderConfirmation] Failed to render:', error);

    // Emit error event
    emitOrderEvent('order:error', { error: error.message, orderNumber });

    block.innerHTML = '';
    block.appendChild(createStateMessage({
      type: 'error',
      icon: 'x-circle',
      title: 'Unable to Load Order Details',
      message: 'We couldn\'t load your order details. Please try again or contact support.',
      buttons: [
        { text: 'Browse Catalog', href: `${basePath}pages/catalog.html`, primary: true },
        { text: 'Home', href: `${basePath}` },
      ],
    }));
  }
}
