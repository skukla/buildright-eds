// Wizard UI Components
// HTML component builders and templates

import { escapeHtml, getLabel, getProjectDetailLabel, COMPONENT_GROUPS, CATEGORY_MAPPING } from '../project-builder-constants.js';
import { getProductImageUrl, getInventoryStatus, getPrimaryWarehouse } from '../data-mock.js';
import { parseHTML, formatCategoryName } from './wizard-utils.js';
import { getWizardState } from '../project-builder.js';

/**
 * Create simple product row for clean list view
 * @param {Object} item - Product item
 * @returns {string} HTML string
 */
export function createSimpleProductRow(item) {
  const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
  const imageUrl = escapeHtml(getProductImageUrl(item.sku));
  const itemName = escapeHtml(item.name);
  const itemSku = escapeHtml(item.sku);
  const isCustom = item.isCustom || false;
  
  return `
    <div class="simple-list-row" data-sku="${itemSku}">
      <div class="simple-list-col-item">
        <div class="simple-list-item-image">
          <img src="${imageUrl}" alt="${itemName}" onerror="this.style.display='none'">
        </div>
        <div class="simple-list-item-info">
          <div class="simple-list-item-name-row">
            <div class="simple-list-item-name">${itemName}</div>
            ${isCustom ? '<span class="custom-item-badge">Custom</span>' : ''}
          </div>
          <div class="simple-list-item-sku">SKU: ${itemSku}</div>
        </div>
      </div>
      <div class="simple-list-col-qty">
        <div class="simple-qty-controls">
          <button class="simple-qty-btn" data-sku="${itemSku}" data-action="decrease">−</button>
          <span class="simple-qty-value">${item.quantity}</span>
          <button class="simple-qty-btn" data-sku="${itemSku}" data-action="increase">+</button>
        </div>
      </div>
      <div class="simple-list-col-price">$${unitPrice.toFixed(2)}</div>
      <div class="simple-list-col-total">$${item.subtotal.toFixed(2)}</div>
      <div class="simple-list-col-actions">
        <button class="simple-remove-btn" data-sku="${itemSku}" aria-label="Remove ${itemName}">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 6L6 18M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

/**
 * Create product card for list view (compact)
 * @param {Object} item - Product item
 * @param {string} mode - Display mode
 * @returns {string} HTML string
 */
export function createProductCard(item, mode = 'list') {
  const inventoryStatus = getInventoryStatus({ sku: item.sku }, getPrimaryWarehouse());
  const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
  const imageUrl = escapeHtml(getProductImageUrl(item.sku));
  const itemName = escapeHtml(item.name);
  const itemReason = escapeHtml(item.reason);
  const itemSku = escapeHtml(item.sku);
  
  let stockText, stockClass;
  if (inventoryStatus === 'in_stock') {
    stockText = 'In Stock';
    stockClass = 'stock-status stock-in';
  } else if (inventoryStatus === 'low_stock') {
    stockText = 'Low Stock';
    stockClass = 'stock-status stock-low';
  } else {
    stockText = 'Out of Stock';
    stockClass = 'stock-status stock-out';
  }

  // Compact list mode - table row style
  return `
    <div class="product-card-list" data-sku="${itemSku}">
      <div class="product-card-list-image">
        <img src="${imageUrl}" alt="${itemName}" onerror="this.style.display='none'">
      </div>
      <div class="product-card-list-info">
        <h5 class="product-card-list-name">${itemName}</h5>
        <p class="product-card-list-reason">${itemReason}</p>
        <p class="product-card-list-sku">SKU: ${itemSku}</p>
      </div>
      <div class="product-card-list-stock">
        <span class="${stockClass}">${stockText}</span>
      </div>
      <div class="product-card-list-quantity">
        <div class="quantity-controls">
          <button class="qty-btn" data-sku="${itemSku}" data-action="decrease">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-sku="${itemSku}" data-action="increase">+</button>
        </div>
      </div>
      <div class="product-card-list-price">
        <span class="unit-price">$${unitPrice.toFixed(2)}</span>
      </div>
      <div class="product-card-list-subtotal">
        <span>$${item.subtotal.toFixed(2)}</span>
      </div>
    </div>
  `;
}

/**
 * Create print header using HTML template
 * @param {Object} bundle - Bundle object
 * @returns {HTMLElement}
 */
export function createPrintHeader(bundle) {
  const wizardState = getWizardState() || {};
  const projectTypeLabel = escapeHtml(getLabel('projectType', wizardState.projectType));
  const projectDetailLabel = escapeHtml(getProjectDetailLabel(wizardState.projectType, wizardState.projectDetail));
  const complexityLabel = escapeHtml(getLabel('complexity', wizardState.complexity));
  const generatedDate = escapeHtml(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
  
  const html = `
    <div class="print-header" style="display: none;">
      <div class="print-header-logo">BuildRight Solutions</div>
      <div class="print-header-title">Project Materials Quote</div>
      <div class="print-header-details">Project: ${projectDetailLabel} ${projectTypeLabel} (${complexityLabel})</div>
      <div class="print-header-date">Generated on ${generatedDate}</div>
    </div>
  `;
  
  return parseHTML(html);
}

/**
 * Create print notes using HTML template
 * @param {string} notes - Notes text
 * @returns {HTMLElement}
 */
export function createPrintNotes(notes) {
  const escapedNotes = escapeHtml(notes);
  const html = `
    <div class="print-notes" style="display: none;">
      <div class="print-notes-label">Project Notes:</div>
      <div>${escapedNotes}</div>
    </div>
  `;
  return parseHTML(html);
}

/**
 * Create bundle header using HTML template
 * @param {Object} bundle - Bundle object
 * @returns {HTMLElement}
 */
export function createBundleHeader(bundle) {
  const bundleName = escapeHtml(bundle.bundleName);
  const html = `
    <div class="bundle-header">
      <div class="bundle-badge">PROJECT KIT</div>
      <h3 class="bundle-title">${bundleName}</h3>
      <p class="bundle-subtitle">${bundle.itemCount} items included</p>
    </div>
  `;
  return parseHTML(html);
}

/**
 * Create bundle summary using HTML template
 * @param {Object} bundle - Bundle object
 * @returns {HTMLElement}
 */
export function createBundleSummary(bundle) {
  const html = `
    <div class="bundle-summary">
      <div class="bundle-total">
        <div class="bundle-total-label">Total Price</div>
        <div class="bundle-total-value" id="bundle-total-value">$${bundle.totalPrice.toFixed(2)}</div>
      </div>
      <button class="btn btn-cta btn-lg" id="add-bundle-btn">Add Kit to Cart</button>
    </div>
  `;
  return parseHTML(html);
}

/**
 * Create component toggles using HTML template
 * @param {Object} componentPrices - Component prices by group
 * @param {Set} includedGroups - Set of included group names
 * @param {Object} bundle - Bundle object
 * @returns {HTMLElement}
 */
export function createComponentToggles(componentPrices, includedGroups, bundle) {
  const toggleItems = Object.keys(COMPONENT_GROUPS)
    .filter(group => {
      const price = componentPrices[group];
      return price !== 0 || group === 'Tools & Accessories';
    })
    .map(group => {
      const price = componentPrices[group];
      const checked = includedGroups.has(group) ? 'checked' : '';
      const groupEscaped = escapeHtml(group);
      return `
        <div class="component-toggle-item">
          <label class="component-toggle-label">
            <input type="checkbox" class="component-toggle-checkbox" data-group="${groupEscaped}" ${checked}>
            <span>${groupEscaped}</span>
          </label>
          <span class="component-toggle-price">$${price.toFixed(2)}</span>
        </div>
      `;
    })
    .join('');
  
  const html = `
    <div class="component-toggles">
      <h4 class="component-toggles-title">Customize Your Kit</h4>
      ${toggleItems}
      <div class="component-toggle-item">
        <span class="component-toggle-label">Total:</span>
        <span class="component-toggle-price" id="component-total-price">$${bundle.totalPrice.toFixed(2)}</span>
      </div>
    </div>
  `;
  
  return parseHTML(html);
}

/**
 * Create bundle products using HTML template
 * @param {Object} itemsByCategory - Items grouped by category
 * @param {Set} includedGroups - Set of included group names
 * @param {Object} bundle - Bundle object
 * @returns {HTMLElement}
 */
export function createBundleProducts(itemsByCategory, includedGroups, bundle) {
  // Group categories by component group for better organization
  const categoriesByGroup = {};
  Object.keys(itemsByCategory).forEach(category => {
    const groupName = CATEGORY_MAPPING[category] || 'Other';
    if (!categoriesByGroup[groupName]) {
      categoriesByGroup[groupName] = [];
    }
    categoriesByGroup[groupName].push(category);
  });
  
  // Create sections grouped by component group, then by category
  const groupSections = Object.keys(categoriesByGroup).map(groupName => {
    const isIncluded = includedGroups.has(groupName);
    const groupNameEscaped = escapeHtml(groupName);
    const excludedClass = isIncluded ? '' : 'excluded';
    
    // Calculate group total
    const groupTotal = categoriesByGroup[groupName].reduce((sum, category) => {
      return sum + itemsByCategory[category].reduce((catSum, item) => catSum + item.subtotal, 0);
    }, 0);
    
    const groupItemCount = categoriesByGroup[groupName].reduce((sum, category) => {
      return sum + itemsByCategory[category].length;
    }, 0);
    
    // Create category sections within this group
    const categorySections = categoriesByGroup[groupName].map(category => {
      const categoryEscaped = escapeHtml(category);
      const categoryName = escapeHtml(formatCategoryName(category));
      const categoryTotal = itemsByCategory[category].reduce((sum, item) => sum + item.subtotal, 0);
      const itemCount = itemsByCategory[category].length;
      const tableHTML = createProductsTable(itemsByCategory[category]).outerHTML;
      const displayStyle = isIncluded ? 'block' : 'none';
      
      return `
        <div class="bundle-category-section ${excludedClass}" data-category="${categoryEscaped}" data-group="${groupNameEscaped}">
          <div class="category-toggle ${excludedClass}" data-category="${categoryEscaped}">
            <span class="category-name">${categoryName}</span>
            <span class="category-count">${itemCount} items</span>
            <span class="category-price">$${categoryTotal.toFixed(2)}</span>
          </div>
          <div class="category-items ${excludedClass}" id="category-${categoryEscaped}" style="display: ${displayStyle};">
            ${tableHTML}
          </div>
        </div>
      `;
    }).join('');
    
    return `
      <div class="bundle-group-section" data-group="${groupNameEscaped}">
        <div class="bundle-group-header">
          <h4 class="bundle-group-title">${groupNameEscaped}</h4>
          <span class="bundle-group-meta">${groupItemCount} items • $${groupTotal.toFixed(2)}</span>
        </div>
        <div class="bundle-group-categories">
          ${categorySections}
        </div>
      </div>
    `;
  }).join('');
  
  const html = `
    <div class="bundle-products">
      <h4 class="bundle-products-title">Kit Contents</h4>
      ${groupSections}
    </div>
  `;
  
  return parseHTML(html);
}

/**
 * Create products table using HTML template
 * @param {Array} items - Array of product items
 * @returns {HTMLElement}
 */
export function createProductsTable(items) {
  const tbodyRows = items.map(item => createProductRow(item).outerHTML).join('');
  
  const html = `
    <table class="products-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Product</th>
          <th>SKU</th>
          <th>Stock</th>
          <th>Qty</th>
          <th>Unit Price</th>
          <th>Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${tbodyRows}
      </tbody>
    </table>
  `;
  
  return parseHTML(html);
}

/**
 * Create product row using HTML template
 * @param {Object} item - Product item
 * @returns {HTMLElement}
 */
export function createProductRow(item) {
  const inventoryStatus = getInventoryStatus({ sku: item.sku }, getPrimaryWarehouse());
  const unitPrice = item.unitPrice || (item.subtotal / item.quantity);
  const imageUrl = escapeHtml(getProductImageUrl(item.sku));
  const itemName = escapeHtml(item.name);
  const itemReason = escapeHtml(item.reason);
  const itemSku = escapeHtml(item.sku);
  
  let stockText, stockClass;
  if (inventoryStatus === 'in_stock') {
    stockText = '✓ In Stock';
    stockClass = 'stock-status stock-in';
  } else if (inventoryStatus === 'low_stock') {
    stockText = '⚠ Low Stock';
    stockClass = 'stock-status stock-low';
  } else {
    stockText = '✗ Out of Stock';
    stockClass = 'stock-status stock-out';
  }
  
  const html = `
    <tr>
      <td>
        <img src="${imageUrl}" alt="${itemName}" class="product-thumbnail" onerror="this.style.display='none'">
      </td>
      <td>
        <div class="product-info">
          <div class="product-name">${itemName}</div>
          <div class="product-reason">${itemReason}</div>
        </div>
      </td>
      <td class="product-sku">${itemSku}</td>
      <td>
        <span class="${stockClass}">${stockText}</span>
      </td>
      <td>
        <div class="quantity-controls">
          <button class="qty-btn" data-sku="${itemSku}" data-action="decrease">-</button>
          <span class="qty-value">${item.quantity}</span>
          <button class="qty-btn" data-sku="${itemSku}" data-action="increase">+</button>
        </div>
      </td>
      <td class="product-unit-price">$${unitPrice.toFixed(2)}</td>
      <td class="product-subtotal">$${item.subtotal.toFixed(2)}</td>
    </tr>
  `;
  
  return parseHTML(html);
}

/**
 * Create bundle actions using HTML template
 * @returns {HTMLElement}
 */
export function createBundleActions() {
  const html = `
    <div class="bundle-actions">
      <a href="catalog" class="btn btn-outline-accent">Customize Kit in Catalog</a>
    </div>
  `;
  return parseHTML(html);
}

/**
 * Create quote actions using HTML template
 * @returns {HTMLElement}
 */
export function createQuoteActions() {
  // No quote actions needed
  return document.createElement('div');
}

/**
 * Create project notes using HTML template
 * @returns {HTMLElement}
 */
export function createProjectNotes() {
  const html = `
    <div class="project-notes">
      <label for="project-notes-textarea" class="project-notes-label">Project Notes</label>
      <textarea id="project-notes-textarea" class="project-notes-textarea" placeholder="Add contractor notes, special instructions, or reminders..."></textarea>
    </div>
  `;
  return parseHTML(html);
}

/**
 * Create empty state component
 * @param {string} title - Empty state title
 * @param {string} description - Empty state description
 * @param {Object} options - Optional configuration
 * @param {string} options.actionLabel - Label for action button
 * @param {string} options.actionId - ID for action button (for event binding)
 * @returns {string} HTML string
 */
export function createEmptyState(title = 'Your kit is empty', description = 'Add items from the catalog to get started', options = {}) {
  const { actionLabel, actionId } = options;
  
  const actionButton = actionLabel && actionId 
    ? `<button class="btn btn-primary btn-lg kit-empty-state-action" id="${actionId}">${escapeHtml(actionLabel)}</button>`
    : '';
  
  return `
    <div class="kit-empty-state">
      <h3 class="kit-empty-state-title">${escapeHtml(title)}</h3>
      <p class="kit-empty-state-description">${escapeHtml(description)}</p>
      ${actionButton}
    </div>
  `;
}

