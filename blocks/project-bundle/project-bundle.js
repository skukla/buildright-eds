// Project Bundle Block - Display and interaction for bundle products

import { updateBundleItemQuantity, removeBundleFromCart } from '../../scripts/project-builder.js';

export default function decorate(block) {
  const bundleData = block.dataset.bundle;
  if (!bundleData) {
    console.error('Project bundle block missing bundle data');
    return;
  }

  let bundle;
  try {
    bundle = typeof bundleData === 'string' ? JSON.parse(bundleData) : bundleData;
  } catch (e) {
    console.error('Error parsing bundle data:', e);
    return;
  }

  // Populate bundle header
  const bundleName = block.querySelector('.bundle-name');
  const bundleItemCount = block.querySelector('.bundle-item-count');
  const bundleTotalPrice = block.querySelector('.bundle-total-price');

  if (bundleName) bundleName.textContent = bundle.bundleName || 'Project Bundle';
  if (bundleItemCount) bundleItemCount.textContent = `${bundle.itemCount || 0} items`;
  if (bundleTotalPrice) bundleTotalPrice.textContent = `$${(bundle.totalPrice || 0).toFixed(2)}`;

  // Populate bundle items
  const bundleItemsContainer = block.querySelector('.bundle-items');
  if (bundleItemsContainer && bundle.items) {
    bundleItemsContainer.innerHTML = bundle.items.map(item => `
      <div class="bundle-item" data-sku="${item.sku}">
        <div class="bundle-item-info">
          <div class="bundle-item-name">${item.name}</div>
          <div class="bundle-item-sku">SKU: ${item.sku}</div>
          <div class="bundle-item-reason">${item.reason || 'Recommended for your project'}</div>
          <div class="bundle-item-quantity">
            <label>Quantity:</label>
            <input type="number" min="1" value="${item.quantity}" data-sku="${item.sku}" class="bundle-item-qty-input">
          </div>
        </div>
        <div class="bundle-item-pricing">
          <div class="bundle-item-unit-price">$${(item.unitPrice || 0).toFixed(2)} each</div>
          <div class="bundle-item-subtotal">$${(item.subtotal || 0).toFixed(2)}</div>
        </div>
      </div>
    `).join('');

    // Setup quantity change handlers
    bundleItemsContainer.querySelectorAll('.bundle-item-qty-input').forEach(input => {
      input.addEventListener('change', (e) => {
        const sku = e.target.dataset.sku;
        const quantity = parseInt(e.target.value) || 1;
        
        // Update bundle item quantity
        updateBundleItemQuantity(bundle.bundleId, sku, quantity);
        
        // Update display
        const item = bundle.items.find(i => i.sku === sku);
        if (item) {
          item.quantity = quantity;
          item.subtotal = item.unitPrice * quantity;
          
          // Update subtotal display
          const itemEl = e.target.closest('.bundle-item');
          const subtotalEl = itemEl.querySelector('.bundle-item-subtotal');
          if (subtotalEl) {
            subtotalEl.textContent = `$${item.subtotal.toFixed(2)}`;
          }
          
          // Recalculate bundle total
          bundle.totalPrice = bundle.items.reduce((sum, i) => sum + i.subtotal, 0);
          if (bundleTotalPrice) {
            bundleTotalPrice.textContent = `$${bundle.totalPrice.toFixed(2)}`;
          }
        }
      });
    });
  }

  // Setup toggle for bundle items
  const bundleToggle = block.querySelector('.bundle-toggle');
  if (bundleToggle) {
    bundleToggle.addEventListener('click', () => {
      const isExpanded = bundleToggle.getAttribute('aria-expanded') === 'true';
      bundleToggle.setAttribute('aria-expanded', !isExpanded);
      
      if (bundleItemsContainer) {
        bundleItemsContainer.style.display = isExpanded ? 'none' : 'flex';
      }
    });
  }

  // Setup add to cart button
  const addBtn = block.querySelector('.bundle-add-btn');
  if (addBtn) {
    addBtn.addEventListener('click', () => {
      // Import addBundleToCart dynamically to avoid circular dependency
      import('../../scripts/project-builder.js').then(module => {
        module.addBundleToCart(bundle);
        
        // Show notification
        const notification = document.createElement('div');
        notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: var(--color-success); color: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 1000;';
        notification.textContent = 'Bundle added to cart!';
        document.body.appendChild(notification);
        
        setTimeout(() => {
          notification.remove();
        }, 3000);
      });
    });
  }

  // Setup customize button
  const customizeBtn = block.querySelector('.bundle-customize-btn');
  if (customizeBtn) {
    customizeBtn.addEventListener('click', () => {
      // Store bundle in sessionStorage and redirect to catalog with filters
      sessionStorage.setItem('buildright_bundle_customize', JSON.stringify(bundle));
      const params = new URLSearchParams();
      if (bundle.projectType) params.set('projectType', bundle.projectType);
      if (bundle.projectDetail) params.set('projectDetail', bundle.projectDetail);
      // Get base path for navigation
      const pathParts = window.location.pathname.split('/').filter(p => p);
      const basePath = pathParts.length > 1 && pathParts[0] !== 'pages' ? `/${pathParts[0]}/` : '/';
      window.location.href = `${basePath}pages/catalog.html?${params.toString()}`.replace('//', '/');
    });
  }
}

