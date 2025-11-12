// Wizard List Views
// List view event handling and interactions

import { getWizardState, saveWizardState, addBundleToCart, updateCustomItemQuantity, removeCustomItemFromKit, removeItemFromKit } from '../project-builder.js';
import { getLabel, getProjectDetailLabel, escapeHtml } from '../project-builder-constants.js';
import { getResourceLinks } from '../educational-content.js';
import { parseHTMLFragment, handleError, showToast } from './wizard-utils.js';
import { getCurrentStep } from './wizard-core.js';

/**
 * Save order to history
 * @param {Object} bundle - Bundle object
 */
function saveOrderToHistory(bundle) {
  try {
    const wizardState = getWizardState() || {};
    const orders = JSON.parse(localStorage.getItem('buildright_orders') || '[]');
    const order = {
      orderID: 'ORD-' + Date.now(),
      timestamp: new Date().toISOString(),
      wizardState: { ...wizardState },
      products: bundle.items.map(item => ({
        sku: item.sku,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.subtotal / item.quantity,
        subtotal: item.subtotal
      })),
      total: bundle.totalPrice,
      itemCount: bundle.itemCount,
      status: 'Completed'
    };
    orders.unshift(order);
    localStorage.setItem('buildright_orders', JSON.stringify(orders));
    
    updateLoyaltySpend(bundle.totalPrice);
  } catch (e) {
    handleError(e, 'saveOrderToHistory');
  }
}

/**
 * Update loyalty spend
 * @param {number} amount - Amount to add
 */
function updateLoyaltySpend(amount) {
  try {
    const loyaltyData = JSON.parse(localStorage.getItem('buildright_loyalty') || '{"totalSpend": 0}');
    loyaltyData.totalSpend = (loyaltyData.totalSpend || 0) + amount;
    localStorage.setItem('buildright_loyalty', JSON.stringify(loyaltyData));
  } catch (e) {
    handleError(e, 'updateLoyaltySpend');
  }
}

/**
 * Format materials list for copy/email
 * @param {Object} bundle - Bundle object
 * @param {Object} wizardState - Wizard state
 * @returns {string}
 */
function formatMaterialsList(bundle, wizardState) {
  const projectTypeLabel = getLabel('projectType', wizardState.projectType);
  const projectDetailLabel = getProjectDetailLabel(wizardState.projectType, wizardState.projectDetail);
  const complexityLabel = getLabel('complexity', wizardState.complexity);
  
  const projectName = `${projectDetailLabel} ${projectTypeLabel} (${complexityLabel})`;
  const generatedDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  
  const categoryMapping = {
    'Lumber & Framing': 'Primary Materials',
    'Drywall & Panels': 'Primary Materials',
    'Windows & Doors': 'Primary Materials',
    'Fasteners & Hardware': 'Fasteners & Hardware',
    'Tools & Accessories': 'Tools & Accessories',
    'Finishing Materials': 'Finishing Materials',
    'Insulation': 'Finishing Materials',
    'Paint & Coatings': 'Finishing Materials'
  };

  const itemsByGroup = {};
  bundle.items.forEach(item => {
    const group = categoryMapping[item.category] || 'Other';
    if (!itemsByGroup[group]) {
      itemsByGroup[group] = [];
    }
    itemsByGroup[group].push(item);
  });

  let text = `BUILDRIGHT MATERIALS LIST\n`;
  text += `Project: ${projectName}\n`;
  text += `Generated: ${generatedDate}\n\n`;

  const notes = sessionStorage.getItem('buildright_project_notes');
  if (notes && notes.trim()) {
    text += `NOTES:\n${notes}\n\n`;
  }

  Object.keys(itemsByGroup).forEach(group => {
    text += `${group.toUpperCase()}\n`;
    itemsByGroup[group].forEach(item => {
      const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
      text += `- ${item.name} (${item.sku}) x${item.quantity} @ $${unitPrice.toFixed(2)} = $${item.subtotal.toFixed(2)}\n`;
    });
    text += `\n`;
  });

  text += `TOTAL: $${bundle.totalPrice.toFixed(2)}\n`;
  
  return text;
}

/**
 * Copy materials list to clipboard
 * @param {Object} bundle - Bundle object
 * @param {Object} wizardState - Wizard state
 */
export async function copyMaterialsList(bundle, wizardState) {
  try {
    const text = formatMaterialsList(bundle, wizardState);
    await navigator.clipboard.writeText(text);
    showToast('success', 'Copied!', 'Materials list copied to clipboard');
  } catch (err) {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = formatMaterialsList(bundle, wizardState);
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      showToast('success', 'Copied!', 'Materials list copied to clipboard');
    } catch (e) {
      showToast('error', 'Error', 'Failed to copy materials list');
    }
    document.body.removeChild(textarea);
  }
}

/**
 * Email quote
 * @param {Object} bundle - Bundle object
 * @param {Object} wizardState - Wizard state
 */
export function emailQuote(bundle, wizardState) {
  try {
    const projectTypeLabel = getLabel('projectType', wizardState.projectType);
    const projectDetailLabel = getProjectDetailLabel(wizardState.projectType, wizardState.projectDetail);
    
    const subject = encodeURIComponent(`BuildRight Quote - ${projectDetailLabel} ${projectTypeLabel}`);
    const body = encodeURIComponent(formatMaterialsList(bundle, wizardState));
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  } catch (error) {
    handleError(error, 'emailQuote');
  }
}

/**
 * Setup simplified list view event listeners
 * @param {Object} bundle - Bundle object
 * @param {Array} allItems - All items array
 * @param {Function} displayBundle - Function to display bundle
 */
export function setupSimpleListViewEventListeners(bundle, allItems, displayBundle) {
  // Add all to cart button
  const addAllBtn = document.getElementById('add-all-to-cart-btn');
  if (addAllBtn) {
    addAllBtn.addEventListener('click', () => {
      saveOrderToHistory(bundle);
      addBundleToCart(bundle);
      window.location.href = 'pages/cart.html';
    });
  }

  // Browse catalog button - navigate to catalog with kit sidebar expanded
  const browseCatalogBtn = document.getElementById('browse-catalog-btn');
  if (browseCatalogBtn) {
    browseCatalogBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      // Set flag to ensure kit sidebar is expanded when navigating to catalog
      sessionStorage.setItem('buildright_kit_sidebar_expanded', 'true');
      // Navigate to catalog (All Products) using absolute path to ensure correct navigation
      // Use absolute path starting with / to ensure it resolves correctly from any page
      const basePath = window.BASE_PATH || '/';
      const catalogPath = basePath === '/' ? '/catalog' : `${basePath}catalog`;
      window.location.href = catalogPath;
    });
  }

  // Quantity controls
  document.querySelectorAll('.simple-qty-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Prevent form submission or default button behavior
      e.stopPropagation(); // Prevent event bubbling
      const sku = btn.dataset.sku;
      const action = btn.dataset.action;
      
      // Find item in bundle
      const item = bundle.items.find(i => i.sku === sku);
      if (!item) return;

      // Update quantity
      if (action === 'increase') {
        item.quantity += 1;
      } else if (action === 'decrease' && item.quantity > 1) {
        item.quantity -= 1;
      }

      // Recalculate subtotal
      item.subtotal = item.quantity * (item.unitPrice || 0);
      
      // Update state
      updateCustomItemQuantity(sku, item.quantity);
      
      // Recalculate bundle totals
      bundle.totalPrice = bundle.items.reduce((sum, i) => sum + i.subtotal, 0);
      
      // Update UI
      const qtyDisplay = btn.parentElement.querySelector('.simple-qty-value');
      if (qtyDisplay) {
        qtyDisplay.textContent = item.quantity;
      }
      
      // Update subtotal display
      const row = btn.closest('.simple-list-row');
      if (row) {
        const subtotalEl = row.querySelector('.simple-list-col-total');
        if (subtotalEl) {
          subtotalEl.textContent = `$${item.subtotal.toFixed(2)}`;
        }
      }
      
      // Update header totals
      const subtitleEl = document.querySelector('.simple-list-subtitle');
      if (subtitleEl) {
        subtitleEl.textContent = `${bundle.items.length} items`;
      }
      
      const totalEl = document.querySelector('.simple-list-total');
      if (totalEl) {
        totalEl.textContent = `$${bundle.totalPrice.toFixed(2)}`;
      }

      const wizardState = getWizardState() || {};
      // Preserve currentStep to prevent navigation reset
      // Use getCurrentStep() to get the actual current step from wizard-core
      const currentStep = getCurrentStep();
      wizardState.bundle = bundle;
      wizardState.currentStep = currentStep; // Explicitly preserve current step
      saveWizardState(wizardState);
      
      // Ensure step 5 radio button stays checked to prevent CSS-based navigation reset
      const step5Radio = document.getElementById('wizard-step-5');
      if (step5Radio && currentStep === 5) {
        step5Radio.checked = true;
      }
      
      // Prevent scrolling to top
      // Store scroll position before any potential DOM updates
      const scrollY = window.scrollY;
      
      // Use requestAnimationFrame to restore scroll position after any DOM updates
      requestAnimationFrame(() => {
        window.scrollTo(0, scrollY);
      });
    });
  });

  // Remove buttons
  document.querySelectorAll('.simple-remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const sku = btn.dataset.sku;
      
      // Find the item to get its name for confirmation
      const item = allItems.find(i => i.sku === sku);
      const itemName = item ? item.name : 'this item';
      
      if (confirm(`Remove ${itemName} from your kit?`)) {
        // Remove item from kit (handles both bundle and custom items)
        const result = removeItemFromKit(sku);
        
        if (result.removed) {
          // Get updated state after removal
          const state = getWizardState();
          
          // Re-render the bundle display
          if (state.bundle && displayBundle) {
            // The bundle.items has already been updated by removeItemFromKit
            // Just need to re-render with the updated bundle
            // displayBundle will merge bundle.items with customItems automatically
            displayBundle(state.bundle);
          } else if (displayBundle) {
            // If no bundle, create a minimal one for display from custom items
            const customItems = state.customItems || [];
            if (customItems.length > 0) {
              const minimalBundle = {
                items: customItems,
                itemCount: customItems.length,
                totalPrice: customItems.reduce((sum, item) => sum + (item.subtotal || 0), 0)
              };
              displayBundle(minimalBundle);
            } else {
              // No items left - show empty state
              const container = document.getElementById('bundle-container');
              if (container) {
                container.innerHTML = '<div class="error-message">Your kit is empty. Please generate a new kit or add items.</div>';
              }
            }
          }
        } else {
          alert('Could not remove item. Please try again.');
        }
      }
    });
  });

  // Project notes handling
  const notesTextarea = document.getElementById('project-notes-textarea');
  if (notesTextarea) {
    const savedNotes = sessionStorage.getItem('buildright_project_notes');
    if (savedNotes) {
      notesTextarea.value = savedNotes;
    }

    notesTextarea.addEventListener('input', () => {
      sessionStorage.setItem('buildright_project_notes', notesTextarea.value);
    });
  }
}

/**
 * Setup list view event listeners
 * @param {Object} bundle - Bundle object
 * @param {Object} itemsByGroup - Items grouped by group
 */
export function setupListViewEventListeners(bundle, itemsByGroup) {
  // Add all to cart button
  const addAllBtn = document.getElementById('add-all-to-cart-btn');
  if (addAllBtn) {
    addAllBtn.addEventListener('click', () => {
      saveOrderToHistory(bundle);
      addBundleToCart(bundle);
      window.location.href = 'pages/cart.html';
    });
  }

  // Quantity controls
  document.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const sku = btn.dataset.sku;
      const action = btn.dataset.action;
      const qtyElement = btn.parentElement.querySelector('.qty-value');
      if (!qtyElement) return;
      
      let qty = parseInt(qtyElement.textContent);
      if (action === 'increase') {
        qty++;
      } else if (action === 'decrease' && qty > 1) {
        qty--;
      }
      
      qtyElement.textContent = qty;
      
      const item = bundle.items.find(i => i.sku === sku);
      if (item) {
        const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
        item.quantity = qty;
        item.subtotal = unitPrice * qty;
        
        // Update subtotal display
        const card = document.querySelector(`[data-sku="${sku}"]`);
        if (card) {
          const subtotalEl = card.querySelector('.subtotal, .product-card-list-subtotal span');
          if (subtotalEl) {
            subtotalEl.textContent = `$${item.subtotal.toFixed(2)}`;
          }
        }
        
        // Recalculate bundle total
        bundle.totalPrice = bundle.items.reduce((sum, i) => sum + i.subtotal, 0);
        
        // Update header total if exists
        const headerSubtitle = document.querySelector('.list-view-subtitle');
        if (headerSubtitle) {
          headerSubtitle.textContent = `${bundle.itemCount} items • Total: $${bundle.totalPrice.toFixed(2)}`;
        }
        
        const wizardState = getWizardState() || {};
        // Preserve currentStep to prevent navigation reset
        const currentStep = getCurrentStep();
        wizardState.bundle = bundle;
        wizardState.currentStep = currentStep; // Explicitly preserve current step
        saveWizardState(wizardState);
        
        // Ensure step 5 radio button stays checked to prevent CSS-based navigation reset
        const step5Radio = document.getElementById('wizard-step-5');
        if (step5Radio && currentStep === 5) {
          step5Radio.checked = true;
        }
      }
    });
  });

  // Project notes handling
  const notesTextarea = document.getElementById('project-notes-textarea');
  if (notesTextarea) {
    const savedNotes = sessionStorage.getItem('buildright_project_notes');
    if (savedNotes) {
      notesTextarea.value = savedNotes;
    }

    notesTextarea.addEventListener('input', () => {
      sessionStorage.setItem('buildright_project_notes', notesTextarea.value);
    });
  }
}

/**
 * Setup bundle event listeners
 * @param {Object} bundle - Bundle object
 * @param {Object} itemsByCategory - Items grouped by category
 * @param {Set} includedGroups - Set of included group names
 * @param {Function} updateComponentToggles - Function to update component toggles
 */
export function setupBundleEventListeners(bundle, itemsByCategory, includedGroups, updateComponentToggles) {
  try {
    // Add bundle to cart button
    const addBtn = document.getElementById('add-bundle-btn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        saveOrderToHistory(bundle);
        addBundleToCart(bundle);
        window.location.href = 'pages/cart.html';
      });
    }

    // Component toggle functionality
    const componentCheckboxes = document.querySelectorAll('.component-toggle-checkbox');
    componentCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const group = checkbox.dataset.group;
        if (checkbox.checked) {
          includedGroups.add(group);
        } else {
          includedGroups.delete(group);
        }
        if (updateComponentToggles) {
          updateComponentToggles(bundle, itemsByCategory, includedGroups);
        }
      });
    });

    // Category toggle functionality - expand/collapse categories
    document.querySelectorAll('.category-toggle').forEach(toggle => {
      // Set initial state - categories start expanded
      const category = toggle.dataset.category;
      const itemsContainer = document.getElementById(`category-${category}`);
      if (itemsContainer && itemsContainer.style.display !== 'none') {
        toggle.setAttribute('aria-expanded', 'true');
        toggle.classList.remove('collapsed');
      }
      
      toggle.addEventListener('click', () => {
        if (itemsContainer) {
          const isExpanded = itemsContainer.style.display !== 'none';
          itemsContainer.style.display = isExpanded ? 'none' : 'block';
          toggle.setAttribute('aria-expanded', !isExpanded);
          toggle.classList.toggle('collapsed', isExpanded);
        }
      });
    });

    // Quantity controls
    document.querySelectorAll('.qty-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const sku = btn.dataset.sku;
        const action = btn.dataset.action;
        const qtyElement = btn.parentElement.querySelector('.qty-value');
        if (!qtyElement) return;
        
        let qty = parseInt(qtyElement.textContent);
        if (action === 'increase') {
          qty++;
        } else if (action === 'decrease' && qty > 1) {
          qty--;
        }
        
        qtyElement.textContent = qty;
        
        const item = bundle.items.find(i => i.sku === sku);
        if (item) {
          const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
          item.quantity = qty;
          item.subtotal = unitPrice * qty;
          
          const row = btn.closest('tr');
          if (row) {
            const subtotalCell = row.querySelector('.product-subtotal');
            if (subtotalCell) {
              subtotalCell.textContent = `$${item.subtotal.toFixed(2)}`;
            }
          }
          
          bundle.totalPrice = bundle.items.reduce((sum, i) => sum + i.subtotal, 0);
          const totalValue = document.querySelector('.bundle-total-value');
          if (totalValue) {
            totalValue.textContent = `$${bundle.totalPrice.toFixed(2)}`;
          }
          
          const wizardState = getWizardState() || {};
          // Preserve currentStep to prevent navigation reset
          const currentStep = getCurrentStep();
          wizardState.bundle = bundle;
          wizardState.currentStep = currentStep; // Explicitly preserve current step
          saveWizardState(wizardState);
          
          // Ensure step 5 radio button stays checked to prevent CSS-based navigation reset
          const step5Radio = document.getElementById('wizard-step-5');
          if (step5Radio && currentStep === 5) {
            step5Radio.checked = true;
          }
        }
      });
    });

    // Print button - visibility is controlled by CSS, just ensure click handler is set
    const printBtn = document.querySelector('.wizard-nav-print');
    if (printBtn) {
      // Remove existing onclick handler if present and add event listener
      printBtn.onclick = null; // Clear inline onclick
      printBtn.addEventListener('click', (e) => {
        e.preventDefault();
        window.print();
      });
    }

    // Copy materials list button
    const copyBtn = document.getElementById('copy-materials-btn');
    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const wizardState = getWizardState() || {};
        copyMaterialsList(bundle, wizardState);
      });
    }

    // Email quote button
    const emailBtn = document.getElementById('email-quote-btn');
    if (emailBtn) {
      emailBtn.addEventListener('click', () => {
        const wizardState = getWizardState() || {};
        emailQuote(bundle, wizardState);
      });
    }

    // Project notes handling
    const notesTextarea = document.getElementById('project-notes-textarea');
    if (notesTextarea) {
      const savedNotes = sessionStorage.getItem('buildright_project_notes');
      if (savedNotes) {
        notesTextarea.value = savedNotes;
      }

      notesTextarea.addEventListener('input', () => {
        sessionStorage.setItem('buildright_project_notes', notesTextarea.value);
      });
    }
  } catch (error) {
    handleError(error, 'setupBundleEventListeners');
  }
}

/**
 * Update component toggles
 * @param {Object} bundle - Bundle object
 * @param {Object} itemsByCategory - Items grouped by category
 * @param {Set} includedGroups - Set of included group names
 */
export function updateComponentToggles(bundle, itemsByCategory, includedGroups) {
  try {
    let newTotal = 0;
    
    document.querySelectorAll('.bundle-category-section').forEach(section => {
      const group = section.dataset.group;
      const isIncluded = includedGroups.has(group);
      
      if (isIncluded) {
        section.classList.remove('excluded');
        const itemsContainer = section.querySelector('.category-items');
        if (itemsContainer) itemsContainer.style.display = 'block';
        const toggle = section.querySelector('.category-toggle');
        if (toggle) toggle.classList.remove('excluded');
      } else {
        section.classList.add('excluded');
        const itemsContainer = section.querySelector('.category-items');
        if (itemsContainer) itemsContainer.style.display = 'none';
        const toggle = section.querySelector('.category-toggle');
        if (toggle) toggle.classList.add('excluded');
      }
      
      if (isIncluded) {
        const category = section.dataset.category;
        if (itemsByCategory[category]) {
          itemsByCategory[category].forEach(item => {
            newTotal += item.subtotal;
          });
        }
      }
    });
    
    const totalValue = document.getElementById('bundle-total-value');
    const componentTotal = document.getElementById('component-total-price');
    if (totalValue) totalValue.textContent = `$${newTotal.toFixed(2)}`;
    if (componentTotal) componentTotal.textContent = `$${newTotal.toFixed(2)}`;
    
    bundle.totalPrice = newTotal;
    const wizardState = getWizardState() || {};
    // Preserve currentStep to prevent navigation reset
    const currentStep = getCurrentStep();
    wizardState.bundle = bundle;
    wizardState.currentStep = currentStep; // Explicitly preserve current step
    saveWizardState(wizardState);
    
    // Ensure step 5 radio button stays checked to prevent CSS-based navigation reset
    const step5Radio = document.getElementById('wizard-step-5');
    if (step5Radio && currentStep === 5) {
      step5Radio.checked = true;
    }
  } catch (error) {
    handleError(error, 'updateComponentToggles');
  }
}

/**
 * Populate resource links using HTML template
 * @param {HTMLElement} container - Container element
 */
export function populateResourceLinks(container) {
  try {
    const wizardState = getWizardState() || {};
    if (wizardState.projectType && wizardState.projectDetail) {
      const links = getResourceLinks(wizardState.projectType, wizardState.projectDetail);
      if (links && links.length > 0) {
        const linksHTML = links.map(link => {
          const url = escapeHtml(link.url);
          const text = escapeHtml(link.text);
          return `<li><a href="${url}" class="resource-link">${text}</a></li>`;
        }).join('');
        
        const html = `
          <div class="resource-links-title">📚 Related Resources</div>
          <ul class="resource-links-list">${linksHTML}</ul>
        `;
        
        // Use parseHTMLFragment instead of innerHTML for better security
        container.textContent = '';
        const fragment = parseHTMLFragment(html);
        Array.from(fragment.children).forEach(child => {
          container.appendChild(child);
        });
      }
    }
  } catch (error) {
    handleError(error, 'populateResourceLinks');
  }
}

