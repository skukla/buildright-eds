# ADR-012: Commerce Dropins Direct Connection Pattern

## Status
**ACCEPTED** - December 12, 2025

## Context

BuildRight has a hybrid architecture where:
- **ACO (Adobe Commerce Optimizer)** provides the product catalog with persona-based pricing
- **Adobe Commerce PaaS** provides customer management, cart, checkout, and orders
- **API Mesh** unifies ACO and BuildRight custom queries (persona resolution, BOM generation)

We needed to integrate Commerce Dropins (for cart, checkout, auth) into this architecture.

### Initial Approach (Rejected)

Our first attempt added Commerce as a source to the API Mesh with `Commerce_` prefixing:

```
Frontend (Dropins) → Fetch Adapter → API Mesh (Commerce_ prefixed) → Commerce
```

**Problems:**
- Required custom fetch adapter to transform unprefixed Dropin queries to `Commerce_` prefixed
- Added complexity and maintenance burden
- Not the standard Dropins integration pattern
- Fetch adapter needed to stay in sync with Dropin operations (GET/POST requests, new operations)
- Additional latency from mesh hop

### Research Findings

According to Adobe's API Mesh and GraphQL Mesh documentation:
1. **Explicit filterSchema** is best practice (no wildcards)
2. **Custom fetch functions** are valid for dynamic operations but add complexity
3. **Prefix transforms** are necessary when combining sources with overlapping types

However, **Commerce Dropins are designed to connect directly to Commerce GraphQL endpoints** without prefixing.

## Decision

**Use a dual-endpoint architecture:**

1. **Commerce Dropins → Commerce Direct**
   - Auth, Cart, Checkout, Orders connect directly to `https://com750.adobedemo.com/graphql`
   - No prefixing, no adapter needed
   - Standard Dropins integration pattern

2. **BuildRight Custom Queries → API Mesh**
   - Persona resolution, ACO catalog, BOM generation use the mesh
   - Only ACO operations are prefixed (`ACO_`, `BuildRight_`)
   - No Commerce operations in the mesh

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (EDS)                        │
└────────────┬─────────────────────────────┬──────────────┘
             │                             │
             │ Commerce Dropins            │ BuildRight Custom
             │ (unprefixed)                │ (ACO_, BuildRight_)
             ▼                             ▼
    ┌────────────────┐          ┌──────────────────┐
    │   Commerce     │          │    API Mesh      │
    │   GraphQL      │          │  (ACO + Custom)  │
    └────────────────┘          └──────────┬───────┘
                                           │
                                           ▼
                                    ┌────────────┐
                                    │    ACO     │
                                    └────────────┘
```

## Implementation

### 1. Dropin Initializer (`scripts/initializers/index.js`)

```javascript
// Configure Commerce endpoint directly (no mesh)
const commerceEndpoint = config.commerceEndpoint;
setEndpoint(commerceEndpoint);
console.log('[Dropins] Using Commerce endpoint directly:', commerceEndpoint);

// Set store code header
setFetchGraphQlHeaders({
  'Store': config.commerceStoreCode
});
```

**Removed:**
- Fetch adapter import and initialization
- Global `window.fetch` override
- Query transformation logic

### 2. API Mesh (`buildright-service/mesh/mesh.config.js`)

```javascript
sources: [
  {
    name: 'ACO',
    // ... ACO configuration with ACO_ prefix
  }
  // Commerce source REMOVED
]

transforms: [
  {
    filterSchema: {
      mode: 'bare',
      filters: [
        // Only BuildRight and ACO operations
        'Query.{BuildRight_*, ACO_productSearch}'
      ]
    }
  }
]
```

**Removed:**
- Commerce source configuration
- Commerce operations from filterSchema
- `COMMERCE_GRAPHQL_ENDPOINT` and `COMMERCE_STORE_CODE` from `.env`

### 3. Retained Reference Files

- `scripts/commerce-fetch-adapter.js` - **Retained** as reference implementation for future dropin adapter standardization. Currently unused, but documents the client-side adapter pattern that may be applied when re-auditing dropin implementations to follow a consistent adapter resolver pattern.
- Environment variables for Commerce removed from mesh

## Consequences

### Positive

1. ✅ **Standard Pattern**: Follows Commerce Dropins best practice
2. ✅ **Simpler Architecture**: No fetch adapter to maintain
3. ✅ **Better Performance**: Eliminates unnecessary mesh hop for Commerce operations
4. ✅ **Easier Debugging**: Direct connection means clearer error messages
5. ✅ **Future-Proof**: Dropins updates won't require adapter changes
6. ✅ **Separation of Concerns**: Clear boundary between Commerce (customer/cart) and ACO (catalog/pricing)

### Negative

1. ❌ **Two Endpoints**: Frontend manages two GraphQL endpoints instead of one unified endpoint
2. ❌ **Product Sync Required**: Commerce catalog must be synchronized with ACO products
3. ⚠️ **CORS Considerations**: Both endpoints must allow frontend origin

### Neutral

- API Mesh is now purely for BuildRight custom logic (persona, BOM) + ACO catalog
- Commerce operations go direct to Commerce (standard pattern)

## Product Synchronization Requirement

**Critical:** Commerce cart operations require products to exist in the Commerce catalog.

Since BuildRight's products come from ACO, we need one of:

### Option A: Product Synchronization (Recommended)
- Sync ACO products to Commerce catalog
- Use Commerce `addProductsToCart` mutation with ACO SKUs
- Maintain single source of truth in ACO, replicate to Commerce

### Option B: Virtual Products
- Create placeholder/virtual products in Commerce for all ACO SKUs
- Use simple products with SKU matching
- Price and details come from ACO at display time

### Option C: Hybrid Cart Service
- Build custom cart service that stores ACO SKUs
- Convert to Commerce format only at checkout
- More complex but provides maximum flexibility

**Chosen Approach:** TBD - User implementing product synchronization

## Alternatives Considered

### 1. Keep Fetch Adapter (Rejected)
**Why Rejected:** Adds unnecessary complexity, not standard pattern, maintenance burden

### 2. Remove Mesh Entirely (Rejected)
**Why Rejected:** Mesh is valuable for BuildRight custom operations (persona resolution, BOM generation)

### 3. Add ACO to Commerce via Plugin (Rejected)
**Why Rejected:** Would require Commerce backend development, doesn't leverage API Mesh capabilities

## References

- [Adobe API Mesh filterSchema Documentation](https://developer.adobe.com/graphql-mesh-gateway/mesh/basic/transforms/filter-schema/)
- [Commerce Dropins Documentation](https://experienceleague.adobe.com/developer/commerce/storefront/)
- Web Research: GraphQL Mesh custom fetch patterns
- `COMMERCE-MESH-INTEGRATION.md` (previous approach documentation)

## Notes

This decision simplifies our architecture by following the principle: **Use the right tool for the job.**

- Commerce Dropins → Commerce (customer management, cart, orders)
- API Mesh → ACO + Custom (catalog, persona, BOM)

This clear separation makes the system easier to understand, debug, and maintain.

## Migration

1. ✅ Updated `scripts/initializers/index.js` to use `commerceEndpoint`
2. ✅ Removed Commerce source from `mesh/mesh.config.js`
3. ✅ Removed Commerce operations from filterSchema
4. ✅ Retained `scripts/commerce-fetch-adapter.js` as reference (see "Retained Reference Files" above)
5. ✅ Removed `COMMERCE_GRAPHQL_ENDPOINT` and `COMMERCE_STORE_CODE` from mesh `.env`
6. ✅ Deployed updated mesh
7. 🔄 **Next:** Product synchronization from ACO to Commerce
8. 🔄 **Future:** Re-audit dropin implementations for adapter pattern consistency



