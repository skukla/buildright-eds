# Commerce Dropins Integration

> **Status:** Implemented  
> **Date:** December 11, 2025  
> **Purpose:** Integrate Adobe Commerce Storefront Dropins with BuildRight

---

## Overview

BuildRight now supports Adobe Commerce Storefront Dropins for authentication and cart functionality. This is a **hybrid integration**:

- **Dropins handle:** Authentication, cart, checkout (Commerce data)
- **Custom blocks handle:** Product catalog from ACO, BOM builder, persona-based pricing

The integration bridges Commerce Dropins with BuildRight's ACO-based catalog through the persona action.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                    Commerce Dropins                                  │
│  ┌──────────────┐ ┌───────────────────┐ ┌────────────────┐         │
│  │ Auth Dropin  │ │  Cart Dropin      │ │ Account Dropin │         │
│  └──────┬───────┘ └─────────┬─────────┘ └───────┬────────┘         │
└─────────┼───────────────────┼───────────────────┼───────────────────┘
          │ authenticated     │ cart/data         │
          ▼                   ▼                   ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       Event Bus                                      │
│  'authenticated' → auth.js initializer → initializeMeshForEmail      │
│  'cart/data' → update cart badges                                   │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   BuildRight Persona Integration                     │
│  initializeMeshForEmail(email) → persona action via API Mesh        │
│  → Gets ACO catalogViewId + priceBookId                             │
│  → Sets headers for all subsequent product queries                  │
└─────────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Custom BuildRight Blocks                           │
│  product-grid → ACO via Mesh (with persona headers)                  │
│  pricing-display → persona-aware volume pricing                      │
│  build-configurator → BOM configuration                              │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Configuration

### `/config/env.json`

```json
{
  "meshEndpoint": "https://edge-sandbox-graph.adobe.io/api/[mesh-id]/graphql",
  "commerceEndpoint": "https://com750.adobedemo.com/graphql",
  "commerceStoreCode": "default",
  "environment": "development",
  "features": {
    "useCommerceDropins": true,
    "useDemoAuth": true
  }
}
```

| Feature Flag | Description |
|--------------|-------------|
| `useCommerceDropins` | Enable Commerce Dropins for auth/cart (true = dropins, false = demo only) |
| `useDemoAuth` | Use demo persona selector instead of real Commerce login |

### Recommended Configurations

| Environment | useCommerceDropins | useDemoAuth | Behavior |
|-------------|-------------------|-------------|----------|
| Demo (default) | `true` | `true` | Dropins initialized, but demo persona UI shown |
| Production | `true` | `false` | Full Commerce login via dropins |
| Offline Dev | `false` | `true` | No dropins, mock data only |

---

## Files Created/Modified

### New Files

| File | Purpose |
|------|---------|
| `scripts/initializers/index.js` | Dropin initialization orchestrator |
| `scripts/initializers/auth.js` | Auth dropin init + persona bridge |
| `scripts/initializers/cart.js` | Cart dropin init + API wrappers |
| `scripts/commerce-helpers.js` | Add-to-cart helpers for ACO products |
| `blocks/auth-dropin/auth-dropin.js` | Auth UI block (login/register/user-menu) |
| `blocks/auth-dropin/auth-dropin.css` | Auth block styles |
| `blocks/commerce-mini-cart/commerce-mini-cart.js` | Mini-cart block |
| `blocks/commerce-mini-cart/commerce-mini-cart.css` | Mini-cart styles |

### Modified Files

| File | Changes |
|------|---------|
| `head.html` | Added import maps for @dropins packages, dropin CSS |
| `package.json` | Added @dropins dependencies |
| `config/env.json` | Added commerceEndpoint, features flags |
| `scripts/scripts.js` | Added dropin initialization call |
| `scripts/auth.js` | Added dropin mode support, event listeners |
| `scripts/site-config.js` | (unchanged, already had loadConfig) |
| `scripts/services/mesh-integration.js` | Added initializeMeshForEmail |
| `scripts/services/catalog-service.js` | Added initializeByEmail method |

---

## Usage

### Adding Products to Cart

Use `commerce-helpers.js` for consistent cart behavior:

```javascript
import { addProductToCart, addMultipleToCart } from './commerce-helpers.js';

// Single product
await addProductToCart({ sku: 'LBR-2X4-8FT' }, 2);

// Multiple products (e.g., from BOM)
await addMultipleToCart([
  { sku: 'LBR-2X4-8FT', quantity: 485 },
  { sku: 'CONC-RDY-3000', quantity: 34 }
]);
```

### Using Auth Dropin Block

Add to HTML:

```html
<!-- Login page -->
<div class="auth-dropin sign-in"></div>

<!-- Registration page -->
<div class="auth-dropin register"></div>

<!-- Header user menu -->
<div class="auth-dropin user-menu"></div>
```

### Using Mini-Cart Block

Add to header HTML:

```html
<div class="commerce-mini-cart" 
     data-cart-url="./cart.html"
     data-checkout-url="./checkout.html">
</div>
```

---

## Event Flow

### User Login

```
1. User enters credentials in Auth Dropin
2. Dropin calls Commerce GraphQL → generateCustomerToken
3. Dropin emits 'authenticated' event (true)
4. auth.js initializer catches event
5. Gets customer data from dropin (email, customer group)
6. Calls initializeMeshForEmail(email)
7. Mesh calls persona action with email
8. Persona action queries Commerce for customer → gets ACO attributes
9. Returns { catalogViewId, priceBookId }
10. Headers cached in sessionStorage
11. All subsequent ACO queries use persona headers
12. Dispatches 'auth:login' event for UI updates
```

### Add to Cart

```
1. User clicks "Add to Cart" on product (from ACO)
2. commerce-helpers.addProductToCart({ sku }) called
3. If dropins enabled → cart.js addToCart(sku, qty)
4. Cart dropin calls Commerce GraphQL → addProductsToCart
5. Dropin emits 'cart/product/added' event
6. Mini-cart auto-opens (if visible)
7. Cart badge updates via 'cart/data' event
```

---

## Key Constraints

### Products from ACO, Cart in Commerce

Products are in ACO (Adobe Commerce Optimizer), but cart is in Commerce PaaS. This means:

1. **Add by SKU only** - Cart dropin receives SKU, not Commerce product ID
2. **No product options in ACO** - Simple products only (configurable options not supported)
3. **Pricing** - ACO provides display pricing, Commerce calculates cart totals

### Persona Bridge

When user authenticates:
1. Commerce provides customer email/group
2. Persona action maps customer → ACO catalog view + price book
3. All catalog queries include persona headers

---

## Testing

### Demo Mode Testing

1. Set `useDemoAuth: true` in env.json
2. Visit login page
3. Select a persona from the list
4. Verify catalog shows persona-specific pricing
5. Add items to cart
6. Verify cart badge updates

### Commerce Mode Testing

1. Set `useDemoAuth: false` in env.json
2. Visit login page
3. Enter Commerce customer credentials
4. Verify persona is resolved from Commerce customer
5. Verify catalog reflects customer's catalog view

### Cart Testing

```javascript
// Browser console
import('/scripts/commerce-helpers.js').then(m => {
  m.addProductToCart({ sku: 'TEST-SKU' }, 1).then(console.log);
});
```

---

## Troubleshooting

### Dropins Not Loading

1. Check browser console for import errors
2. Verify CDN URLs in head.html are accessible
3. Check env.json has `useCommerceDropins: true`

### Auth Not Working

1. Check Commerce endpoint is correct in env.json
2. Verify CORS is configured on Commerce instance
3. Check browser console for GraphQL errors

### Cart Not Updating

1. Verify 'cart/data' events are being emitted
2. Check mini-cart block is decorated
3. Look for cart dropin initialization errors

### Persona Not Resolving

1. Check mesh endpoint is correct
2. Verify persona action is deployed
3. Test persona action directly: `curl "https://.../persona?email=test@example.com"`

---

## Future Improvements

1. **Checkout Dropin** - Add full checkout flow
2. **Order Dropin** - Show order history from Commerce
3. **Wishlist** - Save for later functionality
4. **Real-time Inventory** - Show Commerce inventory levels

