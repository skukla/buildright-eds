# BuildRight Dropin Slots and Configuration Reference

**Date**: December 19, 2025  
**Status**: Active Reference  
**Purpose**: Quick reference for all dropin implementations showing slots and configuration options used

---

## Quick Summary

| Dropin | Pattern Level | Containers | Slots Used | Config Options | Custom HTML | APIs Used | Events Used |
|--------|---------------|------------|------------|----------------|-------------|-----------|-------------|
| **Auth** (SignIn) | Level 1 | `SignIn` | ❌ None | ✅ 6 options | ❌ No | - | - |
| **Auth** (SignUp) | Level 1 | `SignUp` | ❌ None | ✅ 4 options | ❌ No | - | - |
| **Auth** (ResetPassword) | Level 1 | `ResetPassword` | ❌ None | ✅ 3 options | ❌ No | - | - |
| **Auth** (User Menu) | Level 3 | None | N/A | N/A | ✅ Yes | ✅ 3 APIs | ❌ No |
| **Cart** (Full Page) | Level 1 | `CartSummaryList` | ❌ None | ✅ 6 options | ❌ No | - | - |
| **Mini Cart** (Header) | Level 2 | `MiniCart` | ✅ 4 slots | ✅ 7 options | ❌ No | - | - |
| **Checkout** | Level 1 | `Checkout` | ❌ None | ✅ 5 options | ❌ No | - | - |
| **PLP** (Planned) | Level 2 | `ProductList`, `Facets` | ✅ 5 slots | ✅ 2+ options | ❌ No | - | - |

---

## Pattern Level Definitions

### Level 1: UI Container + Configuration Options
- Use dropin's default UI
- Configure with options only
- No slots needed
- No custom HTML

**Current Examples**: Auth forms, Cart page, Checkout page

---

### Level 2: UI Container + Configuration + Slots
- Use dropin's container structure
- Configure with options
- Override specific UI elements via slots
- Custom HTML inside slots only

**Planned Examples**: PLP (ProductList + Facets)

---

### Level 3: Custom HTML + APIs + Events
- No dropin container used
- Complete custom HTML structure
- Call dropin APIs directly
- Listen to dropin events for sync

**Current Examples**: Mini Cart, User Menu

---

## Auth Dropin

### Package
`@dropins/storefront-auth`

### Implementations

#### 1. SignIn Container (Level 1)

**File**: `blocks/auth-dropin/auth-dropin.js` → `renderSignInForm()`

**Container Import**:
```javascript
import { render } from '@dropins/storefront-auth/render.js';
import { SignIn } from '@dropins/storefront-auth/containers/SignIn.js';
```

**Configuration Options**:

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeForgotPassword` | `() => string` | Where "Forgot password?" link goes | `() => './reset-password.html'` |
| `routeSignUp` | `() => string` | Where "Create account" link goes | `() => './signup.html'` |
| `routeRedirectOnSignIn` | `() => string` | Post-login redirect destination | `() => sessionStorage.getItem('auth_redirect') \|\| './dashboard.html'` |
| `renderSignUpLink` | `boolean` | Show "Create account" link | `true` |
| `onSuccessCallback` | `() => void` | Called on successful login | `() => { console.log('[AuthDropin] Sign in successful'); }` |
| `onErrorCallback` | `(error) => void` | Called on login error | `(error) => { console.error('[AuthDropin] Sign in error:', error); }` |

**Slots Available**: `SuccessNotification`  
**Slots Used**: ❌ None (default is fine)

**Code Example**:
```javascript
await render.render(SignIn, {
  routeForgotPassword: () => './reset-password.html',
  renderSignUpLink: true,
  routeSignUp: () => './signup.html',
  routeRedirectOnSignIn: () => {
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
```

---

#### 2. SignUp Container (Level 1)

**File**: `blocks/auth-dropin/auth-dropin.js` → `renderRegisterForm()`

**Container Import**:
```javascript
import { render } from '@dropins/storefront-auth/render.js';
import { SignUp } from '@dropins/storefront-auth/containers/SignUp.js';
```

**Configuration Options**:

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeSignIn` | `() => string` | Where "Sign in" link goes | `() => './login.html'` |
| `routeRedirectOnSignIn` | `() => string` | Post-registration redirect | `() => './dashboard.html'` |
| `onSuccessCallback` | `() => void` | Called on successful registration | `() => { console.log('[AuthDropin] Registration successful'); }` |
| `onErrorCallback` | `(error) => void` | Called on registration error | `(error) => { console.error('[AuthDropin] Registration error:', error); }` |

**Slots Available**: `SuccessNotification`  
**Slots Used**: ❌ None (default is fine)

**Code Example**:
```javascript
await render.render(SignUp, {
  routeSignIn: () => './login.html',
  routeRedirectOnSignIn: () => './dashboard.html',
  onSuccessCallback: () => {
    console.log('[AuthDropin] Registration successful');
  },
  onErrorCallback: (error) => {
    console.error('[AuthDropin] Registration error:', error);
  }
})(block);
```

---

#### 3. ResetPassword Container (Level 1)

**File**: `blocks/auth-dropin/auth-dropin.js` → `renderResetPasswordForm()`

**Container Import**:
```javascript
import { render } from '@dropins/storefront-auth/render.js';
import { ResetPassword } from '@dropins/storefront-auth/containers/ResetPassword.js';
```

**Configuration Options**:

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeSignIn` | `() => string` | Where "Back to sign in" link goes | `() => './login.html'` |
| `onSuccessCallback` | `() => void` | Called when reset email sent | `() => { console.log('[AuthDropin] Password reset email sent'); }` |
| `onErrorCallback` | `(error) => void` | Called on error | `(error) => { console.error('[AuthDropin] Password reset error:', error); }` |

**Slots Available**: `SuccessNotification`  
**Slots Used**: ❌ None (default is fine)

**Code Example**:
```javascript
await render.render(ResetPassword, {
  routeSignIn: () => './login.html',
  onSuccessCallback: () => {
    console.log('[AuthDropin] Password reset email sent');
  },
  onErrorCallback: (error) => {
    console.error('[AuthDropin] Password reset error:', error);
  }
})(block);
```

---

#### 4. User Menu (Level 3)

**File**: `blocks/auth-dropin/auth-dropin.js` → `renderUserMenu()`

**Pattern**: Custom HTML + APIs (no container)

**APIs Used**:

| API | Import From | Description | Usage |
|-----|-------------|-------------|-------|
| `isAuthenticated()` | `scripts/initializers/auth.js` | Check if user is logged in | `if (isAuthenticated()) { ... }` |
| `getCurrentCustomer()` | `scripts/initializers/auth.js` | Get customer data | `const customer = getCurrentCustomer();` |
| `logout()` | `scripts/initializers/auth.js` | Log out user | `await logout();` |

**Custom HTML Structure**:
```html
<div class="user-menu">
  <div class="user-menu-logged-in">
    <div class="user-menu-header">
      <div class="user-avatar">
        <span class="user-initials">SM</span>
      </div>
      <div class="user-info">
        <div class="user-name">Sarah Martinez</div>
        <div class="user-company">Sunbelt Homes</div>
      </div>
    </div>
    <div class="user-menu-content">
      <a href="./account.html" class="user-menu-link">My Account</a>
      <button class="user-menu-logout">Logout</button>
    </div>
  </div>
</div>
```

**Why Custom HTML**: No suitable auth dropin container exists for "user menu dropdown"

---

## Cart Dropin

### Package
`@dropins/storefront-cart`

### Implementations

#### 1. CartSummaryList Container (Level 1)

**File**: `blocks/cart-dropin/cart-dropin.js`

**Container Import**:
```javascript
import { render } from '@dropins/storefront-cart/render.js';
import { CartSummaryList } from '@dropins/storefront-cart/containers/CartSummaryList.js';
```

**Configuration Options**:

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeEmptyCartCTA` | `() => string` | Where "Continue shopping" button goes | `() => '${basePath}pages/catalog.html'` |
| `routeProduct` | `(product) => string` | Product detail page routing | `(product) => '${basePath}pages/product-detail.html?sku=' + product.sku` |
| `hideHeading` | `boolean` | Hide cart heading | `false` |
| `hideFooter` | `boolean` | Hide cart footer | `false` |
| `enableRemoveItem` | `boolean` | Show remove item button | `true` |
| `enableUpdateItemQuantity` | `boolean` | Show quantity controls | `true` |

**Slots Available**: `CartItem`, `EmptyCart`, `OrderSummary` (and others)  
**Slots Used**: ❌ None (default UI is acceptable)

**Code Example**:
```javascript
await render.render(CartSummaryList, {
  routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
  routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.sku}`,
  hideHeading: false,
  hideFooter: false,
  enableRemoveItem: true,
  enableUpdateItemQuantity: true,
})(block);
```

---

#### 2. MiniCart Container (Level 2)

**File**: `blocks/commerce-mini-cart/commerce-mini-cart.js`

**Pattern**: UI Container + Configuration + Slots

**Container Import**:
```javascript
import { render } from '@dropins/storefront-cart/render.js';
import { MiniCart } from '@dropins/storefront-cart/containers/MiniCart.js';
```

**Configuration Options**:

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeProduct` | `(item) => string` | Product detail page routing | `(item) => '${basePath}pages/product-detail.html?sku=' + item.product.sku` |
| `routeCart` | `() => string` | View cart page routing | `() => '${basePath}pages/cart.html'` |
| `routeCheckout` | `() => string` | Checkout page routing | `() => '${basePath}pages/checkout.html'` |
| `routeEmptyCartCTA` | `() => string` | Empty cart CTA routing | `() => '${basePath}pages/catalog.html'` |
| `displayAllItems` | `boolean` | Show all items vs. limited | `false` (limit to 5) |
| `enableItemRemoval` | `boolean` | Enable remove button | `true` |
| `hideHeading` | `boolean` | Hide default heading | `true` (use custom slot) |

**Slots Used**:

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `Heading` | Header section with close button | ✅ Custom HTML with title, count, and close button |
| `EmptyCart` | Empty state message | ✅ Custom HTML with icon, message, and CTA |
| `CartItem` | Individual cart item | ✅ Custom HTML with BuildRight styling |
| `Footer` | Footer with subtotal and buttons | ✅ Custom HTML with subtotal and action buttons |

**Code Example**:
```javascript
await render.render(MiniCart, {
  routeProduct: (item) => `${basePath}pages/product-detail.html?sku=${item.product.sku}`,
  routeCart: () => `${basePath}pages/cart.html`,
  routeCheckout: () => `${basePath}pages/checkout.html`,
  routeEmptyCartCTA: () => `${basePath}pages/catalog.html`,
  displayAllItems: false,
  enableItemRemoval: true,
  hideHeading: true,
  
  slots: {
    Heading: () => `
      <div class="mini-cart-header">
        <h3 class="mini-cart-title">Shopping Cart</h3>
        <span class="mini-cart-item-count"></span>
        <button class="mini-cart-close">X</button>
      </div>
    `,
    EmptyCart: () => `
      <div class="mini-cart-empty">
        <p>Your cart is empty</p>
        <a href="./catalog.html" class="btn">Browse Catalog</a>
      </div>
    `,
    CartItem: (context) => {
      const { item } = context;
      return `
        <a href="./product-detail.html?sku=${item.product.sku}" class="mini-cart-item">
          <img src="${item.product.image.url}" />
          <div class="mini-cart-item-info">
            <div class="mini-cart-item-name">${item.product.name}</div>
            <div>Qty: ${item.quantity} - $${item.prices.row_total.value}</div>
          </div>
        </a>
      `;
    },
    Footer: () => `
      <div class="mini-cart-footer">
        <div class="mini-cart-subtotal">
          <span>Subtotal</span>
          <span class="mini-cart-total"></span>
        </div>
        <div class="mini-cart-actions">
          <a href="./cart.html" class="btn btn-secondary">View Cart</a>
          <a href="./checkout.html" class="btn btn-cta">Checkout</a>
        </div>
      </div>
    `
  }
})(block);
```

---

## Checkout Dropin

### Package
`@dropins/storefront-checkout`

### Implementations

#### 1. Checkout Container (Level 1)

**File**: `blocks/checkout-dropin/checkout-dropin.js`

**Container Import**:
```javascript
import { render } from '@dropins/storefront-checkout/render.js';
import { Checkout } from '@dropins/storefront-checkout/containers/Checkout.js';
```

**Configuration Options**:

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeCart` | `() => string` | Back to cart button routing | `() => '${basePath}pages/cart.html'` |
| `routeSignIn` | `() => string` | Sign in link routing | `() => '${basePath}pages/login.html'` |
| `routeProduct` | `(product) => string` | Product detail page routing | `(product) => '${basePath}pages/product-detail.html?sku=' + (product.topLevelSku \|\| product.sku)` |
| `onOrderSuccess` | `(order) => void` | Called when order placed | `(order) => { window.location.href = './order-confirmation.html?order=' + order.number; }` |
| `onOrderError` | `(error) => void` | Called on order error | `(error) => { console.error('[Checkout Dropin] Order failed:', error); }` |

**Slots Available**: `ShippingAddress`, `BillingAddress`, `ShippingMethods`, `PaymentMethods`, `OrderSummary` (and others)  
**Slots Used**: ❌ None (default UI is acceptable)

**Code Example**:
```javascript
await render(Checkout, {
  routeCart: () => `${basePath}pages/cart.html`,
  routeSignIn: () => `${basePath}pages/login.html`,
  routeProduct: (product) => `${basePath}pages/product-detail.html?sku=${product.topLevelSku || product.sku}`,
  onOrderSuccess: (order) => {
    console.log('[Checkout Dropin] Order placed successfully:', order.number);
    window.location.href = `${basePath}pages/order-confirmation.html?order=${order.number}`;
  },
  onOrderError: (error) => {
    console.error('[Checkout Dropin] Order failed:', error);
  },
})(block);
```

---

## PLP (Product Discovery) - PLANNED

### Package
`@dropins/storefront-product-discovery`

### Implementations

#### 1. ProductList Container (Level 2)

**File**: `blocks/product-grid/product-grid.js` (planned)

**Container Import**:
```javascript
import { render } from '@dropins/storefront-product-discovery/render.js';
import { ProductList } from '@dropins/storefront-product-discovery/containers/ProductList.js';
```

**Configuration Options** (Planned):

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeProduct` | `(product) => string` | Product detail page routing | `(product) => './product-detail.html?sku=' + product.sku` |
| `infiniteScroll` | `boolean` | Enable infinite scroll | `true` |
| `pageSize` | `number` | Products per page | `24` |

**Slots to Use**:

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `ProductCard` | Individual product tile | ✅ Custom HTML with tier badges, manufacturer, grade, SKU |
| `EmptyState` | No products found message | ✅ Custom "no results" message with CTA |
| `LoadingState` | Loading indicator | ✅ Custom BuildRight spinner |

**ProductCard Slot Example** (Planned):
```javascript
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
```

---

#### 2. Facets Container (Level 2)

**File**: `blocks/filters-sidebar/filters-sidebar.js` (planned)

**Container Import**:
```javascript
import { render } from '@dropins/storefront-product-discovery/render.js';
import { Facets } from '@dropins/storefront-product-discovery/containers/Facets.js';
```

**Configuration Options** (Planned):

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `collapsible` | `boolean` | Allow collapse/expand | `true` |

**Slots to Use**:

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `FacetGroup` | Filter section wrapper | ✅ Custom HTML with BuildRight toggle button style |
| `FacetOption` | Individual checkbox option | ✅ Custom HTML with BuildRight checkbox style |

**FacetGroup Slot Example** (Planned):
```javascript
slots: {
  FacetGroup: (context) => {
    const { facet } = context;
    return `
      <div class="filter-section">
        <button class="filter-section-toggle" aria-expanded="false">
          <span class="filter-section-title">${facet.label}</span>
          <svg class="filter-toggle-icon">
            <path d="M6 9l6 6 6-6"/>
          </svg>
        </button>
        <div class="filter-section-content" hidden>
          <!-- Facet options rendered here -->
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
```

---

## Slots Summary Table

### Currently Used Slots

| Dropin | Container | Slots Available | Slots Used | Reason Not Using |
|--------|-----------|-----------------|------------|------------------|
| **Auth** | `SignIn` | `SuccessNotification` | ❌ None | Default behavior is fine |
| **Auth** | `SignUp` | `SuccessNotification` | ❌ None | Default behavior is fine |
| **Auth** | `ResetPassword` | `SuccessNotification` | ❌ None | Default behavior is fine |
| **Auth** | User Menu | N/A (no container) | N/A | Custom HTML instead |
| **Cart** | `CartSummaryList` | `CartItem`, `EmptyCart`, `OrderSummary`, etc. | ❌ None | Default UI acceptable |
| **Mini Cart** | `MiniCart` | `Heading`, `EmptyCart`, `CartItem`, `Footer`, etc. | ✅ 4 slots | BuildRight header dropdown design |
| **Checkout** | `Checkout` | `ShippingAddress`, `BillingAddress`, etc. | ❌ None | Default UI acceptable |

### Planned Slots (PLP)

| Dropin | Container | Slots Available | Slots to Use | Why Using Slots |
|--------|-----------|-----------------|--------------|-----------------|
| **PLP** | `ProductList` | `ProductCard`, `EmptyState`, `LoadingState`, etc. | ✅ All 3 | BuildRight-specific product design (tier badges, manufacturer, grade) |
| **PLP** | `Facets` | `FacetGroup`, `FacetOption`, etc. | ✅ Both | BuildRight-specific filter styling |

---

## Configuration Options Summary

### Auth Dropin

| Container | Total Options | Key Options | Routes | Callbacks | Flags |
|-----------|---------------|-------------|--------|-----------|-------|
| `SignIn` | 6 | `routeRedirectOnSignIn`, `routeForgotPassword`, `routeSignUp` | 3 | 2 | 1 |
| `SignUp` | 4 | `routeRedirectOnSignIn`, `routeSignIn` | 2 | 2 | 0 |
| `ResetPassword` | 3 | `routeSignIn` | 1 | 2 | 0 |

### Cart Dropin

| Container | Total Options | Key Options | Routes | Callbacks | Flags |
|-----------|---------------|-------------|--------|-----------|-------|
| `CartSummaryList` | 6 | `routeProduct`, `routeEmptyCartCTA` | 2 | 0 | 4 |
| `MiniCart` | 7 | `routeProduct`, `routeCart`, `routeCheckout` | 4 | 0 | 3 |

### Checkout Dropin

| Container | Total Options | Key Options | Routes | Callbacks | Flags |
|-----------|---------------|-------------|--------|-----------|-------|
| `Checkout` | 5 | `routeCart`, `routeSignIn`, `routeProduct` | 3 | 2 | 0 |

### PLP (Planned)

| Container | Total Options | Key Options | Routes | Callbacks | Flags |
|-----------|---------------|-------------|--------|-----------|-------|
| `ProductList` | 3+ | `routeProduct`, `infiniteScroll` | 1 | 0 | 2 |
| `Facets` | 1+ | `collapsible` | 0 | 0 | 1 |

---

## APIs and Events Summary

### APIs Used (Level 3 Patterns Only)

| Implementation | APIs | Import From |
|----------------|------|-------------|
| **User Menu** | `isAuthenticated()`, `getCurrentCustomer()`, `logout()` | `scripts/initializers/auth.js` |

### Events Used (Level 3 Patterns Only)

| Implementation | Events | Import From |
|----------------|--------|-------------|
| **User Menu** | None | N/A |

---

## Pattern Decision Matrix

Use this to decide which pattern level to use for new dropin integrations:

| Question | Level 1 | Level 2 | Level 3 |
|----------|---------|---------|---------|
| Is dropin's default UI acceptable? | ✅ Yes | ❌ No | ❌ No |
| Need BuildRight-specific design elements? | ❌ No | ✅ Yes (within structure) | ✅ Yes (complete control) |
| Can configuration options handle requirements? | ✅ Yes | ✅ Yes + slots | ❌ No |
| Need custom HTML structure? | ❌ No | ❌ No | ✅ Yes |
| Does suitable dropin container exist? | ✅ Yes | ✅ Yes | ❌ No (or unsuitable) |
| **Example** | Auth, Cart, Checkout | PLP | Mini Cart, User Menu |

---

## Key Findings

### 1. Most Dropins Don't Need Slots
**Finding**: 3 out of 5 current dropin implementations (Auth, Cart, Checkout) use **Level 1** (configuration options only, no slots)

**Why**: Adobe's dropin default UI is professional and acceptable for standard commerce flows

---

### 2. Mini Cart and PLP Use Slots
**Finding**: Mini Cart and PLP (planned) use **Level 2** (UI Container + Configuration + Slots)

**Why**: Need BuildRight-specific design that differs from default dropin UI

**Mini Cart Slots**:
- `Heading`: Custom header with close button
- `EmptyCart`: Custom empty state message
- `CartItem`: Custom item with BuildRight styling
- `Footer`: Custom footer with subtotal and buttons

**PLP Slots (Planned)**:
- `ProductCard`: Custom product tile with tier badges, manufacturer, grade
- `EmptyState`: Custom "no results" message
- `LoadingState`: Custom loading indicator
- `FacetGroup`: Custom filter section styling
- `FacetOption`: Custom checkbox styling

---

### 3. Level 3 for Special Cases Only
**Finding**: Only 1 implementation uses **Level 3** (User Menu)

**Why**: No suitable dropin container exists for "user menu dropdown in header" use case

---

### 4. Configuration Options Are Powerful
**Finding**: Routes and callbacks (configuration options) handle 90% of customization needs

**Why**: Adobe designed dropins with comprehensive configuration APIs

---

## Related Documentation

- **Integration Pattern Guide**: `docs/reference/standards/DROPIN-INTEGRATION-PATTERN.md`
- **Auth Decision**: `docs/reference/decisions/AUTH-DROPIN-IMPLEMENTATION.md`
- **Clarification Doc**: `docs/DROPIN-APPROACH-CLARIFICATION.md`
- **CLP Breakdown**: `docs/CLP-COMPONENT-BREAKDOWN.md`

---

**Document Version**: 1.0  
**Date**: December 19, 2025  
**Status**: Active Reference  
**Purpose**: Quick reference for dropin implementations

