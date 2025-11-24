# Adobe Commerce Dropins - Integration Guide

**Research Date**: November 15, 2024  
**Sources**: Adobe Experience League, Context7, Adobe Developer Documentation

This guide explains how to integrate Adobe Commerce dropins with the BuildRight EDS storefront, covering both mock (demo) and production scenarios.

---

## Integration Approaches

### Approach 1: Demo Mode (Phases 0-7)
**Mock dropin functionality** without Commerce backend connection.
- Build services that mimic dropin APIs
- Design for eventual dropin integration
- Test persona flows with mock data

### Approach 2: Production Mode (Post-Launch)
**Connect to real dropins** with Commerce backend.
- Install dropin NPM packages
- Configure Commerce API endpoints
- Swap mocks for real imports
- Minimal code changes (by design)

---

## Demo Mode Integration (Our Current Path)

### Step 1: Install SDK Dependencies (For Reference Only)

**Don't install yet**, but understand what we'll need later:

```bash
# Core dropins we'd use in production
npm install @dropins/storefront-auth
npm install @dropins/storefront-account
npm install @dropins/storefront-cart
npm install @dropins/storefront-checkout
```

**For demo**: We'll create mock equivalents.

---

### Step 2: Create Mock Dropin Services

Mirror dropin API structure in our mocks.

#### Mock Auth Service

**File**: `scripts/mock-dropins/auth.js`

```javascript
/**
 * Mock Auth Dropin
 * Mimics @dropins/storefront-auth API
 */

// Mock version of getCustomerToken
export async function getCustomerToken(email, password) {
  console.log('[Mock Auth] Generating customer token');
  
  // Simulate API call
  await simulateDelay(300);
  
  // Return mock token
  return {
    token: 'mock_customer_token_' + Date.now(),
    customer: {
      id: 1,
      firstname: 'Demo',
      lastname: 'User',
      email: email
    }
  };
}

// Mock version of createCustomer
export async function createCustomer(forms, apiVersion2 = false) {
  console.log('[Mock Auth] Creating customer');
  
  await simulateDelay(500);
  
  return {
    customer: {
      id: Date.now(),
      email: forms.email,
      firstname: forms.firstname,
      lastname: forms.lastname
    }
  };
}

// Mock version of getStoreConfig
export async function getStoreConfig() {
  return {
    password_requirements: {
      required_length: 8,
      required_character_types: ['lowercase', 'uppercase', 'number']
    }
  };
}

// Helper
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Emit dropin-style events
export function emitAuthEvent(type, detail) {
  window.dispatchEvent(new CustomEvent(`auth:${type}`, { detail }));
}
```

#### Mock Account Service

**File**: `scripts/mock-dropins/account.js`

```javascript
/**
 * Mock Account Dropin
 * Mimics @dropins/storefront-account API
 */

// Mock version of getCustomer
export async function getCustomer() {
  console.log('[Mock Account] Getting customer data');
  
  // Get from auth context
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  
  return {
    id: user.id,
    firstname: user.firstname || 'Demo',
    lastname: user.lastname || 'User',
    email: user.email
  };
}

// Mock version of getCustomerAddress
export async function getCustomerAddress() {
  return [
    {
      id: 1,
      street: ['123 Main St'],
      city: 'Phoenix',
      region: { region: 'Arizona', regionCode: 'AZ' },
      postcode: '85001',
      country_id: 'US',
      telephone: '555-0100',
      default_shipping: true,
      default_billing: true
    }
  ];
}

// Mock version of createCustomerAddress
export async function createCustomerAddress(address) {
  console.log('[Mock Account] Creating address', address);
  
  await simulateDelay(300);
  
  return 'Address created successfully';
}

// Helper
function simulateDelay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

#### Mock Cart Service

**File**: `scripts/mock-dropins/cart.js`

```javascript
/**
 * Mock Cart Dropin
 * Mimics @dropins/storefront-cart API
 */

let mockCart = {
  id: 'cart-123',
  items: [],
  prices: {
    grand_total: { value: 0, currency: 'USD' }
  }
};

// Mock version of getCart
export async function getCart() {
  console.log('[Mock Cart] Getting cart');
  return { ...mockCart };
}

// Add item to cart
export async function addToCart(product, quantity) {
  console.log('[Mock Cart] Adding to cart', product.sku, quantity);
  
  const existing = mockCart.items.find(item => item.product.sku === product.sku);
  
  if (existing) {
    existing.quantity += quantity;
  } else {
    mockCart.items.push({
      id: 'item-' + Date.now(),
      quantity,
      product: {
        sku: product.sku,
        name: product.name,
        price: product.price
      }
    });
  }
  
  // Recalculate total
  updateCartTotal();
  
  // Emit event (dropin pattern)
  window.dispatchEvent(new CustomEvent('cart:updated', {
    detail: { cart: mockCart }
  }));
  
  return mockCart;
}

// Remove item from cart
export async function removeFromCart(itemId) {
  mockCart.items = mockCart.items.filter(item => item.id !== itemId);
  updateCartTotal();
  
  window.dispatchEvent(new CustomEvent('cart:updated', {
    detail: { cart: mockCart }
  }));
  
  return mockCart;
}

// Update cart item quantity
export async function updateCartItem(itemId, quantity) {
  const item = mockCart.items.find(i => i.id === itemId);
  if (item) {
    item.quantity = quantity;
    updateCartTotal();
    
    window.dispatchEvent(new CustomEvent('cart:updated', {
      detail: { cart: mockCart }
    }));
  }
  
  return mockCart;
}

function updateCartTotal() {
  mockCart.prices.grand_total.value = mockCart.items.reduce(
    (sum, item) => sum + (item.product.price * item.quantity),
    0
  );
}
```

---

### Step 3: Use Mock Services Like Real Dropins

In your EDS blocks, import from mocks:

**File**: `blocks/user-menu/user-menu.js`

```javascript
// Import from mock (same API as real dropin)
import { getCustomer } from '../../scripts/mock-dropins/account.js';

export default async function decorate(block) {
  try {
    // Use exact same API as production dropin
    const customer = await getCustomer();
    
    block.innerHTML = `
      <div class="user-menu">
        <span class="user-name">Welcome, ${customer.firstname}!</span>
        <a href="/pages/account.html">My Account</a>
        <button class="logout-btn">Logout</button>
      </div>
    `;
  } catch (error) {
    console.error('Error loading user menu:', error);
  }
}
```

**When moving to production**: Change import path, logic stays the same:

```javascript
// Production: import from real dropin
import { getCustomer } from '@dropins/storefront-account';

// Everything else stays the same!
```

---

### Step 4: Emit Dropin-Style Events

Use dropin event patterns throughout:

```javascript
// Auth events
window.dispatchEvent(new CustomEvent('auth:login', {
  detail: { user: {...} }
}));

window.dispatchEvent(new CustomEvent('auth:logout'));

// Cart events
window.dispatchEvent(new CustomEvent('cart:updated', {
  detail: { cart: {...} }
}));

window.dispatchEvent(new CustomEvent('cart:item-added', {
  detail: { product: {...}, quantity: 1 }
}));

// User events
window.dispatchEvent(new CustomEvent('user:updated', {
  detail: { user: {...} }
}));
```

---

### Step 5: Align Design Tokens

Map our design tokens to dropin token names:

**File**: `styles/base.css`

```css
:root {
  /* Our tokens */
  --color-brand-500: #1E40AF;
  --color-accent-500: #F59E0B;
  --spacing-small: 0.5rem;
  --spacing-medium: 1rem;
  --spacing-large: 1.5rem;
  --shape-border-radius-3: 0.5rem;
  
  /* Map to dropin-compatible names (for future integration) */
  --dropin-color-brand-primary: var(--color-brand-500);
  --dropin-color-brand-secondary: var(--color-accent-500);
  --dropin-spacing-sm: var(--spacing-small);
  --dropin-spacing-md: var(--spacing-medium);
  --dropin-spacing-lg: var(--spacing-large);
  --dropin-border-radius: var(--shape-border-radius-3);
}
```

---

## Production Mode Integration (Future)

### Step 1: Install Real Dropins

```bash
npm install @dropins/storefront-auth
npm install @dropins/storefront-account
npm install @dropins/storefront-cart
```

---

### Step 2: Configure Commerce Backend

**File**: `scripts/config/commerce-config.js`

```javascript
export const commerceConfig = {
  // GraphQL endpoint
  endpoint: 'https://your-commerce-instance.com/graphql',
  
  // Store configuration
  storeCode: 'default',
  
  // Headers
  headers: {
    'Content-Type': 'application/json',
    'Store-Code': 'default'
  },
  
  // API Key (if using API Mesh)
  apiKey: process.env.COMMERCE_API_KEY
};
```

---

### Step 3: Initialize Dropins

Create initializer scripts (dropin pattern):

**File**: `scripts/initializers/auth.js`

```javascript
import AuthDropin from '@dropins/storefront-auth';
import { commerceConfig } from '../config/commerce-config.js';

// Initialize Auth dropin
const authDropin = new AuthDropin({
  endpoint: commerceConfig.endpoint,
  headers: commerceConfig.headers
});

// Make available globally
window.authDropin = authDropin;

// Listen for auth events
authDropin.on('login', (user) => {
  console.log('User logged in:', user);
  window.dispatchEvent(new CustomEvent('auth:login', {
    detail: { user }
  }));
});

authDropin.on('logout', () => {
  console.log('User logged out');
  window.dispatchEvent(new CustomEvent('auth:logout'));
});

export default authDropin;
```

**File**: `scripts/initializers/cart.js`

```javascript
import CartDropin from '@dropins/storefront-cart';
import { commerceConfig } from '../config/commerce-config.js';

const cartDropin = new CartDropin({
  endpoint: commerceConfig.endpoint,
  headers: commerceConfig.headers
});

window.cartDropin = cartDropin;

// Forward dropin events
cartDropin.on('updated', (cart) => {
  window.dispatchEvent(new CustomEvent('cart:updated', {
    detail: { cart }
  }));
});

export default cartDropin;
```

---

### Step 4: Update EDS Blocks to Use Real Dropins

**Before** (demo mode):
```javascript
import { getCustomer } from '../../scripts/mock-dropins/account.js';
```

**After** (production mode):
```javascript
import { getCustomer } from '@dropins/storefront-account';
```

**That's it!** API signatures match, so code works the same.

---

### Step 5: Configure Dropin Styling

Override dropin styles with our design tokens:

**File**: `styles/dropins-override.css`

```css
/* Override dropin button styles */
.dropin-auth .btn-primary {
  background: var(--dropin-color-brand-primary);
  color: white;
  border-radius: var(--dropin-border-radius);
  padding: var(--dropin-spacing-md) var(--dropin-spacing-lg);
}

/* Override dropin input styles */
.dropin-auth .input-field {
  border: 1px solid var(--color-neutral-300);
  border-radius: var(--dropin-border-radius);
  padding: var(--dropin-spacing-sm);
}

/* Override dropin card styles */
.dropin-account .account-card {
  box-shadow: var(--shape-shadow-2);
  border-radius: var(--dropin-border-radius);
  padding: var(--dropin-spacing-lg);
}
```

---

### Step 6: Customize with Slots

Inject custom content into dropin slots:

```javascript
import authDropin from './initializers/auth.js';

// Get slot reference
const signInSlot = authDropin.slot('sign-in-footer');

// Render custom content into slot
signInSlot.render(() => {
  return `
    <div class="custom-footer">
      <p>Need help? <a href="/support">Contact Support</a></p>
    </div>
  `;
});
```

---

## Integration Checklist

### Demo Mode (Current)
- [ ] Create mock dropin services (`mock-dropins/*.js`)
- [ ] Match dropin API signatures in mocks
- [ ] Use dropin event patterns
- [ ] Align design tokens with dropin token names
- [ ] Import from mocks in EDS blocks
- [ ] Test with persona demo data

### Production Mode (Future)
- [ ] Install real dropin NPM packages
- [ ] Configure Commerce backend endpoints
- [ ] Create dropin initializers
- [ ] Update imports (mocks → dropins)
- [ ] Test with real Commerce data
- [ ] Override dropin styles as needed
- [ ] Implement slot customizations
- [ ] Verify event integration

---

## Architecture Diagram

```
Demo Mode (Phases 0-7):
┌─────────────┐
│ EDS Block   │
└──────┬──────┘
       │
       ├─ import { getCustomer } from 'mock-dropins/account.js'
       │
       ↓
┌─────────────────┐
│ Mock Service    │  ← Mimics dropin API
└─────────────────┘
       │
       ↓
┌─────────────────┐
│ Mock Data       │
│ (localStorage)  │
└─────────────────┘

Production Mode (Post-Launch):
┌─────────────┐
│ EDS Block   │
└──────┬──────┘
       │
       ├─ import { getCustomer } from '@dropins/storefront-account'
       │
       ↓
┌─────────────────┐
│ Real Dropin     │
└─────────────────┘
       │
       ↓ GraphQL
┌─────────────────┐
│ Adobe Commerce  │
│ Backend         │
└─────────────────┘
```

---

## Migration Path

### Phase 0-5: Build with Mocks
- Design mock APIs matching dropin signatures
- Test persona flows
- Ensure event system works
- Align design tokens

### Phase 6-7: Validate Integration Path
- Document dropin integration steps
- Test mock → dropin swap with one component
- Validate event compatibility

### Post-Launch: Connect to Commerce
1. Set up Commerce backend
2. Install dropin packages
3. Create initializers
4. Update imports (2 lines per file)
5. Test with real data
6. Deploy

---

## Best Practices

### DO:
✅ Match dropin API signatures exactly in mocks  
✅ Use dropin event naming conventions  
✅ Align design tokens with dropin tokens  
✅ Keep imports at top of files for easy swapping  
✅ Document which mocks map to which dropins  

### DON'T:
❌ Create custom APIs that don't match dropins  
❌ Use different event patterns  
❌ Hardcode logic that should be in dropins  
❌ Ignore dropin documentation  
❌ Skip design token alignment  

---

## Troubleshooting

### Issue: Dropin not loading
**Check**:
- NPM package installed
- Initializer imported
- Commerce endpoint configured
- CORS enabled on Commerce backend

### Issue: Events not firing
**Check**:
- Event names match dropin conventions
- Custom Event properly dispatched
- Event listeners added before events fire

### Issue: Styling doesn't apply
**Check**:
- CSS specificity (dropins may have high specificity)
- Design tokens properly defined
- Override CSS loaded after dropin CSS

---

## Related Documents

- `DROPIN-ARCHITECTURE.md` - Detailed dropin architecture
- `BLOCK-VS-DROPIN-MATRIX.md` - When to use blocks vs dropins
- `MOCK-ACO-API-SPEC.md` - Mock service specifications
- `AUTH-STRATEGY.md` - Authentication integration

---

## Resources

**Adobe Documentation**:
- [Storefront SDK](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/)
- [Drop-ins Overview](https://experienceleague.adobe.com/developer/commerce/storefront/dropins/)
- [Design Tokens](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/)

**BuildRight Docs**:
- Phase 3: Core Architecture (auth, mock services)
- Phase 4: Shared Components (event patterns)
- Phase 5: Existing Page Refactor (integration points)

---

**Last Updated**: November 15, 2024  
**Status**: Demo mode approach defined, production path documented

