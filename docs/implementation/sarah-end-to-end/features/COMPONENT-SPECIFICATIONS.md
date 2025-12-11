# Phase 6A Component Specifications

**Date**: December 2, 2025  
**Design Sprint - Day 2**: Component specifications for Sarah's workflow  
**Status**: In Progress

---

## 📋 Component Inventory

| Component | Used In | Priority | Reusable? |
|-----------|---------|----------|-----------|
| Selection Tile | Configurator | P0 | ✅ Yes |
| Product Row | BOM Review | P0 | ✅ Yes |
| Product Swap Panel | BOM Review | P0 | No |
| BOM Accordion | BOM Review | P0 | ✅ Yes |
| Build Card | Dashboard | P0 | ✅ Yes |
| Progress Bar | Dashboard | P0 | ✅ Yes |
| Collapsible Section | Dashboard | P0 | ✅ Yes |
| Build Info Form | Configurator | P0 | No |

**Priority Levels**:
- **P0**: Required for MVP (all 3 screens)
- **P1**: Nice to have
- **P2**: Future enhancement

---

## 🎨 Component 1: Selection Tile

### Overview
Visual selection component with photo/icon and checkmark overlay. Replaces traditional checkboxes and radio buttons.

### Variants
1. **Photo Tile** - For variants, packages (large)
2. **Product Tile** - For product swaps (medium)
3. **Icon Tile** - For construction phases (compact)

### Props/Parameters
```javascript
{
  type: 'photo' | 'product' | 'icon',
  mode: 'single' | 'multi',  // Single-select or multi-select
  image: string,              // Photo URL or icon path
  title: string,              // Primary label
  subtitle: string,           // Secondary text (optional)
  price: number,              // Price (optional, shows as +$X or -$X)
  badge: string,              // Badge text (e.g., "CURRENT", "Premium")
  selected: boolean,          // Selection state
  disabled: boolean,          // Disabled state
  onClick: function,          // Click handler
}
```

### HTML Structure

**Photo Tile** (Variants, Packages):
```html
<div class="selection-tile selection-tile-photo" data-selected="false">
  <div class="selection-tile-image" style="background-image: url(...)">
    <!-- Checkmark badge appears here when selected -->
  </div>
  <div class="selection-tile-content">
    <h4 class="selection-tile-title">Bonus Room</h4>
    <p class="selection-tile-subtitle">200 sq ft additional space</p>
    <p class="selection-tile-price">+$15,000</p>
  </div>
</div>
```

**Product Tile** (Product Swaps):
```html
<div class="selection-tile selection-tile-product" data-selected="true">
  <div class="selection-tile-image" style="background-image: url(...)">
    <!-- Checkmark badge -->
  </div>
  <div class="selection-tile-content">
    <h5 class="selection-tile-title">2x10 Dimensional</h5>
    <p class="selection-tile-brand">BuildMaster</p>
    <p class="selection-tile-price">$18.50</p>
    <span class="selection-tile-badge">CURRENT</span>
  </div>
</div>
```

**Icon Tile** (Phases):
```html
<div class="selection-tile selection-tile-icon" data-selected="true">
  <div class="selection-tile-icon-image">
    <svg><!-- Phase icon --></svg>
  </div>
  <div class="selection-tile-content">
    <h5 class="selection-tile-title">Foundation & Framing</h5>
    <p class="selection-tile-price">Est. $45,234</p>
  </div>
</div>
```

### CSS Classes

```css
/* Base tile */
.selection-tile {
  position: relative;
  border: 2px solid var(--color-border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: var(--color-white);
}

.selection-tile:hover {
  border-color: var(--color-cta);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.selection-tile[data-selected="true"] {
  border-color: var(--color-cta);
}

/* Checkmark badge (appears when selected) */
.selection-tile[data-selected="true"]::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-cta);
  color: white;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  z-index: 10;
}

/* Photo variant */
.selection-tile-photo {
  width: 200px;
}

.selection-tile-photo .selection-tile-image {
  height: 140px;
  background-size: cover;
  background-position: center;
  border-radius: 6px 6px 0 0;
}

.selection-tile-photo .selection-tile-content {
  padding: var(--spacing-small);
}

/* Product variant */
.selection-tile-product {
  width: 120px;
}

.selection-tile-product .selection-tile-image {
  height: 100px;
  background-size: cover;
  background-position: center;
  border-radius: 6px 6px 0 0;
}

.selection-tile-product .selection-tile-content {
  padding: 8px;
}

/* Icon variant */
.selection-tile-icon {
  width: 180px;
}

.selection-tile-icon .selection-tile-icon-image {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-background-light);
}

.selection-tile-icon svg {
  width: 48px;
  height: 48px;
  color: var(--color-cta);
}

/* Typography */
.selection-tile-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--color-text);
}

.selection-tile-subtitle {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 8px 0;
}

.selection-tile-price {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-cta);
  margin: 0;
}

.selection-tile-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--color-background-light);
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-light);
  margin-top: 4px;
}

/* Disabled state */
.selection-tile[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

.selection-tile[disabled]:hover {
  border-color: var(--color-border);
  box-shadow: none;
}
```

### JavaScript Behavior

```javascript
class SelectionTile {
  constructor(element, options) {
    this.element = element;
    this.mode = options.mode || 'single';
    this.group = options.group; // For single-select groups
    this.selected = element.dataset.selected === 'true';
    this.onSelect = options.onSelect;
    
    this.init();
  }
  
  init() {
    this.element.addEventListener('click', () => this.handleClick());
  }
  
  handleClick() {
    if (this.element.hasAttribute('disabled')) return;
    
    if (this.mode === 'single') {
      // Deselect all in group
      document.querySelectorAll(`[data-group="${this.group}"]`).forEach(tile => {
        tile.dataset.selected = 'false';
      });
      // Select this one
      this.element.dataset.selected = 'true';
      this.selected = true;
    } else {
      // Multi-select: toggle
      this.selected = !this.selected;
      this.element.dataset.selected = this.selected;
    }
    
    if (this.onSelect) {
      this.onSelect(this.selected);
    }
  }
}
```

### Accessibility

```html
<div 
  class="selection-tile" 
  role="checkbox" 
  aria-checked="false"
  tabindex="0"
  aria-label="Bonus Room, 200 sq ft, adds $15,000"
>
  <!-- Content -->
</div>
```

**Keyboard Support**:
- `Space` or `Enter`: Toggle selection
- `Tab`: Navigate between tiles
- Screen reader announces: "Bonus Room, checkbox, not checked, 200 sq ft, adds $15,000"

### Source Reference

**Existing implementation**: `blocks/project-builder/project-builder.css`

```css
/* Lines 82-120 (photo tile pattern) */
.wizard-option-photo {
  position: relative;
  background-size: cover;
  background-position: center;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.wizard-option-input:checked + .wizard-photo-overlay::after {
  content: '✓';
  position: absolute;
  top: 8px;
  right: 8px;
  background: var(--color-cta);
  /* ... checkmark styling ... */
}
```

**Reuse Strategy**: Extract into shared component in `blocks/selection-tile/`

---

## 📦 Component 2: Product Row

### Overview
Compact product display for BOM line items, similar to mini-cart styling. Shows product image, details, quantity, price, and actions.

### Props/Parameters
```javascript
{
  product: {
    id: string,
    sku: string,
    name: string,
    image: string,
    brand: string,
    specs: string,        // e.g., "Species: SPF"
    quantity: number,
    unitPrice: number,
    subtotal: number,
    badge: string,        // e.g., "★ Premium Package Override"
  },
  showActions: boolean,   // Show Swap/Remove buttons
  onSwap: function,
  onRemove: function,
  onQuantityChange: function,
}
```

### HTML Structure

```html
<div class="product-row" data-sku="SKU12345">
  <div class="product-row-image">
    <img src="..." alt="Product name" width="60" height="60">
  </div>
  
  <div class="product-row-info">
    <h5 class="product-row-name">2x10 x 12' Dimensional Lumber</h5>
    <p class="product-row-meta">Brand: BuildMaster • Species: SPF</p>
    <span class="product-row-badge">★ Premium Package Override</span>
  </div>
  
  <div class="product-row-quantity">
    <span class="quantity-value">64 EA</span>
  </div>
  
  <div class="product-row-unit-price">
    <span class="price-value">$18.50</span>
  </div>
  
  <div class="product-row-subtotal">
    <span class="subtotal-value">$1,184.00</span>
  </div>
  
  <div class="product-row-actions">
    <button class="btn-text" data-action="swap">Swap Product</button>
    <button class="btn-text" data-action="remove">Remove</button>
  </div>
</div>
```

### CSS Classes

```css
.product-row {
  display: grid;
  grid-template-columns: 60px 1fr auto auto auto auto;
  gap: var(--spacing-medium);
  align-items: center;
  padding: var(--spacing-small) 0;
  border-bottom: 1px solid var(--color-border-light);
}

.product-row-image img {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid var(--color-border-light);
}

.product-row-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-row-name {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.product-row-meta {
  font-size: 12px;
  color: var(--color-text-light);
  margin: 0;
}

.product-row-badge {
  display: inline-block;
  font-size: 11px;
  color: var(--color-cta);
  font-weight: 600;
}

.product-row-quantity,
.product-row-unit-price,
.product-row-subtotal {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
  text-align: right;
  white-space: nowrap;
}

.product-row-actions {
  display: flex;
  gap: var(--spacing-small);
}

.btn-text {
  background: none;
  border: none;
  color: var(--color-cta);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 8px;
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.btn-text:hover {
  opacity: 0.8;
}

/* Responsive */
@media (max-width: 768px) {
  .product-row {
    grid-template-columns: 60px 1fr;
    gap: var(--spacing-small);
  }
  
  .product-row-quantity,
  .product-row-unit-price,
  .product-row-subtotal {
    grid-column: 2;
    text-align: left;
  }
}
```

### Source Reference

**Similar pattern**: `scripts/wizard/wizard-ui-components.js` lines 14-51 (`createSimpleProductRow`)

```javascript
export function createSimpleProductRow(item) {
  return `
    <div class="simple-list-row" data-sku="${itemSku}">
      <div class="simple-list-col-item">
        <div class="simple-list-item-image"></div>
        <div class="simple-list-item-info">
          <div class="simple-list-item-name">${itemName}</div>
          <div class="simple-list-item-sku">SKU: ${itemSku}</div>
        </div>
      </div>
      <!-- ... quantity, price, total, actions ... -->
    </div>
  `;
}
```

**Reuse Strategy**: Adapt `simple-list-row` pattern with Swap/Remove actions

---

## 🔄 Component 3: Product Swap Panel

### Overview
Inline expansion panel that shows CCDM-filtered product alternatives when user clicks "Swap Product".

### Props/Parameters
```javascript
{
  currentProduct: {
    id: string,
    sku: string,
    name: string,
    image: string,
    price: number,
  },
  alternatives: Array<{
    id: string,
    sku: string,
    name: string,
    image: string,
    brand: string,
    price: number,
    useCase: string,      // e.g., "Better for outdoor use"
    isCurrent: boolean,
  }>,
  onCancel: function,
  onApply: function(selectedProduct),
}
```

### HTML Structure

```html
<div class="product-swap-panel" data-expanded="true">
  <div class="product-swap-header">
    <h5>🔄 Select Replacement (4 compatible products)</h5>
  </div>
  
  <div class="product-swap-options">
    <!-- Product tiles (using Selection Tile component) -->
    <div class="selection-tile selection-tile-product" data-selected="true">
      <div class="selection-tile-image" style="background-image: url(...)"></div>
      <div class="selection-tile-content">
        <h5 class="selection-tile-title">2x10 Dimensional</h5>
        <p class="selection-tile-brand">BuildMaster</p>
        <p class="selection-tile-price">$18.50</p>
        <span class="selection-tile-badge">CURRENT</span>
      </div>
    </div>
    
    <!-- Repeat for each alternative -->
  </div>
  
  <div class="product-swap-actions">
    <button class="btn btn-secondary" data-action="cancel">Cancel</button>
    <button class="btn btn-cta" data-action="apply">Apply Swap</button>
  </div>
</div>
```

### CSS Classes

```css
.product-swap-panel {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  margin: var(--spacing-small) 0;
  background: var(--color-background-light);
  border-radius: 8px;
}

.product-swap-panel[data-expanded="true"] {
  max-height: 600px;
  opacity: 1;
  padding: var(--spacing-medium);
}

.product-swap-header h5 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 var(--spacing-medium) 0;
  color: var(--color-text);
}

.product-swap-options {
  display: flex;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
  overflow-x: auto;
  padding-bottom: var(--spacing-small);
}

.product-swap-actions {
  display: flex;
  gap: var(--spacing-small);
  justify-content: flex-end;
}

/* Animation - smooth expand/collapse */
@keyframes slideDown {
  from {
    max-height: 0;
    opacity: 0;
  }
  to {
    max-height: 600px;
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    max-height: 600px;
    opacity: 1;
  }
  to {
    max-height: 0;
    opacity: 0;
  }
}
```

### JavaScript Behavior

```javascript
class ProductSwapPanel {
  constructor(productRow, alternatives) {
    this.productRow = productRow;
    this.alternatives = alternatives;
    this.selectedProduct = alternatives.find(p => p.isCurrent);
    this.expanded = false;
  }
  
  show() {
    const panel = this.render();
    this.productRow.insertAdjacentElement('afterend', panel);
    
    // Trigger animation
    setTimeout(() => {
      panel.dataset.expanded = 'true';
    }, 10);
    
    this.expanded = true;
  }
  
  hide() {
    const panel = this.productRow.nextElementSibling;
    if (panel && panel.classList.contains('product-swap-panel')) {
      panel.dataset.expanded = 'false';
      
      // Remove after animation
      setTimeout(() => {
        panel.remove();
      }, 300);
    }
    
    this.expanded = false;
  }
  
  render() {
    const panel = document.createElement('div');
    panel.className = 'product-swap-panel';
    panel.dataset.expanded = 'false';
    
    const tilesHTML = this.alternatives.map(product => {
      return this.renderProductTile(product);
    }).join('');
    
    panel.innerHTML = `
      <div class="product-swap-header">
        <h5>🔄 Select Replacement (${this.alternatives.length} compatible products)</h5>
      </div>
      <div class="product-swap-options">
        ${tilesHTML}
      </div>
      <div class="product-swap-actions">
        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
        <button class="btn btn-cta" data-action="apply">Apply Swap</button>
      </div>
    `;
    
    this.attachEventListeners(panel);
    
    return panel;
  }
  
  attachEventListeners(panel) {
    // Tile selection
    panel.querySelectorAll('.selection-tile').forEach(tile => {
      tile.addEventListener('click', (e) => {
        // Deselect all
        panel.querySelectorAll('.selection-tile').forEach(t => {
          t.dataset.selected = 'false';
        });
        // Select clicked
        tile.dataset.selected = 'true';
        this.selectedProduct = this.alternatives.find(p => 
          p.sku === tile.dataset.sku
        );
      });
    });
    
    // Cancel
    panel.querySelector('[data-action="cancel"]').addEventListener('click', () => {
      this.hide();
    });
    
    // Apply
    panel.querySelector('[data-action="apply"]').addEventListener('click', () => {
      if (this.onApply) {
        this.onApply(this.selectedProduct);
      }
      this.hide();
    });
  }
}
```

---

## 📁 Component 4: BOM Accordion

### Overview
Collapsible phase sections that group BOM line items by construction phase.

### Props/Parameters
```javascript
{
  phase: {
    id: string,
    name: string,              // "Phase 1: Foundation & Framing"
    totalCost: number,
    percentage: number,        // % of total BOM
    categories: Array<{
      name: string,            // "Framing Lumber"
      items: Array<Product>,
    }>,
  },
  defaultExpanded: boolean,    // First phase expanded by default
  onToggle: function,
}
```

### HTML Structure

```html
<div class="bom-accordion" data-phase-id="phase-1">
  <div class="bom-accordion-header" role="button" tabindex="0">
    <span class="accordion-icon">▼</span>
    <h4 class="accordion-title">Phase 1: Foundation & Framing</h4>
    <span class="accordion-total">$45,234.00 (54%)</span>
  </div>
  
  <div class="bom-accordion-content" data-expanded="true">
    <div class="bom-category">
      <h5 class="category-name">Framing Lumber</h5>
      
      <div class="category-items">
        <!-- Product rows here -->
        <div class="product-row">...</div>
        <div class="product-row">...</div>
      </div>
    </div>
    
    <!-- More categories... -->
  </div>
</div>
```

### CSS Classes

```css
.bom-accordion {
  border: 1px solid var(--color-border);
  border-radius: 8px;
  margin-bottom: var(--spacing-small);
  overflow: hidden;
}

.bom-accordion-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-medium);
  background: var(--color-background-light);
  cursor: pointer;
  transition: background 0.2s ease;
}

.bom-accordion-header:hover {
  background: var(--color-background);
}

.accordion-icon {
  font-size: 14px;
  transition: transform 0.3s ease-in-out;
  color: var(--color-text-light);
}

.bom-accordion[data-expanded="false"] .accordion-icon {
  transform: rotate(-90deg);
}

.accordion-title {
  flex: 1;
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.accordion-total {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-cta);
}

.bom-accordion-content {
  max-height: 5000px;
  overflow: hidden;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
  opacity: 1;
}

.bom-accordion[data-expanded="false"] .bom-accordion-content {
  max-height: 0;
  opacity: 0;
}

.bom-category {
  padding: var(--spacing-medium);
  border-top: 1px solid var(--color-border-light);
}

.bom-category:first-child {
  border-top: none;
}

.category-name {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 var(--spacing-small) 0;
  color: var(--color-text);
}

.category-items {
  display: flex;
  flex-direction: column;
}
```

### JavaScript Behavior

```javascript
class BOMAccordion {
  constructor(element) {
    this.element = element;
    this.header = element.querySelector('.bom-accordion-header');
    this.content = element.querySelector('.bom-accordion-content');
    this.expanded = element.dataset.expanded === 'true';
    
    this.init();
  }
  
  init() {
    this.header.addEventListener('click', () => this.toggle());
    this.header.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggle();
      }
    });
  }
  
  toggle() {
    this.expanded = !this.expanded;
    this.element.dataset.expanded = this.expanded;
    
    // Trigger custom event for analytics
    this.element.dispatchEvent(new CustomEvent('accordion-toggle', {
      detail: { phaseId: this.element.dataset.phaseId, expanded: this.expanded }
    }));
  }
  
  expand() {
    this.expanded = true;
    this.element.dataset.expanded = 'true';
  }
  
  collapse() {
    this.expanded = false;
    this.element.dataset.expanded = 'false';
  }
}
```

---

## 🏠 Component 5: Build Card

### Overview
Dashboard card showing build summary, spend progress, and collapsible materials list.

### Props/Parameters
```javascript
{
  build: {
    id: string,
    name: string,              // "House #47"
    template: string,          // "The Sedona"
    configuration: string,     // "Bonus Room • Desert Ridge Premium"
    location: string,          // "Desert Ridge Subdivision • Lot 47"
    bomEstimate: number,
    totalSpent: number,
    percentComplete: number,
    orders: Array<{
      phase: string,
      amount: number,
      orderId: string,
      date: string,
    }>,
    status: 'configured' | 'bom_generated' | 'in_progress' | 'complete',
  },
  defaultExpanded: boolean,
}
```

### HTML Structure

```html
<div class="build-card" data-build-id="build-47">
  <div class="build-card-header">
    <h4 class="build-card-title">House #47 • The Sedona</h4>
    <p class="build-card-meta">Bonus Room • Desert Ridge Premium</p>
    <p class="build-card-location">Desert Ridge Subdivision • Lot 47</p>
  </div>
  
  <div class="build-card-progress">
    <div class="progress-header">
      <span class="progress-label">Total Spend</span>
      <span class="progress-value">$83,227 of $111,727 estimated</span>
    </div>
    <div class="progress-bar">
      <div class="progress-bar-fill" style="width: 75%"></div>
    </div>
    <span class="progress-percent">75%</span>
  </div>
  
  <div class="build-card-materials">
    <div class="materials-header" role="button" tabindex="0">
      <span class="materials-icon">▶</span>
      <span class="materials-title">Materials Ordered (2 of 3 phases)</span>
    </div>
    
    <div class="materials-list" data-expanded="false">
      <div class="material-order">
        <div class="order-status">✓</div>
        <div class="order-info">
          <h5>Foundation & Framing</h5>
          <p>Ordered: Nov 28, 2025 • Order #ORD-12345</p>
        </div>
        <div class="order-amount">$45,234</div>
        <div class="order-actions">
          <button class="btn-text">View Order</button>
          <button class="btn-text">Reorder</button>
        </div>
      </div>
      
      <!-- More orders... -->
    </div>
  </div>
  
  <div class="build-card-actions">
    <button class="btn btn-cta">Order Next Phase →</button>
    <button class="btn btn-secondary">View BOM</button>
    <button class="btn btn-secondary">Clone Build</button>
  </div>
</div>
```

### CSS Classes

```css
.build-card {
  background: var(--color-white);
  border: 1px solid var(--color-border);
  border-radius: 8px;
  padding: var(--spacing-medium);
  margin-bottom: var(--spacing-medium);
}

.build-card-header {
  margin-bottom: var(--spacing-medium);
}

.build-card-title {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--color-text);
}

.build-card-meta,
.build-card-location {
  font-size: 14px;
  color: var(--color-text-light);
  margin: 0 0 4px 0;
}

.build-card-progress {
  margin-bottom: var(--spacing-medium);
  padding: var(--spacing-small);
  background: var(--color-background-light);
  border-radius: 6px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.progress-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border-light);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-bar-fill {
  height: 100%;
  background: var(--color-cta);
  transition: width 0.5s ease-in-out;
}

.progress-percent {
  font-size: 12px;
  color: var(--color-text-light);
}

/* Collapsible Materials List */
.build-card-materials {
  margin-bottom: var(--spacing-medium);
}

.materials-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-small);
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 4px;
}

.materials-header:hover {
  background: var(--color-background-light);
}

.materials-icon {
  font-size: 12px;
  transition: transform 0.3s ease-in-out;
  color: var(--color-text-light);
}

.materials-list[data-expanded="true"] ~ .materials-header .materials-icon {
  transform: rotate(90deg);
}

.materials-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.materials-list {
  max-height: 0;
  overflow: hidden;
  opacity: 0;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.materials-list[data-expanded="true"] {
  max-height: 500px;
  opacity: 1;
  padding-top: var(--spacing-small);
}

.material-order {
  display: grid;
  grid-template-columns: 24px 1fr auto auto;
  gap: var(--spacing-small);
  align-items: start;
  padding: var(--spacing-small);
  margin-bottom: var(--spacing-small);
  background: var(--color-background-light);
  border-radius: 4px;
}

.order-status {
  font-size: 18px;
  color: var(--color-success);
}

.order-info h5 {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 4px 0;
  color: var(--color-text);
}

.order-info p {
  font-size: 12px;
  color: var(--color-text-light);
  margin: 0;
}

.order-amount {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.order-actions {
  display: flex;
  gap: var(--spacing-small);
}

.build-card-actions {
  display: flex;
  gap: var(--spacing-small);
  flex-wrap: wrap;
}
```

### JavaScript Behavior

```javascript
class BuildCard {
  constructor(element) {
    this.element = element;
    this.materialsHeader = element.querySelector('.materials-header');
    this.materialsList = element.querySelector('.materials-list');
    this.expanded = this.materialsList.dataset.expanded === 'true';
    
    this.init();
  }
  
  init() {
    this.materialsHeader.addEventListener('click', () => this.toggleMaterials());
    this.materialsHeader.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleMaterials();
      }
    });
  }
  
  toggleMaterials() {
    this.expanded = !this.expanded;
    this.materialsList.dataset.expanded = this.expanded;
    
    // Update icon
    const icon = this.materialsHeader.querySelector('.materials-icon');
    icon.textContent = this.expanded ? '▼' : '▶';
  }
}
```

---

## 📊 Component 6: Progress Bar

### Overview
Visual progress indicator showing spend vs. estimate.

### Props/Parameters
```javascript
{
  current: number,      // Amount spent
  total: number,        // Estimated total
  label: string,        // "Total Spend"
  showPercentage: boolean,
  animate: boolean,     // Animate on load
}
```

### HTML Structure

```html
<div class="progress-bar-component">
  <div class="progress-header">
    <span class="progress-label">Total Spend</span>
    <span class="progress-value">$83,227 of $111,727 estimated</span>
  </div>
  <div class="progress-bar">
    <div class="progress-bar-fill" data-percent="75" style="width: 0%"></div>
  </div>
  <span class="progress-percent">75%</span>
</div>
```

### CSS Classes

```css
.progress-bar-component {
  width: 100%;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.progress-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.progress-value {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: var(--color-border-light);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}

.progress-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-cta), var(--color-cta-dark));
  transition: width 0.5s ease-in-out;
  border-radius: 4px;
}

.progress-percent {
  font-size: 12px;
  color: var(--color-text-light);
}

/* Color variants based on progress */
.progress-bar-fill[data-percent="100"] {
  background: linear-gradient(90deg, var(--color-success), var(--color-success-dark));
}

.progress-bar-fill[data-percent^="9"] {
  background: linear-gradient(90deg, var(--color-warning), var(--color-warning-dark));
}
```

### JavaScript Behavior

```javascript
class ProgressBar {
  constructor(element, options) {
    this.element = element;
    this.fill = element.querySelector('.progress-bar-fill');
    this.current = options.current;
    this.total = options.total;
    this.animate = options.animate !== false;
    
    this.init();
  }
  
  init() {
    const percent = Math.min((this.current / this.total) * 100, 100);
    this.fill.dataset.percent = Math.round(percent);
    
    if (this.animate) {
      // Start at 0, animate to target
      setTimeout(() => {
        this.fill.style.width = `${percent}%`;
      }, 100);
    } else {
      this.fill.style.width = `${percent}%`;
    }
  }
  
  update(current, total) {
    this.current = current;
    this.total = total;
    const percent = Math.min((this.current / this.total) * 100, 100);
    this.fill.dataset.percent = Math.round(percent);
    this.fill.style.width = `${percent}%`;
  }
}
```

---

## 📋 Component 7: Collapsible Section

### Overview
Generic collapsible section with smooth animations. Used for materials list, filters, etc.

### Props/Parameters
```javascript
{
  title: string,
  defaultExpanded: boolean,
  icon: 'arrow' | 'plus',
  onToggle: function,
}
```

### HTML Structure

```html
<div class="collapsible-section" data-expanded="true">
  <div class="collapsible-header" role="button" tabindex="0">
    <span class="collapsible-icon">▼</span>
    <h5 class="collapsible-title">Materials Ordered (2 of 3 phases)</h5>
  </div>
  
  <div class="collapsible-content">
    <!-- Content here -->
  </div>
</div>
```

### CSS Classes

```css
.collapsible-section {
  border-radius: 4px;
}

.collapsible-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-small);
  padding: var(--spacing-small);
  cursor: pointer;
  transition: background 0.2s ease;
  border-radius: 4px;
}

.collapsible-header:hover {
  background: var(--color-background-light);
}

.collapsible-icon {
  font-size: 12px;
  transition: transform 0.3s ease-in-out;
  color: var(--color-text-light);
}

.collapsible-section[data-expanded="false"] .collapsible-icon {
  transform: rotate(-90deg);
}

.collapsible-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--color-text);
}

.collapsible-content {
  max-height: 1000px;
  overflow: hidden;
  opacity: 1;
  transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
}

.collapsible-section[data-expanded="false"] .collapsible-content {
  max-height: 0;
  opacity: 0;
}
```

---

## 🎨 Animation Specifications

All animations use **ease-in-out** timing for smooth, natural motion.

### Expand/Collapse
```css
transition: max-height 0.3s ease-in-out, opacity 0.3s ease-in-out;
```

### Icon Rotation
```css
transition: transform 0.3s ease-in-out;
```

### Progress Bar Fill
```css
transition: width 0.5s ease-in-out;
```

### Hover States
```css
transition: all 0.2s ease;
```

---

## 🎯 Accessibility Summary

### Keyboard Support
- `Tab`: Navigate between interactive elements
- `Enter` / `Space`: Activate buttons, toggle selections
- `Escape`: Close modals/panels

### ARIA Attributes
- `role="button"` on clickable non-button elements
- `aria-label` for icon-only buttons
- `aria-checked` for selection tiles
- `aria-expanded` for collapsible sections
- `tabindex="0"` for keyboard accessibility

### Screen Reader Support
- Meaningful labels for all interactive elements
- Status announcements for state changes
- Grouped related content with proper headings

---

## 📦 Reusable Components Summary

| Component | Reuse Across Screens | Shared Block? |
|-----------|----------------------|---------------|
| Selection Tile | Build Configurator, Product Swap | Yes - `blocks/selection-tile/` |
| Product Row | BOM Review, Cart, Orders | Yes - `blocks/product-row/` |
| Progress Bar | Dashboard, Order Tracking | Yes - `blocks/progress-bar/` |
| Collapsible Section | Dashboard, Filters, FAQs | Yes - `blocks/collapsible/` |
| BOM Accordion | BOM Review | Screen-specific |
| Product Swap Panel | BOM Review | Screen-specific |
| Build Card | Dashboard | Screen-specific |

---

## ✅ Next Steps (Day 3)

Tomorrow: **Map user flows and interactions**
- Click-through flows for each screen
- State transitions
- Error handling
- Loading states
- Success confirmations

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: ✅ Complete  
**Next**: Day 3 - User Flows & Interactions

