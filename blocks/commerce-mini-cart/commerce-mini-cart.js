/**
 * Commerce Mini-Cart Block
 * 
 * Renders the Commerce Cart Dropin mini-cart component.
 * Shows cart summary with item count, can expand to show items.
 * 
 * @module blocks/commerce-mini-cart
 */

import { loadConfig } from '../../scripts/site-config.js';

/**
 * Decorate the commerce-mini-cart block
 * @param {HTMLElement} block - The block element
 */
export default async function decorate(block) {
  const config = await loadConfig();
  
  // Check if dropins are enabled
  if (!config.features?.useCommerceDropins) {
    console.log('[MiniCart] Commerce Dropins not enabled, using demo cart');
    await renderDemoCart(block);
    return;
  }
  
  console.log('[MiniCart] Rendering Commerce MiniCart');
  
  // Wait for dropins to be initialized
  const { waitForDropins, areDropinsInitialized } = await import('../../scripts/initializers/index.js');
  
  if (!areDropinsInitialized()) {
    block.innerHTML = '<div class="mini-cart-loading"><span class="cart-icon">🛒</span></div>';
    await waitForDropins();
  }
  
  try {
    await renderCommerceMiniCart(block);
  } catch (error) {
    console.error('[MiniCart] Failed to render Commerce MiniCart:', error);
    await renderDemoCart(block);
  }
}

/**
 * Render the Commerce MiniCart dropin
 * @param {HTMLElement} block
 */
async function renderCommerceMiniCart(block) {
  const { render } = await import('@dropins/storefront-cart/render.js');
  const MiniCart = (await import('@dropins/storefront-cart/containers/MiniCart.js')).default;
  
  // Get URLs from block config or use defaults
  const startShoppingURL = block.dataset.startShoppingUrl || './catalog.html';
  const cartURL = block.dataset.cartUrl || './cart.html';
  const checkoutURL = block.dataset.checkoutUrl || './checkout.html';
  
  block.innerHTML = '';
  block.classList.add('commerce-mini-cart-ready');
  
  // Create wrapper for mini-cart trigger
  const wrapper = document.createElement('div');
  wrapper.className = 'mini-cart-wrapper';
  
  // Create cart button/trigger
  const trigger = document.createElement('button');
  trigger.className = 'mini-cart-trigger';
  trigger.setAttribute('aria-label', 'Shopping cart');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.innerHTML = `
    <svg class="cart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 6h15l-1.5 9h-12z"/>
      <circle cx="9" cy="20" r="1"/>
      <circle cx="18" cy="20" r="1"/>
      <path d="M6 6L5 3H2"/>
    </svg>
    <span class="cart-badge" data-cart-badge></span>
  `;
  
  // Create dropdown panel for mini-cart
  const dropdown = document.createElement('div');
  dropdown.className = 'mini-cart-dropdown';
  dropdown.hidden = true;
  
  // Render MiniCart dropin into dropdown
  await render(MiniCart, {
    routeEmptyCartCTA: () => startShoppingURL,
    routeCart: () => cartURL,
    routeCheckout: () => checkoutURL,
    routeProduct: (product) => `./product-detail.html?sku=${product.topLevelSku || product.sku}`
  })(dropdown);
  
  // Set up toggle behavior
  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', !isExpanded);
    dropdown.hidden = isExpanded;
    
    if (!isExpanded) {
      dropdown.classList.add('opening');
      setTimeout(() => dropdown.classList.remove('opening'), 300);
    }
  });
  
  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.hidden = true;
    }
  });
  
  // Close on escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !dropdown.hidden) {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.hidden = true;
      trigger.focus();
    }
  });
  
  wrapper.appendChild(trigger);
  wrapper.appendChild(dropdown);
  block.appendChild(wrapper);
  
  // Listen for cart updates to update badge
  const { events } = await import('@dropins/tools/event-bus.js');
  
  events.on('cart/data', (cart) => {
    updateCartBadge(trigger, cart);
  }, { eager: true });
  
  events.on('cart/updated', (cart) => {
    updateCartBadge(trigger, cart);
  }, { eager: true });
  
  // Auto-open on product added (optional UX enhancement)
  events.on('cart/product/added', () => {
    trigger.setAttribute('aria-expanded', 'true');
    dropdown.hidden = false;
    dropdown.classList.add('opening');
    setTimeout(() => dropdown.classList.remove('opening'), 300);
    
    // Auto-close after 3 seconds
    setTimeout(() => {
      trigger.setAttribute('aria-expanded', 'false');
      dropdown.hidden = true;
    }, 3000);
  }, { eager: true });
}

/**
 * Update cart badge with item count
 * @param {HTMLElement} trigger
 * @param {Object} cart
 */
function updateCartBadge(trigger, cart) {
  const badge = trigger.querySelector('.cart-badge');
  if (!badge) return;
  
  const totalQuantity = cart?.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
  badge.textContent = totalQuantity > 0 ? totalQuantity : '';
  badge.classList.toggle('has-items', totalQuantity > 0);
}

/**
 * Render demo cart fallback
 * Uses local cart manager when dropins are not enabled
 * @param {HTMLElement} block
 */
async function renderDemoCart(block) {
  block.innerHTML = '';
  block.classList.add('demo-mode');
  
  const wrapper = document.createElement('div');
  wrapper.className = 'mini-cart-wrapper';
  
  // Create cart button/trigger
  const trigger = document.createElement('a');
  trigger.href = './cart.html';
  trigger.className = 'mini-cart-trigger mini-cart-link';
  trigger.setAttribute('aria-label', 'Shopping cart');
  trigger.innerHTML = `
    <svg class="cart-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M6 6h15l-1.5 9h-12z"/>
      <circle cx="9" cy="20" r="1"/>
      <circle cx="18" cy="20" r="1"/>
      <path d="M6 6L5 3H2"/>
    </svg>
    <span class="cart-badge" data-cart-badge></span>
  `;
  
  wrapper.appendChild(trigger);
  block.appendChild(wrapper);
  
  // Update badge from local cart
  try {
    const { getCart } = await import('../../scripts/cart-manager.js');
    const cart = getCart();
    const totalQuantity = cart?.items?.reduce((sum, item) => sum + (item.quantity || 1), 0) || 0;
    const badge = trigger.querySelector('.cart-badge');
    if (badge) {
      badge.textContent = totalQuantity > 0 ? totalQuantity : '';
      badge.classList.toggle('has-items', totalQuantity > 0);
    }
  } catch (error) {
    console.warn('[MiniCart] Failed to load demo cart:', error);
  }
  
  // Listen for cart updates
  window.addEventListener('cart:updated', (e) => {
    const badge = trigger.querySelector('.cart-badge');
    if (badge) {
      const count = e.detail?.totalQuantity || 0;
      badge.textContent = count > 0 ? count : '';
      badge.classList.toggle('has-items', count > 0);
    }
  });
}

