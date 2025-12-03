# Phase 6A User Flows and Interactions

**Date**: December 2, 2025  
**Design Sprint - Day 3**: User flows, state transitions, and interactions  
**Status**: In Progress

---

## 🎯 Overview

This document maps out:
1. **Primary User Flows** - Happy paths for key tasks
2. **State Transitions** - How UI responds to user actions
3. **Error Handling** - What happens when things go wrong
4. **Loading States** - Async operation feedback
5. **Success Confirmations** - Completion feedback

---

## 🚀 Primary User Flow 1: Create New Build from Template

### Steps

```
1. Dashboard
   ↓ User clicks "+ New Build"
   
2. Templates Dashboard
   ↓ User clicks "Start New Build" on The Sedona template
   
3. Build Configurator
   ├─ User enters build info (House #47, Desert Ridge, Lot 47)
   ├─ User selects variant (Bonus Room)
   ├─ User selects package (Desert Ridge Premium)
   ├─ User selects phases (Foundation, Envelope)
   └─ User clicks "Generate BOM"
   
4. Loading State (2-3 seconds)
   
5. BOM Review
   ├─ User reviews line items
   ├─ [Optional] User swaps products
   ├─ [Optional] User removes items
   └─ User clicks "Add All to Cart"
   
6. Cart → Checkout → Order Placed
   
7. Dashboard
   └─ Build card appears with order linked
```

### Detailed Interaction Flow

#### **Step 1: Dashboard → Templates**

**User Action**: Clicks "+ New Build" button

**System Response**:
```javascript
// 1. Navigate to templates dashboard
window.location.href = '/templates?context=sarah';

// 2. Templates dashboard loads
// 3. Shows template cards with "Start New Build" CTA
```

**UI State**:
- Dashboard button: Active state → Loading spinner (brief)
- Page transition: Fade out → Fade in templates

---

#### **Step 2: Templates → Build Configurator**

**User Action**: Clicks "Start New Build" on "The Sedona" card

**System Response**:
```javascript
// 1. Load template data
const templateData = await fetch(`/data/templates/sedona-2450.json`);

// 2. Navigate to configurator with template pre-loaded
window.location.href = `/builder/configure?template=sedona-2450`;

// 3. Configurator initializes with template data
```

**UI State**:
- Template card: Hover → Active (pressed) → Loading overlay
- Page transition: Slide left (template → configurator)
- Configurator: Skeleton loader → Populated form

---

#### **Step 3: Build Configurator - User Interactions**

##### **3a. Enter Build Information**

**User Actions**:
1. Types in "Project" field → "House #47"
2. Selects "Desert Ridge" from Subdivision dropdown
3. Types "47" in Lot field
4. Delivery address auto-fills

**System Response**:
```javascript
// Auto-increment project name
const lastProjectNum = getLastProjectNumber(); // Returns 46
projectNameInput.value = `House #${lastProjectNum + 1}`;

// Subdivision selection triggers address lookup
subdivisionSelect.addEventListener('change', async (e) => {
  const subdivision = e.target.value;
  const lotNum = lotInput.value;
  
  if (subdivision && lotNum) {
    const address = await lookupAddress(subdivision, lotNum);
    deliveryAddressInput.value = address;
  }
});
```

**UI State**:
- Project name: Auto-filled with fade-in
- Subdivision: Dropdown opens → Selection highlights → Closes
- Lot: User types → Validation (numbers only)
- Delivery: Auto-fills with slide-down animation

**Validation**:
```javascript
// Real-time validation
function validateBuildInfo() {
  const errors = [];
  
  if (!projectNameInput.value.trim()) {
    errors.push({ field: 'project', message: 'Project name required' });
  }
  
  if (!subdivisionSelect.value) {
    errors.push({ field: 'subdivision', message: 'Subdivision required' });
  }
  
  // Show inline errors
  errors.forEach(error => {
    showFieldError(error.field, error.message);
  });
  
  return errors.length === 0;
}
```

---

##### **3b. Select Variant (Bonus Room)**

**User Action**: Clicks "Bonus Room" photo tile

**System Response**:
```javascript
// 1. Toggle selection (multi-select)
bonusRoomTile.addEventListener('click', function() {
  const wasSelected = this.dataset.selected === 'true';
  this.dataset.selected = !wasSelected;
  
  // 2. Update order summary
  updateOrderSummary();
});

function updateOrderSummary() {
  const selectedVariants = getSelectedVariants(); // ['bonus-room']
  const variantCost = selectedVariants.reduce((sum, v) => 
    sum + variantPrices[v], 0
  ); // $15,000
  
  // Update UI
  document.querySelector('.summary-variants').textContent = 
    selectedVariants.length 
      ? selectedVariants.map(v => variantLabels[v]).join(', ')
      : 'None';
  
  document.querySelector('.summary-variant-cost').textContent = 
    `+$${variantCost.toLocaleString()}`;
  
  // Update total
  updateTotalEstimate();
}
```

**UI State**:
- **Before click**: Gray border, no checkmark
- **Click**: Border turns blue, checkmark fades in (0.2s)
- **Order Summary**: Updates with slide animation
  - "Optional Features: $0" → "Optional Features (Bonus Room): +$15,000"
  - Total: $225,000 → $240,000

**Animation**:
```css
/* Checkmark fade-in */
@keyframes checkmarkFadeIn {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.selection-tile[data-selected="true"]::after {
  animation: checkmarkFadeIn 0.2s ease;
}
```

---

##### **3c. Select Package (Desert Ridge Premium)**

**User Action**: Clicks "Desert Ridge Premium" tile

**System Response**:
```javascript
// 1. Deselect all packages (single-select)
document.querySelectorAll('[data-group="package"]').forEach(tile => {
  tile.dataset.selected = 'false';
});

// 2. Select clicked package
desertRidgeTile.dataset.selected = 'true';

// 3. Update order summary
updateOrderSummary();
```

**UI State**:
- **Builder's Choice**: Selected → Deselected (checkmark fades out)
- **Desert Ridge**: Not selected → Selected (checkmark fades in)
- **Order Summary**: Package line updates
  - "Package (Builder's Choice): Base Price" → "Package (Desert Ridge Premium): +$18,000"
  - Total: $240,000 → $258,000

**Visual Feedback**:
```javascript
// Smooth transition between selections
function switchSelection(fromTile, toTile) {
  // Fade out old checkmark
  fromTile.dataset.selected = 'false';
  
  // Brief delay, then fade in new checkmark
  setTimeout(() => {
    toTile.dataset.selected = 'true';
  }, 100);
}
```

---

##### **3d. Select Phases (Foundation, Envelope)**

**User Action**: Clicks "Foundation & Framing" and "Building Envelope" tiles

**System Response**:
```javascript
// 1. Toggle each phase (multi-select)
const selectedPhases = [];

phaseTiles.forEach(tile => {
  tile.addEventListener('click', function() {
    const wasSelected = this.dataset.selected === 'true';
    this.dataset.selected = !wasSelected;
    
    if (!wasSelected) {
      selectedPhases.push(this.dataset.phaseId);
    } else {
      const index = selectedPhases.indexOf(this.dataset.phaseId);
      selectedPhases.splice(index, 1);
    }
    
    updateOrderSummary();
  });
});

function updateOrderSummary() {
  const phaseCount = selectedPhases.length;
  const totalPhases = 3;
  
  document.querySelector('.summary-phases').textContent = 
    `Materials for ${phaseCount} of ${totalPhases} phases selected`;
}
```

**UI State**:
- Foundation tile: Checkmark appears
- Envelope tile: Checkmark appears
- Interior tile: Remains unselected
- **Order Summary**: "Materials for 0 phases selected" → "Materials for 2 phases selected"

**Validation**:
```javascript
// Must select at least 1 phase
function validatePhaseSelection() {
  if (selectedPhases.length === 0) {
    showError('Please select at least one construction phase');
    return false;
  }
  return true;
}
```

---

##### **3e. Generate BOM**

**User Action**: Clicks "Generate BOM →" button

**System Response**:
```javascript
async function generateBOM() {
  // 1. Validate all inputs
  if (!validateBuildInfo() || !validatePhaseSelection()) {
    return; // Show errors inline
  }
  
  // 2. Show loading state
  showLoadingOverlay('Generating Bill of Materials...');
  
  // 3. Prepare BOM request
  const bomRequest = {
    templateId: 'sedona-2450',
    variant: 'bonus-room',
    packageId: 'desert-ridge-premium',
    phases: ['foundation_framing', 'envelope'],
    buildInfo: {
      projectName: 'House #47',
      subdivision: 'desert-ridge',
      lot: '47',
    }
  };
  
  // 4. Call buildright-service GraphQL API
  try {
    const response = await fetch('/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-catalog-view-id': 'commercial-tier2',
        'x-price-book-id': 'pb-commercial-tier2',
      },
      body: JSON.stringify({
        query: `
          query GenerateBOM($input: TemplateInput!) {
            BuildRight_generateBOMFromTemplate(input: $input) {
              lineItems {
                sku
                name
                quantity
                unitPrice
                subtotal
                category
                phase
              }
              total
              metadata {
                generatedAt
                templateName
                configuration
              }
            }
          }
        `,
        variables: { input: bomRequest }
      })
    });
    
    const { data } = await response.json();
    const bom = data.BuildRight_generateBOMFromTemplate;
    
    // 5. Save BOM to build
    const buildId = await saveBuildWithBOM(bomRequest, bom);
    
    // 6. Navigate to BOM Review
    window.location.href = `/builder/bom-review?buildId=${buildId}`;
    
  } catch (error) {
    hideLoadingOverlay();
    showError('Failed to generate BOM. Please try again.');
    console.error('BOM generation error:', error);
  }
}
```

**UI State Timeline**:

```
0ms:    User clicks "Generate BOM"
        ↓
50ms:   Button: Disabled, shows spinner
        ↓
100ms:  Loading overlay fades in (full-screen)
        "Generating Bill of Materials..."
        [Animated spinner]
        ↓
2000ms: API responds with BOM data
        ↓
2100ms: Loading overlay fades out
        ↓
2200ms: Page transition to BOM Review (slide left)
```

**Loading Overlay**:
```html
<div class="loading-overlay" data-visible="true">
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <h3>Generating Bill of Materials...</h3>
    <p>This will take just a moment</p>
  </div>
</div>
```

```css
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s ease-in-out;
}

.loading-overlay[data-visible="true"] {
  opacity: 1;
  pointer-events: all;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid var(--color-border);
  border-top-color: var(--color-cta);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}
```

---

#### **Step 4: BOM Review - User Interactions**

##### **4a. Review Line Items**

**User Action**: Views generated BOM

**Initial State**:
```
▼ Phase 1: Foundation & Framing    $45,234.00 (54%)
  ┌─ Framing Lumber
  │  • 2x10 x 12' Dimensional Lumber  64 EA × $18.50
  │  • 2x4 x 8' Kiln-Dried Stud       485 EA × $3.50
  │  [+ 12 more items...]
  
▶ Phase 2: Building Envelope       $37,993.09 (46%)
  [Collapsed - click to expand]
```

**Interaction**: Click phase header to expand/collapse

**System Response**:
```javascript
bomAccordion.addEventListener('click', function() {
  const expanded = this.dataset.expanded === 'true';
  this.dataset.expanded = !expanded;
  
  // Smooth animation
  const content = this.querySelector('.bom-accordion-content');
  if (!expanded) {
    // Expanding
    content.style.maxHeight = content.scrollHeight + 'px';
  } else {
    // Collapsing
    content.style.maxHeight = '0';
  }
});
```

**UI State**:
- Icon rotates: ▶ → ▼ (0.3s ease-in-out)
- Content slides down/up (0.3s ease-in-out)
- Border highlight on hover

---

##### **4b. Swap Product**

**User Action**: Clicks "Swap Product" on "2x10 x 12' Dimensional Lumber"

**System Response**:

```javascript
async function handleProductSwap(productRow, product) {
  // 1. Show loading on button
  const swapBtn = productRow.querySelector('[data-action="swap"]');
  swapBtn.textContent = 'Loading...';
  swapBtn.disabled = true;
  
  // 2. Fetch compatible products from CCDM
  const alternatives = await fetchCompatibleProducts({
    productId: product.id,
    catalogViewId: 'commercial-tier2',
    priceBookId: 'pb-commercial-tier2',
    phase: product.phase,
    category: product.category,
  });
  
  // 3. Show product swap panel
  const swapPanel = new ProductSwapPanel(productRow, alternatives);
  swapPanel.show();
  
  // 4. Reset button
  swapBtn.textContent = 'Swap Product';
  swapBtn.disabled = false;
}
```

**UI State Timeline**:

```
0ms:    User clicks "Swap Product"
        ↓
50ms:   Button text: "Swap Product" → "Loading..."
        Button disabled
        ↓
500ms:  API returns compatible products
        ↓
550ms:  Product swap panel slides down below product row
        Shows 4 product tiles (current + 3 alternatives)
        ↓
600ms:  Swap panel fully visible
```

**Product Swap Panel Interaction**:

```
User clicks LVL Beam tile
  ↓
Previous selection (2x10 Dimensional) deselects
Checkmark fades out (0.2s)
  ↓
LVL Beam selects
Checkmark fades in (0.2s)
Border turns blue
  ↓
User clicks "Apply Swap"
  ↓
Panel slides up and fades out (0.3s)
  ↓
Product row updates with new product
Brief highlight animation (flash blue → white)
  ↓
BOM total recalculates
Old total → New total (animated counter)
```

**Implementation**:
```javascript
function applyProductSwap(oldProduct, newProduct) {
  // 1. Hide swap panel
  swapPanel.hide();
  
  // 2. Update product row
  const productRow = document.querySelector(`[data-sku="${oldProduct.sku}"]`);
  
  // Highlight animation
  productRow.style.background = 'var(--color-cta-light)';
  setTimeout(() => {
    productRow.style.background = '';
  }, 500);
  
  // Update content
  productRow.querySelector('.product-row-name').textContent = newProduct.name;
  productRow.querySelector('.product-row-meta').textContent = 
    `Brand: ${newProduct.brand} • ${newProduct.specs}`;
  productRow.querySelector('.product-row-unit-price .price-value').textContent = 
    `$${newProduct.unitPrice.toFixed(2)}`;
  
  const quantity = parseInt(productRow.querySelector('.quantity-value').textContent);
  const newSubtotal = quantity * newProduct.unitPrice;
  productRow.querySelector('.product-row-subtotal .subtotal-value').textContent = 
    `$${newSubtotal.toFixed(2)}`;
  
  // 3. Recalculate BOM total
  recalculateBOMTotal();
}

function recalculateBOMTotal() {
  const allRows = document.querySelectorAll('.product-row');
  let newTotal = 0;
  
  allRows.forEach(row => {
    const subtotal = parseFloat(
      row.querySelector('.subtotal-value').textContent.replace(/[$,]/g, '')
    );
    newTotal += subtotal;
  });
  
  // Animate total change
  animateValue(
    document.querySelector('.bom-total-value'),
    currentTotal,
    newTotal,
    500
  );
  
  currentTotal = newTotal;
}

function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16); // 60fps
  let current = start;
  
  const timer = setInterval(() => {
    current += increment;
    if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
      current = end;
      clearInterval(timer);
    }
    element.textContent = `$${current.toFixed(2)}`;
  }, 16);
}
```

---

##### **4c. Remove Product**

**User Action**: Clicks "Remove" on a product row

**System Response**:
```javascript
function handleProductRemove(productRow, product) {
  // 1. Show confirmation (inline, not modal)
  const confirmBar = document.createElement('div');
  confirmBar.className = 'confirm-bar';
  confirmBar.innerHTML = `
    <p>Remove ${product.name}?</p>
    <button data-action="confirm-remove">Yes, Remove</button>
    <button data-action="cancel-remove">Cancel</button>
  `;
  
  productRow.insertAdjacentElement('afterend', confirmBar);
  confirmBar.style.maxHeight = '0';
  setTimeout(() => {
    confirmBar.style.maxHeight = '60px';
  }, 10);
  
  // 2. Handle confirmation
  confirmBar.querySelector('[data-action="confirm-remove"]').addEventListener('click', () => {
    // Slide up and remove
    productRow.style.opacity = '0';
    productRow.style.transform = 'translateX(-20px)';
    
    setTimeout(() => {
      productRow.remove();
      confirmBar.remove();
      recalculateBOMTotal();
    }, 300);
  });
  
  confirmBar.querySelector('[data-action="cancel-remove"]').addEventListener('click', () => {
    confirmBar.style.maxHeight = '0';
    setTimeout(() => confirmBar.remove(), 300);
  });
}
```

**UI State**:
```
User clicks "Remove"
  ↓
Confirm bar slides down below product row (0.3s)
"Remove [Product]? [Yes, Remove] [Cancel]"
  ↓
If "Yes, Remove":
  Product row fades out + slides left (0.3s)
  ↓
  Row removed from DOM
  ↓
  Remaining rows slide up to fill gap
  ↓
  BOM total recalculates (animated)
  
If "Cancel":
  Confirm bar slides up (0.3s)
  ↓
  Confirm bar removed
  ↓
  Product row unchanged
```

---

##### **4d. Add to Cart**

**User Action**: Clicks "Add All to Cart →"

**System Response**:
```javascript
async function addBOMToCart(buildId) {
  // 1. Validate BOM (at least 1 item)
  const lineItems = document.querySelectorAll('.product-row');
  if (lineItems.length === 0) {
    showError('Cannot add empty BOM to cart');
    return;
  }
  
  // 2. Show loading
  showLoadingOverlay('Adding items to cart...');
  
  // 3. Collect all line items
  const cartItems = Array.from(lineItems).map(row => ({
    sku: row.dataset.sku,
    quantity: parseInt(row.querySelector('.quantity-value').textContent),
  }));
  
  // 4. Add to cart
  try {
    await CartManager.addBulk(cartItems);
    
    // 5. Show success message
    showSuccessMessage(`${cartItems.length} items added to cart!`);
    
    // 6. Navigate to cart
    setTimeout(() => {
      window.location.href = '/cart';
    }, 1500);
    
  } catch (error) {
    hideLoadingOverlay();
    showError('Failed to add items to cart. Please try again.');
  }
}
```

**UI State**:
```
User clicks "Add All to Cart"
  ↓
Button disabled, shows spinner
  ↓
Loading overlay: "Adding items to cart..."
  ↓
Success! Green checkmark appears
"47 items added to cart!"
  ↓
Auto-redirect to cart page (1.5s delay)
```

**Success Message**:
```html
<div class="success-message" data-visible="true">
  <div class="success-icon">✓</div>
  <h4>47 items added to cart!</h4>
  <p>Redirecting to cart...</p>
</div>
```

```css
.success-message {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0.8);
  background: white;
  padding: var(--spacing-large);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  text-align: center;
  opacity: 0;
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 10000;
}

.success-message[data-visible="true"] {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.success-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto var(--spacing-medium);
  background: var(--color-success);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  font-weight: bold;
  animation: successPulse 0.5s ease;
}

@keyframes successPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}
```

---

## 🚀 Primary User Flow 2: Order Next Phase from Dashboard

### Steps

```
1. Dashboard
   ├─ User expands materials list on Build #47
   ├─ Sees: Foundation ✓, Envelope ✓, Interior ○
   └─ Clicks "Order Next Phase →"
   
2. Phase Selection Modal (or direct to BOM if only 1 phase left)
   └─ User confirms "Interior Finish"
   
3. BOM Review (filtered to Interior phase only)
   ├─ Shows only Interior line items
   └─ User clicks "Add to Cart"
   
4. Cart → Checkout → Order Placed
   
5. Dashboard
   └─ Build #47 updated: Interior ✓, Progress: 100%
```

### Detailed Flow

#### **Step 1: Expand Materials & Click "Order Next Phase"**

**User Action**: 
1. Clicks "▶ Materials Ordered" to expand
2. Reviews completed phases
3. Clicks "Order Next Phase →"

**System Response**:
```javascript
function handleOrderNextPhase(buildId) {
  const build = getBuild(buildId);
  const completedPhases = build.orders.map(o => o.phase);
  const allPhases = ['foundation_framing', 'envelope', 'interior_finish'];
  const remainingPhases = allPhases.filter(p => !completedPhases.includes(p));
  
  if (remainingPhases.length === 0) {
    showMessage('All phases have been ordered!');
    return;
  }
  
  if (remainingPhases.length === 1) {
    // Direct to BOM review for last phase
    const phase = remainingPhases[0];
    window.location.href = `/builder/bom-review?buildId=${buildId}&phase=${phase}`;
  } else {
    // Show phase selection modal
    showPhaseSelectionModal(buildId, remainingPhases);
  }
}
```

**UI State**:
```
Materials list collapsed
  ↓ Click header
Materials list expands (0.3s slide-down)
  ✓ Foundation & Framing  $45,234 (Order #ORD-12345)
  ✓ Building Envelope     $37,993 (Order #ORD-12346)
  ○ Interior Finish       Not ordered yet
  ↓ Click "Order Next Phase"
Button: Loading spinner
  ↓
Navigate to BOM Review (filtered to Interior)
```

---

## ⚠️ Error Handling

### Validation Errors

#### **Build Configurator - Missing Required Fields**

**Trigger**: User clicks "Generate BOM" without filling required fields

**Response**:
```javascript
function showFieldError(fieldName, message) {
  const field = document.querySelector(`[name="${fieldName}"]`);
  const errorDiv = document.createElement('div');
  errorDiv.className = 'field-error';
  errorDiv.textContent = message;
  
  field.classList.add('field-error-border');
  field.parentElement.appendChild(errorDiv);
  
  // Scroll to first error
  field.scrollIntoView({ behavior: 'smooth', block: 'center' });
  field.focus();
}
```

**UI State**:
```
Field border: Gray → Red
Error message appears below field (red text)
Page scrolls to first error
Field receives focus
```

**Example**:
```
Subdivision: [dropdown ▾]  ← Red border
⚠️ Subdivision is required
```

---

#### **BOM Review - Empty BOM**

**Trigger**: User removes all items from BOM

**Response**:
```javascript
function checkEmptyBOM() {
  const lineItems = document.querySelectorAll('.product-row');
  
  if (lineItems.length === 0) {
    showEmptyState();
    document.querySelector('[data-action="add-to-cart"]').disabled = true;
  }
}

function showEmptyState() {
  const container = document.querySelector('.bom-content');
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-icon">📋</div>
      <h3>Your BOM is empty</h3>
      <p>You've removed all items. Return to configuration to regenerate.</p>
      <button class="btn btn-cta" onclick="history.back()">
        ← Back to Configuration
      </button>
    </div>
  `;
}
```

---

### API Errors

#### **BOM Generation Failed**

**Trigger**: `buildright-service` API returns error

**Response**:
```javascript
try {
  const bom = await generateBOM(config);
} catch (error) {
  hideLoadingOverlay();
  
  showErrorMessage({
    title: 'Failed to Generate BOM',
    message: error.message || 'Something went wrong. Please try again.',
    actions: [
      { label: 'Try Again', onClick: () => generateBOM(config) },
      { label: 'Cancel', onClick: () => history.back() }
    ]
  });
}
```

**UI State**:
```
Loading overlay disappears
  ↓
Error modal slides in
┌────────────────────────────┐
│ ⚠️ Failed to Generate BOM  │
│                            │
│ Could not connect to       │
│ pricing service.           │
│                            │
│ [Try Again]  [Cancel]      │
└────────────────────────────┘
```

---

#### **Add to Cart Failed**

**Trigger**: Cart API error

**Response**:
```javascript
catch (error) {
  hideLoadingOverlay();
  
  showToast({
    type: 'error',
    message: 'Failed to add items to cart. Please try again.',
    duration: 5000,
  });
}
```

**UI State**:
```
Toast notification slides down from top
┌───────────────────────────────────┐
│ ⚠️ Failed to add items to cart.   │
│    Please try again.              │
│                              [×]  │
└───────────────────────────────────┘
  ↓ 5 seconds
Toast slides up and disappears
```

---

## ⏳ Loading States

### Summary

| Action | Loading Indicator | Duration | Fallback |
|--------|------------------|----------|----------|
| Generate BOM | Full-screen overlay + spinner | 2-3s | Error modal |
| Add to Cart | Full-screen overlay + spinner | 1-2s | Toast error |
| Fetch Compatible Products | Button spinner | 0.5-1s | Inline error |
| Load Templates | Skeleton cards | 0.5-1s | Retry button |
| Load Dashboard | Skeleton cards | 0.5-1s | Retry button |

### Loading Overlay Component

```html
<div class="loading-overlay" data-visible="false">
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <h3 id="loading-title">Loading...</h3>
    <p id="loading-subtitle">Please wait</p>
  </div>
</div>
```

```javascript
function showLoadingOverlay(title, subtitle) {
  const overlay = document.querySelector('.loading-overlay');
  overlay.querySelector('#loading-title').textContent = title;
  overlay.querySelector('#loading-subtitle').textContent = subtitle || 'This will take just a moment';
  overlay.dataset.visible = 'true';
  document.body.style.overflow = 'hidden';
}

function hideLoadingOverlay() {
  const overlay = document.querySelector('.loading-overlay');
  overlay.dataset.visible = 'false';
  document.body.style.overflow = '';
}
```

---

## ✅ Success Confirmations

### BOM Generated Successfully

**Trigger**: BOM generation completes

**Response**: Navigate to BOM Review with success banner

```html
<div class="success-banner" data-visible="true">
  <div class="success-icon">✓</div>
  <div class="success-message">
    <strong>BOM Generated Successfully</strong>
    <p>Review your materials below and add to cart when ready.</p>
  </div>
  <button class="close-banner" aria-label="Close">×</button>
</div>
```

**Animation**: Slides down from top, auto-dismisses after 5s

---

### Items Added to Cart

**Trigger**: All BOM items added to cart

**Response**: Success modal → Auto-redirect to cart

```javascript
function showSuccessAndRedirect(itemCount) {
  showSuccessMessage({
    icon: '✓',
    title: `${itemCount} items added to cart!`,
    message: 'Redirecting to cart...',
  });
  
  setTimeout(() => {
    window.location.href = '/cart';
  }, 1500);
}
```

---

### Order Placed

**Trigger**: Checkout completes, order created

**Response**: Return to dashboard with updated build card

```javascript
// After checkout success
window.location.href = `/dashboard?orderSuccess=true&orderId=${orderId}`;

// Dashboard shows toast
if (params.get('orderSuccess')) {
  showToast({
    type: 'success',
    message: `Order #${params.get('orderId')} placed successfully!`,
    duration: 5000,
  });
  
  // Highlight build card with new order
  highlightBuildCard(buildId);
}
```

---

## 🔄 State Transition Diagram

### Build Lifecycle States

```
NEW
  ↓ User starts configuration
CONFIGURING
  ↓ User clicks "Generate BOM"
GENERATING_BOM (loading)
  ↓ BOM service responds
BOM_READY
  ↓ User modifies BOM (swap/remove)
BOM_MODIFIED
  ↓ User clicks "Add to Cart"
ADDING_TO_CART (loading)
  ↓ Cart service responds
IN_CART
  ↓ User completes checkout
ORDER_PLACED (Phase 1)
  ↓ User orders more phases
ORDER_PLACED (Phase 2)
  ↓ ...
COMPLETE (All phases ordered)
```

### Component States

**Selection Tile**:
```
default → hover → active (click) → selected
selected → hover → active (click) → default (multi-select toggle)
```

**BOM Accordion**:
```
collapsed → hover → active (click) → expanding (0.3s) → expanded
expanded → hover → active (click) → collapsing (0.3s) → collapsed
```

**Product Swap Panel**:
```
hidden → show() called → appearing (0.3s) → visible
visible → hide() called → disappearing (0.3s) → hidden
```

---

## 📱 Responsive Behavior

### Mobile Interactions

**Selection Tiles**:
- Larger tap targets (minimum 44x44px)
- No hover state (goes directly default → selected)

**Product Swap**:
- Tiles stack vertically instead of horizontally
- Larger product images (120x120px vs 100x100px)

**Build Cards**:
- Materials list expanded by default on mobile
- Actions stack vertically

**BOM Accordion**:
- First phase expanded by default
- Easier to tap headers (larger padding)

---

## ♿ Accessibility Interactions

### Keyboard Navigation

**Selection Tiles**:
- `Tab`: Move to next tile
- `Shift+Tab`: Move to previous tile
- `Space` or `Enter`: Toggle selection
- Focus ring visible on keyboard navigation

**Collapsible Sections**:
- `Tab`: Move to header
- `Enter` or `Space`: Toggle expand/collapse
- `Escape`: Collapse if expanded (optional)

**Product Swap**:
- `Tab`: Navigate between product tiles
- `Arrow keys`: Move between tiles (optional enhancement)
- `Space`: Select product
- `Escape`: Cancel swap

### Screen Reader Announcements

```javascript
// After BOM generation
announceToScreenReader('Bill of materials generated successfully. 47 items loaded.');

// After product swap
announceToScreenReader(`Product swapped: ${oldProduct.name} replaced with ${newProduct.name}`);

// After adding to cart
announceToScreenReader(`${itemCount} items added to cart`);

function announceToScreenReader(message) {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', 'polite');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  document.body.appendChild(announcement);
  
  setTimeout(() => announcement.remove(), 3000);
}
```

---

## 🎯 Edge Cases

### No Templates Available

**Scenario**: Templates API returns empty array

**Response**: Show empty state with contact support

---

### All Phases Already Ordered

**Scenario**: User clicks "Order Next Phase" but all phases ordered

**Response**: Disable button, show "All phases ordered ✓"

---

### Build in Cart But Not Ordered

**Scenario**: User adds BOM to cart but doesn't checkout

**Response**: Dashboard shows "BOM generated" status, not "In Progress"

---

### Concurrent Editing

**Scenario**: Build modified in another tab/session

**Response**: Show warning when user returns
```
⚠️ This build was modified in another session. 
[Reload to see latest] [Continue with local version]
```

---

## ✅ Summary

**Day 3 Complete!** We've mapped:
- ✅ 2 primary user flows (Create Build, Order Next Phase)
- ✅ Detailed interaction states for all components
- ✅ Error handling strategies
- ✅ Loading states and feedback
- ✅ Success confirmations
- ✅ Accessibility interactions
- ✅ Edge cases

**Next**: Day 4 - Documentation & User Review

---

**Document Version**: 1.0  
**Last Updated**: December 2, 2025  
**Status**: ✅ Complete  
**Next**: Day 4 - Final Documentation & Review

