# PLP Dropin Mesh Investigation
**Date**: December 20, 2025  
**Status**: Mesh deployed successfully, runtime 500 errors persist

## Problem Summary

The Product Discovery dropin for the BuildRight PLP is showing "Loading catalog..." indefinitely with 500 errors from the mesh endpoint, despite successful deployment.

## Investigation Steps

### 1. Mesh Schema Configuration ✅

**Goal**: Expose ACO's `productSearch` query without the `ACO_` prefix so the Product Discovery dropin can query it directly.

**Solution Implemented**:
- Used the `rename` transform to map `ACO_productSearch` → `productSearch`
- Successfully deployed to BuildRight mesh (`2463edc1-5cf7-4393-af04-95a3d1b6973c`)
- Verified mesh config shows correct renames

```javascript
{
  rename: {
    mode: 'bare',
    renames: [
      { from: { type: 'Query', field: 'ACO_productSearch' }, to: { type: 'Query', field: 'productSearch' } },
      { from: { type: 'Query', field: 'ACO_attributeMetadata' }, to: { type: 'Query', field: 'attributeMetadata' } },
      { from: { type: 'Query', field: 'ACO_products' }, to: { type: 'Query', field: 'products' } },
      { from: { type: 'Query', field: 'ACO_refineProduct' }, to: { type: 'Query', field: 'refineProduct' } }
    ]
  }
}
```

### 2. Frontend Configuration ✅

**Goal**: Configure the Product Discovery dropin to use the mesh endpoint.

**Solution Implemented**:
- `scripts/initializers/index.js` correctly sets the Search dropin endpoint to `config.meshEndpoint`
- Import map in `catalog.html` includes `@dropins/storefront-product-discovery/`
- `search.js` initializer registers the Product Discovery dropin

### 3. Current Error Analysis

**Error in Console**:
```
Error: Type Query must define one or more fields.
[MeshClient] Request failed: Error: Mesh request failed: 500
```

**Possible Root Causes**:

1. **ACO Has No Product Data**  
   - The user stated: "My ACO and Commerce instance have no data"
   - Without products in ACO, queries might return unexpected responses
   - **Recommendation**: Ingest product data into ACO using the `buildright-data` and `commerce-demo-generator`

2. **Mesh Runtime Error**  
   - The mesh deploys successfully but fails at query execution time
   - **Recommendation**: Check Adobe I/O Runtime logs for the mesh:
     ```bash
     aio api-mesh:status
     aio runtime log
     ```

3. **Missing GraphQL Fields in ACO Schema**  
   - The Product Discovery dropin might be querying fields that ACO's Catalog Service doesn't support
   - **Recommendation**: Introspect ACO's schema to verify all required fields exist:
     ```graphql
     query {
       __type(name: "ProductSearchQuery") {
         fields {
           name
         }
       }
     }
     ```

4. **Header Forwarding Issues**  
   - ACO requires `AC-Environment-Id`, `AC-View-Id`, `AC-Price-Book-Id` headers
   - **Recommendation**: Verify the frontend is sending these headers (should be set by `initializeBuildRightPersonaContext`)

## What's Working

1. ✅ Mesh deployment successful
2. ✅ `productSearch` query exposed without prefix
3. ✅ Product Discovery dropin initializes and renders containers
4. ✅ Facets, SortBy, SearchResults, Pagination containers all loaded

## What's Not Working

1. ❌ Product Discovery dropin query execution (500 error)
2. ❌ Persona initialization (also 500 error, likely same root cause)
3. ❌ No products displayed on PLP

## Next Steps

### Immediate Actions

1. **Check if ACO has product data**:
   ```bash
   cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-aco
   # Check if products were ingested
   ```

2. **Test the mesh endpoint directly** using curl or Postman:
   ```bash
   curl -X POST https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql \
     -H "Content-Type: application/json" \
     -H "x-catalog-view-id: 6792f1d5-9e79-4813-8d8e-df5ed76e5692" \
     -H "x-price-book-id: Retail-Registered" \
     -d '{"query": "{ productSearch(phrase: \"\") { total_count } }"}'
   ```

3. **Check mesh logs**:
   ```bash
   cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-service
   aio api-mesh:status
   ```

### If ACO has no data:

1. **Regenerate and ingest BuildRight data**:
   ```bash
   cd /Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/commerce-demo-generator
   npm run generate -- buildright
   # Then ingest to ACO
   ```

2. **Verify ingestion** by querying ACO directly through the mesh

### If ACO has data but queries still fail:

1. **Check what fields the Product Discovery dropin is requesting**
   - Inspect network tab in browser DevTools
   - Compare with ACO's schema

2. **Verify schema compatibility**
   - Confirm ACO is exposing Catalog Service schema (not Commerce schema)
   - Ensure `productSearch` returns `ProductSearchResult` type

3. **Debug mesh transforms**
   - The rename transform might be interfering with type renames
   - May need to also rename types, not just query fields

## Technical Details

### Mesh Configuration File
`/Users/kukla/Documents/Repositories/app-builder/adobe-demo-system/buildright-service/mesh/mesh.config.js`

### Mesh ID
`2463edc1-5cf7-4393-af04-95a3d1b6973c`

### ACO Endpoint
`https://na1-sandbox.api.commerce.adobe.com/X2duJmy3FaTKf1Mmr4GiQY/graphql`

### Frontend Endpoint
`https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql`

## Related Files

- `buildright-eds/scripts/initializers/search.js` - Search dropin initializer
- `buildright-eds/scripts/initializers/index.js` - Endpoint configuration
- `buildright-eds/blocks/product-list-dropin/product-list-dropin.js` - PLP block with dropin containers
- `buildright-eds/pages/catalog.html` - PLP HTML with dropin containers
- `buildright-service/mesh/mesh.config.js` - Mesh configuration

## Conclusion

The mesh configuration is correct and deployed successfully. The 500 errors are likely caused by either:

1. **No product data in ACO** (most likely, given user's statement)
2. **Schema mismatch** between what the dropin expects and what ACO provides
3. **Missing required headers** in the dropin's queries

**Recommended immediate action**: Ingest product data into ACO and test again.

