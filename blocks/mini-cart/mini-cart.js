// Mini Cart Block
//
// Hybrid cart architecture:
// - Commerce items: Fetched from initializers/cart.js (Adobe Commerce dropin)
// - Bundle items: Fetched from cart-manager.js (localStorage for BuildRight bundles)
//
// Event sources:
// - event-bus: cart/initialized, cart/updated (Commerce dropin events)
// - window: cartUpdated (legacy bundle cart events)
//
import { parseHTMLFragment } from '../../scripts/utils.js';

// Shared helper: escape HTML to prevent XSS in text content
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Decode HTML entities from Commerce API responses (e.g., &quot; → ")
function decodeHtmlEntities(text) {
  if (!text) return '';
  const textarea = document.createElement('textarea');
  textarea.innerHTML = text;
  return textarea.value;
}

// Security helper: escape HTML attribute values (handles ", ', <, >, &)
function escapeAttr(value) {
  if (value == null) return '';
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

// Security helper: validate and sanitize URLs for img src
function sanitizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  // Only allow http:, https:, data: (for images), or relative URLs
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:image/') || trimmed.startsWith('/') || !trimmed.includes(':')) {
    return escapeAttr(trimmed);
  }
  // Block javascript:, vbscript:, and other potentially dangerous protocols
  return '';
}

// Shared helper: format price consistently
function formatPrice(amount) {
  return `$${(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default async function decorate(block) {
  const miniCartItems = block.querySelector('#mini-cart-items');
  const miniCartEmpty = block.querySelector('#mini-cart-empty');
  const miniCartItemCount = block.querySelector('.mini-cart-item-count');
  const miniCartTotal = block.querySelector('.mini-cart-total');
  const closeBtn = block.querySelector('#mini-cart-close');

  // Fix static link paths to use BASE_PATH
  const basePath = window.BASE_PATH || '/';
  const cartLinks = block.querySelectorAll('a[href^="pages/"]');
  cartLinks.forEach(link => {
    const href = link.getAttribute('href');
    link.setAttribute('href', `${basePath}${href}`);
  });
  const catalogLink = block.querySelector('a[href="catalog"]');
  if (catalogLink) {
    catalogLink.setAttribute('href', `${basePath}catalog`);
  }

  // Import Commerce cart functions
  const { getCart: getCommerceCart, removeFromCart: removeCommerceItem } = await import('../../scripts/initializers/cart.js');
  const { events } = await import('@dropins/tools/event-bus.js');
  // Keep cart-manager for bundle operations (backward compatibility)
  const { getCart: getBundleCart, removeFromCart: removeBundleItem } = await import('../../scripts/cart-manager.js');
  
  // Setup close button
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      block.classList.remove('active');
      const toggle = document.getElementById('cart-link-toggle');
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Track if we're currently updating to prevent race conditions
  let isUpdating = false;

  // Update mini cart display
  async function updateMiniCart() {
    // Prevent concurrent updates
    if (isUpdating) return;
    isUpdating = true;

    try {
      // Get Commerce cart (object with items array) and legacy bundle cart (array)
      const commerceCart = getCommerceCart();
      const bundleCart = getBundleCart();

      if (!miniCartItems || !miniCartEmpty) {
        console.warn('Mini cart elements not found');
        return;
      }

      // Get Commerce cart items and bundles from legacy cart
      const commerceItems = commerceCart?.items || [];
      const bundles = bundleCart.filter(item => item.bundleId);

      // Calculate totals from Commerce cart
      // Commerce dropin uses totalQuantity (camelCase), not total_quantity
      // Subtotal may be in prices.subtotal or we calculate from items
      let subtotal = commerceCart?.prices?.subtotal?.value || 0;

      // If no subtotal in prices, calculate from items
      if (!subtotal && commerceItems.length > 0) {
        subtotal = commerceItems.reduce((sum, item) => sum + (item.rowTotal?.value || item.total?.value || 0), 0);
      }

      let totalItems = commerceCart?.totalQuantity || commerceCart?.total_quantity || 0;

      // Add bundle totals (backward compatibility)
      for (const bundle of bundles) {
        subtotal += bundle.totalPrice || 0;
        totalItems += bundle.itemCount || 0;
      }

      // Update count and total
      if (miniCartItemCount) {
        miniCartItemCount.textContent = `${totalItems} ${totalItems === 1 ? 'item' : 'items'}`;
      }

      if (miniCartTotal) {
        miniCartTotal.textContent = formatPrice(subtotal);
      }

      // Show empty state or items
      const hasItems = commerceItems.length > 0 || bundles.length > 0;
      if (!hasItems) {
        block.classList.add('mini-cart-empty-state');
        miniCartItems.classList.add('hidden');
        miniCartEmpty.classList.remove('hidden');
      } else {
        block.classList.remove('mini-cart-empty-state');
        miniCartEmpty.classList.add('hidden');
        miniCartItems.classList.remove('hidden');

        // Clear existing items
        miniCartItems.replaceChildren();

        const maxDisplayItems = 5;
        const totalItemCount = bundles.length + commerceItems.length;

        // Render bundles first (limited to maxDisplayItems)
        const bundlesToDisplay = bundles.slice(0, maxDisplayItems);
        for (const bundle of bundlesToDisplay) {
          const bundleHTML = createBundleHTML(bundle);
          if (bundleHTML) {
            const fragment = parseHTMLFragment(bundleHTML);
            miniCartItems.appendChild(fragment);
          }
        }

        // Then render Commerce cart items (up to remaining slots)
        const remainingSlots = maxDisplayItems - bundlesToDisplay.length;
        const commerceItemsToDisplay = commerceItems.slice(0, remainingSlots);
        for (const item of commerceItemsToDisplay) {
          const itemHTML = createCommerceItemHTML(item);
          if (itemHTML) {
            const fragment = parseHTMLFragment(itemHTML);
            miniCartItems.appendChild(fragment);
          }
        }

        // Show "more items" indicator
        if (totalItemCount > maxDisplayItems) {
          const remainingCount = totalItemCount - maxDisplayItems;
          const moreHTML = `<div class="mini-cart-more"><p>And ${remainingCount} more ${remainingCount === 1 ? 'item' : 'items'}</p></div>`;
          miniCartItems.appendChild(parseHTMLFragment(moreHTML));
        }

        // Highlight newly added bundle if specified
        const highlightBundleId = block.getAttribute('data-highlight-bundle');
        if (highlightBundleId) {
          // Security: Use CSS.escape to safely build the selector (prevents selector injection)
          const safeSelector = typeof CSS !== 'undefined' && CSS.escape
            ? `[data-bundle-id="${CSS.escape(highlightBundleId)}"]`
            : `[data-bundle-id="${highlightBundleId.replace(/["\\]/g, '\\$&')}"]`;
          const bundleElement = miniCartItems.querySelector(safeSelector);
          if (bundleElement) {
            bundleElement.classList.add('mini-cart-item-highlighted');
            setTimeout(() => {
              bundleElement.classList.remove('mini-cart-item-highlighted');
            }, 2000);
          }
          block.removeAttribute('data-highlight-bundle');
        }
      }
    } finally {
      isUpdating = false;
    }
  }

  // Create bundle HTML
  function createBundleHTML(bundle) {
    // Store bundle metadata for edit link
    const bundleEditData = JSON.stringify({
      templateId: bundle.metadata?.templateId,
      packageId: bundle.metadata?.packageId,
      variants: bundle.metadata?.variants || [],
      phases: bundle.metadata?.phases || [],
      bundleId: bundle.bundleId
    });

    // Security: Escape all dynamic values for HTML attribute context
    const safeBundleId = escapeAttr(bundle.bundleId);
    const safeBundleEditData = escapeAttr(bundleEditData);
    const bundleName = bundle.bundleName || 'Project Bundle';

    // Link to BOM Review with edit mode
    return `
      <a href="#" class="mini-cart-item mini-cart-bundle mini-cart-item-link mini-cart-bundle-edit"
         data-bundle-id="${safeBundleId}"
         data-bundle-edit="${safeBundleEditData}"
         title="View/Edit ${escapeHtml(bundleName)}">
        <div class="mini-cart-item-info">
          <div class="mini-cart-bundle-badge-row">
            <span class="mini-cart-badge">BUNDLE</span>
          </div>
          <div class="mini-cart-item-header-row">
            <div class="mini-cart-item-name-row">
              <div class="mini-cart-item-name">${escapeHtml(bundleName)}</div>
            </div>
            <button class="mini-cart-item-remove" data-bundle-id="${safeBundleId}" aria-label="Remove ${escapeHtml(bundleName)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="mini-cart-item-details-row">
            <span class="mini-cart-item-quantity">${bundle.itemCount || 0} items</span>
            <div class="mini-cart-item-price">${formatPrice(bundle.totalPrice)}</div>
          </div>
        </div>
      </a>
    `;
  }

  // Create Commerce cart item HTML (uses inline price data from Commerce dropin)
  function createCommerceItemHTML(item) {
    // Commerce dropin cart item structure (different from GraphQL structure):
    // - item.name (not item.product.name)
    // - item.rowTotal.value (not item.prices.row_total.value)
    // - item.image.src (not item.product.thumbnail.url)
    const sku = item.sku || item.topLevelSku || '';
    // Decode HTML entities from Commerce API (e.g., &quot; → ") before display
    const name = decodeHtmlEntities(item.name) || 'Product';
    const quantity = item.quantity || 1;
    const total = item.rowTotal?.value || item.total?.value || item.price?.value || 0;
    const uid = item.uid || '';
    // Commerce dropin uses image.src (not product.thumbnail.url)
    const rawImageUrl = item.image?.src || item.image?.url || '';

    // Security: Escape all dynamic values for HTML attribute context
    const safeSku = escapeAttr(sku);
    const safeUid = escapeAttr(uid);
    const safeImageUrl = sanitizeImageUrl(rawImageUrl);
    const hasImage = safeImageUrl && safeImageUrl.trim() !== '';

    return `
      <a href="${basePath}pages/product-detail.html?sku=${encodeURIComponent(sku)}" class="mini-cart-item mini-cart-item-link" data-sku="${safeSku}" data-uid="${safeUid}">
        <div class="mini-cart-item-image ${!hasImage ? 'mini-cart-item-image-placeholder image-placeholder-pattern' : ''}">
          ${hasImage ? `<img src="${safeImageUrl}" alt="${escapeHtml(name)}" onerror="this.parentElement.classList.add('mini-cart-item-image-placeholder', 'image-placeholder-pattern'); this.classList.add('hidden');">` : ''}
        </div>
        <div class="mini-cart-item-info">
          <div class="mini-cart-item-header-row">
            <div class="mini-cart-item-name-row">
              <div class="mini-cart-item-name" title="${escapeAttr(name)}">${escapeHtml(name)}</div>
            </div>
            <button class="mini-cart-item-remove" data-uid="${safeUid}" aria-label="Remove ${escapeHtml(name)}">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </div>
          <div class="mini-cart-item-details-row">
            <span class="mini-cart-item-quantity">Qty: ${quantity}</span>
            <span class="mini-cart-item-price">${formatPrice(total)}</span>
          </div>
        </div>
      </a>
    `;
  }

  // Handle clicks (remove buttons and bundle edit links)
  block.addEventListener('click', async (e) => {
    const removeBtn = e.target.closest('.mini-cart-item-remove');
    const bundleEditLink = e.target.closest('.mini-cart-bundle-edit');

    if (removeBtn) {
      // Prevent link navigation when clicking remove button
      e.preventDefault();
      e.stopPropagation();

      // Get parent item for loading state
      const cartItem = removeBtn.closest('.mini-cart-item');

      // Check if it's a bundle or Commerce item
      const bundleId = removeBtn.getAttribute('data-bundle-id');
      const uid = removeBtn.getAttribute('data-uid');

      // Show loading state on the item
      if (cartItem) {
        cartItem.classList.add('is-loading');
      }

      try {
        if (bundleId) {
          // Bundle removal - use legacy cart-manager
          removeBundleItem(bundleId);
        } else if (uid) {
          // Commerce item removal - use Commerce cart initializer (by uid)
          await removeCommerceItem(uid);
        }
      } catch (error) {
        console.error('[MiniCart] Failed to remove item:', error);
        // Remove loading state on error so user can retry
        if (cartItem) {
          cartItem.classList.remove('is-loading');
        }
      }
      // Note: On success, cart/updated event triggers re-render which removes loading state
    } else if (bundleEditLink && !e.target.closest('.mini-cart-item-remove')) {
      // Handle bundle edit - navigate to BOM review
      e.preventDefault();

      // Security: Wrap JSON.parse in try-catch for robustness
      let bundleData;
      try {
        bundleData = JSON.parse(bundleEditLink.dataset.bundleEdit);
      } catch (parseError) {
        console.error('Failed to parse bundle data:', parseError);
        return; // Exit gracefully on malformed data
      }

      // Restore build configuration to localStorage for BOM review
      const buildConfig = {
        templateId: bundleData.templateId,
        packageId: bundleData.packageId,
        variants: bundleData.variants,
        phases: bundleData.phases,
        editingBundleId: bundleData.bundleId,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('buildright_current_build', JSON.stringify(buildConfig));

      // Close mini-cart and navigate to BOM review
      block.classList.remove('active');
      window.location.href = '/pages/bom-review.html';
    }
  });

  // Listen for Commerce cart events via event-bus
  events.on('cart/initialized', () => {
    updateMiniCart();
  }, { eager: true });

  events.on('cart/updated', () => {
    updateMiniCart();
  }, { eager: true });

  // Listen for legacy bundle cart updates (backward compatibility)
  window.addEventListener('cartUpdated', () => {
    updateMiniCart();
  });

  // Listen for highlight bundle event (UI coordination)
  window.addEventListener('openMiniCart', (e) => {
    const highlightBundleId = e.detail?.highlightBundleId;
    if (highlightBundleId) {
      block.setAttribute('data-highlight-bundle', highlightBundleId);
    }
    updateMiniCart();
  });

  // Initial load
  updateMiniCart();
}

