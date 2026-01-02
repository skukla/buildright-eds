# BuildRight Dropin Integration Reference

**Status**: Active Reference
**Last Updated**: 2026-01-02
**Consolidated From**: `dropin-config-reference.md`, `dropin-integration-pattern.md`
**Purpose**: Canonical reference for all dropin implementations showing patterns, slots, and configuration options

---

## Quick Summary

| Dropin | Pattern Level | Containers | Slots Used | Config Options | Custom HTML | APIs Used |
|--------|---------------|------------|------------|----------------|-------------|-----------|
| **Auth** (SignIn) | Level 1 | `SignIn` | None | 6 options | No | - |
| **Auth** (SignUp) | Level 1 | `SignUp` | None | 4 options | No | - |
| **Auth** (ResetPassword) | Level 1 | `ResetPassword` | None | 3 options | No | - |
| **Auth** (User Menu) | Level 3 | None | N/A | N/A | Yes | 3 APIs |
| **Cart** (Full Page) | Level 1 | `CartSummaryList` | None | 6 options | No | - |
| **Mini Cart** (Header) | Level 2 | `MiniCart` | 4 slots | 7 options | No | - |
| **Checkout** | Level 1 | `Checkout` | None | 5 options | No | - |
| **PLP** (Planned) | Level 2 | `ProductList`, `Facets` | 5 slots | 2+ options | No | - |

---

## Core Principle

**Use dropin UI containers with configuration options. Add custom slots when BuildRight design requires it.**

- **DO** use dropin UI containers (SignIn, CartSummaryList, Checkout, ProductList, Facets)
- **DO** configure them with routes, callbacks, and flags
- **DO** add custom slots when we need BuildRight-specific HTML structure
- **DON'T** create custom HTML unless truly necessary (mini cart, user menu cases)

---

## Pattern Levels

### Level 1: UI Container + Configuration Options

**When to use**: Dropin's default UI is acceptable, just needs routing/behavior config

**Customization**: Configuration options only
**Effort**: Low
**Design control**: Minimal (dropin's default UI)

**Current Examples**: Auth forms, Cart page, Checkout page

```javascript
// Auth Dropin - SignIn container
await render.render(SignIn, {
  routeForgotPassword: () => './reset-password.html',
  routeSignUp: () => './signup.html',
  routeRedirectOnSignIn: () => './dashboard.html',
  renderSignUpLink: true,
  onSuccessCallback: () => { console.log('Login success'); },
  onErrorCallback: (error) => { console.error(error); }
})(block);
```

---

### Level 2: UI Container + Configuration + Slots

**When to use**: Need BuildRight-specific design within dropin's structure

**Customization**: Configuration + Slots
**Effort**: Medium
**Design control**: High (full HTML control within container)

**Current Examples**: Mini Cart
**Planned Examples**: PLP (ProductList + Facets)

```javascript
// PLP - ProductList container with custom slots
await render.render(ProductList, {
  routeProduct: (product) => `./product-detail.html?sku=${product.sku}`,
  infiniteScroll: true,

  slots: {
    ProductCard: (context) => {
      const { product } = context;
      return `
        <div class="product-tile" data-sku="${product.sku}">
          ${product.attributes.tier ? `<span class="tier-badge">${product.attributes.tier}</span>` : ''}
          <img src="${product.image.url}" alt="${product.name}" />
          <div class="product-title">${product.name}</div>
          <div class="product-price">$${product.price.final.amount.value}</div>
        </div>
      `;
    }
  }
})(block);
```

---

### Level 3: Custom HTML + Dropin APIs + Events

**When to use**: Need complete control over structure AND behavior

**Customization**: Custom HTML + APIs + Events
**Effort**: High
**Design control**: Complete (100% custom)

**Current Examples**: Mini Cart (header dropdown), User Menu

```javascript
// Mini Cart - Custom HTML with Dropin APIs
export default async function decorate(block) {
  block.innerHTML = `<div class="mini-cart">...</div>`;

  const { getCartData, removeCartItems } = await import('@dropins/storefront-cart/api.js');
  const { events } = await import('@dropins/tools/event-bus.js');

  events.on('cart/updated', () => updateMiniCart());
  await updateMiniCart();
}
```

---

## Why Level 3 for Specific Cases

### Mini Cart (Header Dropdown)

**Requirements**: Custom dropdown design, limited space (max 5 items), custom empty state, tight header integration

**Why Level 3**: The `MiniCart` dropin container exists, but it's designed for a different layout pattern. BuildRight's header dropdown requires complete structural control.

**Alternative Considered**: Using `MiniCart` container with extensive slot overrides
**Decision**: Custom HTML is cleaner for this specific use case

### User Menu (Header Dropdown)

**Requirements**: Custom dropdown, user initials avatar, company name display, persona-specific menu items

**Why Level 3**: The auth dropin doesn't have a "user menu" container. It has authentication forms only.

**Alternative Considered**: None available
**Decision**: Custom HTML with auth API calls

---

## Pattern Decision Matrix

| Question | Level 1 | Level 2 | Level 3 |
|----------|---------|---------|---------|
| Is dropin's default UI acceptable? | Yes | No | No |
| Need BuildRight-specific design elements? | No | Yes (within structure) | Yes (complete control) |
| Can configuration options handle requirements? | Yes | Yes + slots | No |
| Need custom HTML structure? | No | No | Yes |
| Does suitable dropin container exist? | Yes | Yes | No (or unsuitable) |
| **Example** | Auth, Cart, Checkout | PLP, Mini Cart | User Menu |

---

## Implementation Reference

### Auth Dropin

**Package**: `@dropins/storefront-auth`
**File**: `blocks/auth-dropin/auth-dropin.js`

#### SignIn Container (Level 1)

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeForgotPassword` | `() => string` | Where "Forgot password?" link goes | `() => './reset-password.html'` |
| `routeSignUp` | `() => string` | Where "Create account" link goes | `() => './signup.html'` |
| `routeRedirectOnSignIn` | `() => string` | Post-login redirect | `() => sessionStorage.getItem('auth_redirect') \|\| './dashboard.html'` |
| `renderSignUpLink` | `boolean` | Show "Create account" link | `true` |
| `onSuccessCallback` | `() => void` | Called on successful login | `() => { console.log('Sign in successful'); }` |
| `onErrorCallback` | `(error) => void` | Called on login error | `(error) => { console.error(error); }` |

#### SignUp Container (Level 1)

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeSignIn` | `() => string` | Where "Sign in" link goes | `() => './login.html'` |
| `routeRedirectOnSignIn` | `() => string` | Post-registration redirect | `() => './dashboard.html'` |
| `onSuccessCallback` | `() => void` | Called on success | `() => { ... }` |
| `onErrorCallback` | `(error) => void` | Called on error | `(error) => { ... }` |

#### ResetPassword Container (Level 1)

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeSignIn` | `() => string` | Where "Back to sign in" link goes | `() => './login.html'` |
| `onSuccessCallback` | `() => void` | Called when reset email sent | `() => { ... }` |
| `onErrorCallback` | `(error) => void` | Called on error | `(error) => { ... }` |

#### User Menu (Level 3)

**APIs Used**:
| API | Import From | Description |
|-----|-------------|-------------|
| `isAuthenticated()` | `scripts/initializers/auth.js` | Check if user is logged in |
| `getCurrentCustomer()` | `scripts/initializers/auth.js` | Get customer data |
| `logout()` | `scripts/initializers/auth.js` | Log out user |

---

### Cart Dropin

**Package**: `@dropins/storefront-cart`

#### CartSummaryList Container (Level 1)

**File**: `blocks/cart-dropin/cart-dropin.js`

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeEmptyCartCTA` | `() => string` | Where "Continue shopping" button goes | `() => '${basePath}pages/catalog.html'` |
| `routeProduct` | `(product) => string` | Product detail page routing | `(product) => '${basePath}pages/product-detail.html?sku=' + product.sku` |
| `hideHeading` | `boolean` | Hide cart heading | `false` |
| `hideFooter` | `boolean` | Hide cart footer | `false` |
| `enableRemoveItem` | `boolean` | Show remove item button | `true` |
| `enableUpdateItemQuantity` | `boolean` | Show quantity controls | `true` |

#### MiniCart Container (Level 2)

**File**: `blocks/commerce-mini-cart/commerce-mini-cart.js`

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeProduct` | `(item) => string` | Product detail page routing | `(item) => '...'` |
| `routeCart` | `() => string` | View cart page routing | `() => '${basePath}pages/cart.html'` |
| `routeCheckout` | `() => string` | Checkout page routing | `() => '${basePath}pages/checkout.html'` |
| `routeEmptyCartCTA` | `() => string` | Empty cart CTA routing | `() => '${basePath}pages/catalog.html'` |
| `displayAllItems` | `boolean` | Show all items vs. limited | `false` (limit to 5) |
| `enableItemRemoval` | `boolean` | Enable remove button | `true` |
| `hideHeading` | `boolean` | Hide default heading | `true` (use custom slot) |

**Slots Used**:
| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `Heading` | Header section | Custom HTML with title, count, close button |
| `EmptyCart` | Empty state message | Custom HTML with icon, message, CTA |
| `CartItem` | Individual cart item | Custom HTML with BuildRight styling |
| `Footer` | Footer with subtotal | Custom HTML with subtotal and action buttons |

---

### Checkout Dropin

**Package**: `@dropins/storefront-checkout`
**File**: `blocks/checkout-dropin/checkout-dropin.js`

#### Checkout Container (Level 1)

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeCart` | `() => string` | Back to cart button routing | `() => '${basePath}pages/cart.html'` |
| `routeSignIn` | `() => string` | Sign in link routing | `() => '${basePath}pages/login.html'` |
| `routeProduct` | `(product) => string` | Product detail page routing | `(product) => '...'` |
| `onOrderSuccess` | `(order) => void` | Called when order placed | `(order) => { window.location.href = './order-confirmation.html?order=' + order.number; }` |
| `onOrderError` | `(error) => void` | Called on order error | `(error) => { console.error(error); }` |

---

### PLP (Product Discovery) - PLANNED

**Package**: `@dropins/storefront-product-discovery`

#### ProductList Container (Level 2)

**File**: `blocks/product-grid/product-grid.js` (planned)

| Option | Type | Description | BuildRight Value |
|--------|------|-------------|------------------|
| `routeProduct` | `(product) => string` | Product detail page routing | `(product) => './product-detail.html?sku=' + product.sku` |
| `infiniteScroll` | `boolean` | Enable infinite scroll | `true` |
| `pageSize` | `number` | Products per page | `24` |

**Slots to Use**:
| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `ProductCard` | Individual product tile | Custom HTML with tier badges, manufacturer, grade, SKU |
| `EmptyState` | No products found message | Custom "no results" message with CTA |
| `LoadingState` | Loading indicator | Custom BuildRight spinner |

#### Facets Container (Level 2)

**Slots to Use**:
| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `FacetGroup` | Filter section wrapper | Custom HTML with BuildRight toggle button style |
| `FacetOption` | Individual checkbox option | Custom HTML with BuildRight checkbox style |

---

## Key Findings

### 1. Most Dropins Don't Need Slots

**Finding**: 3 out of 5 current dropin implementations (Auth, Cart, Checkout) use **Level 1** (configuration options only, no slots)

**Why**: Adobe's dropin default UI is professional and acceptable for standard commerce flows

### 2. Configuration Options Are Powerful

**Finding**: Routes and callbacks (configuration options) handle 90% of customization needs

**Why**: Adobe designed dropins with comprehensive configuration APIs

### 3. Level 3 for Special Cases Only

**Finding**: Only 2 implementations use **Level 3** (Mini Cart, User Menu)

**Why**: No suitable dropin container exists for these specific use cases (header dropdowns)

### 4. Slots Enable BuildRight Design

**Finding**: Mini Cart and PLP (planned) use **Level 2** with custom slots

**Why**: Need BuildRight-specific design elements (tier badges, custom layouts) that differ from default dropin UI

---

## Related Documentation

- **Architecture Overview**: `docs/reference/dropin-architecture.md`
- **ADR-001**: Commerce Dropin Decisions
- **ADR-007**: Custom SDK Dropins for ACO
- **ADR-014**: EDS Blocks vs Dropins Decision Matrix

---

**Document Version**: 1.0 (Consolidated)
**Date**: 2026-01-02
**Status**: Active Reference
