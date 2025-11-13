// Kit Sidebar Component - Shows kit summary while browsing catalog

import { getWizardState, saveWizardState, getFullKit, removeItemFromKit, updateCustomItemQuantity, updateBundleItemQuantity } from './project-builder.js';
import { getProductImageUrl } from './data-mock.js';
import { escapeHtml } from './project-builder-constants.js';
import { parseHTML, parseHTMLFragment } from './utils.js';

let kitSidebarElement = null;
let kitSidebarBackdrop = null;
let isExpanded = true;

// Cart sidebar functionality removed - using mini cart dropdown instead

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
  const sidebarHTML = `
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
        <button class="btn btn-primary btn-sm" id="kit-sidebar-view-full">Add All to Cart</button>
        <button class="kit-sidebar-exit-btn" id="kit-sidebar-exit-btn">
          Exit Kit Mode
        </button>
      </div>
    </div>
  `;
  
  // Create wrapper div and append parsed content
  kitSidebarElement = document.createElement('div');
  kitSidebarElement.className = 'kit-sidebar';
  kitSidebarElement.id = 'kit-sidebar';
  kitSidebarElement.setAttribute('aria-label', 'Project Kit Summary');
  
  // Parse and append the sidebar content
  const fragment = parseHTMLFragment(sidebarHTML);
  while (fragment.firstChild) {
    kitSidebarElement.appendChild(fragment.firstChild);
  }

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
      // The wizard state will be cleared if they choose "Start New Project" from the Project Builder banner
        sessionStorage.removeItem('kit_mode_resume_choice');
        window.location.reload();
    });
  }
  
  // Setup "Add All to Cart" button
  const addToCartBtn = kitSidebarElement.querySelector('#kit-sidebar-view-full');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const fullKit = getFullKit();
      if (!fullKit || !fullKit.items || fullKit.items.length === 0) {
        return;
      }
      
      // Check if any items are out of stock (should be prevented by disabled button, but double-check)
      const hasOutOfStock = await checkAndHighlightOutOfStockItems();
      if (hasOutOfStock) {
        return; // Button should be disabled, but prevent action if somehow clicked
      }
      
      // Add to cart
      addToCartBtn.disabled = true;
      addToCartBtn.textContent = 'Adding to cart...';
      
      const bundleId = await addKitToCart(fullKit);
      
      // Reset button state
      addToCartBtn.disabled = false;
      addToCartBtn.textContent = 'Add All to Cart';
      
      // Handle kit added to cart (roll up animation and open mini cart)
      await handleKitAddedToCart(bundleId);
    });
  }
  
  // Cart sidebar removed - mini cart handles cart display
  
  // Prevent page scrolling when mouse is over the flyout
  // Always capture scroll events when hovering over the flyout, regardless of boundaries
  kitSidebarElement.addEventListener('wheel', (e) => {
    const contentEl = kitSidebarElement.querySelector('.kit-sidebar-content');
    if (!contentEl) {
      // If no content element, allow page scroll
      return;
    }
    
    const { scrollHeight, clientHeight } = contentEl;
    
    // If content doesn't overflow, allow page scroll (flyout doesn't need scrolling)
    if (scrollHeight <= clientHeight) {
      return;
    }
    
    // Always prevent page scroll when mouse is over the flyout
    // The flyout will handle its own scrolling (or do nothing if at boundaries)
    e.stopPropagation();
  }, { passive: false });
}

/**
 * Update kit sidebar content
 * @param {boolean} scrollToNewItem - If true, scroll to show the item
 * @param {string|null} existingItemSku - If provided, item already exists - scroll to it and highlight instead of fading in
 */
export async function updateKitSidebar(scrollToNewItem = false, existingItemSku = null) {
  const fullKit = getFullKit();
  const state = getWizardState();
  
  // If kit becomes empty, exit kit mode
  if (!fullKit || fullKit.items.length === 0) {
    // Kit is empty - exit kit mode
    if (kitSidebarElement) {
      removeKitSidebar();
    }
    sessionStorage.removeItem('kit_mode_resume_choice');
    sessionStorage.removeItem('buildright_wizard_state');
    return;
  }
  
  // If we have items but no sidebar, create and show it
  if (!kitSidebarElement) {
    // Set kit_mode_resume_choice to 'edit' if not already set (so sidebar persists)
    const resumeChoice = sessionStorage.getItem('kit_mode_resume_choice');
    if (!resumeChoice || resumeChoice === 'shop') {
      sessionStorage.setItem('kit_mode_resume_choice', 'edit');
    }
    
    // Create sidebar
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
    
    // Ensure sidebar is in kit mode
    
    // Show sidebar - ensure it's appended to body first
    if (kitSidebarElement) {
      // Make sure it's in the DOM before applying classes
      if (!kitSidebarElement.parentElement) {
        document.body.appendChild(kitSidebarElement);
      }
      
      // Force a reflow to ensure DOM is ready
      void kitSidebarElement.offsetHeight;
      
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
      
      // Ensure it's visible (clear any inline styles that might hide it)
      kitSidebarElement.style.display = '';
      kitSidebarElement.style.visibility = '';
      kitSidebarElement.style.opacity = '';
      kitSidebarElement.style.transform = '';
    }
  } else {
    // Sidebar exists - ensure it's visible if we have items
    if (fullKit && fullKit.items && fullKit.items.length > 0) {
      // Ensure sidebar is visible
      if (!kitSidebarElement.parentElement) {
        document.body.appendChild(kitSidebarElement);
      }
      kitSidebarElement.classList.add('kit-sidebar-open');
      kitSidebarElement.classList.add('kit-sidebar-visible');
      kitSidebarElement.style.display = '';
      kitSidebarElement.style.visibility = '';
      kitSidebarElement.style.opacity = '';
    }
  }

  // Show empty state if no items (shouldn't reach here due to check above, but keeping for safety)
  const itemsEl = kitSidebarElement.querySelector('#kit-sidebar-items');
  const emptyStateEl = kitSidebarElement.querySelector('#kit-sidebar-empty-state');
  
  // When there are items, ensure button says "Add All to Cart" (matches project builder step 5)
  const viewFullBtn = kitSidebarElement.querySelector('#kit-sidebar-view-full');
  if (viewFullBtn) {
    viewFullBtn.textContent = 'Add All to Cart';
    viewFullBtn.disabled = false;
    viewFullBtn.classList.remove('btn-error');
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

      const itemsListHTML = `
        <div class="kit-sidebar-items-list">
          ${itemsHTML.join('')}
        </div>
      `;
      itemsEl.innerHTML = '';
      itemsEl.appendChild(parseHTML(itemsListHTML));

      // Setup quantity controls and remove buttons
      setupKitSidebarItemListeners(fullKit);
      
      // Check inventory status and update button state
      await checkAndHighlightOutOfStockItems();
      
      // Scroll to show item if requested
      if (scrollToNewItem) {
        const contentEl = kitSidebarElement.querySelector('.kit-sidebar-content');
        const itemsList = itemsEl.querySelector('.kit-sidebar-items-list');
        if (contentEl && itemsList) {
          if (existingItemSku) {
            // Existing item - find it, scroll to it, and highlight it
            const existingItem = itemsList.querySelector(`.kit-sidebar-item[data-sku="${existingItemSku}"]`);
            if (existingItem) {
              // Wait for DOM to be ready
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  // Check if item is already visible in the viewport
                  const itemRect = existingItem.getBoundingClientRect();
                  const contentRect = contentEl.getBoundingClientRect();
                  
                  const isVisible = (
                    itemRect.top >= contentRect.top &&
                    itemRect.bottom <= contentRect.bottom &&
                    itemRect.left >= contentRect.left &&
                    itemRect.right <= contentRect.right
                  );
                  
                  if (!isVisible) {
                    // Item is not visible - scroll to it and highlight
                    existingItem.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    
                    // Small delay to let scroll start, then add highlight
                    setTimeout(() => {
                      existingItem.classList.add('kit-sidebar-item-highlighted');
                      
                      // Remove highlight after animation completes
                      setTimeout(() => {
                        existingItem.classList.remove('kit-sidebar-item-highlighted');
                      }, 2000);
                    }, 100);
                  }
                  // If item is already visible, don't highlight or scroll
                });
              });
            }
          } else {
            // New item - fade in and scroll to bottom
            const lastItem = itemsList.lastElementChild;
            if (lastItem) {
              lastItem.classList.add('kit-sidebar-item-newly-added');
              // Remove the class after animation completes
              setTimeout(() => {
                lastItem.classList.remove('kit-sidebar-item-newly-added');
              }, 300);
            }
            
            // Wait a bit for the item to start rendering, then scroll smoothly
            // Use double requestAnimationFrame to ensure DOM is fully rendered and painted
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                // Small delay to let the fade-in animation start
                setTimeout(() => {
                  contentEl.scrollTo({
                    top: contentEl.scrollHeight,
                    behavior: 'smooth'
                  });
                }, 50);
              });
            });
          }
        }
      }
    }
}

/**
 * Check for out-of-stock items and update UI
 */
async function checkAndHighlightOutOfStockItems() {
  const fullKit = getFullKit();
  if (!fullKit || !fullKit.items || fullKit.items.length === 0) {
    return false;
  }
  
  const { getProducts, getInventoryStatus, getPrimaryWarehouse } = await import('./data-mock.js');
  const products = await getProducts();
  const primaryWarehouse = getPrimaryWarehouse();
  
  let hasOutOfStock = false;
  const itemsList = kitSidebarElement?.querySelector('.kit-sidebar-items-list');
  
  if (itemsList) {
    for (const item of fullKit.items) {
      const product = products.find(p => p.sku === item.sku);
      const itemElement = itemsList.querySelector(`.kit-sidebar-item[data-sku="${item.sku}"]`);
      
      if (product && itemElement) {
        const status = getInventoryStatus(product, primaryWarehouse);
        
        if (status === 'out-of-stock') {
          hasOutOfStock = true;
          itemElement.classList.add('kit-sidebar-item-out-of-stock');
        } else {
          itemElement.classList.remove('kit-sidebar-item-out-of-stock');
        }
      }
    }
  }
  
  // Disable "Add All to Cart" button if there are out-of-stock items
  const addToCartBtn = kitSidebarElement?.querySelector('#kit-sidebar-view-full');
  if (addToCartBtn) {
    if (hasOutOfStock) {
      addToCartBtn.disabled = true;
      addToCartBtn.classList.add('btn-disabled');
    } else {
      addToCartBtn.disabled = false;
      addToCartBtn.classList.remove('btn-disabled');
    }
  }
  
  return hasOutOfStock;
}

/**
 * Create kit sidebar item HTML
 */
async function createKitSidebarItem(item) {
  const itemName = escapeHtml(item.name);
  const itemSku = escapeHtml(item.sku);
  const isCustom = item.isCustom || false;
  
  // Get inventory status for this item - only show if out of stock
  let inventoryStatus = 'unknown';
  let showOutOfStockBadge = false;
  
  try {
    const { getProductBySKU, getInventoryStatus, getPrimaryWarehouse } = await import('./data-mock.js');
    const product = await getProductBySKU(item.sku);
    if (product) {
      const primaryWarehouse = getPrimaryWarehouse();
      const status = getInventoryStatus(product, primaryWarehouse);
      inventoryStatus = status;
      showOutOfStockBadge = (status === 'out-of-stock');
    }
  } catch (e) {
    console.warn('Could not get inventory status for item:', item.sku, e);
  }
  
  return `
    <div class="kit-sidebar-item ${inventoryStatus === 'out-of-stock' ? 'kit-sidebar-item-out-of-stock' : ''}" data-sku="${itemSku}" data-inventory-status="${inventoryStatus}">
      <div class="kit-sidebar-item-image kit-sidebar-item-image-placeholder">
      </div>
      <div class="kit-sidebar-item-info">
        <div class="kit-sidebar-item-header-row">
          <div class="kit-sidebar-item-name-row">
            <div class="kit-sidebar-item-name">${itemName}</div>
          </div>
          <div class="kit-sidebar-item-badges">
            ${isCustom ? '<span class="custom-item-badge">Custom</span>' : ''}
            ${showOutOfStockBadge ? '<span class="custom-item-badge kit-sidebar-item-badge-out">OUT OF STOCK</span>' : ''}
          </div>
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
      
      // Find the item element to animate
      const itemElement = btn.closest('.kit-sidebar-item');
      
      if (itemElement) {
        // Add fade-out class for smooth removal animation
        itemElement.classList.add('kit-sidebar-item-removing');
        
        // Wait for animation to complete before removing
        setTimeout(async () => {
          // Remove item from kit (handles both bundle and custom items)
          const result = removeItemFromKit(sku);
          
          if (result.removed) {
            // Update sidebar to reflect changes
            await updateKitSidebar();
            
            // Re-check inventory after removal (this will re-enable button if no out-of-stock items remain)
            await checkAndHighlightOutOfStockItems();
            
            // Dispatch event for other components
            window.dispatchEvent(new CustomEvent('kitUpdated'));
          } else {
            // If removal failed, remove the animation class
            itemElement.classList.remove('kit-sidebar-item-removing');
          }
        }, 300); // Match CSS animation duration
      } else {
        // Fallback if element not found
        const result = removeItemFromKit(sku);
        if (result.removed) {
          await updateKitSidebar();
          // Re-check inventory after removal
          await checkAndHighlightOutOfStockItems();
          window.dispatchEvent(new CustomEvent('kitUpdated'));
        }
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
  
  // Handle width changes
  if (isExpanded) {
    kitSidebarElement.classList.add('kit-sidebar-expanded');
    kitSidebarElement.classList.remove('kit-sidebar-collapsed');
  } else {
    kitSidebarElement.classList.add('kit-sidebar-collapsed');
    kitSidebarElement.classList.remove('kit-sidebar-expanded');
  }
  
  if (content && toggle) {
    if (isExpanded) {
      // Expand: show content
      content.style.display = 'block';
      // Width classes already set above based on mode
      kitSidebarElement.classList.remove('kit-sidebar-collapsed');
      // Clear persisted collapsed state
      sessionStorage.removeItem('buildright_kit_sidebar_collapsed');
    } else {
      // Collapse: hide content but keep sidebar visible (just header)
      content.style.display = 'none';
      // Width classes already set above
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
 * Add kit to cart (helper function)
 * @returns {string} bundleId - The ID of the added bundle
 */
async function addKitToCart(fullKit) {
  const { addBundleToCart } = await import('./project-builder.js');
  const state = getWizardState();
  
  // Create bundle object for cart
  const bundle = {
    bundleId: state.bundle?.bundleId || `kit-${Date.now()}`,
    bundleName: state.bundle?.bundleName || 'Project Kit',
    projectType: state.bundle?.projectType || 'custom',
    projectDetail: state.bundle?.projectDetail || 'custom',
    complexity: state.bundle?.complexity || 'moderate',
    budget: state.bundle?.budget || 'custom',
    items: fullKit.items.map(item => ({
      sku: item.sku,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice
    })),
    totalPrice: fullKit.totalPrice,
    itemCount: fullKit.itemCount,
    createdAt: state.bundle?.createdAt || new Date().toISOString()
  };
  
  await addBundleToCart(bundle);
  return bundle.bundleId;
}


/**
 * Handle kit added to cart - roll up animation and open mini cart
 */
async function handleKitAddedToCart(addedBundleId = null) {
  if (!kitSidebarElement) return;
  
  // Trigger roll-up animation for kit items
  const itemsList = kitSidebarElement.querySelector('.kit-sidebar-items-list');
  if (itemsList) {
    itemsList.classList.add('rolling-up');
  }
  
  // Wait for roll-up animation to complete (600ms)
  await new Promise(resolve => setTimeout(resolve, 600));
  
  // Exit kit mode - clear wizard state and session storage
  const { clearWizardState } = await import('./project-builder.js');
  clearWizardState();
  sessionStorage.removeItem('kit_mode_resume_choice');
  sessionStorage.removeItem('buildright_wizard_state');
  
  // Close kit sidebar
  removeKitSidebar();
  
  // Open mini cart dropdown to show the added bundle
  window.dispatchEvent(new CustomEvent('openMiniCart', { detail: { highlightBundleId: addedBundleId } }));
}

// Cart sidebar functions removed - mini cart handles cart display

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

