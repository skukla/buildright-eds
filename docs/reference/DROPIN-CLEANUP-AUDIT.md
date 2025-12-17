# Commerce Dropin Cleanup Audit

**Date**: December 12, 2024  
**Status**: Phase 5.5 - Commerce Dropins Integration (In Progress)

## Executive Summary

This audit identifies:
1. **Conflicting logic** from pre-dropin implementations
2. **Reusability issues** where components could be better shared
3. **EDS patterns** for proper component architecture

---

## 1. Conflicting/Deprecated Logic

### ✅ KEEP: Intentional Dual-Mode Support

These files provide **intentional fallbacks** and should be kept:

#### `scripts/commerce-helpers.js`
**Status**: ✅ **KEEP** - Well-designed bridge layer  
**Purpose**: Provides a unified API that works with either:
- Commerce Dropins (production)
- Local cart-manager.js (demo/fallback)

**Why it's good**:
```javascript
// Detects config and routes to appropriate implementation
if (config.features?.useCommerceDropins) {
  const { addToCart } = await import('./initializers/cart.js');
  return await addToCart(product.sku, quantity);
} else {
  return addToLocalCart(product, quantity);
}
```

**Usage**: Product tiles, BOM builder, and other components should use `commerce-helpers.js` functions:
- `addProductToCart(product, quantity)`
- `addMultipleToCart(items)`
- `getCartItemCount()`
- `createAddToCartButton(product, options)`

---

#### `scripts/cart-manager.js`
**Status**: ✅ **KEEP** - Fallback for demo mode  
**Purpose**: localStorage-based cart for when Commerce Dropins are disabled

**Why it's needed**:
- Allows site to function without Commerce backend
- Useful for local development/demos
- Automatically used via `commerce-helpers.js` fallback logic

---

### ⚠️ NEEDS CLEANUP: Direct Imports

These files are **directly importing** old cart-manager instead of using the bridge layer:

#### ❌ `index.html` (Line 257)
```javascript
await import('./scripts/cart-manager.js');
```

**Issue**: Loads old cart unconditionally  
**Fix**: Remove this import (cart is loaded conditionally via commerce-helpers.js)

---

#### ❌ `scripts/app.js` (Line 4)
```javascript
import './cart-manager.js';
```

**Issue**: Unconditional import  
**Fix**: Remove this import

---

### ⚠️ REVIEW NEEDED: Cart Badge Update Logic

#### Issue: Selector Mismatch (FIXED)
**Status**: ✅ **FIXED** in this session

**Problem** (before fix):
- Header HTML used `.cart-count`
- Cart Dropin initializer expected `.cart-badge`
- Result: Badge never updated, sometimes showed "Loading..."

**Fix applied**:
- Updated `blocks/header/header.html` to use `.cart-badge`
- Updated `blocks/header/header.css` to style `.cart-badge` with `.has-items` toggle
- Removed inline `<script>` tag that set initial count

---

## 2. Component Reusability Issues

### Current State

#### Pages Using Dropins

| Page | Dropin Usage | Implementation Method |
|------|--------------|----------------------|
| `login.html` | Auth (API-only) | Custom HTML + `getCustomerToken()` API |
| `signup.html` | Auth | Dropin Container (needs review) |
| `catalog.html` | Mini Cart | Block (`commerce-mini-cart`) |
| `cart.html` | Cart | Inline `<script>` rendering Dropin |
| `checkout.html` | Checkout | Inline `<script>` rendering Dropin |
| `order-confirmation.html` | Order Confirmation | Inline `<script>` rendering Dropin |
| `order-history.html` | Order | Inline `<script>` rendering Dropin |

#### Problem: Inline Script Duplication

Each page has **duplicated initialization logic** like this:

```javascript
// cart.html
<script type="module">
  import { waitForDropins } from '../scripts/initializers/index.js';
  
  async function initializeCartPage() {
    await waitForDropins();
    const { render } = await import('@dropins/storefront-cart/render.js');
    const Cart = (await import('@dropins/storefront-cart/containers/Cart.js')).default;
    await render(Cart, { ...config })(container);
  }
  initializeCartPage();
</script>
```

This same pattern is repeated in:
- `checkout.html`
- `order-confirmation.html`
- `order-history.html`

---

## 3. EDS Reusability Patterns

### How EDS Handles Component Reuse

EDS has a **block-based architecture**. Here's how components should be shared:

---

### Pattern 1: **Blocks** (Most Common)

**When to use**: Reusable UI components that appear on multiple pages

**Structure**:
```
blocks/
  my-component/
    my-component.js     ← Exports decorate(block)
    my-component.css    ← Component styles
    my-component.html   ← Optional: Template
    README.md           ← Documentation
```

**Usage in HTML**:
```html
<!-- Automatic decoration -->
<div class="my-component"></div>

<!-- Or with data attributes -->
<div class="my-component variant-header" data-config='{"option": "value"}'></div>
```

**Usage in JS**:
```javascript
import { decorateBlock } from '../scripts/scripts.js';

const block = document.createElement('div');
block.className = 'my-component';
await decorateBlock(block, 'my-component');
parentElement.appendChild(block);
```

**Examples**:
- ✅ `blocks/commerce-mini-cart/` - Used in header across all pages
- ✅ `blocks/auth-dropin/` - Used in header and login page
- ✅ `blocks/product-tile/` - Used in catalog, search results, etc.

---

### Pattern 2: **Fragments** (Page Sections)

**When to use**: Large page sections that are reused verbatim

**Structure**:
```
fragments/
  hero-banner.html
  footer-nav.html
```

**Usage**:
```javascript
import { loadFragment } from '../scripts/fragment-loader.js';

const fragment = await loadFragment('/fragments/hero-banner.html');
container.appendChild(fragment);
```

**When NOT to use**: If the component needs JavaScript behavior (use blocks instead)

---

### Pattern 3: **Utility Modules** (Shared Logic)

**When to use**: Pure JavaScript logic with no UI

**Structure**:
```
scripts/
  services/
    catalog-service.js
    mesh-client.js
  initializers/
    auth.js
    cart.js
  commerce-helpers.js
  utils.js
```

**Usage**:
```javascript
import { addProductToCart } from '../scripts/commerce-helpers.js';
import { getCatalogService } from '../scripts/services/catalog-service.js';
```

**Examples**:
- ✅ `scripts/commerce-helpers.js` - Cart operations
- ✅ `scripts/services/catalog-service.js` - Product data
- ✅ `scripts/initializers/cart.js` - Cart Dropin initialization

---

### Pattern 4: **Page-Specific Scripts** (Minimal)

**When to use**: Logic that's truly unique to one page

**Guideline**: Keep inline `<script>` tags minimal. If logic is >20 lines or could be reused, extract it.

**Example** (current issue):
```html
<!-- ❌ BAD: Duplicated across cart/checkout/order pages -->
<script type="module">
  async function initializeCartPage() {
    await waitForDropins();
    const { render } = await import('@dropins/storefront-cart/render.js');
    // ... 20 more lines
  }
</script>
```

**Better approach**:
```html
<!-- ✅ GOOD: Extract to reusable block -->
<div class="commerce-cart-page"></div>
```

```javascript
// blocks/commerce-cart-page/commerce-cart-page.js
export default async function decorate(block) {
  await waitForDropins();
  const { render } = await import('@dropins/storefront-cart/render.js');
  // ... reusable initialization
}
```

---

## 4. Recommended Cleanup Actions

### Priority 1: Fix Conflicting Logic

- [x] **DONE**: Fix cart badge selector mismatch
- [ ] **Remove** `index.html` line 257 import of `cart-manager.js`
- [ ] **Remove** `scripts/app.js` line 4 import of `cart-manager.js`

### Priority 2: Extract Duplicate Dropin Initializers

Create reusable blocks for each dropin page:

#### Create `blocks/commerce-cart-page/`
```javascript
// Replaces inline script in cart.html
export default async function decorate(block) {
  await waitForDropins();
  const { render } = await import('@dropins/storefront-cart/render.js');
  const Cart = (await import('@dropins/storefront-cart/containers/Cart.js')).default;
  
  const basePath = window.BASE_PATH || '/';
  await render(Cart, {
    routeEmptyCartCTA: () => `${basePath}catalog`,
    routeCheckout: () => `${basePath}pages/checkout.html`,
    routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
    enableQuantityUpdate: true,
    enableRemoveItem: true,
  })(block);
}
```

Then simplify `cart.html`:
```html
<div class="commerce-cart-page"></div>
```

#### Similarly create:
- `blocks/commerce-checkout-page/` for `checkout.html`
- `blocks/commerce-order-confirmation-page/` for `order-confirmation.html`
- `blocks/commerce-order-history-page/` for `order-history.html`

### Priority 3: Review Auth Dropin Usage

- [ ] **Review** `signup.html` - Is it using Dropin Container or API-only pattern?
- [ ] **Ensure consistency** with `login.html` pattern (custom HTML + API)

### Priority 4: Documentation

- [ ] **Update** `DROPIN-INTEGRATION-PATTERN.md` with EDS reusability patterns
- [ ] **Document** when to use blocks vs inline scripts
- [ ] **Add examples** of each pattern to the standards doc

---

## 5. EDS Best Practices Summary

### ✅ DO

1. **Use blocks for reusable components**
   - Mini cart, auth menu, product tiles, etc.
   - Self-contained: JS + CSS + optional HTML

2. **Use utility modules for shared logic**
   - `commerce-helpers.js` for cart operations
   - Service layers for data access

3. **Keep inline scripts minimal**
   - <20 lines
   - Page-specific only
   - Extract to blocks if reused

4. **Follow the decorateBlock pattern**
   - Automatic discovery via class names
   - Manual decoration when building dynamic UI

### ❌ DON'T

1. **Don't duplicate initialization code**
   - Extract to blocks or utility modules

2. **Don't import cart-manager.js directly**
   - Use `commerce-helpers.js` bridge layer

3. **Don't mix selector conventions**
   - Standardize on `.cart-badge` for cart count
   - Document selectors in README

4. **Don't put business logic in page HTML**
   - Extract to blocks or utilities

---

## 6. Migration Checklist

### Phase 5.5 (Current) - Commerce Dropins

- [x] Implement Auth Dropin (API-only)
- [x] Implement Mini Cart Dropin (API-only)
- [ ] Fix selector mismatch for cart badge
- [ ] Remove conflicting cart-manager imports
- [ ] Extract inline dropin initializers to blocks
- [ ] Test all cart operations end-to-end

### Phase 6 (Future) - Custom SDK Dropins

- [ ] Build custom Product Tile Dropin (for ACO products)
- [ ] Build custom BOM Builder Dropin
- [ ] Build custom Bundle Display Dropin (for cart)
- [ ] Integrate with event bus for consistency

---

## 7. Files Requiring Immediate Action

| File | Action | Priority |
|------|--------|----------|
| `index.html` | Remove line 257 `cart-manager.js` import | High |
| `scripts/app.js` | Remove line 4 `cart-manager.js` import | High |
| `cart.html` | Extract inline script to block | Medium |
| `checkout.html` | Extract inline script to block | Medium |
| `order-confirmation.html` | Extract inline script to block | Medium |
| `order-history.html` | Extract inline script to block | Medium |
| `signup.html` | Review dropin usage pattern | Medium |

---

## 8. Component Inventory

### ✅ Properly Structured (Keep as-is)

- `blocks/commerce-mini-cart/` - Context-aware mini cart
- `blocks/auth-dropin/` - Context-aware auth menu
- `blocks/login-form/` - Custom login with API integration
- `blocks/product-grid/` - Catalog display
- `blocks/product-tile/` - Individual product card
- `scripts/commerce-helpers.js` - Cart operations bridge
- `scripts/initializers/auth.js` - Auth Dropin setup
- `scripts/initializers/cart.js` - Cart Dropin setup

### ⚠️ Needs Refactoring

- `cart.html` inline script → Extract to block
- `checkout.html` inline script → Extract to block
- `order-confirmation.html` inline script → Extract to block
- `order-history.html` inline script → Extract to block

### 📦 Legacy (Keep for fallback)

- `scripts/cart-manager.js` - localStorage cart (demo mode)
- `scripts/data-mock.js` - Mock product data (demo mode)
- `scripts/aco-service.js` - Mock ACO API (demo mode)

---

## Conclusion

The current architecture is **mostly solid** with a few cleanup items:

1. **Remove conflicting imports** that bypass the bridge layer
2. **Extract duplicate inline scripts** to reusable blocks
3. **Follow EDS block patterns** for all reusable components

These changes will ensure:
- ✅ Consistent dropin integration across all pages
- ✅ No conflicting cart implementations
- ✅ Better maintainability and reusability
- ✅ Easier testing and debugging

