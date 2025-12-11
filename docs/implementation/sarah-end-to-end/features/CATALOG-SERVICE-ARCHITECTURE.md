# Catalog Service Architecture

**Status**: ✅ Implemented  
**Created**: December 8, 2025  
**Related**: [Phase 6A Integration Plan](./PHASE-6A-INTEGRATION-PLAN.md) | [Backend Service Reference](../../BACKEND-SERVICE-REFERENCE.md)

---

## Overview

The Catalog Service provides a unified interface for fetching product data from Adobe Commerce Optimizer (ACO) via API Mesh. It implements a **strategy pattern** that enables seamless switching between real ACO data and mock data for offline development.

**Key Principle**: All product data flows through a single service layer. The consuming code doesn't know (or care) whether data comes from the mesh or local files.

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                    buildright-eds Frontend                          │
│                                                                     │
│   product-grid.js ──┐                                               │
│   featured-products.js ──► catalogService ──► MeshStrategy ──┐      │
│   bom-review.js ────┘           │                            │      │
│                                 ▼                            │      │
│                           MockStrategy                       │      │
│                        (fallback/offline)                    │      │
└──────────────────────────────────────────────────────────────│──────┘
                                                               │
                                                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         API Mesh                                    │
│     https://edge-sandbox-graph.adobe.io/api/.../graphql            │
├─────────────────────────────────────────────────────────────────────┤
│  BuildRight_personaForCustomer(customerGroupId)                     │
│  BuildRight_searchProducts(phrase, pageSize, currentPage)           │
│  BuildRight_getProductBySKU(sku)                                    │
│  BuildRight_generateBOMFromTemplate(...)                            │
└─────────────────────────────────────────────────────────────────────┘
                    │                         │
                    ▼                         ▼
            ┌───────────────┐        ┌───────────────┐
            │      ACO      │        │   Commerce    │
            │   (Catalog)   │        │   (Future)    │
            └───────────────┘        └───────────────┘
```

---

## File Structure

```
scripts/services/
├── catalog-service.js    ← Strategy pattern + unified interface
├── mesh-client.js        ← GraphQL client for API Mesh
└── mesh-integration.js   ← Auth/persona integration layer
```

### catalog-service.js

**Purpose**: Provides the unified interface and strategy selection.

```javascript
import { catalogService } from './services/catalog-service.js';

// Initialize for persona (demo mode)
await catalogService.initialize('sarah');

// Initialize for customer group (production mode)
await catalogService.initialize(user.group_id, { isProductionMode: true });

// Use the same API regardless of strategy
const products = await catalogService.searchProducts('lumber', { pageSize: 20 });
const product = await catalogService.getProduct('SKU-001');
const bom = await catalogService.generateBOM(config);
```

### mesh-client.js

**Purpose**: Low-level GraphQL client for the API Mesh.

```javascript
import { meshQuery, initializePersona } from './services/mesh-client.js';

// Initialize persona (sets headers for subsequent requests)
const persona = await initializePersona('1'); // Customer group ID

// Execute arbitrary GraphQL query
const data = await meshQuery(QUERY_SEARCH_PRODUCTS, { phrase: 'lumber' });
```

### mesh-integration.js

**Purpose**: Thin integration layer connecting auth with catalog service.

```javascript
import { initializeMeshForPersona } from './services/mesh-integration.js';

// Called by auth.js on login/restore
const personaData = await initializeMeshForPersona('sarah');
// Returns combined local persona + mesh data
```

---

## Strategy Pattern

The catalog service uses two strategies:

| Strategy | Data Source | Use Case |
|----------|-------------|----------|
| **MeshStrategy** | API Mesh → ACO | Production, demos with real data |
| **MockStrategy** | `/data/*.json` files | Offline development, testing |

### Strategy Selection

```javascript
// Automatic: tries mesh first, falls back to mock
await catalogService.initialize('sarah');

// Force mock (for offline development)
await catalogService.initialize('sarah', { forceStrategy: 'mock' });
```

### Adding a New Strategy

To add a new data source (e.g., a different Commerce backend):

```javascript
const NewStrategy = {
  name: 'newbackend',
  
  async initialize(identifier, options = {}) {
    // Setup code
  },
  
  async searchProducts(phrase, options = {}) {
    // Implementation
  },
  
  async getProduct(sku) {
    // Implementation
  },
  
  async generateBOM(config) {
    // Implementation
  }
};
```

---

## Persona & Header Management

### The Problem

ACO requires specific headers to determine:
- **Catalog View**: Which products the user can see (CCDM filtering)
- **Price Book**: Which pricing tier applies

### The Solution

1. **Frontend** calls mesh with `customerGroupId` (e.g., "1")
2. **Mesh** returns `catalogViewId` and `priceBookId` from `persona-mappings.js`
3. **Frontend** stores these as headers in `sessionStorage`
4. **All subsequent product queries** include these headers

```javascript
// Headers sent with every product request
{
  'X-Catalog-View-Id': '22c02790-7c5e-474d-a3b6-c72b22203be5',
  'X-Price-Book-Id': 'Production-Builder'
}
```

### Where Persona Mappings Live

**Source of Truth**: `buildright-service/mesh/resolvers-src/utils/persona-mappings.js`

The frontend does **not** hardcode catalog views or price books. All that data comes from the mesh via the `BuildRight_personaForCustomer` query.

### Customer Group Mapping (Demo Mode Only)

The frontend maps demo persona IDs to Commerce customer group IDs:

```javascript
// scripts/services/catalog-service.js
const DEMO_PERSONA_MAPPING = {
  'sarah': '1',      // Production Builder
  'marcus': '2',     // General Contractor
  'lisa': '3',       // Remodeling Contractor
  'david': '4',      // DIY Homeowner
  'kevin': '5'       // Store Manager
};
```

In production mode, the customer group ID comes directly from Commerce Auth.

---

## Integration Points

### auth.js

Auth initializes the catalog service on login/restore:

```javascript
// scripts/auth.js
import { initializeMeshForPersona } from './services/mesh-integration.js';

async _initializeDemoMode() {
  // ...
  meshData = await initializeMeshForPersona(persona.id);
  // ...
}
```

### product-grid.js

Product grid uses catalog service for all product queries:

```javascript
// blocks/product-grid/product-grid.js
import { catalogService } from '../../scripts/services/catalog-service.js';

const result = await catalogService.searchProducts(searchPhrase, {
  pageSize: 100,
  currentPage: 1
});
```

### bom-review.js

BOM review uses catalog service for BOM generation:

```javascript
// scripts/bom-review.js
import { catalogService } from './services/catalog-service.js';

if (catalogService.isUsingRealData()) {
  const meshBom = await catalogService.generateBOM({
    templateId: this.bomData.templateId,
    packageId: this.bomData.selectedPackage,
    selectedPhases: this.bomData.selectedPhases
  });
}
```

---

## API Reference

### catalogService.initialize(identifier, options)

Initialize the catalog service with a persona or customer group.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `identifier` | string | Persona ID (demo) or customer group ID (production) |
| `options.isProductionMode` | boolean | If true, identifier is a customer group ID |
| `options.forceStrategy` | string | Force 'mesh' or 'mock' strategy |

**Example**:
```javascript
// Demo mode
await catalogService.initialize('sarah');

// Production mode
await catalogService.initialize(user.group_id, { isProductionMode: true });

// Force mock for offline development
await catalogService.initialize('sarah', { forceStrategy: 'mock' });
```

### catalogService.searchProducts(phrase, options)

Search products in the catalog.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `phrase` | string | Search phrase (use ' ' for all products) |
| `options.pageSize` | number | Products per page (default: 20) |
| `options.currentPage` | number | Page number (default: 1) |

**Returns**: `Promise<SearchResult>`
```javascript
{
  totalCount: 100,
  items: [
    {
      sku: 'LBR-001',
      name: '2x4 Stud - 8ft Premium Pine',
      price: { value: 4.99, currency: 'USD' },
      inStock: true,
      category: 'Framing Lumber',
      imageUrl: '/images/products/LBR-001.png',
      attributes: [{ name: 'grade', value: 'premium' }]
    }
  ],
  pageInfo: { currentPage: 1, pageSize: 20, totalPages: 5 }
}
```

### catalogService.getProduct(sku)

Get a single product by SKU.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `sku` | string | Product SKU |

**Returns**: `Promise<Product|null>`

### catalogService.generateBOM(config)

Generate a Bill of Materials from a template.

**Parameters**:
| Name | Type | Description |
|------|------|-------------|
| `config.templateId` | string | Template ID (e.g., 'sedona') |
| `config.variantId` | string | Optional variant ID |
| `config.packageId` | string | Package ID (e.g., 'premium-select') |
| `config.selectedPhases` | string[] | Array of phase IDs |

**Returns**: `Promise<BOMResult>`

### catalogService.getActiveStrategy()

Get the name of the active strategy.

**Returns**: `'mesh' | 'mock' | 'none'`

### catalogService.isUsingRealData()

Check if using real data (mesh strategy).

**Returns**: `boolean`

---

## Debugging

### Console Logs

The service provides detailed console logging:

```
[MeshClient] Initializing persona for customer group: 1
[MeshClient] Executing query: {endpoint, headers, variables}
[MeshClient] Persona headers set: {X-Catalog-View-Id, X-Price-Book-Id}
[CatalogService] Initialized with MeshStrategy
[Product Grid] Loaded 100 products via mesh
```

### Browser DevTools

Check Network tab for GraphQL requests to:
```
https://edge-sandbox-graph.adobe.io/api/f625cd2c-a812-459b-bdb9-dd7f9deeeb2e/graphql
```

Verify headers include:
- `X-Catalog-View-Id`
- `X-Price-Book-Id`

### Testing Mesh Connectivity

```javascript
// In browser console
import { catalogService } from '/scripts/services/catalog-service.js';

await catalogService.initialize('sarah');
console.log('Strategy:', catalogService.getActiveStrategy());
console.log('Using real data:', catalogService.isUsingRealData());

const products = await catalogService.searchProducts('lumber');
console.log('Products:', products.items.length);
```

---

## Common Issues

### "Persona headers not set"

**Cause**: Attempted to make product queries before initializing the service.

**Fix**: Ensure `catalogService.initialize()` is called before any queries. This is typically handled by `auth.js` on login/restore.

### Products not loading

**Possible causes**:
1. **Mesh unavailable** - Service will fall back to MockStrategy
2. **Invalid headers** - Check that persona headers are set correctly
3. **CORS issues** - Mesh endpoint must allow origin

**Debugging**:
```javascript
console.log('Strategy:', catalogService.getActiveStrategy());
// If 'mock', mesh connection failed
```

### Wrong pricing displayed

**Cause**: Using wrong price book for persona.

**Fix**: Verify the customer group mapping is correct and the mesh is returning the expected `priceBookId`.

---

## Future Considerations

### Commerce Auth Integration

When Adobe Commerce Auth Dropin is integrated:

```javascript
// auth.js - production mode
async _initializeProductionMode() {
  const user = await commerceAuth.getUser();
  
  // Customer group comes from Commerce, not demo mapping
  await catalogService.initialize(user.group_id, { isProductionMode: true });
}
```

### Commerce Cart Integration

Cart and checkout will be added to the mesh as additional queries:
- `BuildRight_addToCart`
- `BuildRight_getCart`
- `BuildRight_checkout`

The same `catalogService` pattern can be extended or a parallel `cartService` can be created.

### Additional Strategies

If needed, additional strategies can be added:
- **CachedMeshStrategy**: Mesh with local caching
- **OfflineSyncStrategy**: Sync data when online
- **CommerceDirectStrategy**: Direct Commerce API calls

---

## Related Documentation

- [Backend Service Reference](../../BACKEND-SERVICE-REFERENCE.md) - BuildRight Service overview
- [ADR-003: Mock ACO Service](../../adr/ADR-003-mock-aco-service.md) - Why we have mock data
- [Phase 6A Integration Plan](./PHASE-6A-INTEGRATION-PLAN.md) - Integration roadmap
- [Frontend Integration Guide](../../../../buildright-service/docs/frontend/FRONTEND-INTEGRATION-GUIDE.md) - Mesh API documentation

---

**Last Updated**: December 8, 2025  
**Status**: ✅ Implemented and tested

