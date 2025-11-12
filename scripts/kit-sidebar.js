// Kit Sidebar Component - Shows kit summary while browsing catalog

import { getWizardState, saveWizardState, getFullKit, removeItemFromKit, updateCustomItemQuantity, updateBundleItemQuantity } from './project-builder.js';
import { getProductImageUrl } from './data-mock.js';
import { escapeHtml } from './project-builder-constants.js';

let kitSidebarElement = null;
let kitSidebarBackdrop = null;
let isExpanded = true;

/**
 * Initialize kit sidebar if wizard state has an active kit with items
 */
export async function initKitSidebar() {
  const state = getWizardState();
  const { hasKitItems } = await import('./project-builder.js');
  
  // Only show sidebar if kit has items - empty kits should not be resumable
  if (!state || !hasKitItems()) {
    // Only remove sidebar if it exists - don't create it if there's no state or kit is empty
    if (kitSidebarElement) {
      removeKitSidebar();
      // Clear kit mode if kit is empty
      sessionStorage.removeItem('kit_mode_resume_choice');
      sessionStorage.removeItem('buildright_wizard_state');
    }
    return;
  }

  // Create sidebar if it doesn't exist
  if (!kitSidebarElement) {
    createKitSidebar();
  }

  // Ensure sidebar is appended to body
  if (kitSidebarElement && !kitSidebarElement.parentElement) {
    document.body.appendChild(kitSidebarElement);
  }

  // Update sidebar content (will show empty state if no items)
  await updateKitSidebar();

  // Show sidebar as flyout overlay - ensure all visibility classes are set
  if (kitSidebarElement) {
    // Check if we should force expansion (e.g., when navigating from bundle display)
    const shouldExpand = sessionStorage.getItem('buildright_kit_sidebar_expanded') === 'true';
    if (shouldExpand) {
      isExpanded = true;
      sessionStorage.removeItem('buildright_kit_sidebar_expanded');
      // Clear persisted collapsed state when forcing expansion
      sessionStorage.removeItem('buildright_kit_sidebar_collapsed');
    } else {
      // Restore persisted collapsed state, default to expanded if not set
      const persistedCollapsed = sessionStorage.getItem('buildright_kit_sidebar_collapsed') === 'true';
      isExpanded = !persistedCollapsed;
    }
    
    // Show sidebar (always visible)
    kitSidebarElement.classList.add('kit-sidebar-open');
    kitSidebarElement.classList.add('kit-sidebar-visible');
    
    // Apply expanded/collapsed state
    const content = kitSidebarElement.querySelector('.kit-sidebar-content');
    const toggle = kitSidebarElement.querySelector('#kit-sidebar-toggle');
    
    if (isExpanded) {
      kitSidebarElement.classList.add('kit-sidebar-expanded');
      kitSidebarElement.classList.remove('kit-sidebar-collapsed');
      if (content) content.style.display = 'block';
    if (toggle) {
        toggle.setAttribute('aria-expanded', 'true');
      toggle.classList.remove('collapsed');
      }
    } else {
      kitSidebarElement.classList.add('kit-sidebar-collapsed');
      kitSidebarElement.classList.remove('kit-sidebar-expanded');
      if (content) content.style.display = 'none';
      if (toggle) {
        toggle.setAttribute('aria-expanded', 'false');
        toggle.classList.add('collapsed');
      }
    }
    
    // Ensure it's not hidden
    kitSidebarElement.style.display = '';
    kitSidebarElement.style.visibility = '';
    kitSidebarElement.style.opacity = '';
    // Don't show backdrop - we don't want to grey out the products
  }
}

/**
 * Create kit sidebar DOM structure
 */
function createKitSidebar() {
  kitSidebarElement = document.createElement('div');
  kitSidebarElement.className = 'kit-sidebar';
  kitSidebarElement.id = 'kit-sidebar';
  kitSidebarElement.setAttribute('aria-label', 'Project Kit Summary');
  
  kitSidebarElement.innerHTML = `
    <div class="kit-sidebar-header">
      <button class="kit-sidebar-toggle" id="kit-sidebar-toggle" aria-expanded="true" aria-label="Toggle kit sidebar">
        <span class="kit-sidebar-toggle-icon">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
        <div class="kit-sidebar-header-content">
          <span class="kit-sidebar-title" id="kit-sidebar-title"></span>
          <span class="kit-sidebar-stat" id="kit-sidebar-count"></span>
        </div>
        <div class="kit-sidebar-total" id="kit-sidebar-total"></div>
        <span class="kit-sidebar-label-collapsed" id="kit-sidebar-label-collapsed"></span>
      </button>
    </div>
    <div class="kit-sidebar-content" id="kit-sidebar-content">
      <div class="kit-sidebar-items" id="kit-sidebar-items">
        <!-- Items will be populated here -->
      </div>
      <div class="kit-sidebar-empty-state" id="kit-sidebar-empty-state" style="display: none;">
        <h3 class="kit-sidebar-empty-title">Your kit is empty</h3>
        <p class="kit-sidebar-empty-description">Add items from the catalog to get started</p>
      </div>
      <div class="kit-sidebar-actions-bottom">
        <a href="pages/project-builder.html?continue=true" class="btn btn-primary btn-sm" id="kit-sidebar-view-full">Add All to Cart</a>
        <button class="kit-sidebar-exit-btn" id="kit-sidebar-exit-btn">
          Exit Kit Mode
        </button>
      </div>
    </div>
  `;

  // Setup toggle functionality
  const toggleBtn = kitSidebarElement.querySelector('#kit-sidebar-toggle');
  if (toggleBtn) {
    toggleBtn.addEventListener('click', toggleKitSidebar);
  }
  
  // Setup exit kit mode button
  const exitBtn = kitSidebarElement.querySelector('#kit-sidebar-exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      // Exit kit mode immediately - user can resume via the resume banner
      // Only remove kit_mode_resume_choice - keep wizard state so user can resume
      // The wizard state will be cleared if they choose "Start New Project" from the resume banner
        sessionStorage.removeItem('kit_mode_resume_choice');
        window.location.reload();
    });
  }
}

/**
 * Update kit sidebar content
 */
export async function updateKitSidebar() {
  if (!kitSidebarElement) {
    // If sidebar doesn't exist, create it
    createKitSidebar();
    // Append to body if not already there
    if (kitSidebarElement && !kitSidebarElement.parentElement) {
      document.body.appendChild(kitSidebarElement);
    }
    // Check if we should force expansion
    const shouldExpand = sessionStorage.getItem('buildright_kit_sidebar_expanded') === 'true';
    if (shouldExpand) {
      isExpanded = true;
      sessionStorage.removeItem('buildright_kit_sidebar_expanded');
      sessionStorage.removeItem('buildright_kit_sidebar_collapsed');
    } else {
      // Restore persisted collapsed state, default to expanded if not set
      const persistedCollapsed = sessionStorage.getItem('buildright_kit_sidebar_collapsed') === 'true';
      isExpanded = !persistedCollapsed;
    }
    // Show sidebar
    if (kitSidebarElement) {
      kitSidebarElement.classList.add('kit-sidebar-open');
      kitSidebarElement.classList.add('kit-sidebar-visible');
      
      // Apply expanded/collapsed state
      const content = kitSidebarElement.querySelector('.kit-sidebar-content');
      const toggle = kitSidebarElement.querySelector('#kit-sidebar-toggle');
      
      if (isExpanded) {
        kitSidebarElement.classList.add('kit-sidebar-expanded');
        kitSidebarElement.classList.remove('kit-sidebar-collapsed');
        if (content) content.style.display = 'block';
      if (toggle) {
          toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.remove('collapsed');
        }
      } else {
        kitSidebarElement.classList.add('kit-sidebar-collapsed');
        kitSidebarElement.classList.remove('kit-sidebar-expanded');
        if (content) content.style.display = 'none';
        if (toggle) {
          toggle.setAttribute('aria-expanded', 'false');
          toggle.classList.add('collapsed');
        }
      }
    }
  }

  const fullKit = getFullKit();
  const state = getWizardState();
  
  // If kit becomes empty, exit kit mode
  if (!fullKit || fullKit.items.length === 0) {
    // Kit is empty - exit kit mode
    removeKitSidebar();
    sessionStorage.removeItem('kit_mode_resume_choice');
    sessionStorage.removeItem('buildright_wizard_state');
    return;
  }
  
  // Show empty state if no items (shouldn't reach here due to check above, but keeping for safety)
  const itemsEl = kitSidebarElement.querySelector('#kit-sidebar-items');
  const emptyStateEl = kitSidebarElement.querySelector('#kit-sidebar-empty-state');
  
  // When there are items, ensure button says "Add All to Cart" (matches project builder step 5)
  const viewFullBtn = kitSidebarElement.querySelector('#kit-sidebar-view-full');
  if (viewFullBtn) {
    viewFullBtn.textContent = 'Add All to Cart';
    viewFullBtn.href = 'pages/project-builder.html?continue=true';
  }

  // Hide empty state and show items
  if (emptyStateEl) emptyStateEl.style.display = 'none';
  if (itemsEl) itemsEl.style.display = 'block';

  // Update header with kit name
  const titleEl = kitSidebarElement.querySelector('#kit-sidebar-title');
  const labelCollapsedEl = kitSidebarElement.querySelector('#kit-sidebar-label-collapsed');
  const bundleName = state.bundle?.bundleName || 'Project Kit';
  
  if (titleEl) {
    titleEl.textContent = bundleName;
  }
  if (labelCollapsedEl) {
    labelCollapsedEl.textContent = 'Project Kit';
  }

  // Update count and total in header
  const countEl = kitSidebarElement.querySelector('#kit-sidebar-count');
  if (countEl) {
    countEl.textContent = `${fullKit.itemCount} items`;
  }
  
  const totalEl = kitSidebarElement.querySelector('#kit-sidebar-total');
  if (totalEl) {
    totalEl.textContent = `$${fullKit.totalPrice.toFixed(2)}`;
  }

  // Update items list (show all items - list is scrollable)
  if (itemsEl) {
    // Create items HTML asynchronously for all items
    const itemsHTML = await Promise.all(
      fullKit.items.map(item => createKitSidebarItem(item))
    );

    itemsEl.innerHTML = `
      <div class="kit-sidebar-items-list">
        ${itemsHTML.join('')}
      </div>
    `;

    // Setup quantity controls and remove buttons
    setupKitSidebarItemListeners(fullKit);
  }
}

/**
 * Create kit sidebar item HTML
 */
async function createKitSidebarItem(item) {
  const imageUrl = escapeHtml(getProductImageUrl(item.sku));
  const itemName = escapeHtml(item.name);
  const itemSku = escapeHtml(item.sku);
  const isCustom = item.isCustom || false;
  
  return `
    <div class="kit-sidebar-item" data-sku="${itemSku}">
      <div class="kit-sidebar-item-image">
        <img src="${imageUrl}" alt="${itemName}" onerror="this.style.display='none'">
      </div>
      <div class="kit-sidebar-item-info">
        <div class="kit-sidebar-item-name-row">
          <div class="kit-sidebar-item-name">${itemName}</div>
          ${isCustom ? '<span class="custom-item-badge">Custom</span>' : ''}
        </div>
        <div class="kit-sidebar-item-details-row">
          <div class="kit-sidebar-item-qty">
            <button class="kit-sidebar-qty-btn" data-sku="${itemSku}" data-action="decrease" tabindex="-1">-</button>
            <input type="number" class="kit-sidebar-qty-input" data-sku="${itemSku}" value="${item.quantity}" min="1" max="9999">
            <button class="kit-sidebar-qty-btn" data-sku="${itemSku}" data-action="increase" tabindex="-1">+</button>
          </div>
          <div class="kit-sidebar-item-price">$${item.subtotal.toFixed(2)}</div>
        </div>
      </div>
      <button class="kit-sidebar-item-remove" data-sku="${itemSku}" aria-label="Remove ${itemName}" tabindex="-1">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  `;
}

/**
 * Setup event listeners for kit sidebar items
 */
function setupKitSidebarItemListeners(fullKit) {
  // Quantity button controls
  kitSidebarElement.querySelectorAll('.kit-sidebar-qty-btn').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const sku = btn.dataset.sku;
      const action = btn.dataset.action;
      const qtyInput = btn.parentElement.querySelector('.kit-sidebar-qty-input');
      if (!qtyInput) return;

      let qty = parseInt(qtyInput.value) || 1;
      if (action === 'increase') {
        qty++;
      } else if (action === 'decrease' && qty > 1) {
        qty--;
      }
      
      // Update input value immediately
      qtyInput.value = qty;
      
      // Update the originalValue stored on the input element for the blur handler
      // This prevents the blur handler from resetting the value
      if (qtyInput.dataset.originalValue !== undefined) {
        qtyInput.dataset.originalValue = qty.toString();
      }
      
      await updateItemQuantity(sku, qty, fullKit);
    });
  });

  // Quantity input controls
  kitSidebarElement.querySelectorAll('.kit-sidebar-qty-input').forEach(input => {
    // Store original value on the input element itself so it persists across updates
    if (!input.dataset.originalValue) {
      input.dataset.originalValue = input.value;
    }
    let originalValue = input.dataset.originalValue;
    
    // Clear input when focused (by click or tab)
    input.addEventListener('focus', (e) => {
      originalValue = e.target.value;
      e.target.dataset.originalValue = originalValue;
      e.target.value = '';
    });
    
    // Handle quantity update on blur (after focus has moved)
    input.addEventListener('blur', async (e) => {
      const sku = input.dataset.sku;
      let qty = parseInt(input.value);
      
      // Validate quantity
      if (!input.value || isNaN(qty) || qty < 1) {
        // Restore original value if invalid
        input.value = originalValue;
        return;
      }
      
      if (qty > 9999) {
        qty = 9999;
        input.value = qty;
      }
      
      // Only update if value actually changed
      if (qty !== parseInt(originalValue)) {
        await updateItemQuantity(sku, qty, fullKit);
        originalValue = qty.toString();
        input.dataset.originalValue = originalValue;
      } else {
        // Even if value didn't change, restore it to ensure consistency
        input.value = originalValue;
      }
    });
    
    // Prevent scroll when hovering over input
    input.addEventListener('wheel', (e) => {
      e.preventDefault();
    });
  });

  // Helper function to update item quantity
  async function updateItemQuantity(sku, qty, fullKit) {
    const item = fullKit.items.find(i => i.sku === sku);
    if (!item) return;
    
    // Update the state first
    if (item.isCustom) {
      updateCustomItemQuantity(sku, qty);
      // Refresh the item from state to ensure we have the latest data
      const state = getWizardState();
      const updatedCustomItem = state.customItems?.find(i => i.sku === sku);
      if (updatedCustomItem) {
        item.quantity = updatedCustomItem.quantity;
        item.subtotal = updatedCustomItem.subtotal;
        item.unitPrice = updatedCustomItem.unitPrice;
      }
    } else {
      // Update bundle item quantity in wizard state
      const state = getWizardState();
      if (state.bundle) {
        const bundleItem = state.bundle.items.find(i => i.sku === sku);
        if (bundleItem) {
          bundleItem.quantity = qty;
          bundleItem.subtotal = bundleItem.unitPrice * qty;
          
          // Recalculate bundle total
          state.bundle.totalPrice = state.bundle.items.reduce((sum, i) => 
            sum + (i.unitPrice * i.quantity), 0
          );
          state.bundle.itemCount = state.bundle.items.reduce((sum, i) => 
            sum + i.quantity, 0
          );
          
          saveWizardState(state);
          
          // Update the item in fullKit
          item.quantity = qty;
          item.subtotal = bundleItem.subtotal;
        }
      }
    }

    // Recalculate totals from fresh state
    const updatedFullKit = getFullKit();
    const totalPrice = updatedFullKit.totalPrice;
    const itemCount = updatedFullKit.items.reduce((sum, i) => sum + i.quantity, 0);
    
    // Update only the header totals without re-rendering the entire list
    const countEl = kitSidebarElement.querySelector('#kit-sidebar-count');
    if (countEl) {
      countEl.textContent = `${itemCount} items`;
    }
    
    const totalEl = kitSidebarElement.querySelector('#kit-sidebar-total');
    if (totalEl) {
      totalEl.textContent = `$${totalPrice.toFixed(2)}`;
    }
    
    // Update the item's subtotal display
    const itemRow = kitSidebarElement.querySelector(`.kit-sidebar-item[data-sku="${sku}"]`);
    if (itemRow) {
      const priceEl = itemRow.querySelector('.kit-sidebar-item-price');
      if (priceEl) {
        priceEl.textContent = `$${item.subtotal.toFixed(2)}`;
      }
      
      // Ensure the input value matches the updated quantity
      const qtyInput = itemRow.querySelector('.kit-sidebar-qty-input');
      if (qtyInput) {
        qtyInput.value = item.quantity;
      }
    }
    
    // Dispatch event for other components (but don't trigger full re-render)
    // Use a custom event that doesn't trigger updateKitSidebar
    window.dispatchEvent(new CustomEvent('kitUpdated', { detail: { skipRerender: true } }));
  }

  // Remove buttons
  kitSidebarElement.querySelectorAll('.kit-sidebar-item-remove').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const sku = btn.dataset.sku;
      
      // Remove item from kit (handles both bundle and custom items)
      const result = removeItemFromKit(sku);
      
      if (result.removed) {
        // Update sidebar to reflect changes
        await updateKitSidebar();
        
        // Dispatch event for other components
        window.dispatchEvent(new CustomEvent('kitUpdated'));
      }
    });
  });
}

/**
 * Toggle kit sidebar expand/collapse
 */
function toggleKitSidebar() {
  if (!kitSidebarElement) return;
  
  isExpanded = !isExpanded;
  const content = kitSidebarElement.querySelector('.kit-sidebar-content');
  const toggle = kitSidebarElement.querySelector('#kit-sidebar-toggle');
  
  if (content && toggle) {
    if (isExpanded) {
      // Expand: show content
      content.style.display = 'block';
      kitSidebarElement.classList.add('kit-sidebar-expanded');
      kitSidebarElement.classList.remove('kit-sidebar-collapsed');
      // Clear persisted collapsed state
      sessionStorage.removeItem('buildright_kit_sidebar_collapsed');
    } else {
      // Collapse: hide content but keep sidebar visible (just header)
      content.style.display = 'none';
      kitSidebarElement.classList.add('kit-sidebar-collapsed');
      kitSidebarElement.classList.remove('kit-sidebar-expanded');
      // Persist collapsed state
      sessionStorage.setItem('buildright_kit_sidebar_collapsed', 'true');
    }
    toggle.setAttribute('aria-expanded', isExpanded.toString());
    toggle.classList.toggle('collapsed', !isExpanded);
  }
}

/**
 * Clear kit (remove custom items and bundle)
 */
async function clearKit() {
  const { clearWizardState } = await import('./project-builder.js');
  clearWizardState();
  removeKitSidebar();
  window.dispatchEvent(new CustomEvent('kitUpdated'));
  window.location.reload();
}

/**
 * Remove kit sidebar from DOM
 */
export function removeKitSidebar() {
  if (kitSidebarElement && kitSidebarElement.parentElement) {
    kitSidebarElement.classList.remove('kit-sidebar-open');
    kitSidebarElement.classList.remove('kit-sidebar-visible');
    kitSidebarElement.classList.remove('kit-sidebar-expanded');
    kitSidebarElement.classList.remove('kit-sidebar-collapsed');
    kitSidebarElement.parentElement.removeChild(kitSidebarElement);
  }
  kitSidebarElement = null;
  
  // Remove backdrop if it exists (though we're not using it anymore)
  if (kitSidebarBackdrop && kitSidebarBackdrop.parentElement) {
    kitSidebarBackdrop.classList.remove('kit-sidebar-backdrop-active');
    kitSidebarBackdrop.parentElement.removeChild(kitSidebarBackdrop);
  }
  kitSidebarBackdrop = null;
}

