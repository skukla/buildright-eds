# BuildRight Dropin Architecture

**Status**: Canonical Reference
**Last Updated**: January 4, 2026 (Modularized visualizations to docs/explanations/dropins/)

---

## What Are Dropins?

Adobe Commerce **Dropins** are pre-built npm packages that provide commerce UI functionality. Each dropin contains multiple **containers** (renderable components), and containers expose **slots** (customization points).

```
HIERARCHY
═════════

@dropins/storefront-[name]                ◄── DROPIN (npm package)
│
├── containers/                           ◄── CONTAINERS (renderable components)
│   ├── ComponentA
│   └── ComponentB
│
└── slots (within containers)             ◄── SLOTS (customization points)
    ├── SlotName1
    └── SlotName2
```

**Key Distinction:**
- **Dropins** are npm packages you install
- **Containers** are components you render into DOM elements
- **Slots** are hooks where you inject custom HTML/styling

---

## Dropins Used in BuildRight

| Dropin Package | Purpose | Status | Visualization |
|----------------|---------|--------|---------------|
| `@dropins/storefront-product-discovery` | Product search, filters, sorting | **Production** | [product-discovery.md](../explanations/dropins/product-discovery.md) |
| `@dropins/storefront-auth` | Authentication UI | **Production** | [auth.md](../explanations/dropins/auth.md) |
| `@dropins/storefront-cart` | Cart functionality | **Production** | [cart.md](../explanations/dropins/cart.md) |
| `@dropins/storefront-checkout` | Checkout flow | **Production** | [checkout.md](../explanations/dropins/checkout.md) |
| `@dropins/storefront-order` | Order confirmation | **Production** | [order.md](../explanations/dropins/order.md) |

> **Visual Documentation**: Per-dropin page architecture diagrams, slot details, and customization patterns have been moved to [docs/explanations/dropins/](../explanations/dropins/README.md) for better maintainability.

---

## Slot Availability Summary

| Dropin | Container | Key Slots | BuildRight Level |
|--------|-----------|-----------|------------------|
| `storefront-product-discovery` | SearchResults, Facets, SortBy, Pagination | ProductCardImage, ProductCardName, ProductCardPrice, ProductCardActions, SelectedFacets, FacetBucket | Level 2 (custom slot rendering) |
| `storefront-cart` | CartSummaryList | EmptyCart, Item, Summary | Level 2 (custom slot rendering) |
| `storefront-checkout` | Checkout | ShippingAddress, ShippingMethods, BillingAddress, PaymentMethods, OrderSummary, PlaceOrder | Level 2 (custom slot rendering) |
| `storefront-auth` | SignIn, SignUp, ResetPassword | Form fields via container config | Level 1 (CSS styling) + custom UserMenu |
| `storefront-order` | OrderConfirmation | OrderHeader, OrderItems, OrderTotals, ShippingInfo | Level 2 (custom slot rendering) |

**BuildRight Customization Levels:**
- **Level 1**: CSS-only styling (design tokens, brand colors)
- **Level 2**: Custom slot rendering via `ctx.replaceWith()` / `ctx.appendChild()`
- **Level 3**: Custom containers (not used - prefer native dropin containers)

---

## Integration Pattern

### Block → Dropin → Containers → Slots

```javascript
// blocks/product-list/product-list.js

import {
  SearchResults,
  Facets,
  SortBy,
  Pagination
} from '@dropins/storefront-product-discovery/containers';

export default async function decorate(block) {
  // Wait for dropin initialization
  await waitForDropins();

  // Render each CONTAINER to a different DOM element
  SortBy.render(document.querySelector('.dropin-sort-container'));

  Facets.render(document.querySelector('.dropin-facets-container'));

  SearchResults.render(document.querySelector('.dropin-search-results-container'), {
    // SLOTS customize what renders inside the container
    slots: {
      ProductCardImage: (ctx) => {
        const el = document.createElement('div');
        el.className = 'buildright-product-image';
        el.style.backgroundImage = `url(${ctx.product.image.url})`;
        ctx.replaceWith(el);
      },
      ProductCardPrice: (ctx) => {
        const el = document.createElement('div');
        el.className = 'buildright-price';
        el.textContent = formatPrice(ctx.product.price);
        ctx.replaceWith(el);
      }
    }
  });

  Pagination.render(document.querySelector('.dropin-pagination-container'));
}
```

### Slot API

| Method | Purpose |
|--------|---------|
| `ctx.replaceWith(element)` | Replace default content with custom element |
| `ctx.prependChild(element)` | Add before default content |
| `ctx.appendChild(element)` | Add after default content |
| `ctx.product` / `ctx.data` | Access data for current item |

---

## Query Flow: Mesh Adapter Pattern

All dropin queries are intercepted by mesh adapters for extensibility control. BuildRight uses a unified adapter pattern across all dropin types:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         UNIFIED MESH ROUTING                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     DROPIN CONTAINERS                                │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ SearchResults │ CartSummaryList │ Checkout │ SignIn │ OrderConfirm  │   │
│  └───────┬───────────────┬──────────────┬──────────┬────────────┬──────┘   │
│          │               │              │          │            │          │
│          ▼               ▼              ▼          ▼            ▼          │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                     MESH ADAPTER RESOLVERS                           │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │ dropin-plp  │ dropin-cart │ dropin-checkout │ dropin-auth │ order   │   │
│  │    .js      │    .js      │      .js        │    .js      │  .js    │   │
│  └───────┬───────────────┬──────────────┬──────────┬────────────┬──────┘   │
│          │               │              │          │            │          │
│          │ INTERCEPTS    │ INTERCEPTS   │ INTERCEPTS  INTERCEPTS INTERCEPTS│
│          │ productSearch │ cart ops     │ checkout    auth       order     │
│          │               │              │          │            │          │
│          ▼               ▼              ▼          ▼            ▼          │
│  ┌───────────────┐  ┌────────────────────────────────────────────────┐    │
│  │ ACO_BuildRight│  │              Commerce Source                    │    │
│  │    Source     │  │   (Cart, Checkout, Auth, Order mutations)       │    │
│  │               │  │                                                 │    │
│  │ BuildRight_   │  │   - createCart, addToCart, updateCart           │    │
│  │ productSearch │  │   - setShippingAddress, placeOrder              │    │
│  │               │  │   - signIn, signUp, resetPassword               │    │
│  │ + extensibility│ │   - getOrderDetails                             │    │
│  │   hooks       │  │                                                 │    │
│  └───────┬───────┘  └──────────────────────┬─────────────────────────┘    │
│          │                                  │                              │
│          ▼                                  ▼                              │
│  ┌───────────────┐                ┌─────────────────────────────────┐     │
│  │ Adobe Commerce│                │         Adobe Commerce          │     │
│  │ Optimizer(ACO)│                │     (Magento GraphQL API)       │     │
│  │               │                │                                 │     │
│  │ Products +    │                │ Cart, Checkout, Auth, Orders    │     │
│  │ Pricing       │                │                                 │     │
│  └───────────────┘                └─────────────────────────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Adapter Routing by Dropin Type

| Dropin | Adapter | Backend Source | Purpose |
|--------|---------|----------------|---------|
| Product Discovery (PLP) | `dropin-plp.js` | ACO (Adobe Commerce Optimizer) | Product search, facets, pricing |
| Product Details (PDP) | `dropin-pdp.js` | ACO (Adobe Commerce Optimizer) | Product details, variants |
| Cart | `dropin-cart.js` | Commerce (Magento) | Cart operations |
| Checkout | `dropin-checkout.js` | Commerce (Magento) | Checkout mutations |
| Auth | `dropin-auth.js` | Commerce (Magento) | Authentication |
| Order | `dropin-order.js` | Commerce (Magento) | Order queries |

**Why the adapter pattern?**
- Provides programmatic control over dropin queries
- Enables adding custom BuildRight fields
- Centralizes business logic and logging
- ACO returns pricing natively - adapter is for CONTROL, not required for basic pricing
- Allows persona-aware routing (different catalog views per user tier)

See `buildright-service/mesh/README.md` for mesh architecture details.

---

## CSS Strategy

### Namespacing

All custom slot content uses `.buildright-*` class prefix:

```css
/* Custom slot content - no !important needed */
.buildright-product-image { ... }
.buildright-price { ... }
.buildright-add-to-cart { ... }
```

### Overriding Dropin Containers

Adobe container styles require `!important` for overrides:

```css
/* Grid layout override */
.dropin-search-results-container [class*="productList"] {
  display: grid !important;
  grid-template-columns: repeat(4, 240px) !important;
  gap: 24px !important;
}
```

### CSS File Structure

```
blocks/product-list/
├── product-list.css          # Imports component files
└── css/
    ├── grid.css              # Grid layout overrides
    ├── product-card.css      # Card slot styling
    ├── facets.css            # Facets container styling
    ├── pagination.css        # Pagination styling
    └── loading-states.css    # Loading/error states
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `blocks/header/header.js` | Header block with SearchBarInput/SearchBarResults containers |
| `blocks/product-list/product-list.js` | Block logic, container rendering, slot config |
| `blocks/product-list/product-list.css` | CSS imports |
| `blocks/product-list/css/*.css` | Modular component CSS |
| `pages/catalog.html` | Catalog page using product-list block |
| `scripts/initializers/index.js` | Dropin initialization |
| `buildright-service/mesh/resolvers-src/dropin-plp.js` | PLP query adapter (Product Discovery) |
| `buildright-service/mesh/resolvers-src/dropin-pdp.js` | PDP query adapter (Product Details) |

---

## Deprecated

The custom catalog implementation (direct ACO queries, custom `product-grid` and `filters-sidebar` blocks) has been fully replaced by the dropin approach and removed from the codebase. See git history if reference is needed.

---

## Related Documentation

### Visual Documentation (Per-Dropin)

- [Dropin Visualizations Overview](../explanations/dropins/README.md)
- [Product Discovery Dropin](../explanations/dropins/product-discovery.md) - /catalog page architecture
- [Cart Dropin](../explanations/dropins/cart.md) - /cart page architecture
- [Checkout Dropin](../explanations/dropins/checkout.md) - /checkout page architecture
- [Auth Dropin](../explanations/dropins/auth.md) - /login, /signup page architectures
- [Order Dropin](../explanations/dropins/order.md) - /order-confirmation page architecture

### Technical Reference

- [dropin-integration-reference.md](./dropin-integration-reference.md) - Configuration, slots, and implementation patterns
- `buildright-service/mesh/README.md` - Mesh architecture and adapter pattern
- `blocks/CLAUDE.md` - Block inventory (29 blocks including cart, checkout, auth, order-confirmation)
- `docs/adr/ADR-008-*.md` - CSS refactoring decisions
- [ADR-014](../adr/ADR-014-eds-blocks-vs-dropins.md) - EDS Blocks vs Dropins decision framework

### Block Implementation Files

| Page | Block | File |
|------|-------|------|
| /catalog | product-list | `blocks/product-list/product-list.js` |
| /cart | cart | `blocks/cart/cart.js` |
| /checkout | checkout | `blocks/checkout/checkout.js` |
| /login | login-form | `blocks/login-form/login-form.js` |
| /signup | auth | `blocks/auth/auth.js` |
| /order-confirmation | order-confirmation | `blocks/order-confirmation/order-confirmation.js` |
