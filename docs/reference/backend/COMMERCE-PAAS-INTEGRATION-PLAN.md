# Commerce PaaS Integration Plan

**Created**: December 10, 2025  
**Status**: Planning  
**Estimated Effort**: 3-5 days

---

## Overview

This document outlines the integration of Adobe Commerce PaaS backend with the BuildRight EDS frontend. Commerce will handle cart, checkout, orders, and customer authentication, while ACO continues to handle catalog and pricing.

---

## Current State

### What We Have

| System | Purpose | Status |
|--------|---------|--------|
| **ACO (Catalog Service)** | Product catalog, pricing, faceted search | ✅ Integrated via API Mesh |
| **Commerce PaaS** | Cart, checkout, orders, customers | ✅ Data seeded, ❌ Not integrated |
| **buildright-service** | BOM generation, persona resolution | ✅ Deployed |
| **buildright-eds** | Frontend storefront | ✅ Using mock cart/checkout |

### Commerce Data Already Seeded

| Entity | Count | Notes |
|--------|-------|-------|
| Products | 158 | 146 simple + 12 bundles |
| Categories | 37 | Hierarchical structure |
| Customer Groups | 5 | Matching ACO personas |
| Customers | 5 | Demo personas (Sarah, Marcus, etc.) |
| Product Images | 35 | With proper roles |
| Website/Store | 1 | BuildRight website + store view |

---

## Integration Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (EDS)                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   Dropins    │  │  EDS Blocks  │  │   Scripts    │          │
│  │  (Commerce)  │  │  (Content)   │  │  (Custom)    │          │
│  └──────┬───────┘  └──────────────┘  └──────┬───────┘          │
│         │                                     │                  │
└─────────┼─────────────────────────────────────┼──────────────────┘
          │                                     │
          ▼                                     ▼
┌─────────────────────┐             ┌─────────────────────┐
│    API Mesh         │             │    API Mesh         │
│  (Commerce Source)  │             │   (ACO Source)      │
│                     │             │                     │
│  - Cart mutations   │             │  - Product search   │
│  - Checkout         │             │  - Pricing          │
│  - Orders           │             │  - BOM generation   │
│  - Customer auth    │             │  - Persona          │
└─────────┬───────────┘             └─────────┬───────────┘
          │                                   │
          ▼                                   ▼
┌─────────────────────┐             ┌─────────────────────┐
│  Adobe Commerce     │             │  Adobe Commerce     │
│  (PaaS Instance)    │             │  Catalog Service    │
│                     │             │  (ACO)              │
│  buildright store   │             │                     │
└─────────────────────┘             └─────────────────────┘
```

---

## Phase 1: Add Commerce to API Mesh (Day 1)

### 1.1 Update mesh.json with Commerce Source

Add Commerce GraphQL as a second source alongside ACO:

```javascript
// mesh/mesh.config.js additions
{
  "name": "Commerce",
  "handler": {
    "graphql": {
      "endpoint": "{env.COMMERCE_GRAPHQL_ENDPOINT}",
      "operationHeaders": {
        "Content-Type": "application/json",
        "Store": "buildright_us",
        "Authorization": "Bearer {context.headers['authorization']}"
      }
    }
  },
  "transforms": [
    {
      "prefix": {
        "value": "Commerce_",
        "includeRootOperations": true
      }
    }
  ]
}
```

### 1.2 Add Commerce Environment Variables

```bash
# .env additions
COMMERCE_GRAPHQL_ENDPOINT=https://your-instance.commercecloud.adobe.io/graphql
COMMERCE_STORE_CODE=buildright_us
```

### 1.3 Expose Commerce Queries/Mutations

Update mesh schema filter to expose:
- `Commerce_cart` - Get cart
- `Commerce_createEmptyCart` - Create cart
- `Commerce_addProductsToCart` - Add items
- `Commerce_removeItemFromCart` - Remove items
- `Commerce_updateCartItems` - Update quantities
- `Commerce_customer` - Get customer info
- `Commerce_generateCustomerToken` - Login
- `Commerce_placeOrder` - Checkout

---

## Phase 2: Install Storefront Dropins (Day 1-2)

### 2.1 Install Dropin Packages

```bash
npm install @dropins/storefront-auth \
            @dropins/storefront-cart \
            @dropins/storefront-checkout \
            @dropins/storefront-account \
            @dropins/storefront-order
```

### 2.2 Configure Dropin Initialization

Create `scripts/commerce/dropin-config.js`:

```javascript
export const commerceConfig = {
  endpoint: window.MESH_ENDPOINT,
  storeCode: 'buildright_us',
  currencyCode: 'USD',
  locale: 'en-US'
};

export async function initializeDropins() {
  const { initialize: initAuth } = await import('@dropins/storefront-auth');
  const { initialize: initCart } = await import('@dropins/storefront-cart');
  
  await initAuth(commerceConfig);
  await initCart(commerceConfig);
}
```

---

## Phase 3: Replace Mock Cart (Day 2)

### 3.1 Current Mock Implementation

**File**: `scripts/cart-manager.js` (or similar)

```javascript
// BEFORE: Mock cart using localStorage
export function addToCart(sku, quantity) {
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  cart.push({ sku, quantity });
  localStorage.setItem('buildright_cart', JSON.stringify(cart));
}
```

### 3.2 Real Cart Implementation

```javascript
// AFTER: Real cart using Commerce dropin
import { addProductsToCart, getCart } from '@dropins/storefront-cart';

export async function addToCart(sku, quantity) {
  try {
    const result = await addProductsToCart({
      cartItems: [{ sku, quantity }]
    });
    
    window.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { cart: result.cart }
    }));
    
    return { success: true, cart: result.cart };
  } catch (error) {
    console.error('Add to cart failed:', error);
    return { success: false, error: error.message };
  }
}

export async function getCartData() {
  return await getCart();
}
```

### 3.3 Update Mini-Cart Block

**File**: `blocks/mini-cart/mini-cart.js`

```javascript
import { getCartData } from '../../scripts/commerce/cart-service.js';

export default async function decorate(block) {
  const cart = await getCartData();
  
  block.innerHTML = `
    <div class="mini-cart">
      <span class="cart-count">${cart.total_quantity || 0}</span>
      <span class="cart-total">$${cart.prices?.grand_total?.value?.toFixed(2) || '0.00'}</span>
    </div>
  `;
  
  // Listen for cart updates
  window.addEventListener('cart:updated', async () => {
    const updatedCart = await getCartData();
    block.querySelector('.cart-count').textContent = updatedCart.total_quantity;
    block.querySelector('.cart-total').textContent = 
      `$${updatedCart.prices?.grand_total?.value?.toFixed(2)}`;
  });
}
```

---

## Phase 4: Implement Authentication (Day 2-3)

### 4.1 Auth Service

**File**: `scripts/commerce/auth-service.js`

```javascript
import { 
  signIn, 
  signOut, 
  getCustomer,
  isAuthenticated 
} from '@dropins/storefront-auth';

export async function login(email, password) {
  try {
    const result = await signIn({ email, password });
    
    // After Commerce login, get customer group for ACO persona
    const customer = await getCustomer();
    const customerGroupId = customer.group_id;
    
    // Initialize ACO persona based on Commerce customer group
    await initializePersona(customerGroupId);
    
    return { success: true, customer };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

export async function logout() {
  await signOut();
  clearPersonaHeaders();
}

export { isAuthenticated, getCustomer };
```

### 4.2 Login Block

**File**: `blocks/login/login.js`

```javascript
import { login } from '../../scripts/commerce/auth-service.js';

export default async function decorate(block) {
  block.innerHTML = `
    <form class="login-form">
      <input type="email" name="email" placeholder="Email" required>
      <input type="password" name="password" placeholder="Password" required>
      <button type="submit">Sign In</button>
      <div class="error-message"></div>
    </form>
  `;
  
  block.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const result = await login(
      formData.get('email'),
      formData.get('password')
    );
    
    if (result.success) {
      window.location.href = '/account';
    } else {
      block.querySelector('.error-message').textContent = result.error;
    }
  });
}
```

---

## Phase 5: Implement Checkout (Day 3-4)

### 5.1 Checkout Page

**File**: `pages/checkout.html`

```html
<main>
  <div class="section checkout-section">
    <div class="checkout-container">
      <!-- Checkout dropin renders here -->
    </div>
  </div>
</main>
```

### 5.2 Checkout Block

**File**: `blocks/checkout/checkout.js`

```javascript
import { render } from '@dropins/storefront-checkout';

export default async function decorate(block) {
  await render(block, {
    onOrderPlaced: async (order) => {
      // Track order placement
      window.dispatchEvent(new CustomEvent('order:placed', {
        detail: { orderId: order.order_number }
      }));
      
      // Redirect to confirmation
      window.location.href = `/order-confirmation?order=${order.order_number}`;
    },
    onError: (error) => {
      console.error('Checkout error:', error);
    }
  });
}
```

---

## Phase 6: Order History (Day 4)

### 6.1 Orders Block

**File**: `blocks/order-history/order-history.js`

```javascript
import { getOrders } from '@dropins/storefront-order';

export default async function decorate(block) {
  const orders = await getOrders();
  
  if (!orders.length) {
    block.innerHTML = '<p>No orders yet.</p>';
    return;
  }
  
  block.innerHTML = `
    <div class="orders-list">
      ${orders.map(order => `
        <div class="order-card">
          <div class="order-header">
            <span class="order-number">Order #${order.number}</span>
            <span class="order-date">${formatDate(order.order_date)}</span>
            <span class="order-status">${order.status}</span>
          </div>
          <div class="order-total">$${order.grand_total.toFixed(2)}</div>
          <a href="/order-detail?id=${order.number}" class="view-order">View Details</a>
        </div>
      `).join('')}
    </div>
  `;
}
```

---

## Phase 7: Connect BOM to Cart (Day 4-5)

### 7.1 Update BOM Review to Use Real Cart

**File**: `scripts/bom-review.js`

```javascript
import { addToCart } from './commerce/cart-service.js';

async addAllToCart() {
  const bomData = this.getBOMData();
  
  // Add each BOM line item to Commerce cart
  for (const phase of bomData.phases) {
    for (const item of phase.lineItems) {
      await addToCart(item.sku, item.quantity);
    }
  }
  
  // Navigate to cart
  window.location.href = '/cart';
}
```

### 7.2 Bundle Product Support

For bundle products, use Commerce's bundle product cart mutation:

```javascript
async function addBundleToCart(bundleSku, selectedOptions) {
  const { addBundleProductsToCart } = await import('@dropins/storefront-cart');
  
  return await addBundleProductsToCart({
    cartItems: [{
      sku: bundleSku,
      quantity: 1,
      bundle_options: selectedOptions.map(opt => ({
        id: opt.optionId,
        quantity: opt.quantity,
        value: [opt.selectionId]
      }))
    }]
  });
}
```

---

## Testing Checklist

### Phase 1: Mesh
- [ ] Commerce source added to mesh
- [ ] Environment variables configured
- [ ] Basic queries work (cart, customer)

### Phase 2: Dropins
- [ ] Auth dropin initializes
- [ ] Cart dropin initializes
- [ ] No console errors on page load

### Phase 3: Cart
- [ ] Add to cart works
- [ ] Mini-cart updates
- [ ] Cart page shows items
- [ ] Update quantity works
- [ ] Remove item works

### Phase 4: Auth
- [ ] Login works
- [ ] Logout works
- [ ] Customer data loads
- [ ] ACO persona syncs with Commerce group

### Phase 5: Checkout
- [ ] Checkout renders
- [ ] Shipping address works
- [ ] Payment methods show
- [ ] Order placement works

### Phase 6: Orders
- [ ] Order history loads
- [ ] Order details accessible
- [ ] Reorder flow works

### Phase 7: BOM
- [ ] BOM items add to cart
- [ ] Bundle items add correctly
- [ ] Quantities preserved

---

## Migration Path

### Demo Mode → Production Mode

The codebase should support both modes:

```javascript
// scripts/commerce/config.js
export const isProduction = !window.location.hostname.includes('localhost');

export const getCartService = async () => {
  if (isProduction) {
    return await import('./cart-service.js');
  } else {
    return await import('./mock-cart-service.js');
  }
};
```

### Feature Flags

```javascript
// scripts/commerce/features.js
export const FEATURES = {
  REAL_CART: true,           // Use Commerce cart
  REAL_CHECKOUT: true,       // Use Commerce checkout
  REAL_AUTH: true,           // Use Commerce auth
  REAL_ORDERS: true          // Use Commerce orders
};
```

---

## Known Considerations

### 1. SKU Synchronization
Products in Commerce must match SKUs from ACO. Our import scripts ensure this.

### 2. Pricing Source
- **Catalog pricing**: ACO (via persona price books)
- **Cart pricing**: Commerce (final cart totals)
- **May differ slightly** due to cart rules, promotions

### 3. Customer Group Mapping
| Commerce Group | ACO Persona | Price Book |
|----------------|-------------|------------|
| 1 | Production Builder | Production-Builder |
| 2 | General Contractor | Trade-Professional |
| 3 | Remodeling Contractor | Trade-Professional |
| 4 | DIY Homeowner | Retail |
| 5 | Store Manager | Admin |

### 4. Bundle Products
Commerce bundles have their own pricing logic. We calculate bundle price from ACO selections, but Commerce cart may apply different rules.

---

## Dependencies

### NPM Packages
```json
{
  "@dropins/storefront-auth": "^1.x",
  "@dropins/storefront-cart": "^1.x",
  "@dropins/storefront-checkout": "^1.x",
  "@dropins/storefront-account": "^1.x",
  "@dropins/storefront-order": "^1.x"
}
```

### Environment
- Commerce PaaS instance with GraphQL enabled
- API Mesh with Commerce source configured
- BuildRight website/store/store view created

---

## Related Documentation

- [ADR-001: Use Dropins for Commerce](../adr/ADR-001-use-dropins-for-commerce.md)
- [ADR-005: Dual Mode Authentication](../adr/ADR-005-dual-mode-authentication.md)
- [DROPIN-INTEGRATION-GUIDE.md](./DROPIN-INTEGRATION-GUIDE.md)
- [BLOCK-VS-DROPIN-MATRIX.md](./BLOCK-VS-DROPIN-MATRIX.md)

