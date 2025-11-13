// Wizard Bundle Display
// Main bundle rendering and view management

import { getWizardState, saveWizardState } from '../project-builder.js';
import { escapeHtml, COMPONENT_GROUPS } from '../project-builder-constants.js';
import { parseHTML, parseHTMLFragment } from './wizard-utils.js';
import { updateSidebar } from './wizard-sidebar.js';
import { getCurrentStep } from './wizard-core.js';
import {
  createSimpleProductRow,
  createPrintHeader,
  createPrintNotes,
  createBundleHeader,
  createBundleSummary,
  createComponentToggles,
  createBundleProducts,
  createBundleActions,
  createQuoteActions,
  createProjectNotes,
  createEmptyState,
  createProjectDetailsHTML
} from './wizard-ui-components.js';

/**
 * Get current view preference
 * @returns {string}
 */
export function getCurrentView() {
  return sessionStorage.getItem('buildright_kit_view') || 'list';
}

/**
 * Set view preference
 * @param {string} view
 */
export function setCurrentView(view) {
  sessionStorage.setItem('buildright_kit_view', view);
}

/**
 * Display bundle - refactored to support dual views
 * @param {Object} bundle - Bundle object
 * @param {Function} setupSimpleListViewEventListeners - Function to setup simple list view listeners
 * @param {Function} displayBundleCallback - Function to re-display bundle (for re-rendering)
 */
export function displayBundle(bundle, setupSimpleListViewEventListeners, displayBundleCallback) {
  const container = document.getElementById('bundle-container');
  if (!container) {
    console.error('[Project Builder] Bundle container not found');
    return;
  }

  const wizardState = getWizardState() || {};
  // Merge bundle items with custom items
  const customItems = wizardState.customItems || [];
  const bundleItems = bundle.items || [];
  const allItems = [...bundleItems, ...customItems];
  
  console.log('[Project Builder] All items:', allItems.length, 'bundle items:', bundleItems.length, 'custom items:', customItems.length);
  
  // Ensure we have items
  if (!allItems || allItems.length === 0) {
    console.error('[Project Builder] No items to display');
    const emptyStateHTML = createEmptyState(
      'Your kit is empty', 
      'Start the project builder to create your custom kit',
      { actionLabel: 'Build A New Project', actionId: 'empty-state-restart-btn' }
    );
    container.innerHTML = '';
    container.appendChild(parseHTML(emptyStateHTML));
    
    // Add event listener for restart button
    const restartBtn = document.getElementById('empty-state-restart-btn');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        // Navigate to step 1
        const step1Radio = document.getElementById('wizard-step-1');
        if (step1Radio) {
          step1Radio.checked = true;
          step1Radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
    return;
  }
  
  // Group items by component type
  const itemsByCategory = allItems.reduce((acc, item) => {
    const category = item.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
  
  // Update bundle totals to include custom items
  const totalPrice = allItems.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  bundle.totalPrice = totalPrice;
  bundle.itemCount = allItems.length;
  bundle.items = allItems; // Update bundle items array

  // Calculate prices per component group
  const componentPrices = Object.fromEntries(
    Object.entries(COMPONENT_GROUPS).map(([group, categories]) => [
      group,
      categories.flatMap(cat => itemsByCategory[cat] || [])
        .reduce((sum, item) => sum + item.subtotal, 0)
    ])
  );

  // Default included groups
  const includedGroups = new Set(['Primary Materials', 'Fasteners & Hardware']);

  // Always display list view
  displayListView(bundle, itemsByCategory, componentPrices, includedGroups, setupSimpleListViewEventListeners, displayBundleCallback || displayBundle);

  // Save bundle to state
  // Preserve currentStep to prevent navigation reset when updating bundle
  const currentStep = getCurrentStep(); // Get the actual current step from wizard-core
  wizardState.bundle = bundle;
  wizardState.currentStep = currentStep; // Explicitly preserve current step
  saveWizardState(wizardState);
  
  // Set kit mode resume choice to 'edit' when a new bundle is created/saved
  // This ensures the kit sidebar automatically shows when navigating to catalog pages
  sessionStorage.setItem('kit_mode_resume_choice', 'edit');
  
  // Ensure step 5 radio button stays checked to prevent CSS-based navigation reset
  const step5Radio = document.getElementById('wizard-step-5');
  if (step5Radio && currentStep === 5) {
    step5Radio.checked = true;
  }
  
  updateSidebar();
}

/**
 * Display List View - simplified clean list
 * @param {Object} bundle - Bundle object
 * @param {Object} itemsByCategory - Items grouped by category
 * @param {Object} componentPrices - Component prices by group
 * @param {Set} includedGroups - Set of included group names
 * @param {Function} setupSimpleListViewEventListeners - Function to setup event listeners
 * @param {Function} displayBundle - Function to re-display bundle (for re-rendering)
 */
export function displayListView(bundle, itemsByCategory, componentPrices, includedGroups, setupSimpleListViewEventListeners, displayBundle) {
  const container = document.getElementById('bundle-container');
  if (!container) return;

  // Flatten all items into a single list
  const allItems = [];
  Object.keys(itemsByCategory).forEach(category => {
    const categoryItems = itemsByCategory[category] || [];
    allItems.push(...categoryItems);
  });
  
  if (allItems.length === 0) {
    const emptyStateHTML = createEmptyState(
      'Your kit is empty', 
      'Start the project builder to create your custom kit',
      { actionLabel: 'Build A New Project', actionId: 'empty-state-restart-btn-2' }
    );
    container.innerHTML = '';
    container.appendChild(parseHTML(emptyStateHTML));
    
    // Add event listener for restart button
    const restartBtn = document.getElementById('empty-state-restart-btn-2');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        // Navigate to step 1
        const step1Radio = document.getElementById('wizard-step-1');
        if (step1Radio) {
          step1Radio.checked = true;
          step1Radio.dispatchEvent(new Event('change', { bubbles: true }));
        }
      });
    }
    return;
  }

  // Build simplified list view HTML
  const itemsHTML = allItems.map(item => createSimpleProductRow(item)).join('');
  
  // Create project details HTML for header
  const projectDetailsHTML = createProjectDetailsHTML();
  
  const listViewHTML = `
    <div class="project-kit-list-view-simple" data-bundle-id="${bundle.bundleId}">
      <div class="simple-list-header">
        <div class="simple-list-header-content">
          <h3 class="simple-list-title">${escapeHtml(bundle.bundleName)}</h3>
          <p class="simple-list-subtitle">${bundle.itemCount} ${bundle.itemCount === 1 ? 'item' : 'items'}</p>
          ${projectDetailsHTML}
        </div>
        <div class="simple-list-total">$${bundle.totalPrice.toFixed(2)}</div>
      </div>
      
      <div class="simple-list-table">
        <div class="simple-list-table-header">
          <div class="simple-list-col-item">Item</div>
          <div class="simple-list-col-qty">Quantity</div>
          <div class="simple-list-col-price">Price</div>
          <div class="simple-list-col-total">Total</div>
          <div class="simple-list-col-actions"></div>
        </div>
        <div class="simple-list-items">
          ${itemsHTML}
        </div>
      </div>

      <div class="simple-list-footer">
        <button class="btn btn-cta btn-lg" id="add-all-to-cart-btn">Add All to Cart</button>
        <button class="btn btn-outline btn-lg" id="browse-catalog-btn">Browse Catalog for More Items</button>
      </div>
      
      ${createProjectNotes().outerHTML}
    </div>
  `;

  container.textContent = '';
  const listViewDiv = parseHTML(listViewHTML);
  container.appendChild(listViewDiv);

  // Set separator width to match title width
  requestAnimationFrame(() => {
    const titleEl = listViewDiv.querySelector('.simple-list-title');
    const detailsEl = listViewDiv.querySelector('.simple-list-project-details');
    if (titleEl && detailsEl) {
      const titleWidth = titleEl.offsetWidth;
      detailsEl.style.setProperty('--project-title-width', `${titleWidth}px`);
    }
  });

  // Setup list view event listeners
  if (setupSimpleListViewEventListeners) {
    setupSimpleListViewEventListeners(bundle, allItems, displayBundle);
  }
}

/**
 * Display Bundle View - unified bundle product style
 * @param {Object} bundle - Bundle object
 * @param {Object} itemsByCategory - Items grouped by category
 * @param {Object} componentPrices - Component prices by group
 * @param {Set} includedGroups - Set of included group names
 * @param {Function} setupBundleEventListeners - Function to setup bundle event listeners
 * @param {Function} populateResourceLinks - Function to populate resource links
 */
export function displayBundleView(bundle, itemsByCategory, componentPrices, includedGroups, setupBundleEventListeners, populateResourceLinks) {
  const container = document.getElementById('bundle-container');
  if (!container) return;

  // Build bundle HTML using templates (reduces DOM manipulation significantly)
  const notes = sessionStorage.getItem('buildright_project_notes');
  const printHeaderHTML = createPrintHeader(bundle).outerHTML;
  const printNotesHTML = notes && notes.trim() ? createPrintNotes(notes).outerHTML : '';
  const bundleHeaderHTML = createBundleHeader(bundle).outerHTML;
  const bundleSummaryHTML = createBundleSummary(bundle).outerHTML;
  const componentTogglesHTML = createComponentToggles(componentPrices, includedGroups, bundle).outerHTML;
  const bundleProductsHTML = createBundleProducts(itemsByCategory, includedGroups, bundle).outerHTML;
  const bundleActionsHTML = createBundleActions().outerHTML;
  const quoteActionsHTML = createQuoteActions().outerHTML;
  const projectNotesHTML = createProjectNotes().outerHTML;
  
  const bundleHTML = `
    <div class="project-bundle" data-bundle-id="${bundle.bundleId}">
      ${printHeaderHTML}
      ${printNotesHTML}
      ${bundleHeaderHTML}
      ${bundleSummaryHTML}
      ${componentTogglesHTML}
      ${bundleProductsHTML}
      ${bundleActionsHTML}
      <div class="resource-links" id="resource-links-section"></div>
      ${quoteActionsHTML}
      ${projectNotesHTML}
    </div>
  `;
  
  // Single DOM operation instead of many appendChild calls
  container.textContent = '';
  const bundleDiv = parseHTML(bundleHTML);
  container.appendChild(bundleDiv);
  
  // Get resource links section reference
  const resourceLinksSection = bundleDiv.querySelector('#resource-links-section');

  // Setup event listeners for bundle
  if (setupBundleEventListeners) {
    setupBundleEventListeners(bundle, itemsByCategory, includedGroups);
  }

  // Populate resource links
  if (populateResourceLinks && resourceLinksSection) {
    populateResourceLinks(resourceLinksSection);
  }
  
  // Setup project notes handling
  const notesTextarea = bundleDiv.querySelector('#project-notes-textarea');
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

