# Commerce Mesh Integration

## Overview

The BuildRight API Mesh now integrates both ACO (product catalog) and Adobe Commerce PaaS (customer, cart, checkout, orders) into a unified GraphQL endpoint. This enables Commerce Dropins to operate through the mesh while maintaining persona-based catalog and pricing from ACO.

## Architecture

```
┌─────────────────────┐
│  BuildRight EDS     │
│   (Frontend)        │
└──────────┬──────────┘
           │
           │ Commerce Dropins + Fetch Adapter
           ▼
┌─────────────────────┐
│   API Mesh          │
│  (Unified Gateway)  │
├─────────────────────┤
│  Commerce_* queries │
│  BuildRight_* custom│
│  ACO_* product data │
└─────┬───────┬───────┘
      │       │
      │       └──────────┐
      │                  │
      ▼                  ▼
┌─────────────┐   ┌─────────────┐
│  Commerce   │   │     ACO     │
│    PaaS     │   │   Catalog   │
└─────────────┘   └─────────────┘
```

## Configuration

### 1. Mesh Configuration (`buildright-service/mesh/mesh.config.js`)

Added Commerce as a second source alongside ACO:

```javascript
sources: [
  {
    name: 'Commerce',
    handler: {
      graphql: {
        endpoint: '{env.COMMERCE_GRAPHQL_ENDPOINT}',
        operationHeaders: {
          'Content-Type': 'application/json',
          'Store': '{env.COMMERCE_STORE_CODE}',
          'Authorization': '{context.headers["authorization"]}'
        }
      }
    },
    transforms: [
      {
        prefix: {
          value: 'Commerce_',
          includeRootOperations: true
        }
      }
    ]
  },
  {
    name: 'ACO',
    // ... existing ACO configuration
  }
]
```

**Key Points:**
- Commerce operations are prefixed with `Commerce_` to avoid schema conflicts with ACO
- Authorization header is forwarded for customer-specific operations
- Store code is set via header

### 2. Schema Filtering

The mesh exposes only the operations we need:

```javascript
transforms: [
  {
    filterSchema: {
      mode: 'bare',
      filters: [
        'Query.{BuildRight_personaForCustomer, BuildRight_personaById, BuildRight_personaByEmail, BuildRight_personas, BuildRight_searchProducts, BuildRight_getProductBySKU, BuildRight_generateBOMFromTemplate, BuildRight_productSearchFilter, BuildRight_searchSuggestions, ACO_productSearch, Commerce_cart, Commerce_customer, Commerce_customerCart, Commerce_customerOrders, Commerce_availableStores, Commerce_storeConfig, Commerce_countries, Commerce_country}',
        'Mutation.{Commerce_generateCustomerToken, Commerce_revokeCustomerToken, Commerce_createEmptyCart, Commerce_addProductsToCart, Commerce_addSimpleProductsToCart, Commerce_updateCartItems, Commerce_removeItemFromCart, Commerce_applyCouponToCart, Commerce_removeCouponFromCart, Commerce_setShippingAddressesOnCart, Commerce_setBillingAddressOnCart, Commerce_setShippingMethodsOnCart, Commerce_setPaymentMethodOnCart, Commerce_setGuestEmailOnCart, Commerce_placeOrder, Commerce_mergeCarts}'
      ],
    },
  },
],
```

**Important:** Wildcard patterns (`Commerce_*`) don't work in filterSchema. Each operation must be explicitly listed.

### 3. Environment Variables

Added to `buildright-service/.env`:

```bash
COMMERCE_GRAPHQL_ENDPOINT=https://com750.adobedemo.com/graphql
COMMERCE_STORE_CODE=default
```

### 4. Frontend Adapter (`buildright-eds/scripts/commerce-fetch-adapter.js`)

**Problem:** Commerce Dropins send unprefixed GraphQL queries (e.g., `cart`, `generateCustomerToken`), but our mesh expects `Commerce_cart`, `Commerce_generateCustomerToken`.

**Solution:** A fetch adapter that intercepts Dropin requests and transforms query names by adding the `Commerce_` prefix.

```javascript
// Example transformation
// Before: mutation { generateCustomerToken(email: "...") }
// After:  mutation { Commerce_generateCustomerToken(email: "...") }
```

The adapter is installed globally in `scripts/initializers/index.js` and only affects requests to the mesh endpoint.

## Deployment

1. **Build the mesh:**
   ```bash
   cd buildright-service
   npm run build:mesh
   ```

2. **Deploy to Adobe I/O:**
   ```bash
   npm run deploy:mesh
   ```

3. **Verify deployment:**
   ```bash
   aio api-mesh:describe
   ```

## Testing

### Test BuildRight Custom Queries

```bash
curl -X POST https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql \
  -H "Content-Type: application/json" \
  --data '{"query":"{ BuildRight_personas { id name } }"}'
```

### Test Commerce Operations

```bash
# Create empty cart
curl -X POST https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql \
  -H "Content-Type: application/json" \
  -H "Store: default" \
  --data '{"query":"mutation { Commerce_createEmptyCart }"}'

# Get cart
curl -X POST https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql \
  -H "Content-Type: application/json" \
  -H "Store: default" \
  --data '{"query":"{ Commerce_cart(cart_id: \"CART_ID\") { id items { product { name sku } quantity } } }"}'
```

## Troubleshooting

### "Type Query must define one or more fields"

**Cause:** The `filterSchema` is too restrictive and filtering out all queries.

**Solution:**
1. Temporarily disable the filter by setting `transforms: []`
2. Deploy and verify the mesh works
3. Re-enable the filter with explicit operation names (no wildcards)

### "Maximum call stack size exceeded"

**Cause:** The fetch adapter is creating an infinite loop by not preserving the original `window.fetch`.

**Solution:** Ensure the adapter receives and uses the original fetch function:

```javascript
const originalFetch = window.fetch.bind(window);
const commerceFetch = createCommerceFetchAdapter(meshEndpoint, originalFetch);
```

### Commerce operations failing

**Causes:**
1. Missing `COMMERCE_GRAPHQL_ENDPOINT` or `COMMERCE_STORE_CODE` in `.env`
2. Commerce endpoint not reachable
3. Authorization header not being forwarded
4. Operation not included in `filterSchema`

**Solutions:**
1. Verify environment variables are set
2. Test endpoint directly with curl
3. Check mesh configuration for authorization header forwarding
4. Add missing operations to the filter list

## Key Learnings

1. **Schema Prefixing is Required:** When combining multiple GraphQL sources with overlapping types (both ACO and Commerce have `Query`, `Mutation`, `Product`, etc.), prefixing prevents conflicts.

2. **Wildcard Filters Don't Work:** The `filterSchema` transform with `mode: 'bare'` requires explicit operation names. Wildcards like `Commerce_*` don't work.

3. **Fetch Adapter Pattern:** When Dropins can't be configured to use prefixed queries, a fetch adapter that transforms queries at runtime is an effective solution.

4. **Avoid Infinite Loops:** When overriding `window.fetch`, always preserve and use the original function to avoid recursion.

5. **Mesh Deployment Takes Time:** Allow 1-2 minutes for mesh provisioning after deployment.

## Next Steps

1. ✅ **Mesh Configured:** Commerce source added with proper prefixing
2. ✅ **Fetch Adapter Implemented:** Dropins can now use the mesh
3. ✅ **Testing:** Basic operations verified
4. 🔄 **Full Integration:** Test end-to-end cart, checkout, and order flows
5. 📝 **Documentation:** Update phase documentation and ADRs

## Related Files

- `buildright-service/mesh/mesh.config.js` - Mesh configuration
- `buildright-service/.env` - Environment variables
- `buildright-eds/scripts/commerce-fetch-adapter.js` - Query transformer
- `buildright-eds/scripts/initializers/index.js` - Dropin initialization
- `buildright-eds/config/env.json` - Frontend configuration

