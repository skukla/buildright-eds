# BuildRight Dropin Integration Pattern (Corrected)

**Status**: Active Standard (Updated Dec 19, 2025)  
**Date**: December 19, 2025  
**Applies To**: All Adobe Commerce Dropin integrations  
**Previous Version**: Incorrectly documented "API-only" approach

---

## ⚠️ Documentation Correction

**What Previous Documentation Said**: "We use API-only approach for all dropins"  
**Reality**: We use **UI containers with configuration options** for all dropins

This document has been updated to reflect the actual implementation pattern.

---

## Core Principle

**Use dropin UI containers with configuration options. Add custom slots when BuildRight design requires it.**

This means:
- ✅ **DO** use dropin UI containers (SignIn, CartSummaryList, Checkout, ProductList, Facets)
- ✅ **DO** configure them with routes, callbacks, and flags
- ✅ **DO** add custom slots when we need BuildRight-specific HTML structure
- ❌ **DON'T** create custom HTML unless truly necessary (mini cart case)

---

## Pattern Levels

BuildRight uses THREE integration patterns depending on requirements:

### Level 1: UI Container + Configuration Options
**When to use**: Dropin's default UI is acceptable, just needs routing/behavior config

**Example**: Auth, Cart, Checkout dropins

```javascript
// Auth Dropin - SignIn container
const { render } = await import('@dropins/storefront-auth/render.js');
const SignIn = await import('@dropins/storefront-auth/containers/SignIn.js');

await render.render(SignIn, {
  // Configuration options (no slots needed)
  routeForgotPassword: () => './reset-password.html',
  routeSignUp: () => './signup.html',
  routeRedirectOnSignIn: () => './dashboard.html',
  renderSignUpLink: true,
  onSuccessCallback: () => { console.log('Login success'); },
  onErrorCallback: (error) => { console.error(error); }
})(block);
```

**Customization method**: Configuration options only  
**Effort**: Low  
**Design control**: Minimal (dropin's default UI)

---

### Level 2: UI Container + Configuration + Slots
**When to use**: Need BuildRight-specific design within dropin's structure

**Example**: PLP (Product List + Facets)

```javascript
// PLP - ProductList container with custom slots
const { render } = await import('@dropins/storefront-product-discovery/render.js');
const ProductList = await import('@dropins/storefront-product-discovery/containers/ProductList.js');

await render.render(ProductList, {
  // Configuration options
  routeProduct: (product) => `./product-detail.html?sku=${product.sku}`,
  infiniteScroll: true,
  
  // Custom slots for BuildRight design
  slots: {
    ProductCard: (context) => {
      const { product } = context;
      return `
        <div class="product-tile" data-sku="${product.sku}">
          ${product.attributes.tier ? `<span class="tier-badge ${product.attributes.tier}">${product.attributes.tier}</span>` : ''}
          <img src="${product.image.url}" alt="${product.name}" />
          <div class="product-title">${product.name}</div>
          <div class="product-sku">SKU: ${product.sku}</div>
          <div class="product-manufacturer">${product.attributes.manufacturer || ''}</div>
          <div class="product-grade">${product.attributes.grade || ''}</div>
          <div class="product-price">$${product.price.final.amount.value}</div>
        </div>
      `;
    },
    EmptyState: (context) => {
      return `<div class="no-products">No products found</div>`;
    }
  }
})(block);
```

**Customization method**: Configuration + Slots  
**Effort**: Medium  
**Design control**: High (full HTML control within container)

---

### Level 3: Custom HTML + Dropin APIs + Events
**When to use**: Need complete control over structure AND behavior

**Example**: Mini Cart (header dropdown)

```javascript
// Mini Cart - Custom HTML with Dropin APIs
export default async function decorate(block) {
  // Create BuildRight's exact HTML structure
  block.innerHTML = `
    <div class="mini-cart">
      <div class="mini-cart-header">...</div>
      <div class="mini-cart-items" id="mini-cart-items"></div>
      <div class="mini-cart-footer">...</div>
    </div>
  `;
  
  // Import Dropin APIs (not UI containers)
  const { getCartData, removeCartItems } = await import('@dropins/storefront-cart/api.js');
  const { events } = await import('@dropins/tools/event-bus.js');
  
  // Wire up functionality
  async function updateMiniCart() {
    const cart = await getCartData();
    // Update custom HTML with cart data
  }
  
  // Listen for events
  events.on('cart/updated', () => updateMiniCart());
  
  // Initial load
  await updateMiniCart();
}
```

**Customization method**: Custom HTML + APIs + Events  
**Effort**: High  
**Design control**: Complete (100% custom)

---

## Implementation Summary: Current Dropins

| Dropin | Pattern Level | Container Used | Slots Used | APIs Used | Events Used |
|--------|---------------|----------------|------------|-----------|-------------|
| **Auth** (SignIn) | Level 1 | ✅ `SignIn` | ❌ None | - | - |
| **Auth** (SignUp) | Level 1 | ✅ `SignUp` | ❌ None | - | - |
| **Auth** (ResetPassword) | Level 1 | ✅ `ResetPassword` | ❌ None | - | - |
| **Auth** (User Menu) | Level 3 | ❌ None | - | ✅ `isAuthenticated()`, `logout()` | - |
| **Cart** (Full Page) | Level 1 | ✅ `CartSummaryList` | ❌ None | - | - |
| **Mini Cart** (Header) | Level 2 | ✅ `MiniCart` | ✅ `Heading`, `EmptyCart`, `CartItem`, `Footer` | - | - |
| **Checkout** | Level 1 | ✅ `Checkout` | ❌ None | - | - |
| **PLP** (Planned) | Level 2 | ✅ `ProductList`, `Facets` | ✅ `ProductCard`, `FacetGroup`, `FacetOption` | - | - |

---

## Detailed Implementation Examples

### Example 1: Auth Dropin (Level 1)

**File**: `blocks/auth-dropin/auth-dropin.js`

```85:109:blocks/auth-dropin/auth-dropin.js
async function renderSignInForm(block) {
  try {
    // The render export is an object with a render method
    const { render: authRenderer } = await import('@dropins/storefront-auth/render.js');
    const SignIn = (await import('@dropins/storefront-auth/containers/SignIn.js')).default;
    
    block.innerHTML = '';
    
    await authRenderer.render(SignIn, {
      routeForgotPassword: () => './reset-password.html',
      renderSignUpLink: true,
      routeSignUp: () => './signup.html',
      routeRedirectOnSignIn: () => {
        // Get redirect URL from session storage or default to dashboard
        const redirectUrl = sessionStorage.getItem('auth_redirect') || './dashboard.html';
        sessionStorage.removeItem('auth_redirect');
        return redirectUrl;
      },
      onSuccessCallback: () => {
        console.log('[AuthDropin] Sign in successful');
      },
      onErrorCallback: (error) => {
        console.error('[AuthDropin] Sign in error:', error);
      }
    })(block);
    
  } catch (error) {
    console.error('[AuthDropin] Failed to render SignIn:', error);
    await renderDemoMode(block);
  }
}
```

**Configuration Options Used**:
- `routeForgotPassword`: Routing function
- `routeSignUp`: Routing function
- `routeRedirectOnSignIn`: Post-login redirect
- `renderSignUpLink`: Boolean flag
- `onSuccessCallback`: Success handler
- `onErrorCallback`: Error handler

**Slots Used**: None  
**Design**: Dropin's default UI

---

### Example 2: Cart Dropin (Level 1)

**File**: `blocks/cart-dropin/cart-dropin.js`

```42:52:blocks/cart-dropin/cart-dropin.js
    const { render } = await import('@dropins/storefront-cart/render.js');
    const { CartSummaryList } = await import('@dropins/storefront-cart/containers/CartSummaryList.js');

    await render.render(CartSummaryList, {
      routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
      hideHeading: false,
      hideFooter: false,
      enableRemoveItem: true,
      enableUpdateItemQuantity: true,
    })(block);
```

**Configuration Options Used**:
- `routeEmptyCartCTA`: Empty cart action
- `routeProduct`: Product link routing
- `hideHeading`: Boolean flag
- `hideFooter`: Boolean flag
- `enableRemoveItem`: Boolean flag
- `enableUpdateItemQuantity`: Boolean flag

**Slots Used**: None  
**Design**: Dropin's default UI

---

### Example 3: Checkout Dropin (Level 1)

**File**: `blocks/checkout-dropin/checkout-dropin.js`

```42:58:blocks/checkout-dropin/checkout-dropin.js
    const { render } = await import('@dropins/storefront-checkout/render.js');
    const Checkout = (await import('@dropins/storefront-checkout/containers/Checkout.js')).default;

    await render(Checkout, {
      routeCart: () => `${basePath}pages/cart.html`,
      routeSignIn: () => `${basePath}pages/login.html`,
      routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.topLevelSku || product.sku}`,
      onOrderSuccess: (order) => {
        console.log('[Checkout Dropin] Order placed successfully:', order.number);
        // Redirect to order confirmation
        window.location.href = `${basePath}pages/order-confirmation.html?order=${order.number}`;
      },
      onOrderError: (error) => {
        console.error('[Checkout Dropin] Order failed:', error);
        // Error is handled by the dropin UI
      },
    })(block);
```

**Configuration Options Used**:
- `routeCart`: Back to cart routing
- `routeSignIn`: Sign in routing
- `routeProduct`: Product link routing
- `onOrderSuccess`: Success handler (with redirect)
- `onOrderError`: Error handler

**Slots Used**: None  
**Design**: Dropin's default UI

---

### Example 4: Mini Cart (Level 3)

**File**: `blocks/commerce-mini-cart/commerce-mini-cart.js`

**Pattern**: Custom HTML + Dropin APIs + Events

```javascript
export default async function decorate(block) {
  // Step 1: Create BuildRight's exact HTML structure
  const miniCartHTML = `
    <div class="mini-cart" id="mini-cart">
      <div class="mini-cart-header">
        <h3 class="mini-cart-title">Shopping Cart</h3>
        <span class="mini-cart-item-count">0 items</span>
        <button class="mini-cart-close">X</button>
      </div>
      <div class="mini-cart-items" id="mini-cart-items"></div>
      <div class="mini-cart-footer">
        <div class="mini-cart-subtotal">
          <span>Subtotal</span>
          <span class="mini-cart-total">$0.00</span>
        </div>
        <div class="mini-cart-actions">
          <a href="${basePath}pages/cart.html" class="btn btn-secondary">View Cart</a>
          <a href="${basePath}pages/checkout.html" class="btn btn-cta">Checkout</a>
        </div>
      </div>
    </div>
  `;
  
  block.innerHTML = miniCartHTML;
  
  // Step 2: Import Dropin APIs (not UI containers)
  const { getCartData, removeCartItems } = await import('@dropins/storefront-cart/api.js');
  const { events } = await import('@dropins/tools/event-bus.js');
  
  // Step 3: Wire up functionality
  async function updateMiniCart() {
    const cart = await getCartData();
    const items = cart?.items || [];
    const subtotal = cart?.prices?.subtotal?.value || 0;
    const totalQuantity = cart?.total_quantity || 0;
    
    // Update custom HTML with cart data
    document.querySelector('.mini-cart-item-count').textContent = `${totalQuantity} items`;
    document.querySelector('.mini-cart-total').textContent = `$${subtotal.toFixed(2)}`;
    
    // Render items
    const itemsContainer = document.getElementById('mini-cart-items');
    itemsContainer.innerHTML = items.map(item => createItemHTML(item)).join('');
  }
  
  // Step 4: Listen for dropin events
  events.on('cart/updated', () => updateMiniCart());
  events.on('cart/initialized', () => updateMiniCart());
  
  // Step 5: Initial load
  await updateMiniCart();
}
```

**APIs Used**:
- `getCartData()`: Get cart state
- `removeCartItems()`: Remove item from cart

**Events Used**:
- `cart/updated`: Cart changed
- `cart/initialized`: Cart initialized

**UI Container**: None  
**Design**: 100% custom BuildRight HTML

---

## Decision Matrix: Which Pattern to Use?

| Requirement | Pattern Level | Example |
|-------------|---------------|---------|
| Need Commerce functionality, dropin UI is acceptable | **Level 1** | Auth forms, Cart page, Checkout page |
| Need Commerce functionality + BuildRight design elements | **Level 2** | PLP product cards (tier badges, custom fields) |
| Need complete control over layout AND behavior | **Level 3** | Mini cart dropdown, User menu dropdown |

---

## Why Mini Cart and User Menu Use Level 3

### Mini Cart (Header Dropdown)
**Requirements**:
- Custom dropdown design (not a full page)
- Limited space (show max 5 items)
- Custom empty state with CTA
- Custom header/footer layout
- Tight integration with header button

**Why Level 3**: The `MiniCart` dropin container exists, but it's designed for a different layout pattern. BuildRight's header dropdown requires complete structural control.

**Alternative Considered**: Using `MiniCart` container with extensive slot overrides  
**Decision**: Custom HTML is cleaner for this specific use case

---

### User Menu (Header Dropdown)
**Requirements**:
- Custom dropdown design
- Show user initials avatar
- Show company name
- Persona-specific menu items
- Tight integration with header button

**Why Level 3**: The auth dropin doesn't have a "user menu" container. It has authentication forms only.

**Alternative Considered**: None available  
**Decision**: Custom HTML with auth API calls

---

## Common Configuration Options Reference

### Auth Dropin

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `routeForgotPassword` | Function | Where to go for password reset | `() => './reset-password.html'` |
| `routeSignUp` | Function | Where to go for registration | `() => './signup.html'` |
| `routeSignIn` | Function | Where to go for sign in | `() => './login.html'` |
| `routeRedirectOnSignIn` | Function | Where to go after successful login | `() => './dashboard.html'` |
| `renderSignUpLink` | Boolean | Show "Create account" link | `true` |
| `onSuccessCallback` | Function | Success handler | `() => { console.log('Success'); }` |
| `onErrorCallback` | Function | Error handler | `(error) => { console.error(error); }` |

---

### Cart Dropin

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `routeEmptyCartCTA` | Function | Where empty cart CTA goes | `() => './catalog.html'` |
| `routeProduct` | Function | Product detail page routing | `(product) => './product-detail.html?sku=' + product.sku` |
| `hideHeading` | Boolean | Hide cart heading | `false` |
| `hideFooter` | Boolean | Hide cart footer | `false` |
| `enableRemoveItem` | Boolean | Enable remove button | `true` |
| `enableUpdateItemQuantity` | Boolean | Enable quantity controls | `true` |

---

### Checkout Dropin

| Option | Type | Description | Example |
|--------|------|-------------|---------|
| `routeCart` | Function | Back to cart routing | `() => './cart.html'` |
| `routeSignIn` | Function | Sign in routing | `() => './login.html'` |
| `routeProduct` | Function | Product detail page routing | `(product) => './product-detail.html?sku=' + product.sku` |
| `onOrderSuccess` | Function | Order success handler | `(order) => { window.location.href = './order-confirmation.html?order=' + order.number; }` |
| `onOrderError` | Function | Order error handler | `(error) => { console.error(error); }` |

---

## PLP: First Use of Slots (Level 2)

**PLP will be the FIRST BuildRight dropin to use custom slots.**

### Why PLP Needs Slots

**BuildRight-Specific Requirements**:
- ✅ Tier badges (GOLD, SILVER, BRONZE)
- ✅ Manufacturer display
- ✅ Grade indicators
- ✅ Custom product card layout
- ✅ Custom facet styling

**Dropin's Default**: Generic product card without BuildRight-specific attributes

**Solution**: Use ProductList and Facets containers with custom slots

---

### PLP Slot Implementation (Planned)

```javascript
// blocks/product-grid/product-grid.js

import { ProductList } from '@dropins/storefront-product-discovery/containers/ProductList.js';
import { Facets } from '@dropins/storefront-product-discovery/containers/Facets.js';
import { render } from '@dropins/storefront-product-discovery/render.js';

// ProductList with custom slots
await render.render(ProductList, {
  // Configuration
  routeProduct: (product) => `./product-detail.html?sku=${product.sku}`,
  infiniteScroll: true,
  
  // Custom slots for BuildRight design
  slots: {
    ProductCard: (context) => {
      const { product } = context;
      const tier = product.attributes.tier || '';
      const manufacturer = product.attributes.manufacturer || '';
      const grade = product.attributes.grade || '';
      
      return `
        <div class="product-tile" data-sku="${product.sku}">
          ${tier ? `<span class="tier-badge tier-${tier.toLowerCase()}">${tier}</span>` : ''}
          <div class="product-image">
            <img src="${product.image.url}" alt="${product.name}" />
          </div>
          <div class="product-info">
            <div class="product-title">${product.name}</div>
            <div class="product-sku">SKU: ${product.sku}</div>
            ${manufacturer ? `<div class="product-manufacturer">${manufacturer}</div>` : ''}
            ${grade ? `<div class="product-grade">Grade: ${grade}</div>` : ''}
            <div class="product-price">$${product.price.final.amount.value}</div>
          </div>
        </div>
      `;
    },
    EmptyState: (context) => {
      return `
        <div class="no-products-state">
          <h3>No products found</h3>
          <p>Try adjusting your filters or search terms.</p>
          <a href="./catalog.html" class="btn btn-cta">Clear Filters</a>
        </div>
      `;
    },
    LoadingState: (context) => {
      return `<div class="loading-spinner">Loading products...</div>`;
    }
  }
})(productGridBlock);

// Facets with custom slots
await render.render(Facets, {
  slots: {
    FacetGroup: (context) => {
      const { facet } = context;
      return `
        <div class="filter-section">
          <button class="filter-section-toggle" aria-expanded="false">
            <span class="filter-section-title">${facet.label}</span>
            <svg class="filter-toggle-icon">...</svg>
          </button>
          <div class="filter-section-content" hidden>
            <!-- Facet options will be rendered here -->
          </div>
        </div>
      `;
    },
    FacetOption: (context) => {
      const { option, facet, isSelected } = context;
      return `
        <label class="filter-option">
          <input type="checkbox" ${isSelected ? 'checked' : ''} />
          <span class="filter-option-label">${option.label}</span>
          <span class="filter-option-count">(${option.count})</span>
        </label>
      `;
    }
  }
})(filtersBlock);
```

**Slots to be used**:
- `ProductCard`: Custom product tile HTML
- `EmptyState`: Custom "no results" message
- `LoadingState`: Custom loading indicator
- `FacetGroup`: Custom filter section wrapper
- `FacetOption`: Custom checkbox option

---

## Summary: The Real Pattern

### ❌ What Documentation Said
"We use API-only approach for all dropins"

### ✅ What We Actually Do

| Pattern | When to Use | Current Examples | Planned Examples |
|---------|-------------|------------------|------------------|
| **Level 1**: UI Container + Config | Dropin UI is acceptable | Auth, Cart, Checkout | - |
| **Level 2**: UI Container + Config + Slots | Need custom design elements | - | PLP (ProductList + Facets) |
| **Level 3**: Custom HTML + APIs + Events | Need complete control | Mini Cart, User Menu | - |

---

## Files to Reference

### Current Implementations

1. **Auth Dropin** (Level 1)
   - File: `blocks/auth-dropin/auth-dropin.js`
   - Pattern: UI containers with configuration
   - Containers: `SignIn`, `SignUp`, `ResetPassword`
   - Slots: None

2. **Cart Dropin** (Level 1)
   - File: `blocks/cart-dropin/cart-dropin.js`
   - Pattern: UI container with configuration
   - Container: `CartSummaryList`
   - Slots: None

3. **Checkout Dropin** (Level 1)
   - File: `blocks/checkout-dropin/checkout-dropin.js`
   - Pattern: UI container with configuration
   - Container: `Checkout`
   - Slots: None

4. **Mini Cart** (Level 3)
   - File: `blocks/commerce-mini-cart/commerce-mini-cart.js`
   - Pattern: Custom HTML + APIs + Events
   - APIs: `getCartData()`, `removeCartItems()`
   - Events: `cart/updated`, `cart/initialized`

5. **User Menu** (Level 3)
   - File: `blocks/auth-dropin/auth-dropin.js` (renderUserMenu function)
   - Pattern: Custom HTML + APIs
   - APIs: `isAuthenticated()`, `getCurrentCustomer()`, `logout()`

---

## Related Documentation

- **Clarification Doc**: `docs/DROPIN-APPROACH-CLARIFICATION.md` - Explains doc/reality mismatch
- **Component Breakdown**: `docs/CLP-COMPONENT-BREAKDOWN.md` - Visual breakdown of CLP components
- **Phase 5.5 Plan**: `docs/implementation/active/PHASE-5.5-COMMERCE-DROPINS.md`

---

**Document Version**: 2.0 (Corrected)  
**Last Updated**: December 19, 2025  
**Status**: Active Standard - Reflects Actual Implementation
