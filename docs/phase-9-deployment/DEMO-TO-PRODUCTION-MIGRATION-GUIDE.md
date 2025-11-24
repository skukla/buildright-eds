# Demo Mode to Production Migration Guide

**Status**: Reference Document  
**Date**: 2025-11-24  
**Purpose**: Step-by-step guide to migrate BuildRight EDS from static demo mode to live Adobe Commerce PaaS + ACO integration

---

## Overview

This guide provides a complete, ordered checklist for migrating from demo mode (static files) to production mode (live APIs) across all three systems:

1. **Adobe Commerce PaaS** - Backend/Commerce engine
2. **Adobe Commerce Optimizer (ACO)** - Enhancement layer (pricing, catalog, policies)
3. **Adobe Commerce Edge Delivery Services (EDS)** - Frontend storefront

**Prerequisites**:
- ✅ Phase 1-7 completed (demo mode functional)
- ✅ Phase 8 completed (backend setup in Commerce PaaS + ACO)
- ✅ Access to Adobe I/O, API Mesh, EDS deployment

---

## Migration Architecture

### Demo Mode (Current)

```
┌─────────────────────────────────────────────┐
│  BuildRight EDS (localhost:3000)            │
│  ─────────────────────────────              │
│  • Static files in data/                    │
│  • Mock services in scripts/                │
│  • No backend connection                    │
└─────────────────────────────────────────────┘
    ↓
Data Sources (ALL LOCAL):
• data/mock-products.json
• data/store-inventory.json
• scripts/data-mock.js
• scripts/aco-service.js (mock)
• scripts/auth.js (mock)
• localStorage/sessionStorage
```

### Production Mode (Target)

```
┌─────────────────────────────────────────────────────┐
│  Edge Delivery Services                             │
│  (https://main--buildright--org.aem.live)           │
│  ─────────────────────────────────                  │
│  • Adobe Commerce Dropins                           │
│  • Custom EDS Blocks                                │
│  • API Mesh Client                                  │
└──────────────┬──────────────────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────────────────┐
│  Adobe API Mesh                                     │
│  (GraphQL Gateway)                                  │
│  ─────────────────────                              │
│  • Custom resolvers (persona, pricing, policy)      │
│  • Authentication middleware                        │
│  • Combines Commerce + ACO data                     │
└──────────────┬──────────────────────────────────────┘
               │
       ┌───────┴───────┐
       │               │
       ↓               ↓
┌──────────────┐  ┌──────────────┐
│  Adobe       │  │  Adobe       │
│  Commerce    │  │  Commerce    │
│  PaaS        │  │  Optimizer   │
│              │  │  (ACO)       │
├──────────────┤  ├──────────────┤
│ • Products   │  │ • Price Books│
│ • Inventory  │  │ • Policies   │
│ • Categories │  │ • Catalog    │
│ • Customers  │  │ • CCDM       │
│ • B2B        │  │ • Analytics  │
└──────────────┘  └──────────────┘
```

---

## Migration Phases

| Phase | System | Duration | Dependencies |
|-------|--------|----------|--------------|
| 1 | API Mesh Setup | 2-3 days | Adobe I/O access, Commerce+ACO endpoints |
| 2 | Authentication Migration | 1-2 days | API Mesh deployed, Dropins configured |
| 3 | Product Data Migration | 2-3 days | API Mesh deployed, ACO configured |
| 4 | Pricing Migration | 1-2 days | Product data migrated, Price books configured |
| 5 | Cart/Checkout Migration | 2-3 days | Auth + Products + Pricing working |
| 6 | Persona Features Migration | 3-5 days | All core commerce working |
| 7 | Testing & Validation | 2-3 days | All features migrated |
| 8 | EDS Deployment | 1-2 days | All testing passed |

**Total**: 14-23 days (3-5 weeks)

---

## Phase 1: API Mesh Setup

### Step 1.1: Install Adobe I/O CLI

```bash
# Install CLI
npm install -g @adobe/aio-cli

# Verify installation
aio --version

# Login
aio login

# Verify org access
aio console:org:list
```

**Expected Output**: List of Adobe orgs you have access to

**Deliverable**: ✅ Authenticated to Adobe I/O

---

### Step 1.2: Create API Mesh Project

```bash
# Create mesh
aio api-mesh:create buildright-mesh

# Verify creation
aio api-mesh:get buildright-mesh
```

**Expected Output**: Mesh ID and initial endpoint

**Deliverable**: ✅ API Mesh project created

---

### Step 1.3: Configure Mesh Sources

**File**: `buildright-mesh/mesh.json`

```json
{
  "meshConfig": {
    "sources": [
      {
        "name": "AdobeCommerce",
        "handler": {
          "graphql": {
            "endpoint": "${env:COMMERCE_GRAPHQL_ENDPOINT}",
            "operationHeaders": {
              "Store": "default",
              "Content-Currency": "USD",
              "Authorization": "Bearer ${context.headers['authorization']}"
            }
          }
        }
      },
      {
        "name": "ACO",
        "handler": {
          "graphql": {
            "endpoint": "${env:ACO_GRAPHQL_ENDPOINT}",
            "operationHeaders": {
              "x-api-key": "${env:ACO_API_KEY}",
              "x-gw-ims-org-id": "${env:ACO_ORG_ID}",
              "Authorization": "Bearer ${context.headers['authorization']}"
            }
          }
        }
      }
    ],
    "additionalTypeDefs": "./schema/buildright-extensions.graphql",
    "additionalResolvers": [
      "./resolvers/persona-resolver.js",
      "./resolvers/pricing-resolver.js"
    ],
    "cache": {
      "enabled": true,
      "ttl": 300
    }
  }
}
```

**Deliverable**: ✅ Mesh configuration file created

---

### Step 1.4: Create Custom Schema

**File**: `buildright-mesh/schema/buildright-extensions.graphql`

```graphql
extend type Customer {
  """Persona determined from customer attributes"""
  persona: Persona
}

type Persona {
  id: String!
  name: String!
  title: String!
  customerGroup: String!
  attributes: PersonaAttributes!
}

type PersonaAttributes {
  constructionPhase: String
  qualityTier: String
  packageTier: String
  deckCompatible: Boolean
  storeVelocityCategory: String
}

extend type Query {
  """Get current customer's persona"""
  currentPersona: Persona
  
  """Get persona-filtered products"""
  personaProducts(
    search: String
    pageSize: Int
    currentPage: Int
  ): Products
  
  """Get persona-specific pricing with volume tiers"""
  personaPricing(sku: String!): PersonaPricing
}

type PersonaPricing {
  sku: String!
  basePrice: Money!
  customerGroupPrice: Money!
  volumeTiers: [VolumeTier!]!
  savings: Money
  savingsPercent: Float
}

type VolumeTier {
  minQuantity: Int!
  maxQuantity: Int
  unitPrice: Money!
  discount: Float!
}
```

**Deliverable**: ✅ Custom GraphQL schema defined

---

### Step 1.5: Create Persona Resolver

**File**: `buildright-mesh/resolvers/persona-resolver.js`

<parameter name="contents">
(See full resolver implementation in PHASE-9-PRODUCTION-DEPLOYMENT.md lines 197-273)

**Key functions**:
- `Customer.persona` - Maps customer attributes to persona object
- `Query.currentPersona` - Returns authenticated customer's persona
- `Query.personaProducts` - Filters products by persona policies
- `Query.personaPricing` - Returns persona-specific pricing with volume tiers

**Deliverable**: ✅ Persona resolution logic implemented

---

### Step 1.6: Deploy API Mesh

```bash
# Set environment variables
export COMMERCE_GRAPHQL_ENDPOINT="https://your-instance.adobe.io/graphql"
export ACO_GRAPHQL_ENDPOINT="https://experience.adobe.io/commerce-catalog-service/graphql"
export ACO_API_KEY="your-aco-api-key"
export ACO_ORG_ID="your-aco-org-id"

# Deploy mesh
cd buildright-mesh
aio api-mesh:update buildright-mesh --mesh-config mesh.json

# Get endpoint
aio api-mesh:get buildright-mesh
```

**Expected Output**:
```
✓ API Mesh updated successfully
Endpoint: https://graph.adobe.io/api/buildright-mesh/graphql
```

**Deliverable**: ✅ API Mesh deployed and accessible

---

### Step 1.7: Test API Mesh

```bash
# Test persona query
curl -X POST https://graph.adobe.io/api/buildright-mesh/graphql \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "{ currentPersona { id name title customerGroup } }"
  }'
```

**Expected Response**:
```json
{
  "data": {
    "currentPersona": {
      "id": "sarah",
      "name": "Sarah Martinez",
      "title": "Production Builder",
      "customerGroup": "Production-Builder"
    }
  }
}
```

**Deliverable**: ✅ API Mesh responding correctly

---

## Phase 2: Authentication Migration

### Step 2.1: Install Adobe Commerce Auth Dropin

```bash
cd buildright-eds
npm install @dropins/storefront-auth
```

**Deliverable**: ✅ Auth dropin installed

---

### Step 2.2: Replace Mock Auth Service

**File**: `scripts/auth.js`

**BEFORE (Demo Mode)**:
```javascript
// Mock authentication
const DEMO_USERS = {
  'sarah.martinez@sunbelthomes.com': {
    id: 'sarah',
    name: 'Sarah Martinez',
    // ...
  }
};

export async function login(email, password) {
  // Mock login logic
  const user = DEMO_USERS[email];
  if (user) {
    localStorage.setItem('buildright_auth', JSON.stringify(user));
    return { success: true, user };
  }
  return { success: false };
}
```

**AFTER (Production Mode)**:
```javascript
import { initialize, signIn, signOut, getCustomer } from '@dropins/storefront-auth';
import { getCurrentPersona } from './api-mesh-client.js';

// Initialize with API Mesh endpoint
await initialize({
  endpoint: window.apiMeshConfig.endpoint,
  apiKey: window.apiMeshConfig.apiKey
});

export async function login(email, password) {
  try {
    const result = await signIn({ email, password });
    
    if (result.success) {
      // Get customer persona from API Mesh
      const persona = await getCurrentPersona();
      
      // Store in session
      sessionStorage.setItem('currentPersona', JSON.stringify(persona));
      
      // Dispatch event
      window.dispatchEvent(new CustomEvent('auth:login', {
        detail: { user: result.customer, persona }
      }));
      
      return { success: true, user: result.customer, persona };
    }
    
    return { success: false, error: result.error };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
  }
}

export async function logout() {
  await signOut();
  sessionStorage.removeItem('currentPersona');
  window.dispatchEvent(new CustomEvent('auth:logout'));
}

export async function getCurrentUser() {
  return await getCustomer();
}

export function isAuthenticated() {
  return !!sessionStorage.getItem('currentPersona');
}
```

**Changes**:
- ✅ Removed mock user database
- ✅ Added @dropins/storefront-auth integration
- ✅ Added API Mesh persona query
- ✅ Real Adobe Commerce authentication
- ✅ Session management

**Deliverable**: ✅ Real authentication working

---

### Step 2.3: Create API Mesh Client

**File**: `scripts/api-mesh-client.js` (NEW)

```javascript
const API_MESH_ENDPOINT = window.apiMeshConfig?.endpoint;
const API_MESH_API_KEY = window.apiMeshConfig?.apiKey;

async function executeQuery(query, variables = {}, headers = {}) {
  const authToken = sessionStorage.getItem('auth_token');
  
  const response = await fetch(API_MESH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_MESH_API_KEY,
      'Authorization': authToken ? `Bearer ${authToken}` : '',
      ...headers
    },
    body: JSON.stringify({ query, variables })
  });
  
  if (!response.ok) {
    throw new Error(`API Mesh error: ${response.statusText}`);
  }
  
  const { data, errors } = await response.json();
  
  if (errors) {
    console.error('GraphQL errors:', errors);
    throw new Error(errors[0].message);
  }
  
  return data;
}

export async function getCurrentPersona() {
  const query = `
    query GetCurrentPersona {
      currentPersona {
        id name title customerGroup
        attributes {
          constructionPhase qualityTier packageTier
          deckCompatible storeVelocityCategory
        }
      }
    }
  `;
  
  const data = await executeQuery(query);
  return data.currentPersona;
}

export default {
  executeQuery,
  getCurrentPersona
};
```

**Deliverable**: ✅ API Mesh client created

---

### Step 2.4: Update Login Page

**File**: `pages/login.html`

**Update JavaScript**:
```javascript
// OLD: Import mock auth
// import { loginWithPersona } from '../scripts/auth.js';

// NEW: Import real auth
import { login } from '../scripts/auth.js';

document.querySelector('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.querySelector('#email').value;
  const password = document.querySelector('#password').value;
  
  // OLD: await loginWithPersona('sarah');
  // NEW:
  const result = await login(email, password);
  
  if (result.success) {
    window.location.href = '/dashboard.html';
  } else {
    showError(result.error);
  }
});
```

**Deliverable**: ✅ Login page using real auth

---

### Step 2.5: Test Authentication

**Test Checklist**:
- [ ] Can log in with real Adobe Commerce customer account
- [ ] Persona is correctly determined from customer attributes
- [ ] Session persists across page loads
- [ ] Logout works correctly
- [ ] Unauthenticated users redirected to login

**Deliverable**: ✅ Authentication fully migrated

---

## Phase 3: Product Data Migration

### Step 3.1: Replace Mock Product Data

**File**: `scripts/data-mock.js`

**BEFORE (Demo Mode)**:
```javascript
export function getProductBySKU(sku) {
  const products = JSON.parse(mockProductsJSON);
  return products.find(p => p.sku === sku);
}

export function getAllProducts() {
  return JSON.parse(mockProductsJSON);
}
```

**AFTER (Production Mode - DELETE THIS FILE)**:

This entire file is replaced by API Mesh queries.

**Deliverable**: ✅ data-mock.js deleted or deprecated

---

### Step 3.2: Add Product Query to API Mesh Client

**File**: `scripts/api-mesh-client.js` (update)

```javascript
export async function getProduct(sku) {
  const query = `
    query GetProduct($sku: String!) {
      products(filter: { sku: { eq: $sku } }) {
        items {
          sku name
          description { html }
          image { url label }
          media_gallery { url label }
          price_range {
            minimum_price {
              regular_price { value currency }
              final_price { value currency }
            }
          }
          ... on ConfigurableProduct {
            configurable_options {
              attribute_code label
              values { value_index label }
            }
          }
        }
      }
    }
  `;
  
  const data = await executeQuery(query, { sku });
  return data.products.items[0];
}

export async function getPersonaProducts(search = '', pageSize = 24, currentPage = 1) {
  const query = `
    query GetPersonaProducts($search: String, $pageSize: Int, $currentPage: Int) {
      personaProducts(search: $search, pageSize: $pageSize, currentPage: $currentPage) {
        total_count
        items {
          sku name
          image { url }
          price_range {
            minimum_price {
              regular_price { value currency }
              final_price { value currency }
            }
          }
        }
        page_info {
          current_page
          total_pages
        }
      }
    }
  `;
  
  const data = await executeQuery(query, { search, pageSize, currentPage });
  return data.personaProducts;
}
```

**Deliverable**: ✅ Product queries added

---

### Step 3.3: Update Catalog Page

**File**: `blocks/product-grid/product-grid.js`

**BEFORE (Demo Mode)**:
```javascript
import { getAllProducts } from '../../scripts/data-mock.js';

export default async function decorate(block) {
  const products = getAllProducts();
  renderProducts(block, products);
}
```

**AFTER (Production Mode)**:
```javascript
import { getPersonaProducts } from '../../scripts/api-mesh-client.js';

export default async function decorate(block) {
  try {
    const result = await getPersonaProducts('', 24, 1);
    renderProducts(block, result.items);
  } catch (error) {
    console.error('Failed to load products:', error);
    showError(block, 'Unable to load products');
  }
}
```

**Changes**:
- ✅ Removed static data import
- ✅ Added API query
- ✅ Added error handling
- ✅ Products now filtered by persona policies

**Deliverable**: ✅ Catalog using live data

---

### Step 3.4: Update Product Detail Page

**File**: `blocks/product-detail/product-detail.js`

**BEFORE (Demo Mode)**:
```javascript
import { getProductBySKU } from '../../scripts/data-mock.js';

const sku = getSkuFromUrl();
const product = getProductBySKU(sku);
renderProduct(block, product);
```

**AFTER (Production Mode)**:
```javascript
import { getProduct } from '../../scripts/api-mesh-client.js';

const sku = getSkuFromUrl();
try {
  const product = await getProduct(sku);
  renderProduct(block, product);
} catch (error) {
  console.error('Failed to load product:', error);
  show404(block);
}
```

**Deliverable**: ✅ PDP using live data

---

### Step 3.5: Test Product Data

**Test Checklist**:
- [ ] Catalog page loads products from Adobe Commerce
- [ ] Products are filtered by persona policies (via ACO)
- [ ] Product images display correctly
- [ ] Product detail page loads correct product
- [ ] Configurable products show options
- [ ] 404 handling works for invalid SKUs

**Deliverable**: ✅ Product data fully migrated

---

## Phase 4: Pricing Migration

### Step 4.1: Add Pricing Query to API Mesh Client

**File**: `scripts/api-mesh-client.js` (update)

```javascript
export async function getPersonaPricing(sku, quantity = 1) {
  const query = `
    query GetPersonaPricing($sku: String!) {
      personaPricing(sku: $sku) {
        sku
        basePrice { value currency }
        customerGroupPrice { value currency }
        volumeTiers {
          minQuantity maxQuantity
          unitPrice { value currency }
          discount
        }
        savings { value currency }
        savingsPercent
      }
    }
  `;
  
  const data = await executeQuery(query, { sku });
  
  // Find applicable tier for quantity
  const pricing = data.personaPricing;
  const tier = pricing.volumeTiers
    .reverse()
    .find(t => quantity >= t.minQuantity && (!t.maxQuantity || quantity <= t.maxQuantity));
  
  return {
    ...pricing,
    applicableTier: tier,
    unitPrice: tier ? tier.unitPrice : pricing.customerGroupPrice,
    totalPrice: {
      value: (tier ? tier.unitPrice.value : pricing.customerGroupPrice.value) * quantity,
      currency: pricing.basePrice.currency
    }
  };
}
```

**Deliverable**: ✅ Pricing query added

---

### Step 4.2: Replace Mock Pricing Logic

**File**: `blocks/pricing-display/pricing-display.js`

**BEFORE (Demo Mode)**:
```javascript
import { getPrice } from '../../scripts/data-mock.js';

const pricing = getPrice(product, quantity);
displayPrice(pricing);
```

**AFTER (Production Mode)**:
```javascript
import { getPersonaPricing } from '../../scripts/api-mesh-client.js';

const pricing = await getPersonaPricing(product.sku, quantity);

// Display customer group price
displayCustomerGroupPrice(pricing.customerGroupPrice);

// Display volume tiers
displayVolumeTiers(pricing.volumeTiers);

// Display savings
if (pricing.savings.value > 0) {
  displaySavings(pricing.savings, pricing.savingsPercent);
}
```

**Deliverable**: ✅ Pricing display using live data

---

### Step 4.3: Update Volume Pricing Table

**File**: `pages/product-detail.html` (volume pricing section)

**Update JavaScript**:
```javascript
// Load volume tiers from API Mesh
const pricing = await getPersonaPricing(sku);

const tableBody = document.querySelector('#volume-tiers tbody');
tableBody.innerHTML = '';

pricing.volumeTiers.forEach(tier => {
  const row = `
    <tr>
      <td>${tier.minQuantity}${tier.maxQuantity ? `-${tier.maxQuantity}` : '+'}</td>
      <td>$${tier.unitPrice.value.toFixed(2)}</td>
      <td>${tier.discount.toFixed(1)}%</td>
    </tr>
  `;
  tableBody.insertAdjacentHTML('beforeend', row);
});
```

**Deliverable**: ✅ Volume pricing using live tiers

---

### Step 4.4: Test Pricing

**Test Checklist**:
- [ ] Base price displays correctly
- [ ] Customer group discount shows (persona-specific)
- [ ] Volume tiers display correctly
- [ ] Savings calculation is accurate
- [ ] Price updates when quantity changes
- [ ] Different personas see different prices

**Deliverable**: ✅ Pricing fully migrated

---

## Phase 5: Cart & Checkout Migration

### Step 5.1: Install Cart Dropin

```bash
npm install @dropins/storefront-cart
```

**Deliverable**: ✅ Cart dropin installed

---

### Step 5.2: Replace Mock Cart

**File**: `scripts/cart-manager.js`

**BEFORE (Demo Mode)**:
```javascript
export function addToCart(sku, quantity) {
  const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
  cart.push({ sku, quantity });
  localStorage.setItem('buildright_cart', JSON.stringify(cart));
}
```

**AFTER (Production Mode)**:
```javascript
import { initialize, addProductToCart, getCartData } from '@dropins/storefront-cart';

await initialize({
  endpoint: window.apiMeshConfig.endpoint,
  apiKey: window.apiMeshConfig.apiKey
});

export async function addToCart(sku, quantity) {
  try {
    const result = await addProductToCart({ sku, quantity });
    
    // Dispatch custom event
    window.dispatchEvent(new CustomEvent('cartItemAdded', {
      detail: { sku, quantity, cart: result.cart }
    }));
    
    return { success: true, cart: result.cart };
  } catch (error) {
    console.error('Add to cart error:', error);
    return { success: false, error: error.message };
  }
}

export async function getCart() {
  return await getCartData();
}
```

**Deliverable**: ✅ Cart using dropin

---

### Step 5.3: Update Mini Cart

**File**: `blocks/mini-cart/mini-cart.js`

**BEFORE (Demo Mode)**:
```javascript
const cart = JSON.parse(localStorage.getItem('buildright_cart') || '[]');
renderCartItems(cart);
```

**AFTER (Production Mode)**:
```javascript
import { getCart } from '../../scripts/cart-manager.js';

const cart = await getCart();
renderCartItems(cart.items);

// Update count
document.querySelector('.cart-count').textContent = cart.total_quantity;

// Update total
document.querySelector('.cart-total').textContent = 
  `$${cart.prices.grand_total.value.toFixed(2)}`;
```

**Deliverable**: ✅ Mini cart using live cart

---

### Step 5.4: Update Checkout

**File**: `pages/checkout.html`

**Use Adobe Commerce Checkout Dropin**:
```javascript
import { initialize, render } from '@dropins/storefront-checkout';

await initialize({
  endpoint: window.apiMeshConfig.endpoint,
  apiKey: window.apiMeshConfig.apiKey
});

const checkoutContainer = document.querySelector('#checkout');
await render(checkoutContainer);
```

**Deliverable**: ✅ Checkout using dropin

---

### Step 5.5: Test Cart & Checkout

**Test Checklist**:
- [ ] Can add products to cart
- [ ] Cart persists across sessions
- [ ] Prices in cart are correct (persona-specific)
- [ ] Volume discounts apply in cart
- [ ] Can update quantities in cart
- [ ] Can remove items from cart
- [ ] Checkout process works end-to-end
- [ ] Orders placed successfully

**Deliverable**: ✅ Cart & checkout fully migrated

---

## Phase 6: Persona Features Migration

### Step 6.1: Update Restock Dashboard (Kevin)

**File**: `scripts/dashboards/restock-dashboard.js`

**BEFORE (Demo Mode)**:
```javascript
const inventoryData = await fetch('/data/store-inventory.json').then(r => r.json());
const storeData = inventoryData.stores.find(s => s.location_id === locationId);
renderDashboard(storeData);
```

**AFTER (Production Mode)**:
```javascript
// Option A: Custom inventory API (future)
const inventoryData = await fetch(
  `/api/inventory/store/${locationId}`, 
  { headers: { 'Authorization': `Bearer ${authToken}` } }
).then(r => r.json());

// Option B: Adobe Commerce Order History + Analytics
const orderHistory = await executeQuery(`
  query GetStoreOrderHistory($locationId: String!) {
    customer {
      orders(filter: { shipping_address: { region: { eq: $locationId } } }) {
        items {
          sku quantity order_date
        }
      }
    }
  }
`, { locationId });

// Calculate velocity from order history
const velocityData = calculateVelocityMetrics(orderHistory);

renderDashboard(velocityData);
```

**Note**: Full inventory dashboard requires custom analytics service (Phase 10+)

**Deliverable**: ✅ Dashboard strategy defined

---

### Step 6.2: Update Project Builder (Marcus)

**File**: `scripts/builders/project-wizard.js`

**BEFORE (Demo Mode)**:
```javascript
const products = await fetch('/data/mock-products.json').then(r => r.json());
const filtered = products.filter(p => p.phase === selectedPhase);
```

**AFTER (Production Mode)**:
```javascript
import { getPersonaProducts } from '../api-mesh-client.js';

// Products automatically filtered by persona policies via API Mesh
const result = await getPersonaProducts(selectedPhase, 100, 1);
renderProducts(result.items);
```

**Deliverable**: ✅ Project builder using live data

---

### Step 6.3: Update Template Dashboard (Sarah)

**File**: `scripts/dashboards/template-dashboard.js`

**BEFORE (Demo Mode)**:
```javascript
const templates = await fetch('/data/floor-plan-templates.json').then(r => r.json());
```

**AFTER (Production Mode)**:
```javascript
// Templates stored as custom product type or category in Adobe Commerce
const templates = await executeQuery(`
  query GetTemplates {
    products(filter: { category_id: { eq: "floor-plan-templates" } }) {
      items {
        sku name
        custom_attributes {
          attribute_code value
        }
      }
    }
  }
`);
```

**Deliverable**: ✅ Templates using live data

---

## Phase 7: Testing & Validation

### Step 7.1: End-to-End Testing

**Full User Journey Tests**:

1. **Sarah (Production Builder)**:
   - [ ] Log in → Dashboard loads templates
   - [ ] Select template → Products filtered by template
   - [ ] View pricing → Production Builder tier (15% off)
   - [ ] Add 100 units → Volume tier applies (3% additional)
   - [ ] Checkout → Order placed successfully

2. **Marcus (General Contractor)**:
   - [ ] Log in → Project wizard loads
   - [ ] Select phase → Products filtered by construction phase
   - [ ] Custom BOM → Correct pricing (10% off)
   - [ ] Save project → Project persists

3. **Lisa (Remodeling Contractor)**:
   - [ ] Log in → Package builder loads
   - [ ] Select tier → Products filtered by tier
   - [ ] Customize → Pricing updates correctly
   - [ ] Generate quote → Quote created

4. **David (DIY Homeowner)**:
   - [ ] Log in → Deck wizard loads
   - [ ] Progressive disclosure → Products narrow with each step
   - [ ] Educational content → Displays correctly
   - [ ] Add to cart → Retail pricing (no discount)

5. **Kevin (Store Manager)**:
   - [ ] Log in → Restock dashboard loads
   - [ ] Switch location → Dashboard updates
   - [ ] View recommendations → Velocity-based suggestions
   - [ ] Quick restock → Wholesale pricing (8% off)

**Deliverable**: ✅ All personas tested end-to-end

---

### Step 7.2: Performance Testing

**Metrics**:
- [ ] Page load < 2s
- [ ] API calls < 500ms
- [ ] API Mesh queries batched/optimized
- [ ] Caching working correctly
- [ ] No console errors
- [ ] Lighthouse score > 90

**Deliverable**: ✅ Performance validated

---

### Step 7.3: Data Validation

**Check Data Accuracy**:
- [ ] Product count matches Adobe Commerce
- [ ] Pricing matches price books in ACO
- [ ] Policies filter products correctly
- [ ] Customer groups assigned correctly
- [ ] Volume tiers calculate correctly

**Deliverable**: ✅ Data accuracy confirmed

---

## Phase 8: EDS Deployment

### Step 8.1: Configure EDS Environment

**File**: `.env` (production)

```bash
# API Mesh
API_MESH_ENDPOINT=https://graph.adobe.io/api/buildright-mesh/graphql
API_MESH_API_KEY=your-production-api-key

# Adobe Commerce
COMMERCE_ENDPOINT=https://your-instance.adobe.io

# ACO
ACO_ORG_ID=your-aco-org-id
```

**Deliverable**: ✅ Production config

---

### Step 8.2: Deploy to EDS

```bash
# Push to main branch
git add .
git commit -m "feat: migrate to production APIs"
git push origin main

# EDS auto-deploys
```

**Expected**: Deployment to `https://main--buildright--org.aem.live`

**Deliverable**: ✅ Live production deployment

---

### Step 8.3: Post-Deployment Validation

**Smoke Tests**:
- [ ] Homepage loads
- [ ] Can log in
- [ ] Catalog loads products
- [ ] PDP displays correctly
- [ ] Add to cart works
- [ ] Checkout works
- [ ] All personas functional

**Deliverable**: ✅ Production validated

---

## Migration Checklist Summary

### Pre-Migration
- [ ] Phase 8 (Backend Setup) completed
- [ ] Adobe I/O access confirmed
- [ ] API Mesh entitlement confirmed
- [ ] EDS deployment access confirmed

### Phase 1: API Mesh
- [ ] Adobe I/O CLI installed
- [ ] API Mesh project created
- [ ] Mesh configuration deployed
- [ ] Custom schema defined
- [ ] Resolvers implemented
- [ ] Mesh endpoint tested

### Phase 2: Authentication
- [ ] Auth dropin installed
- [ ] Mock auth replaced
- [ ] API Mesh client created
- [ ] Login page updated
- [ ] Authentication tested

### Phase 3: Products
- [ ] Mock data removed
- [ ] Product queries added
- [ ] Catalog page updated
- [ ] PDP updated
- [ ] Product data tested

### Phase 4: Pricing
- [ ] Pricing query added
- [ ] Pricing display updated
- [ ] Volume tiers updated
- [ ] Pricing tested

### Phase 5: Cart & Checkout
- [ ] Cart dropin installed
- [ ] Mock cart replaced
- [ ] Mini cart updated
- [ ] Checkout updated
- [ ] Cart/checkout tested

### Phase 6: Persona Features
- [ ] Dashboard strategies defined
- [ ] Project builder updated
- [ ] Template dashboard updated
- [ ] All features migrated

### Phase 7: Testing
- [ ] End-to-end tests passed
- [ ] Performance validated
- [ ] Data accuracy confirmed

### Phase 8: Deployment
- [ ] Production config set
- [ ] Deployed to EDS
- [ ] Smoke tests passed
- [ ] Production validated

---

## Rollback Plan

If migration issues occur:

1. **Revert to Demo Mode**:
   ```bash
   git revert HEAD
   git push origin main
   ```

2. **Switch API Mesh to Passthrough**:
   - Update mesh config to bypass custom resolvers
   - Direct queries to Commerce/ACO

3. **Feature Flags**:
   - Use environment variable to toggle demo/production mode
   - Gradual rollout by persona

---

## Support Resources

- **API Mesh Docs**: https://developer.adobe.com/graphql-mesh-gateway/
- **Commerce Dropins**: https://experienceleague.adobe.com/docs/commerce-web-components/
- **EDS Documentation**: https://www.aem.live/developer/
- **Phase 9 Guide**: [PHASE-9-PRODUCTION-DEPLOYMENT.md](./PHASE-9-PRODUCTION-DEPLOYMENT.md)
- **Data Source Matrix**: [DATA-SOURCE-MATRIX.md](./DATA-SOURCE-MATRIX.md)

---

**Last Updated**: November 24, 2025  
**Status**: Reference Guide  
**Next Review**: Before Phase 9 implementation


