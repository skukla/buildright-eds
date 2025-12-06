# Component Extraction - Quick Reference

**Last Updated:** December 6, 2025  
**Full Audit:** See `COMPONENT-EXTRACTION-OPPORTUNITIES.md`

---

## At a Glance

**Total Opportunities Identified:** 23 components  
**High-Impact Items:** 10 components  
**Estimated Code Reduction:** ~2,000 lines  
**Files Affected:** 15+ pages

---

## Top 10 Priority Components

### 🔴 Critical Priority (Week 1-2)

| # | Component | Instances | Impact | Files |
|---|-----------|-----------|--------|-------|
| 1 | **Quantity Controls** | 10+ | ⭐⭐⭐⭐⭐ | PDP, Cart, Kit Sidebar, Tables |
| 2 | **Loading Overlay** | 8+ | ⭐⭐⭐⭐⭐ | All major pages |
| 3 | **Card Component** | 35+ | ⭐⭐⭐⭐ | Homepage, Account, Forms |
| 4 | **Data Table** | 6+ | ⭐⭐⭐⭐⭐ | Account, BOM, Orders |

**Why Critical:** These 4 components alone would eliminate ~1,000 lines of duplicate code and standardize core patterns used throughout the app.

---

### 🟡 High Priority (Week 3-4)

| # | Component | Instances | Impact | Files |
|---|-----------|-----------|--------|-------|
| 5 | **Tabs** | 3 | ⭐⭐⭐ | Login, PDP |
| 6 | **Breadcrumbs** | 7 | ⭐⭐⭐ | All content pages |
| 7 | **Status Badges** | 15+ | ⭐⭐⭐ | Products, Orders, Cart |
| 8 | **Modal/Dialog** | 3+ | ⭐⭐⭐⭐ | PDP, Confirmations |
| 9 | **Summary Sidebar** | 3 | ⭐⭐⭐ | Configurator, BOM, Cart |
| 10 | **Empty State** | 8+ | ⭐⭐ | Cart, Account, Sidebars |

---

## Quick Win Checklist

Use this checklist to track extraction progress:

### Sprint 1: Foundation Components

- [ ] **Quantity Controls** 
  - [ ] Create block structure
  - [ ] Extract from PDP
  - [ ] Extract from Cart
  - [ ] Extract from Kit Sidebar
  - [ ] Extract from Tables
  - [ ] Add to component library

- [ ] **Loading Overlay**
  - [ ] Create unified block
  - [ ] Replace catalog-loading-overlay
  - [ ] Replace pdp-loading-overlay
  - [ ] Replace generic loading-overlay
  - [ ] Create show/hide API
  - [ ] Update all pages

- [ ] **Card Component**
  - [ ] Create base card block
  - [ ] Add variant: interactive
  - [ ] Add variant: empty-state
  - [ ] Add variant: quick-action
  - [ ] Add variant: category
  - [ ] Migrate homepage
  - [ ] Migrate account page
  - [ ] Migrate other pages

- [ ] **Data Table**
  - [ ] Create base table block
  - [ ] Add sorting capability
  - [ ] Add filtering capability
  - [ ] Add responsive behavior
  - [ ] Migrate orders table
  - [ ] Migrate builds table
  - [ ] Migrate deliveries table
  - [ ] Migrate BOM table

### Sprint 2: UI Patterns

- [ ] **Tabs Component**
  - [ ] Create base tabs block
  - [ ] Add mobile select variant
  - [ ] Add keyboard navigation
  - [ ] Migrate login tabs
  - [ ] Migrate PDP tabs

- [ ] **Breadcrumbs**
  - [ ] Extract HTML/JS pattern
  - [ ] Add auto-generation
  - [ ] Add structured data
  - [ ] Migrate all 7 pages

- [ ] **Status Badges**
  - [ ] Create base badge block
  - [ ] Add inventory variant
  - [ ] Add order status variant
  - [ ] Add savings variant
  - [ ] Migrate all badge instances

- [ ] **Modal/Dialog**
  - [ ] Create base modal block
  - [ ] Add show/hide API
  - [ ] Add keyboard handling
  - [ ] Migrate volume pricing modal
  - [ ] Add to component library

- [ ] **Summary Sidebar**
  - [ ] Create sticky sidebar block
  - [ ] Add line items support
  - [ ] Add update API
  - [ ] Migrate configurator
  - [ ] Migrate BOM review
  - [ ] Migrate cart

- [ ] **Empty State**
  - [ ] Create base empty state block
  - [ ] Add variants (with icon, with CTA, compact)
  - [ ] Migrate cart empty state
  - [ ] Migrate account empty states

### Sprint 3: Enhancement Components

- [ ] Search Bar
- [ ] Filter Sidebar  
- [ ] Navigation Sidebar
- [ ] Form Fields
- [ ] Notification/Toast
- [ ] Accordion
- [ ] Image Placeholder
- [ ] Stat Card
- [ ] Dropdown
- [ ] Action Button Group

---

## Component Library Structure

After extraction, the blocks folder should look like:

```
blocks/
├── accordion/
│   ├── accordion.css
│   ├── accordion.html
│   ├── accordion.js
│   └── README.md
├── breadcrumbs/
│   ├── breadcrumbs.css
│   ├── breadcrumbs.html  ← NEW
│   ├── breadcrumbs.js     ← NEW
│   └── README.md          ← NEW
├── card/
│   ├── card.css
│   ├── card.html
│   ├── card.js
│   └── README.md
├── data-table/
│   ├── data-table.css
│   ├── data-table.html
│   ├── data-table.js
│   └── README.md
├── empty-state/
│   ├── empty-state.css
│   ├── empty-state.html
│   ├── empty-state.js
│   └── README.md
├── loading-overlay/
│   ├── loading-overlay.css
│   ├── loading-overlay.html
│   ├── loading-overlay.js
│   └── README.md
├── modal/
│   ├── modal.css
│   ├── modal.html
│   ├── modal.js
│   └── README.md
├── quantity-control/
│   ├── quantity-control.css
│   ├── quantity-control.html
│   ├── quantity-control.js
│   └── README.md
├── status-badge/
│   ├── status-badge.css
│   ├── status-badge.html
│   ├── status-badge.js
│   └── README.md
├── summary-sidebar/
│   ├── summary-sidebar.css
│   ├── summary-sidebar.html
│   ├── summary-sidebar.js
│   └── README.md
├── tabs/
│   ├── tabs.css
│   ├── tabs.html
│   ├── tabs.js
│   └── README.md
└── [13 more components...]
```

---

## Before/After Examples

### Example 1: Quantity Controls

**Before (PDP):**
```html
<!-- In product-detail.html -->
<div class="product-detail-qty-controls">
  <button class="product-detail-qty-btn" data-action="decrease">-</button>
  <input type="number" id="quantity" value="1" min="1">
  <button class="product-detail-qty-btn" data-action="increase">+</button>
</div>

<script>
  // 30+ lines of increment/decrement logic
</script>
```

**After:**
```html
<!-- In product-detail.html -->
<div class="quantity-control" 
     data-block-name="quantity-control"
     data-min="1" 
     data-max="9999"
     data-sku="LBR-D0414F1E">
  <div>1</div>
</div>
```

**Savings:** 25+ lines per usage × 10 usages = ~250 lines

---

### Example 2: Loading Overlay

**Before (3 different patterns):**
```html
<!-- Pattern 1: Catalog -->
<div class="catalog-loading-overlay" id="catalog-loading">
  <div class="loading-spinner loading-spinner-sm"></div>
  <p>Loading catalog...</p>
</div>

<!-- Pattern 2: PDP -->
<div class="pdp-loading-overlay" id="pdp-loading-overlay">
  <div class="loading-spinner"></div>
</div>

<!-- Pattern 3: Generic -->
<div class="loading-overlay" id="loading-overlay" data-visible="false">
  <div class="loading-content">
    <div class="loading-spinner"></div>
    <h3>Loading...</h3>
  </div>
</div>
```

**After (1 unified pattern):**
```html
<div class="loading-overlay" 
     data-block-name="loading-overlay"
     data-message="Loading catalog...">
  <div></div>
</div>

<script type="module">
  import { decorateBlock } from '../scripts/scripts.js';
  const overlay = document.querySelector('[data-block-name="loading-overlay"]');
  const loader = await decorateBlock(overlay, 'loading-overlay');
  
  // Simple API
  loader.show();
  loader.hide();
  loader.update({ message: 'Processing...' });
</script>
```

**Savings:** 3 CSS files consolidated, 1 unified API

---

### Example 3: Data Tables

**Before (Orders Table in account.html):**
```javascript
// 70+ lines of inline rendering logic
function renderOrdersTable(orders, emptyTitle, emptyText) {
  if (orders.length === 0) {
    return `<div class="card"><div class="card-body empty-state-card">
      <p class="empty-state-title">${emptyTitle}</p>
      <p class="empty-state-text">${emptyText}</p>
    </div></div>`;
  }
  
  return `
    <div class="orders-table-wrapper">
      <table class="orders-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Order / Build</th>
            <th>Items</th>
            <th>Total</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${orders.map(order => `
            <tr>
              <td data-label="Date">${formatDate(order.timestamp)}</td>
              <td data-label="Order / Build">
                <div>${order.orderID}</div>
                ${order.buildName ? `<div>${order.buildName}</div>` : ''}
              </td>
              <td data-label="Items">${order.itemCount} items</td>
              <td data-label="Total">$${order.total.toFixed(2)}</td>
              <td data-label="Status">
                <span class="order-status ${order.status.toLowerCase()}">${order.status}</span>
              </td>
              <td data-label="Actions">
                <button class="btn btn-secondary btn-sm">View Details</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}
```

**After:**
```html
<div class="data-table" 
     data-block-name="data-table"
     data-columns="date,order,items,total,status,actions"
     data-sortable="date,total"
     data-empty-title="No orders yet"
     data-empty-text="When you make a purchase, it will appear here">
  <div></div>
</div>

<script type="module">
  import { decorateBlock } from '../scripts/scripts.js';
  const table = document.querySelector('[data-block-name="data-table"]');
  const dataTable = await decorateBlock(table, 'data-table');
  
  // Simple data binding
  dataTable.setData(orders);
</script>
```

**Savings:** 70+ lines × 6 table types = ~420 lines

---

## Migration Strategy

### Phase 1: Create Components (Weeks 1-2)
- Build 4 critical components
- Test in isolation
- Document usage

### Phase 2: Migrate High-Traffic Pages (Week 3)
- Homepage
- Product detail page
- Cart page
- Catalog page

### Phase 3: Migrate Account Pages (Week 4)
- Account dashboard
- Orders
- Profile

### Phase 4: Migrate Specialty Pages (Week 5)
- Build configurator
- BOM review
- Template dashboard

### Phase 5: Polish & Documentation (Week 6)
- Component library documentation
- Usage examples
- Migration guide

---

## Success Metrics

Track these metrics to measure success:

- [ ] **Code Reduction:** Reduced codebase by 2,000+ lines
- [ ] **Consistency:** All instances of each pattern use the same component
- [ ] **Performance:** No degradation in page load times
- [ ] **Maintainability:** Bug fixes apply to all instances automatically
- [ ] **Developer Experience:** Faster development of new features
- [ ] **Quality:** No regression bugs introduced

---

## Common Pitfalls to Avoid

1. **Over-Engineering** - Don't add features you don't need
2. **Breaking Changes** - Maintain backward compatibility during migration
3. **Poor Documentation** - Document BEFORE migrating
4. **Scope Creep** - Stick to the extraction, don't refactor everything
5. **Testing Gaps** - Test each component thoroughly
6. **Inconsistent Naming** - Follow EDS naming conventions

---

## Resources

- **Full Audit:** `COMPONENT-EXTRACTION-OPPORTUNITIES.md`
- **EDS Documentation:** [Adobe Edge Delivery Docs](https://www.aem.live/developer/block-collection)
- **Existing Blocks:** `blocks/` folder for reference patterns
- **Design System:** `docs/design-system/` for styling guidelines

---

## Questions?

Contact the development team or refer to:
- `docs/standards/CSS-ARCHITECTURE.md`
- `docs/standards/BUTTON-SYSTEM.md`
- `docs/IMPLEMENTATION-GUIDE.md`

