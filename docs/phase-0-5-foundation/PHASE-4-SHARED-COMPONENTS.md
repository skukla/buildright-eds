# Phase 4: Shared Components

## Overview

**Duration**: 2 weeks  
**Dependencies**: Phase 2 (icons), Phase 3 (architecture)  
**Status**: Not Started

Build reusable EDS blocks that are used across multiple persona flows. These components follow EDS best practices and use the custom icon library.

---

## Objectives

1. Build 5 shared EDS blocks
2. Ensure blocks follow EDS patterns
3. Integrate with custom icon library
4. Create component documentation
5. Establish testing patterns for blocks

---

## EDS Block Pattern

All blocks follow this structure:
```
blocks/
└── block-name/
    ├── block-name.html   (optional: template structure)
    ├── block-name.css    (block-specific styles)
    └── block-name.js     (block decoration logic)
```

**Key Principles** (from Phase 0 research):
- Block JS decorates existing DOM or generates new DOM
- Follow EDS lifecycle: `loadEager` → `loadLazy` → `loadDelayed`
- Use design system CSS variables
- Emit events for inter-block communication

---

## Task 1: Loading Overlay Block

### 1.1 Create Block Structure

**Purpose**: Display loading state during CCDM filtering with progress message.

**File**: `blocks/loading-overlay/loading-overlay.html`

```html
<div class="loading-overlay">
  <div class="loading-spinner"></div>
  <p class="loading-message">Loading...</p>
  <div class="loading-details"></div>
</div>
```

**File**: `blocks/loading-overlay/loading-overlay.css`

```css
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease;
}

.loading-overlay.active {
  opacity: 1;
  pointer-events: auto;
}

.loading-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid var(--color-neutral-200);
  border-top-color: var(--color-brand-500);
  border-radius: 50%;
  animation: spinner-rotate 0.8s linear infinite;
}

@keyframes spinner-rotate {
  to { transform: rotate(360deg); }
}

.loading-message {
  margin-top: var(--spacing-medium);
  font-size: var(--type-heading-3-font-size);
  font-weight: var(--type-heading-3-font-weight);
  color: var(--color-neutral-900);
}

.loading-details {
  margin-top: var(--spacing-small);
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
  max-width: 500px;
  text-align: center;
}
```

**File**: `blocks/loading-overlay/loading-overlay.js`

```javascript
/**
 * Loading Overlay Block
 * Shows loading state during async operations (especially CCDM filtering)
 */

export default function decorate(block) {
  // Block is already decorated from HTML
  // Add API for showing/hiding
  
  block.show = function(message, details = '') {
    const messageEl = block.querySelector('.loading-message');
    const detailsEl = block.querySelector('.loading-details');
    
    if (messageEl) messageEl.textContent = message;
    if (detailsEl) detailsEl.textContent = details;
    
    block.classList.add('active');
  };
  
  block.hide = function() {
    block.classList.remove('active');
  };
  
  // Listen for loading events
  window.addEventListener('loading:start', (e) => {
    const { message, details } = e.detail || {};
    block.show(message || 'Loading...', details || '');
  });
  
  window.addEventListener('loading:end', () => {
    block.hide();
  });
  
  return block;
}

/**
 * Helper functions for triggering loading states
 */
export function showLoading(message, details = '') {
  window.dispatchEvent(new CustomEvent('loading:start', {
    detail: { message, details }
  }));
}

export function hideLoading() {
  window.dispatchEvent(new CustomEvent('loading:end'));
}
```

---

## Task 2: Wizard Vertical Progress Block

### 2.1 Create Block Structure

**Purpose**: Display vertical progress indicator for wizard flows (Marcus, David).

**File**: `blocks/wizard-vertical-progress/wizard-vertical-progress.html`

```html
<div class="wizard-vertical-progress">
  <div class="wizard-steps">
    <!-- Steps populated by JS -->
  </div>
</div>
```

**File**: `blocks/wizard-vertical-progress/wizard-vertical-progress.css`

```css
.wizard-vertical-progress {
  background: var(--color-neutral-50);
  border-right: 1px solid var(--color-neutral-200);
  padding: var(--spacing-large);
  min-height: 100vh;
  position: sticky;
  top: 0;
}

.wizard-steps {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-medium);
}

.wizard-step {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-small);
  cursor: pointer;
  padding: var(--spacing-small);
  border-radius: var(--shape-border-radius-2);
  transition: background 0.2s ease;
}

.wizard-step:hover {
  background: var(--color-neutral-100);
}

.wizard-step.active {
  background: var(--color-brand-50);
}

.wizard-step.completed {
  opacity: 0.7;
}

.wizard-step.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.wizard-step-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.wizard-step-icon .icon {
  width: 24px;
  height: 24px;
}

.wizard-step-icon.pending {
  color: var(--color-neutral-400);
}

.wizard-step-icon.active {
  color: var(--color-brand-500);
}

.wizard-step-icon.completed {
  color: var(--color-positive-500);
}

.wizard-step-content {
  flex: 1;
}

.wizard-step-title {
  font-size: var(--type-body-1-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-neutral-900);
  margin: 0;
}

.wizard-step-description {
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
  margin: 0.25rem 0 0;
}

/* Mobile responsive */
@media (max-width: 768px) {
  .wizard-vertical-progress {
    position: static;
    min-height: auto;
    border-right: none;
    border-bottom: 1px solid var(--color-neutral-200);
  }
  
  .wizard-steps {
    flex-direction: row;
    overflow-x: auto;
  }
  
  .wizard-step {
    flex-direction: column;
    min-width: 120px;
    text-align: center;
  }
  
  .wizard-step-description {
    display: none;
  }
}
```

**File**: `blocks/wizard-vertical-progress/wizard-vertical-progress.js`

```javascript
/**
 * Wizard Vertical Progress Block
 * Displays progress through wizard steps
 */

import { createIcon } from '../../scripts/icon-helper.js';

export default async function decorate(block) {
  const stepsContainer = block.querySelector('.wizard-steps');
  
  // Block API
  block.steps = [];
  block.currentStep = 0;
  
  /**
   * Initialize wizard with steps
   */
  block.initialize = function(steps) {
    this.steps = steps;
    this.render();
  };
  
  /**
   * Set active step
   */
  block.setActiveStep = function(stepIndex) {
    if (stepIndex < 0 || stepIndex >= this.steps.length) return;
    
    this.currentStep = stepIndex;
    this.render();
    
    // Emit event
    window.dispatchEvent(new CustomEvent('wizard:step-changed', {
      detail: { step: stepIndex, stepData: this.steps[stepIndex] }
    }));
  };
  
  /**
   * Mark step as completed
   */
  block.completeStep = function(stepIndex) {
    if (this.steps[stepIndex]) {
      this.steps[stepIndex].completed = true;
      this.render();
    }
  };
  
  /**
   * Render wizard steps
   */
  block.render = function() {
    stepsContainer.innerHTML = '';
    
    this.steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.className = 'wizard-step';
      
      // Determine state
      const isCompleted = step.completed;
      const isActive = index === this.currentStep;
      const isPending = !isCompleted && !isActive;
      const isDisabled = step.disabled || index > this.currentStep + 1;
      
      if (isCompleted) stepEl.classList.add('completed');
      if (isActive) stepEl.classList.add('active');
      if (isDisabled) stepEl.classList.add('disabled');
      
      // Icon
      const iconContainer = document.createElement('div');
      iconContainer.className = 'wizard-step-icon';
      
      let iconName, iconClass;
      if (isCompleted) {
        iconName = 'checkmark-circle';
        iconClass = 'completed';
      } else if (isActive) {
        iconName = 'circle-filled';
        iconClass = 'active';
      } else {
        iconName = 'circle-outline';
        iconClass = 'pending';
      }
      
      iconContainer.classList.add(iconClass);
      const icon = createIcon('wizard', iconName, 'medium');
      iconContainer.appendChild(icon);
      
      // Content
      const contentEl = document.createElement('div');
      contentEl.className = 'wizard-step-content';
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'wizard-step-title';
      titleEl.textContent = step.title;
      
      const descEl = document.createElement('p');
      descEl.className = 'wizard-step-description';
      descEl.textContent = step.description || '';
      
      contentEl.appendChild(titleEl);
      if (step.description) contentEl.appendChild(descEl);
      
      stepEl.appendChild(iconContainer);
      stepEl.appendChild(contentEl);
      
      // Click handler (if not disabled)
      if (!isDisabled) {
        stepEl.addEventListener('click', () => {
          this.setActiveStep(index);
        });
      }
      
      stepsContainer.appendChild(stepEl);
    });
  };
  
  return block;
}
```

---

## Task 3: Template Card Block

### 3.1 Create Block Structure

**Purpose**: Display floor plan templates (Sarah's dashboard).

**File**: `blocks/template-card/template-card.html`

```html
<div class="template-card">
  <div class="template-card-image">
    <img src="" alt="" loading="lazy">
  </div>
  <div class="template-card-content">
    <h3 class="template-card-title"></h3>
    <div class="template-card-specs"></div>
    <div class="template-card-actions"></div>
  </div>
</div>
```

**File**: `blocks/template-card/template-card.css`

```css
.template-card {
  background: white;
  border-radius: var(--shape-border-radius-3);
  box-shadow: var(--shape-shadow-2);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.template-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shape-shadow-3);
}

.template-card-image {
  position: relative;
  width: 100%;
  padding-top: 66.67%; /* 3:2 aspect ratio */
  background: var(--color-neutral-100);
  overflow: hidden;
}

.template-card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-card-content {
  padding: var(--spacing-medium);
}

.template-card-title {
  font-size: var(--type-heading-4-font-size);
  font-weight: var(--type-heading-4-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 var(--spacing-small);
}

.template-card-specs {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-small);
  margin-bottom: var(--spacing-medium);
}

.template-spec {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
}

.template-spec .icon {
  width: 16px;
  height: 16px;
  color: var(--color-neutral-500);
}

.template-card-actions {
  display: flex;
  gap: var(--spacing-small);
}

.template-card-badge {
  position: absolute;
  top: var(--spacing-small);
  right: var(--spacing-small);
  background: var(--color-brand-500);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: var(--shape-border-radius-2);
  font-size: var(--type-body-2-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
}
```

**File**: `blocks/template-card/template-card.js`

```javascript
/**
 * Template Card Block
 * Display floor plan templates (for Sarah)
 */

import { createIcon } from '../../scripts/icon-helper.js';

export default function decorate(block) {
  // Block can be initialized with data
  
  block.setData = function(templateData) {
    this.data = templateData;
    this.render();
  };
  
  block.render = function() {
    if (!this.data) return;
    
    const { name, sqft, stories, bedrooms, bathrooms, image, finishedImage, variants } = this.data;
    
    // Update image
    const img = block.querySelector('.template-card-image img');
    img.src = image || '/images/floor-plans/placeholder.png';
    img.alt = `${name} floor plan`;
    
    // Add badge if has variants
    if (variants && variants.length > 1) {
      const imageContainer = block.querySelector('.template-card-image');
      const badge = document.createElement('div');
      badge.className = 'template-card-badge';
      badge.textContent = `${variants.length} Variants`;
      imageContainer.appendChild(badge);
    }
    
    // Update title
    const title = block.querySelector('.template-card-title');
    title.textContent = name;
    
    // Update specs
    const specsContainer = block.querySelector('.template-card-specs');
    specsContainer.innerHTML = '';
    
    const specs = [
      { icon: 'blueprint', label: `${sqft.toLocaleString()} sq ft` },
      { icon: 'project', label: `${stories} ${stories === 1 ? 'Story' : 'Stories'}` },
      { icon: 'interior', label: `${bedrooms} BR / ${bathrooms} BA` }
    ];
    
    specs.forEach(spec => {
      const specEl = document.createElement('div');
      specEl.className = 'template-spec';
      
      const icon = createIcon('construction', spec.icon, 'small');
      specEl.appendChild(icon);
      
      const label = document.createElement('span');
      label.textContent = spec.label;
      specEl.appendChild(label);
      
      specsContainer.appendChild(specEl);
    });
    
    // Update actions
    const actionsContainer = block.querySelector('.template-card-actions');
    actionsContainer.innerHTML = '';
    
    const viewBtn = document.createElement('button');
    viewBtn.className = 'btn btn-secondary';
    viewBtn.textContent = 'View Details';
    viewBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('template:view', {
        detail: { template: this.data }
      }));
    });
    
    const orderBtn = document.createElement('button');
    orderBtn.className = 'btn btn-primary';
    orderBtn.textContent = 'Order Materials';
    orderBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      window.dispatchEvent(new CustomEvent('template:order', {
        detail: { template: this.data }
      }));
    });
    
    actionsContainer.appendChild(viewBtn);
    actionsContainer.appendChild(orderBtn);
  };
  
  // Click on card (excluding buttons)
  block.addEventListener('click', () => {
    if (block.data) {
      window.dispatchEvent(new CustomEvent('template:select', {
        detail: { template: block.data }
      }));
    }
  });
  
  return block;
}
```

---

## Task 4: Product Tile Block

### 4.2 Create Block Structure

**Purpose**: Display product selection tiles in wizards and builders.

**File**: `blocks/product-tile/product-tile.html`

```html
<div class="product-tile">
  <div class="product-tile-image">
    <img src="" alt="" loading="lazy">
    <div class="product-tile-inventory"></div>
  </div>
  <div class="product-tile-content">
    <h4 class="product-tile-title"></h4>
    <p class="product-tile-sku"></p>
    <div class="product-tile-price"></div>
    <div class="product-tile-actions"></div>
  </div>
</div>
```

**File**: `blocks/product-tile/product-tile.css`

```css
.product-tile {
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--shape-border-radius-3);
  padding: var(--spacing-medium);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.product-tile:hover {
  border-color: var(--color-brand-300);
  box-shadow: var(--shape-shadow-2);
}

.product-tile.selected {
  border-color: var(--color-brand-500);
  background: var(--color-brand-50);
  box-shadow: var(--shape-shadow-2);
}

.product-tile-image {
  position: relative;
  width: 100%;
  padding-top: 100%; /* Square aspect ratio */
  background: var(--color-neutral-50);
  border-radius: var(--shape-border-radius-2);
  overflow: hidden;
  margin-bottom: var(--spacing-small);
}

.product-tile-image img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 90%;
  max-height: 90%;
  object-fit: contain;
}

.product-tile-inventory {
  position: absolute;
  top: var(--spacing-small);
  right: var(--spacing-small);
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  background: white;
  border-radius: var(--shape-border-radius-2);
  font-size: var(--type-body-2-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
}

.product-tile-inventory .icon {
  width: 16px;
  height: 16px;
}

.product-tile-inventory.in-stock {
  color: var(--color-positive-600);
}

.product-tile-inventory.low-stock {
  color: var(--color-warning-600);
}

.product-tile-inventory.out-of-stock {
  color: var(--color-negative-600);
}

.product-tile-title {
  font-size: var(--type-body-1-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 0.25rem;
}

.product-tile-sku {
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-600);
  margin: 0 0 var(--spacing-small);
}

.product-tile-price {
  font-size: var(--type-heading-4-font-size);
  font-weight: var(--type-heading-4-font-weight);
  color: var(--color-brand-600);
  margin-bottom: var(--spacing-small);
}

.product-tile-actions {
  display: flex;
  gap: var(--spacing-small);
}

.product-tile-select-indicator {
  position: absolute;
  top: var(--spacing-small);
  left: var(--spacing-small);
  width: 32px;
  height: 32px;
  background: var(--color-brand-500);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transform: scale(0.8);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.product-tile.selected .product-tile-select-indicator {
  opacity: 1;
  transform: scale(1);
}

.product-tile-select-indicator .icon {
  width: 20px;
  height: 20px;
  color: white;
}
```

**File**: `blocks/product-tile/product-tile.js`

```javascript
/**
 * Product Tile Block
 * Display selectable product tiles
 */

import { createIcon } from '../../scripts/icon-helper.js';
import { acoService } from '../../scripts/aco-service.js';
import { authService } from '../../scripts/auth.js';

export default function decorate(block) {
  block.selected = false;
  block.data = null;
  
  block.setData = async function(productData) {
    this.data = productData;
    
    // Get pricing for current customer group
    const customerGroup = authService.getCustomerGroup();
    const pricing = await acoService.getPricing({
      productIds: [productData.sku],
      customerGroup,
      quantity: 1
    });
    
    this.data.pricing = pricing.pricing[productData.sku];
    
    this.render();
  };
  
  block.render = function() {
    if (!this.data) return;
    
    const { name, sku, image, inStock, pricing } = this.data;
    
    // Update image
    const img = block.querySelector('.product-tile-image img');
    img.src = image || '/images/products/placeholder.png';
    img.alt = name;
    
    // Add select indicator
    const imageContainer = block.querySelector('.product-tile-image');
    let selectIndicator = imageContainer.querySelector('.product-tile-select-indicator');
    if (!selectIndicator) {
      selectIndicator = document.createElement('div');
      selectIndicator.className = 'product-tile-select-indicator';
      const icon = createIcon('wizard', 'checkmark-circle', 'medium');
      selectIndicator.appendChild(icon);
      imageContainer.insertBefore(selectIndicator, imageContainer.firstChild);
    }
    
    // Update inventory status
    const inventoryEl = block.querySelector('.product-tile-inventory');
    inventoryEl.innerHTML = '';
    
    let inventoryIcon, inventoryText, inventoryClass;
    if (inStock === false || inStock === 0) {
      inventoryIcon = 'inventory-error';
      inventoryText = 'Out of Stock';
      inventoryClass = 'out-of-stock';
    } else if (inStock < 10) {
      inventoryIcon = 'inventory-warning';
      inventoryText = 'Low Stock';
      inventoryClass = 'low-stock';
    } else {
      inventoryIcon = 'inventory-check';
      inventoryText = 'In Stock';
      inventoryClass = 'in-stock';
    }
    
    inventoryEl.className = `product-tile-inventory ${inventoryClass}`;
    const icon = createIcon('commerce', inventoryIcon, 'small');
    inventoryEl.appendChild(icon);
    
    const statusText = document.createElement('span');
    statusText.textContent = inventoryText;
    inventoryEl.appendChild(statusText);
    
    // Update title and SKU
    block.querySelector('.product-tile-title').textContent = name;
    block.querySelector('.product-tile-sku').textContent = `SKU: ${sku}`;
    
    // Update price
    const priceEl = block.querySelector('.product-tile-price');
    if (pricing) {
      priceEl.textContent = `$${pricing.unitPrice.toFixed(2)}`;
    }
    
    // Update actions
    const actionsContainer = block.querySelector('.product-tile-actions');
    actionsContainer.innerHTML = '';
    
    const selectBtn = document.createElement('button');
    selectBtn.className = this.selected ? 'btn btn-primary' : 'btn btn-secondary';
    selectBtn.textContent = this.selected ? 'Selected' : 'Select';
    selectBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggle();
    });
    
    actionsContainer.appendChild(selectBtn);
  };
  
  block.toggle = function() {
    this.selected = !this.selected;
    
    if (this.selected) {
      block.classList.add('selected');
    } else {
      block.classList.remove('selected');
    }
    
    this.render();
    
    window.dispatchEvent(new CustomEvent('product:toggle', {
      detail: { product: this.data, selected: this.selected }
    }));
  };
  
  block.setSelected = function(selected) {
    this.selected = selected;
    
    if (selected) {
      block.classList.add('selected');
    } else {
      block.classList.remove('selected');
    }
    
    this.render();
  };
  
  // Click on tile (excluding buttons)
  block.addEventListener('click', () => {
    this.toggle();
  });
  
  return block;
}
```

---

## Task 5: Package Comparison Block

### 5.1 Create Block Structure

**Purpose**: Side-by-side comparison of Good/Better/Best packages (Lisa).

**File**: `blocks/package-comparison/package-comparison.html`

```html
<div class="package-comparison">
  <div class="package-comparison-header">
    <h2>Choose Your Package</h2>
    <p>Compare features and pricing across tiers</p>
  </div>
  <div class="package-comparison-grid">
    <!-- Populated by JS -->
  </div>
</div>
```

**File**: `blocks/package-comparison/package-comparison.css`

```css
.package-comparison {
  padding: var(--spacing-large) 0;
}

.package-comparison-header {
  text-align: center;
  margin-bottom: var(--spacing-large);
}

.package-comparison-header h2 {
  font-size: var(--type-heading-2-font-size);
  font-weight: var(--type-heading-2-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 var(--spacing-small);
}

.package-comparison-header p {
  font-size: var(--type-body-1-font-size);
  color: var(--color-neutral-600);
  margin: 0;
}

.package-comparison-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing-large);
  max-width: 1400px;
  margin: 0 auto;
}

.package-card {
  background: white;
  border: 2px solid var(--color-neutral-200);
  border-radius: var(--shape-border-radius-3);
  overflow: hidden;
  transition: transform 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;
}

.package-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-brand-300);
  box-shadow: var(--shape-shadow-3);
}

.package-card.recommended {
  border-color: var(--color-brand-500);
  box-shadow: var(--shape-shadow-2);
}

.package-card.selected {
  border-color: var(--color-brand-600);
  box-shadow: var(--shape-shadow-3);
  background: var(--color-brand-50);
}

.package-card-badge {
  background: var(--color-brand-500);
  color: white;
  text-align: center;
  padding: 0.5rem;
  font-size: var(--type-body-2-font-size);
  font-weight: var(--type-body-1-strong-font-weight);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.package-card-image {
  width: 100%;
  padding-top: 66.67%; /* 3:2 aspect ratio */
  background: var(--color-neutral-100);
  position: relative;
  overflow: hidden;
}

.package-card-image img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.package-card-content {
  padding: var(--spacing-large);
}

.package-card-header {
  text-align: center;
  margin-bottom: var(--spacing-medium);
}

.package-card-tier {
  font-size: var(--type-heading-3-font-size);
  font-weight: var(--type-heading-3-font-weight);
  color: var(--color-neutral-900);
  margin: 0 0 var(--spacing-small);
}

.package-card-price {
  font-size: var(--type-heading-2-font-size);
  font-weight: var(--type-heading-2-font-weight);
  color: var(--color-brand-600);
  margin: 0;
}

.package-card-features {
  list-style: none;
  padding: 0;
  margin: 0 0 var(--spacing-large);
}

.package-feature {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-small);
  padding: var(--spacing-small) 0;
  border-bottom: 1px solid var(--color-neutral-100);
}

.package-feature:last-child {
  border-bottom: none;
}

.package-feature-icon {
  flex-shrink: 0;
  color: var(--color-positive-500);
}

.package-feature-icon .icon {
  width: 20px;
  height: 20px;
}

.package-feature-text {
  font-size: var(--type-body-2-font-size);
  color: var(--color-neutral-700);
}

.package-card-action {
  width: 100%;
}

@media (max-width: 768px) {
  .package-comparison-grid {
    grid-template-columns: 1fr;
  }
}
```

**File**: `blocks/package-comparison/package-comparison.js`

```javascript
/**
 * Package Comparison Block
 * Compare Good/Better/Best packages (for Lisa)
 */

import { createIcon } from '../../scripts/icon-helper.js';

export default function decorate(block) {
  block.packages = [];
  block.selectedPackage = null;
  
  block.setPackages = function(packages) {
    this.packages = packages;
    this.render();
  };
  
  block.render = function() {
    const grid = block.querySelector('.package-comparison-grid');
    grid.innerHTML = '';
    
    this.packages.forEach((pkg, index) => {
      const card = this.createPackageCard(pkg, index);
      grid.appendChild(card);
    });
  };
  
  block.createPackageCard = function(pkg) {
    const { tier, name, price, image, features, recommended } = pkg;
    
    const card = document.createElement('div');
    card.className = 'package-card';
    if (recommended) card.classList.add('recommended');
    if (this.selectedPackage === tier) card.classList.add('selected');
    
    // Badge (if recommended)
    if (recommended) {
      const badge = document.createElement('div');
      badge.className = 'package-card-badge';
      badge.textContent = 'Most Popular';
      card.appendChild(badge);
    }
    
    // Image
    const imageContainer = document.createElement('div');
    imageContainer.className = 'package-card-image';
    const img = document.createElement('img');
    img.src = image || '/images/packages/placeholder.jpg';
    img.alt = `${name} bathroom`;
    img.loading = 'lazy';
    imageContainer.appendChild(img);
    card.appendChild(imageContainer);
    
    // Content
    const content = document.createElement('div');
    content.className = 'package-card-content';
    
    // Header
    const header = document.createElement('div');
    header.className = 'package-card-header';
    
    const tierEl = document.createElement('h3');
    tierEl.className = 'package-card-tier';
    tierEl.textContent = name;
    
    const priceEl = document.createElement('div');
    priceEl.className = 'package-card-price';
    priceEl.textContent = `$${price.toLocaleString()}`;
    
    header.appendChild(tierEl);
    header.appendChild(priceEl);
    content.appendChild(header);
    
    // Features
    const featuresList = document.createElement('ul');
    featuresList.className = 'package-card-features';
    
    features.forEach(feature => {
      const li = document.createElement('li');
      li.className = 'package-feature';
      
      const iconContainer = document.createElement('div');
      iconContainer.className = 'package-feature-icon';
      const icon = createIcon('wizard', 'checkmark-circle', 'small');
      iconContainer.appendChild(icon);
      
      const text = document.createElement('span');
      text.className = 'package-feature-text';
      text.textContent = feature;
      
      li.appendChild(iconContainer);
      li.appendChild(text);
      featuresList.appendChild(li);
    });
    
    content.appendChild(featuresList);
    
    // Action button
    const button = document.createElement('button');
    button.className = 'btn btn-primary package-card-action';
    button.textContent = this.selectedPackage === tier ? 'Selected' : 'Select Package';
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectPackage(tier);
    });
    
    content.appendChild(button);
    card.appendChild(content);
    
    // Click on card
    card.addEventListener('click', () => {
      this.selectPackage(tier);
    });
    
    return card;
  };
  
  block.selectPackage = function(tier) {
    this.selectedPackage = tier;
    this.render();
    
    const pkg = this.packages.find(p => p.tier === tier);
    window.dispatchEvent(new CustomEvent('package:select', {
      detail: { package: pkg }
    }));
  };
  
  return block;
}
```

---

## Success Criteria

✅ All 5 shared blocks created  
✅ Blocks follow EDS patterns from Phase 0 research  
✅ Blocks use custom icons from Phase 2  
✅ Blocks use design system CSS variables  
✅ Blocks emit events for inter-component communication  
✅ Blocks are reusable and configurable  
✅ Blocks include API methods for programmatic control  
✅ Blocks work in isolation (can be tested standalone)

---

## Testing/Validation

### Component Testing
- [ ] Each block renders correctly with mock data
- [ ] Each block responds to API method calls
- [ ] Each block emits expected events
- [ ] Each block uses icons correctly

### Integration Testing
- [ ] Blocks work with auth service
- [ ] Blocks work with ACO service
- [ ] Blocks communicate via events
- [ ] Multiple blocks on same page don't conflict

### Visual Testing
- [ ] Blocks match design system
- [ ] Blocks are responsive
- [ ] Blocks have correct hover/active states
- [ ] Icons display correctly

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announcements correct
- [ ] Focus indicators visible
- [ ] ARIA labels present

---

## Deliverables Checklist

### Block Files
- [ ] `blocks/loading-overlay/*` (HTML, CSS, JS)
- [ ] `blocks/wizard-vertical-progress/*` (HTML, CSS, JS)
- [ ] `blocks/template-card/*` (HTML, CSS, JS)
- [ ] `blocks/product-tile/*` (HTML, CSS, JS)
- [ ] `blocks/package-comparison/*` (HTML, CSS, JS)

### Documentation
- [ ] Component usage guide
- [ ] Event API documentation
- [ ] Integration examples

---

## Next Steps

Upon completion of Phase 4:
1. **Phase 5**: Use blocks in refactored existing pages
2. **Phase 6**: Use blocks in persona-specific implementations
3. Test blocks across all personas

---

## Related Documents

- `PERSONA-META-PLAN.md` - Overall orchestration
- `PHASE-2-DESIGN-SYSTEM-AND-ICONS.md` - Icon library
- `PHASE-3-CORE-ARCHITECTURE.md` - Architecture foundations

---

**Phase Owner**: TBD  
**Started**: TBD  
**Completed**: TBD  
**Last Updated**: November 15, 2024

