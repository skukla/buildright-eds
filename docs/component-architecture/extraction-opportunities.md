# Component Extraction Opportunities - Comprehensive Audit

**Date:** December 6, 2025  
**Audit Scope:** Entire BuildRight EDS Frontend  
**Purpose:** Identify all patterns that can be extracted into reusable blocks/components

---

## Executive Summary

This audit identifies **23 distinct component extraction opportunities** across the codebase. Each opportunity represents repeated UI patterns that could be converted into Adobe Edge Delivery Service (EDS) blocks for better reusability, maintainability, and authoring experience.

**Priority Levels:**
- 🔴 **Critical** - Used 5+ times, high impact
- 🟡 **High** - Used 3-4 times, moderate impact  
- 🟢 **Medium** - Used 2 times, low-moderate impact
- ⚪ **Low** - Used once but complex enough to warrant extraction

---

## 1. Card Component 🔴 CRITICAL

**Current State:** CSS-only pattern in `styles/components.css`  
**Occurrences:** 35+ instances across 8+ files

### Locations Found:
- `index.html` - Featured category cards (6 instances)
- `pages/account.html` - Quick actions, company info, empty states (15+ instances)
- `pages/signup.html` - Signup wizard container
- `pages/project-selector.html` - Project type selection cards (4 instances)
- `pages/login.html` - Login form container

### Current Pattern:
```html
<div class="card">
  <div class="card-header">
    <h3>Title</h3>
  </div>
  <div class="card-body">
    <!-- Content -->
  </div>
  <div class="card-footer">
    <!-- Actions -->
  </div>
</div>
```

### Variants Needed:
1. **Basic Card** - Simple container with padding
2. **Interactive Card** - Clickable/hoverable with transforms
3. **Empty State Card** - Special styling for empty states
4. **Quick Action Card** - Dashboard quick actions
5. **Category Card** - Featured categories with icons

### Extraction Plan:
```
blocks/card/
  ├── card.css
  ├── card.html (with variants)
  └── card.js (for interactive variants)
```

**Impact:** High - Would standardize one of the most common UI patterns

---

## 2. Loading Overlay 🔴 CRITICAL

**Current State:** CSS-only pattern, inconsistent implementations  
**Occurrences:** 8+ instances across 6 pages

### Locations Found:
- `pages/catalog.html` - Catalog loading (`catalog-loading-overlay`)
- `pages/product-detail.html` - PDP loading (`pdp-loading-overlay`)
- `pages/bom-review.html` - BOM generation loading
- `pages/build-configurator.html` - Configuration loading
- `pages/dashboard.html` - Dashboard content loading
- `scripts/build-configurator.js` - Programmatic overlay control

### Current Patterns:
```html
<!-- Pattern 1: Generic -->
<div class="loading-overlay" id="loading-overlay" data-visible="false">
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <h3 id="loading-title">Loading...</h3>
    <p id="loading-subtitle">Please wait</p>
  </div>
</div>

<!-- Pattern 2: Catalog-specific -->
<div class="catalog-loading-overlay" id="catalog-loading">
  <div class="loading-spinner loading-spinner-sm"></div>
  <p>Loading catalog...</p>
</div>

<!-- Pattern 3: PDP-specific -->
<div class="pdp-loading-overlay" id="pdp-loading-overlay">
  <div class="loading-spinner"></div>
</div>
```

### Issues:
- Three different class names for same purpose
- Inconsistent structure
- Duplicate CSS across multiple files
- No centralized API for show/hide

### Extraction Plan:
```
blocks/loading-overlay/
  ├── loading-overlay.css
  ├── loading-overlay.html
  └── loading-overlay.js (with show/hide API)
```

**API Design:**
```javascript
// Unified API
loadingOverlay.show({ title: 'Loading...', subtitle: 'Please wait' });
loadingOverlay.hide();
loadingOverlay.update({ title: 'Processing...' });
```

**Impact:** High - Would eliminate duplicate code and provide consistent loading UX

---

## 3. Tabs Component 🟡 HIGH

**Current State:** Inline JavaScript in pages  
**Occurrences:** 3 instances across 2 pages

### Locations Found:
- `pages/login.html` - Email/Persona login tabs
- `pages/product-detail.html` - Desktop tabs (Description/Specs/Availability/Volume Pricing)
- `pages/product-detail.html` - Mobile tab select dropdown

### Current Pattern (Login):
```html
<div class="login-tabs">
  <button type="button" class="login-tab active" data-tab="email">
    Email Login
  </button>
  <button type="button" class="login-tab" data-tab="persona">
    Quick Login (Demo)
  </button>
</div>

<div id="email-login" class="login-tab-content active">
  <!-- Content -->
</div>
<div id="persona-login" class="login-tab-content">
  <!-- Content -->
</div>

<script>
  // 40+ lines of tab switching logic
</script>
```

### Current Pattern (Product Detail):
```html
<!-- Desktop Tabs -->
<div class="product-tabs" role="tablist">
  <button class="product-tab active" role="tab" data-tab="description">Description</button>
  <button class="product-tab" role="tab" data-tab="specifications">Specifications</button>
  <!-- ... -->
</div>

<!-- Mobile Select -->
<select id="product-tab-select" class="product-tab-select">
  <option value="description">Description</option>
  <option value="specifications">Specifications</option>
</select>

<div class="product-tab-panels">
  <div class="product-tab-panel active" id="tab-description">...</div>
  <div class="product-tab-panel" id="tab-specifications" hidden>...</div>
</div>

<script>
  // 60+ lines of tab management logic
</script>
```

### Extraction Plan:
```
blocks/tabs/
  ├── tabs.css
  ├── tabs.html
  └── tabs.js (with mobile/desktop responsive behavior)
```

**Features:**
- Auto-generates mobile select from tabs
- Keyboard navigation (arrow keys)
- ARIA compliance
- URL hash support (optional)
- Event system for tab changes

**Impact:** Medium-High - Would eliminate duplicate tab logic and improve accessibility

---

## 4. Breadcrumbs Component 🟡 HIGH

**Current State:** Repeated HTML pattern  
**Occurrences:** 7 instances across 7 pages

### Locations Found:
- `pages/catalog.html`
- `pages/product-detail.html`
- `pages/account.html`
- `pages/bom-review.html`
- `pages/build-configurator.html`
- `pages/dashboard-templates.html`

### Current Pattern:
```html
<div class="breadcrumbs">
  <div>
    <div><a href="../index.html">Home</a></div>
  </div>
  <div>
    <div><a href="/pages/catalog.html">All Products</a></div>
  </div>
  <div>
    <div>Product Name</div>
  </div>
</div>
```

### Issues:
- Deeply nested divs (EDS standard but verbose)
- Manual JavaScript to add current page
- Inconsistent styling for current page
- No structured data markup

### Extraction Plan:
```
blocks/breadcrumbs/
  ├── breadcrumbs.css (EXISTS)
  ├── breadcrumbs.html
  └── breadcrumbs.js (with auto-generation from path)
```

**Note:** CSS already exists, needs to extract HTML/JS pattern

**Impact:** Medium - Would reduce boilerplate and add structured data

---

## 5. Empty State Component 🟡 HIGH

**Current State:** Repeated pattern with inconsistent styling  
**Occurrences:** 8+ instances across 4 pages

### Locations Found:
- `pages/cart.html` - Empty cart state
- `pages/account.html` - Empty builds, deliveries, orders, profile (4 instances)
- Inline in JavaScript - Kit sidebar empty state
- Project builder - Kit empty state

### Current Patterns:
```html
<!-- Pattern 1: Cart -->
<div id="empty-cart" class="cart-empty-state" style="display: none;">
  <div class="empty-cart-icon">
    <svg>...</svg>
  </div>
  <h2 class="empty-cart-title">Your cart is empty</h2>
  <p class="empty-cart-text">Start adding products...</p>
  <a href="catalog.html" class="btn btn-primary">Browse Catalog</a>
</div>

<!-- Pattern 2: Account Dashboard -->
<div class="card">
  <div class="card-body empty-state-card">
    <p class="empty-state-title">No orders yet</p>
    <p class="empty-state-text">When you make a purchase...</p>
  </div>
</div>

<!-- Pattern 3: Kit Sidebar (in JS) -->
<div class="kit-sidebar-empty-state">
  <h3 class="kit-sidebar-empty-title">No items in your kit</h3>
  <p class="kit-sidebar-empty-description">Browse products to add...</p>
</div>
```

### Extraction Plan:
```
blocks/empty-state/
  ├── empty-state.css
  ├── empty-state.html
  └── empty-state.js
```

**Variants:**
1. With icon
2. With illustration
3. With CTA button
4. Compact (for sidebars/small spaces)

**Impact:** Medium - Would standardize empty state UX

---

## 6. Quantity Controls 🔴 CRITICAL

**Current State:** Repeated pattern in multiple contexts  
**Occurrences:** 10+ instances across 5 contexts

### Locations Found:
- `pages/product-detail.html` - PDP quantity controls
- `pages/cart.html` - Cart item quantity (inline in JS)
- `styles/components.css` - Kit sidebar quantity (`.kit-sidebar-qty-btn`)
- `styles/components.css` - Simple list quantity (`.simple-qty-controls`)
- BOM review tables - Inline quantity controls
- Project builder - Product quantity selectors

### Current Patterns:
```html
<!-- Pattern 1: PDP -->
<div class="product-detail-qty-controls">
  <button class="product-detail-qty-btn" data-action="decrease">-</button>
  <input type="number" id="quantity" class="product-detail-quantity-input" value="1" min="1">
  <button class="product-detail-qty-btn" data-action="increase">+</button>
</div>

<!-- Pattern 2: Cart -->
<div class="quantity-controls">
  <button class="qty-btn qty-decrease" data-sku="${sku}">
    <svg>...</svg>
  </button>
  <div class="qty-display">${quantity}</div>
  <button class="qty-btn qty-increase" data-sku="${sku}">
    <svg>...</svg>
  </button>
</div>

<!-- Pattern 3: Kit Sidebar -->
<div class="kit-sidebar-item-qty">
  <button class="kit-sidebar-qty-btn">-</button>
  <input type="number" class="kit-sidebar-qty-input" value="1">
  <button class="kit-sidebar-qty-btn">+</button>
</div>

<!-- Pattern 4: Simple List -->
<div class="simple-qty-controls">
  <button class="simple-qty-btn">-</button>
  <input type="number" class="simple-qty-input" value="1">
  <button class="simple-qty-btn">+</button>
</div>
```

### Issues:
- Four different CSS class sets
- Inconsistent button styles
- Duplicate increment/decrement logic
- No standardized min/max validation

### Extraction Plan:
```
blocks/quantity-control/
  ├── quantity-control.css
  ├── quantity-control.html
  └── quantity-control.js (with validation, events)
```

**Features:**
- Min/max constraints
- Step increments
- Keyboard support (arrow keys)
- Change events for parent components
- Optional display-only mode
- Size variants (small, medium, large)

**Impact:** Very High - Used extensively, high duplication

---

## 7. Status Badge Component 🟡 HIGH

**Current State:** Multiple badge patterns  
**Occurrences:** 15+ instances across 5 contexts

### Badge Types Found:
1. **Inventory Status** - In Stock, Low Stock, Out of Stock
2. **Order Status** - Processing, Shipped, Delivered, Cancelled
3. **Tier Badge** - Customer tier levels
4. **Custom Item Badge** - "CUSTOM" label for custom products
5. **Bundle Badge** - "BUNDLE" label
6. **Savings Badge** - Percentage savings

### Locations Found:
- Product tiles - Inventory status
- Product detail - Inventory badges
- Cart - Bundle badges
- Account dashboard - Order status badges
- Kit sidebar - Custom item badges, out of stock badges
- Pricing displays - Savings badges

### Current Patterns:
```html
<!-- Inventory Status -->
<span class="status in-stock">In Stock</span>
<span class="status low-stock">Low Stock</span>
<span class="status out-of-stock">Out of Stock</span>

<!-- Order Status -->
<span class="order-status delivered">Delivered</span>
<span class="order-status processing">Processing</span>

<!-- Savings -->
<div class="savings-pill">Save 15%</div>

<!-- Custom Badge -->
<span class="custom-item-badge">CUSTOM</span>
<span class="kit-sidebar-item-badge">CUSTOM</span>
```

### Extraction Plan:
```
blocks/status-badge/
  ├── status-badge.css
  ├── status-badge.html
  └── status-badge.js
```

**Variants:**
- Inventory (success/warning/error colors)
- Order Status (brand colors)
- Savings (positive/accent color)
- Info/Label (neutral)

**Impact:** Medium - Would standardize status indicators

---

## 8. Data Table Component 🔴 CRITICAL

**Current State:** Multiple table patterns with duplicate code  
**Occurrences:** 6+ different table implementations

### Table Types Found:
1. **Orders Table** - Account dashboard orders
2. **Builds Table** - Sarah's builds tracking
3. **Deliveries Table** - Delivery schedule
4. **BOM Table** - Bill of materials by phase
5. **Volume Pricing Table** - Tiered pricing
6. **Simple List Table** - Generic product lists

### Locations Found:
- `pages/account.html` - Orders, Builds, Deliveries tables (180+ lines of inline code)
- `pages/bom-review.html` - BOM phase tables
- `pages/product-detail.html` - Volume pricing table
- Kit views - List view tables
- Dashboard - Template listings

### Current Pattern (Orders):
```javascript
// 70+ lines of table rendering logic in account.html
function renderOrdersTable(orders, emptyTitle, emptyText) {
  if (orders.length === 0) {
    return `
      <div class="card">
        <div class="card-body empty-state-card">...</div>
      </div>
    `;
  }
  
  return `
    <div class="orders-table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order / Build</th>
            <!-- ... -->
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `...`).join('')}
        </tbody>
      </table>
    </div>
  `;
}
```

### Issues:
- Duplicate rendering logic across files
- No standardized sorting/filtering
- Inconsistent responsive behavior
- No pagination support
- Duplicate empty state logic

### Extraction Plan:
```
blocks/data-table/
  ├── data-table.css
  ├── data-table.html
  └── data-table.js (with sorting, filtering, pagination)
```

**Features:**
- Column definitions
- Sortable columns
- Filterable rows
- Responsive (stacks on mobile)
- Empty state integration
- Action column support
- Custom cell renderers

**Impact:** Very High - Major code deduplication opportunity

---

## 9. Search Bar Component 🟢 MEDIUM

**Current State:** Inline pattern in catalog  
**Occurrences:** 2 instances (catalog, potential reuse)

### Locations Found:
- `pages/catalog.html` - Product search with clear button

### Current Pattern:
```html
<div class="catalog-search">
  <svg class="search-icon">...</svg>
  <input 
    type="search" 
    id="catalog-search-input" 
    class="catalog-search-input" 
    placeholder="Search products..."
  />
  <button class="search-clear" id="search-clear" style="display: none;">
    <svg>...</svg>
  </button>
</div>

<script>
  // 30+ lines of search logic with debouncing
  searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('catalogSearch', {
        detail: { searchTerm: value }
      }));
    }, 300);
  });
</script>
```

### Extraction Plan:
```
blocks/search-bar/
  ├── search-bar.css
  ├── search-bar.html
  └── search-bar.js (with debouncing)
```

**Features:**
- Built-in debouncing
- Clear button (auto-shows when text entered)
- Search event emission
- Keyboard shortcuts (Cmd/Ctrl+K)
- Loading state

**Impact:** Medium - Would be reusable in other search contexts

---

## 10. Filter Sidebar Component 🟢 MEDIUM

**Current State:** Inline HTML in catalog  
**Occurrences:** 1 (catalog filters)

### Location:
- `pages/catalog.html` - Filters sidebar with categories, price range, availability

### Current Pattern:
```html
<div class="filters-sidebar" data-block-name="filters-sidebar">
  <div class="filters-header">
    <h3>Refine Results</h3>
    <button class="clear-filters">Clear All</button>
  </div>
  
  <div class="filter-section">
    <button class="filter-toggle" data-filter="category" aria-expanded="true">
      <span>Category</span>
      <span class="toggle-icon">▼</span>
    </button>
    <div class="filter-content active" id="filter-category">
      <!-- Checkboxes -->
    </div>
  </div>
  
  <!-- More filter sections -->
</div>
```

### Extraction Plan:
```
blocks/filter-sidebar/
  ├── filter-sidebar.css (EXISTS - partially)
  ├── filter-sidebar.html
  └── filter-sidebar.js (dynamic filter generation)
```

**Note:** CSS exists but HTML/JS is inline

**Features:**
- Dynamic filter generation from config
- Collapsible sections
- Multi-select checkboxes
- Price range inputs
- Clear all functionality
- URL param sync

**Impact:** Medium - Reusable for any filtered listing

---

## 11. Modal/Dialog Component 🟡 HIGH

**Current State:** Inline modals in pages  
**Occurrences:** 3+ instances

### Locations Found:
- `pages/product-detail.html` - Volume pricing modal
- Documentation examples - Delete confirmation modal
- Potential use cases - Image lightbox, confirmation dialogs

### Current Pattern (Volume Pricing):
```html
<div id="volume-pricing-modal" class="volume-pricing-modal" style="display: none;">
  <div class="volume-pricing-modal-backdrop"></div>
  <div class="volume-pricing-modal-content">
    <div class="volume-pricing-modal-header">
      <h3>Volume Pricing</h3>
      <button id="volume-pricing-modal-close" class="volume-pricing-modal-close">
        <svg>...</svg>
      </button>
    </div>
    <div class="volume-pricing-modal-body">
      <!-- Content -->
    </div>
  </div>
</div>

<script>
  // 50+ lines of modal open/close logic
  // Backdrop click handling
  // Escape key handling
  // Body scroll locking
</script>
```

### Extraction Plan:
```
blocks/modal/
  ├── modal.css
  ├── modal.html
  └── modal.js (with API for show/hide)
```

**Features:**
- Show/hide API
- Auto-focus management
- Escape key to close
- Backdrop click to close
- Body scroll lock
- ARIA attributes
- Size variants (small, medium, large, fullscreen)
- Animation options

**API Design:**
```javascript
modal.show({ 
  title: 'Confirm Delete',
  content: '...',
  actions: [...]
});
modal.hide();
```

**Impact:** High - Would standardize all dialog patterns

---

## 12. Navigation Sidebar Component 🟢 MEDIUM

**Current State:** Account nav pattern  
**Occurrences:** 1 (account dashboard)

### Location:
- `pages/account.html` - Account navigation sidebar

### Current Pattern:
```html
<nav class="account-nav">
  <a href="#dashboard" class="account-nav-item active" data-section="dashboard">
    <svg>...</svg>
    Dashboard
  </a>
  <a href="#profile" class="account-nav-item" data-section="profile">
    <svg>...</svg>
    Profile
  </a>
  <!-- More items -->
</nav>

<script>
  // 40+ lines of navigation management
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      // Show/hide sections
      // Update active state
    });
  });
</script>
```

### Extraction Plan:
```
blocks/nav-sidebar/
  ├── nav-sidebar.css
  ├── nav-sidebar.html
  └── nav-sidebar.js (section management)
```

**Impact:** Medium - Useful for dashboard-style layouts

---

## 13. Summary Card/Sidebar 🟡 HIGH

**Current State:** Repeated sticky sidebar pattern  
**Occurrences:** 3 instances

### Locations Found:
- `pages/build-configurator.html` - Order summary sidebar
- `pages/bom-review.html` - BOM actions sidebar
- Cart page - Cart summary sidebar

### Current Pattern (Build Configurator):
```html
<aside class="configurator-sidebar">
  <div class="order-summary-card" id="order-summary">
    <h3 class="summary-title">Order Summary</h3>
    
    <div class="summary-content">
      <div class="summary-line">
        <span class="summary-label">Base Template</span>
        <span class="summary-value" id="summary-base">$0</span>
      </div>
      <!-- More lines -->
      
      <div class="summary-divider"></div>
      
      <div class="summary-line summary-total">
        <span class="summary-label">Estimated Total</span>
        <span class="summary-value" id="summary-total">$0</span>
      </div>
    </div>
    
    <div class="summary-actions">
      <button class="btn btn-cta btn-lg">Generate BOM</button>
    </div>
  </div>
</aside>
```

### Extraction Plan:
```
blocks/summary-sidebar/
  ├── summary-sidebar.css
  ├── summary-sidebar.html
  └── summary-sidebar.js (sticky behavior, updates)
```

**Features:**
- Sticky positioning
- Line items with label/value
- Dividers
- Total highlighting
- Action buttons
- Update API

**Impact:** Medium-High - Used in key conversion flows

---

## 14. Form Input Wrappers 🟢 MEDIUM

**Current State:** Repeated form patterns  
**Occurrences:** 5+ instances across 3 pages

### Locations Found:
- `pages/build-configurator.html` - Build details form
- `pages/signup.html` - Multi-step signup
- `pages/login.html` - Login form
- Various inline forms

### Current Pattern:
```html
<div class="form-group">
  <label class="form-label" for="project-name">
    Project Name
    <span class="required">*</span>
  </label>
  <input type="text" id="project-name" class="form-input" placeholder="...">
  <span class="form-hint">Auto-increments based on your last build</span>
</div>
```

### Extraction Plan:
```
blocks/form-field/
  ├── form-field.css
  ├── form-field.html
  └── form-field.js (validation)
```

**Variants:**
- Text input
- Select dropdown
- Textarea
- Radio group
- Checkbox group
- With validation messages

**Impact:** Medium - Would standardize form UX

---

## 15. Action Button Group 🟢 MEDIUM

**Current State:** Repeated button groupings  
**Occurrences:** 10+ instances

### Patterns Found:
- Primary + Secondary button pairs
- Cancel + Submit combinations
- Multiple action buttons in cards

### Locations:
- Build configurator - Generate BOM + Cancel
- BOM review - Add to Cart + Edit Config
- Modals - Confirm + Cancel
- Account dashboard - Multiple action groups

### Current Pattern:
```html
<div class="summary-actions">
  <button class="btn btn-cta btn-lg">Proceed to Checkout</button>
  <button class="btn btn-secondary">Continue Shopping</button>
</div>
```

### Extraction Plan:
```
blocks/button-group/
  ├── button-group.css
  └── button-group.html
```

**Features:**
- Horizontal/vertical layouts
- Responsive stacking
- Alignment options (left, center, right, justified)

**Impact:** Low-Medium - More of a layout utility

---

## 16. Image Gallery/Lightbox 🟢 MEDIUM

**Current State:** Product gallery block exists  
**Occurrences:** 1 (PDP), potential reuse

### Location:
- `blocks/product-gallery/` - Exists but could be generalized

### Current Use:
- Product detail page - Main image + thumbnails + lightbox

### Extraction Opportunity:
Generalize the existing product-gallery block to work with any images, not just products.

**Impact:** Medium - Reusable for any image-heavy content

---

## 17. Stat Card/Metric Display 🟢 MEDIUM

**Current State:** Inline pattern  
**Occurrences:** 2 instances

### Locations:
- BOM Review - Summary stats (Total Cost, Line Items, Phases)
- Potential use in dashboards

### Current Pattern:
```html
<div class="summary-grid" id="bom-summary">
  <div class="summary-stat-card">
    <span class="stat-value" id="summary-total">$0</span>
    <span class="stat-label">Total Cost</span>
  </div>
  <div class="summary-stat-card">
    <span class="stat-value" id="summary-items">0</span>
    <span class="stat-label">Line Items</span>
  </div>
</div>
```

### Extraction Plan:
```
blocks/stat-card/
  ├── stat-card.css
  └── stat-card.html
```

**Features:**
- Value + label
- Optional icon
- Trend indicator (up/down arrows)
- Color variants

**Impact:** Low-Medium - Nice to have for dashboards

---

## 18. Notification/Toast 🟡 HIGH

**Current State:** Cart notification exists, not generalized  
**Occurrences:** 1 (cart notification), potential reuse

### Location:
- Cart notification system (success notifications)

### Current Pattern:
```html
<div class="cart-notification">
  <div class="cart-notification-icon">...</div>
  <div class="cart-notification-content">
    <span class="cart-notification-text">...</span>
  </div>
  <button class="cart-notification-close">...</button>
</div>
```

### Extraction Opportunity:
Generalize to support:
- Success notifications
- Error notifications
- Warning notifications
- Info notifications

### Extraction Plan:
```
blocks/notification/
  ├── notification.css
  ├── notification.html
  └── notification.js (with queue, timing)
```

**Features:**
- Auto-dismiss timer
- Queue management
- Click to dismiss
- Position options (top, bottom, corner)
- Type variants (success, error, warning, info)

**Impact:** Medium-High - Useful across entire app

---

## 19. Accordion/Collapsible Section 🟢 MEDIUM

**Current State:** Filter toggle pattern  
**Occurrences:** 2+ instances

### Locations:
- Catalog filters - Collapsible filter sections
- BOM review - Phase sections
- Potential use in FAQs, documentation

### Current Pattern (Filters):
```html
<div class="filter-section">
  <button class="filter-toggle" data-filter="category" aria-expanded="true">
    <span>Category</span>
    <span class="toggle-icon">▼</span>
  </button>
  <div class="filter-content active" id="filter-category">
    <!-- Content -->
  </div>
</div>
```

### Extraction Plan:
```
blocks/accordion/
  ├── accordion.css
  ├── accordion.html
  └── accordion.js (expand/collapse)
```

**Features:**
- Single expand or multi-expand
- Animation
- Keyboard navigation
- ARIA attributes
- Icon rotation

**Impact:** Medium - Useful for content organization

---

## 20. Pagination Component ⚪ LOW

**Current State:** Not implemented, but needed  
**Occurrences:** 0 (opportunity for future)

### Potential Uses:
- Product catalog - Paginated results
- Order history - Long lists
- Any data table

### Extraction Plan:
```
blocks/pagination/
  ├── pagination.css
  ├── pagination.html
  └── pagination.js
```

**Features:**
- Page numbers
- Previous/Next buttons
- First/Last buttons
- Current page highlight
- Disabled states

**Impact:** Low - Not currently needed but future-proof

---

## 21. Progress Indicator 🟢 MEDIUM

**Current State:** Wizard progress exists but specialized  
**Occurrences:** 2 instances

### Locations:
- `blocks/wizard-progress/` - Horizontal wizard
- `blocks/wizard-vertical-progress/` - Vertical wizard
- Signup wizard - Multi-step form progress

### Extraction Opportunity:
Generalize existing wizard progress blocks into a more flexible progress indicator.

**Variants:**
- Linear progress bar
- Stepped progress
- Circular/radial progress
- Percentage display

**Impact:** Medium - Useful for multi-step processes

---

## 22. Dropdown Menu Component 🟢 MEDIUM

**Current State:** Header user menu, location selector  
**Occurrences:** 2+ instances

### Locations:
- Header - User menu dropdown
- Header - Location selector dropdown
- Potential use for filters, actions

### Current State:
Implemented in header block, could be extracted for general use.

### Extraction Plan:
```
blocks/dropdown/
  ├── dropdown.css
  ├── dropdown.html
  └── dropdown.js (positioning, click outside)
```

**Features:**
- Click to toggle
- Click outside to close
- Keyboard navigation
- Position auto-detection (below/above, left/right align)
- Icons in menu items
- Dividers

**Impact:** Medium - Reusable across many UIs

---

## 23. Image Placeholder Component 🟢 MEDIUM

**Current State:** Repeated fallback pattern  
**Occurrences:** 10+ instances

### Locations:
- Product tiles - Missing images
- Cart items - Missing images
- Kit sidebar - Missing images
- BOM tables - Missing images

### Current Pattern:
```html
<img src="..." alt="..." 
  onerror="this.parentElement.innerHTML='<div class=\'cart-item-image-placeholder\'><svg>...</svg></div>'">
```

### CSS Pattern:
```css
.product-card-list-image-placeholder,
.simple-list-item-image-placeholder,
.kit-sidebar-item-image-placeholder {
  background: var(--color-border);
  cursor: default;
}

.image-placeholder-pattern::before {
  /* Diagonal stripes */
}
```

### Extraction Plan:
```
blocks/image-placeholder/
  ├── image-placeholder.css
  └── image-placeholder.js (auto-replace on error)
```

**Features:**
- Auto-detection of broken images
- Diagonal stripe pattern
- Icon overlay
- Size variants

**Impact:** Medium - Better error handling UX

---

## Priority Matrix

### Immediate (Sprint 1) 🔴
1. **Quantity Controls** - Used everywhere, high duplication
2. **Loading Overlay** - Inconsistent implementations
3. **Card Component** - 35+ instances
4. **Data Table** - Major code deduplication

### High Priority (Sprint 2) 🟡
5. **Tabs Component** - Eliminate duplicate logic
6. **Breadcrumbs** - Standardize navigation
7. **Status Badges** - Unify status indicators
8. **Modal/Dialog** - Standardize overlays
9. **Summary Sidebar** - Key conversion flows
10. **Empty State** - Consistent empty UX

### Medium Priority (Sprint 3) 🟢
11. **Search Bar** - Reusable pattern
12. **Filter Sidebar** - Extract from inline
13. **Navigation Sidebar** - Dashboard layouts
14. **Form Fields** - Standardize inputs
15. **Notification/Toast** - Generalize existing
16. **Accordion** - Content organization
17. **Image Placeholder** - Error handling
18. **Stat Card** - Dashboard metrics
19. **Dropdown** - General purpose menus
20. **Action Button Group** - Layout utility

### Future/Nice-to-Have ⚪
21. **Pagination** - Not yet needed
22. **Progress Indicator** - Generalize existing
23. **Image Gallery** - Generalize existing

---

## Implementation Guidelines

### For Each Component:

1. **Create Block Structure**
   ```
   blocks/[component-name]/
     ├── [component-name].css
     ├── [component-name].html
     └── [component-name].js
   ```

2. **Follow EDS Patterns**
   - Use nested divs for EDS table format
   - Implement `decorate(block)` function
   - Return decorated block from function
   - Add to block auto-loader in scripts.js

3. **Support Variants**
   - Use data attributes for variants
   - Use CSS modifier classes
   - Document all variants in README

4. **Provide API**
   - Export helper functions where needed
   - Emit custom events for interactions
   - Support programmatic control

5. **Document Usage**
   - Add README.md to block folder
   - Show HTML examples
   - Show JavaScript usage
   - List all variants

6. **Test Thoroughly**
   - Test in isolation
   - Test in context of existing pages
   - Test responsive behavior
   - Test accessibility

---

## Estimated Impact

**Total Lines of Duplicate Code:** ~2,000+ lines  
**Files That Would Be Simplified:** 15+ files  
**Consistency Improvements:** Massive (23 patterns standardized)  
**Maintainability:** Significantly improved  
**Authoring Experience:** Much better (reusable blocks vs custom code)

---

## Next Steps

1. **Review & Prioritize** - Review this audit with team, confirm priorities
2. **Create Extraction Plan** - Break down into sprints
3. **Start with Quick Wins** - Begin with high-impact, low-effort items
4. **Incremental Migration** - Don't break existing pages, migrate gradually
5. **Document Components** - Create comprehensive component library docs
6. **Update Standards** - Add component usage to coding standards

---

## Conclusion

This audit reveals significant opportunities for componentization. The biggest wins are:

1. **Quantity Controls** - Eliminate 4 duplicate implementations
2. **Loading Overlays** - Unify 3 different patterns
3. **Cards** - Standardize 35+ instances
4. **Data Tables** - Massive deduplication opportunity
5. **Tabs** - Remove duplicate logic from 3 places

By systematically extracting these 23 components, we can:
- Reduce codebase size by ~2,000 lines
- Improve consistency across the entire UI
- Make development faster (reuse vs rebuild)
- Improve maintainability (fix once, apply everywhere)
- Better align with EDS best practices

