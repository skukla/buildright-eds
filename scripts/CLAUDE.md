# BuildRight EDS Scripts - AI Assistant Context

## Directory Structure

```
scripts/
├── scripts.js              # Main EDS loader, decorates blocks
├── critical-init.js        # BASE_PATH, variant detection (runs first)
├── app.js                  # Legacy app loader
├── auth.js                 # Demo mode persona selection
├── site-config.js          # Config loader from /config/env.json
├── persona-config.js       # 5 persona definitions
├── company-config.js       # Company/warehouse config
├── warehouse-config.js     # Multi-location setup
├── initializers/           # Dropin initialization
│   ├── index.js            # Main initialization hub (177 lines)
│   ├── auth.js             # Auth dropin setup
│   ├── cart.js             # Cart dropin setup (stub)
│   └── search.js           # Product Discovery setup
└── services/               # API services
    ├── mesh-client.js      # ACO GraphQL client (460+ lines)
    ├── catalog-service.js  # Product query wrapper (648 lines)
    └── mesh-integration.js # Persona header integration
```

---

## Key Files

### scripts.js (Main Loader)

The EDS standard entry point that:
- Loads CSS
- Decorates blocks
- Handles lazy loading

```javascript
// Standard EDS pattern - usually don't modify
import { loadBlocks, loadCSS } from './lib-franklin.js';

async function loadPage() {
  await loadCSS('/styles/styles.css');
  await loadBlocks(document.querySelector('main'));
}

loadPage();
```

### site-config.js (Configuration)

Loads runtime config from `/config/env.json`:

```javascript
// Usage
import { getConfig } from './site-config.js';

const config = await getConfig();
// {
//   meshEndpoint: "https://edge-sandbox-graph.adobe.io/...",
//   commerceEndpoint: "https://com750.adobedemo.com/graphql",
//   commerceStoreCode: "default",
//   features: {
//     useCommerceDropins: true,
//     useDemoAuth: false
//   }
// }
```

### persona-config.js (Personas)

Defines 5 B2B personas:

```javascript
export const personas = {
  sarah: {
    id: 'sarah',
    name: 'Sarah Martinez',
    email: 'sarah@buildright.demo',
    role: 'Designer/Decorator',
    catalog_view_id: 'view_designer',
    price_book_id: 'book_designer',
    tier: 'pro'
  },
  marcus: { /* ... */ },
  lisa: { /* ... */ },
  david: { /* ... */ },
  kevin: { /* ... */ }
};

export function getPersonaByEmail(email) {
  return Object.values(personas).find(p => p.email === email);
}
```

---

## Initializers

### initializers/index.js (Hub)

Central initialization for all dropins with ACO header configuration:

```javascript
import { initializers } from '@dropins/tools/initializer.js';
import { setEndpoint, setFetchGraphQlHeaders } from '@dropins/tools/fetch-graphql.js';
import { getConfig } from '../site-config.js';
import { getPersonaHeaders, initializePersona } from '../services/mesh-client.js';

export async function initializeDropins() {
  const config = await getConfig();

  // Configure API Mesh endpoint for Auth, Cart, Checkout dropins
  setEndpoint(config.meshEndpoint);

  // CRITICAL: Initialize persona BEFORE setting dropin headers
  // This ensures persona service resolves catalog view UUIDs
  await initializePersona('0'); // '0' = default/guest persona

  // Get persona headers (now contains resolved UUIDs)
  const personaHeaders = getPersonaHeaders();

  // Set ACO headers for pricing (Auth, Cart, Checkout dropins)
  // AC-View-Id MUST be a UUID, not human-readable like "default"
  setFetchGraphQlHeaders({
    'AC-View-Id': personaHeaders['X-Catalog-View-Id'] || config.aco.defaultViewId,
    'AC-Price-Book-Id': personaHeaders['X-Price-Book-Id'] || config.aco.defaultPriceBookId
  });

  // Cart and Search dropins always load
  // Auth dropin loads conditionally based on auth token cookie (performance optimization)
  // See shouldInitializeAuth() - checks for 'auth_dropin_user_token' cookie
}
```

> **CRITICAL:** The above only configures Auth, Cart, Checkout dropins. **Product Discovery dropin has SEPARATE configuration** - see `initializers/search.js` which uses `@dropins/storefront-product-discovery/api.js`.

**Header Architecture:**
- `mesh-client.js` stores persona headers as `X-Catalog-View-Id`, `X-Price-Book-Id` (UUIDs from persona service)
- `initializers/index.js` translates to `AC-View-Id`, `AC-Price-Book-Id` when calling mesh
- **Critical:** `AC-View-Id` must be a UUID, not a human-readable string like "default"
- Mesh reads lowercase versions (`ac-view-id`, `ac-price-book-id`) due to HTTP normalization

### initializers/auth.js

Auth dropin setup with persona bridging:

```javascript
import * as auth from '@dropins/storefront-auth/api.js';
import { initializeMeshForEmail } from '../services/mesh-integration.js';

export function initializeAuth() {
  initializers.register(auth.initialize, {
    // i18n config...
  });

  // Listen for authentication
  auth.events.on('authenticated', async (user) => {
    // Bridge to persona system
    await initializeMeshForEmail(user.email);
  });

  auth.events.on('signedOut', () => {
    // Clear persona context
    clearPersonaContext();
  });
}
```

---

## Services

### services/mesh-client.js (GraphQL Client)

Low-level GraphQL client for API Mesh:

```javascript
const MESH_ENDPOINT = 'https://edge-sandbox-graph.adobe.io/api/.../graphql';

export async function meshQuery(query, variables = {}, headers = {}) {
  const response = await fetch(MESH_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify({ query, variables }),
  });

  const { data, errors } = await response.json();
  if (errors) throw new Error(errors[0].message);
  return data;
}
```

**Category Utilities** (shared across blocks):

```javascript
import { getCategories, getCategoryDisplayName } from './services/mesh-client.js';

// Singleton fetch - prevents duplicate API calls
const { categories } = await getCategories();

// Convert slug to display name using ACO data
const displayName = getCategoryDisplayName('structural-materials', categories);
// Returns: "Structural Materials" (from ACO) or title-cased slug as fallback
```

### services/catalog-service.js (Product Queries)

High-level product query wrapper (648 lines):

```javascript
import { meshQuery } from './mesh-client.js';
import { getPersonaHeaders } from './mesh-integration.js';

export const catalogService = {
  async getProductsByCategory(categoryId, options = {}) {
    const { page = 1, pageSize = 24, filters = {} } = options;
    const headers = getPersonaHeaders();

    const query = `
      query GetProducts($categoryId: String!, $page: Int!, $pageSize: Int!) {
        products(
          filter: { category_id: { eq: $categoryId } }
          pageSize: $pageSize
          currentPage: $page
        ) {
          items {
            sku
            name
            price_range { ... }
            image { url }
          }
          total_count
          page_info { ... }
        }
      }
    `;

    return meshQuery(query, { categoryId, page, pageSize }, headers);
  },

  async getProductBySku(sku) { /* ... */ },
  async searchProducts(searchTerm) { /* ... */ },
  async getFilters(categoryId) { /* ... */ },
};
```

### services/mesh-integration.js (Persona Headers)

Manages persona context for ACO queries:

```javascript
import { getPersonaByEmail } from '../persona-config.js';

let currentPersona = null;

export async function initializeMeshForEmail(email) {
  const persona = getPersonaByEmail(email);
  if (persona) {
    currentPersona = persona;
    // Could also call Persona Service Action here
  }
}

export function getPersonaHeaders() {
  if (!currentPersona) {
    return {}; // Guest/anonymous
  }

  // Note: These are internal keys; initializer/index.js translates to AC-* format
  return {
    'X-Catalog-View-Id': currentPersona.catalog_view_id,
    'X-Price-Book-Id': currentPersona.price_book_id,
  };
}

export function clearPersonaContext() {
  currentPersona = null;
}

export function getCurrentPersona() {
  return currentPersona;
}
```

---

## Event System

### Dropin Events (from @dropins/tools)

```javascript
import { events } from '@dropins/tools/events.js';

// Subscribe to global events
events.on('cart/updated', (cartData) => {
  updateHeaderCartBadge(cartData.totalQuantity);
});

events.on('user/authenticated', (user) => {
  initializeMeshForEmail(user.email);
});

events.on('product/added-to-cart', (product) => {
  showMiniCart();
});

// Emit custom events
events.emit('buildright/persona-changed', { persona: currentPersona });
```

### Custom Events (DOM-based)

```javascript
// Dispatch
document.dispatchEvent(new CustomEvent('dropins:initialized'));
document.dispatchEvent(new CustomEvent('persona:changed', {
  detail: { persona: currentPersona }
}));

// Listen
document.addEventListener('dropins:initialized', () => {
  console.log('Dropins ready');
});
```

---

## Common Patterns

### Waiting for Dropins

```javascript
export function waitForDropins() {
  return new Promise((resolve) => {
    if (window.dropinsReady) {
      resolve();
      return;
    }
    document.addEventListener('dropins:initialized', resolve, { once: true });
  });
}

// Usage in block
export default async function decorate(block) {
  await waitForDropins();
  // Now safe to use dropin APIs
}
```

### Feature Flag Check

```javascript
import { getConfig } from './site-config.js';

export async function isDropinsEnabled() {
  const config = await getConfig();
  return config.features?.useCommerceDropins ?? false;
}

// Usage
if (await isDropinsEnabled()) {
  await initializeDropins();
} else {
  // Use demo mode fallback
  initializeDemoMode();
}
```

### Error Handling

```javascript
export async function safeQuery(queryFn, fallback = null) {
  try {
    return await queryFn();
  } catch (error) {
    console.error('Query failed:', error);
    // Optionally report to analytics
    return fallback;
  }
}

// Usage
const products = await safeQuery(
  () => catalogService.getProductsByCategory('cat1'),
  [] // fallback to empty array
);
```

---

## Configuration Files

### /config/env.json

```json
{
  "meshEndpoint": "https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql",
  "commerceEndpoint": "https://com750.adobedemo.com/graphql",
  "commerceStoreCode": "default",
  "environment": "development",
  "features": {
    "useCommerceDropins": true,
    "useDemoAuth": false
  }
}
```

---

## Import Patterns

### Dropin Imports

```javascript
// From npm packages
import { initializers } from '@dropins/tools/initializer.js';
import { events } from '@dropins/tools/events.js';
import { setEndpoint } from '@dropins/tools/fetch-graphql.js';

import * as auth from '@dropins/storefront-auth/api.js';
import * as cart from '@dropins/storefront-cart/api.js';
import ProductList from '@dropins/storefront-plp/containers/ProductList.js';
```

### Local Service Imports

```javascript
// Relative paths from blocks
import { catalogService } from '../../scripts/services/catalog-service.js';
import { getPersonaHeaders } from '../../scripts/services/mesh-integration.js';
import { getConfig } from '../../scripts/site-config.js';
```

---

## Checklist for Script Changes

- [ ] Use async/await for all API calls
- [ ] Include persona headers for ACO queries
- [ ] Handle errors gracefully with fallbacks
- [ ] Dispatch events for cross-component communication
- [ ] Check feature flags before dropin operations
- [ ] Clear sensitive data on sign-out
- [ ] Test with multiple personas
