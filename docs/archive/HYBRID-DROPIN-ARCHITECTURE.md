# Hybrid Dropin Architecture - Implementation Summary

**Date**: December 20, 2025  
**Status**: ✅ Complete - Ready for Testing

## Overview

Implemented a **hybrid architecture** that combines the benefits of Adobe Commerce Product Discovery dropins with BuildRight's custom design requirements:

```
Frontend (product-grid.js)
  ↓ Simple filter objects
  ↓ { price: ['0-100'], product_category: ['Lumber'] }
  ↓
Mesh Resolver (product-discovery.js)
  ↓ Transforms filters → dropin format
  ↓ [{ attribute: 'price', range: { from: 0, to: 100 } }]
  ↓
Product Discovery Dropin
  ↓ Adobe-maintained search logic
  ↓ ACO queries with persona headers
  ↓
Mesh Resolver
  ↓ Transforms response → BuildRight format
  ↓ Clean products with imageUrl, price.value, etc.
  ↓
Frontend
  ✅ Clean data, just render!
```

## What Changed

### 1. Mesh Resolver (`buildright-service/mesh/resolvers-src/product-discovery.js`)

**Created new hybrid resolver:**
- Wraps Product Discovery dropin internally
- Exposes clean BuildRight GraphQL API
- Handles all data transformations server-side

**Key Functions:**
- `transformFiltersToDropin()` - BuildRight format → dropin format
- `transformProduct()` - Dropin response → BuildRight product
- `transformFacet()` - Dropin facets → BuildRight facets
- `BuildRight_productSearchWithDropin` - Main resolver query

**Benefits:**
- Adobe maintains search logic (via dropin)
- BuildRight controls data format
- Transformations in ONE place (mesh)
- Frontend stays simple

### 2. Frontend (`buildright-eds/blocks/product-grid/product-grid.js`)

**Removed ~150 lines of transformation code:**
- ❌ No more dropin import
- ❌ No more filter array building (`attribute`, `in`, `range`)
- ❌ No more product transformation (image fallback, price extraction)
- ❌ No more facet transformation (RangeBucket, ScalarBucket)

**Simplified to:**
- ✅ Build simple filter object: `{ price: ['0-100'], br_product_category: ['Lumber'] }`
- ✅ Call mesh: `productSearchWithDropin({ phrase, filter, sort })`
- ✅ Render clean data: `product.imageUrl`, `product.price.value`

**Lines of code:**
- Before: ~880 lines (with transformations)
- After: ~790 lines (clean rendering only)
- **Removed: ~90 lines of complex transformation logic**

### 3. Mesh Client (`buildright-eds/scripts/services/mesh-client.js`)

**Added new function:**
```javascript
export async function productSearchWithDropin(options) {
  const { phrase, filter, sort, limit = 48, page = 1 } = options;
  
  const data = await meshQuery(queries.PRODUCT_SEARCH_WITH_DROPIN, {
    phrase, filter, sort, limit, page
  });
  
  return data.BuildRight_productSearchWithDropin;
}
```

### 4. GraphQL Query (`buildright-eds/scripts/services/queries.js`)

**Added new query:**
```graphql
query ProductSearchWithDropin(
  $phrase: String
  $filter: BuildRight_ProductFilter
  $sort: BuildRight_SortInput
  $limit: Int = 48
  $page: Int = 1
) {
  BuildRight_productSearchWithDropin(...) {
    products { items { sku name imageUrl price { value } } }
    facets { facets { key title options { id name count min max } } }
    totalCount
  }
}
```

### 5. Mesh Configuration (`buildright-service/mesh/mesh.config.js`)

**Added resolver to config:**
```javascript
additionalResolvers: [
  './build/resolvers/product-discovery.js'
]
```

## Architecture Benefits

### ✅ Clean Separation of Concerns
- **Mesh**: Data transformations, business logic
- **Frontend**: Rendering, user interaction
- **Dropin**: Search logic (Adobe-maintained)

### ✅ Reduced Frontend Complexity
- No more filter format gymnastics
- No more API response transformations
- Simple filter objects: `{ attribute: [values] }`

### ✅ Server-Side Transformations
- Image fallback logic (ACO → `/images/products/{SKU}.jpg`)
- Price extraction from nested structures
- Facet format conversion (RangeBucket → clean options)

### ✅ Adobe-Maintained Search
- Product Discovery dropin handles search/filter logic
- Updates automatically as Adobe improves the dropin
- Proven search algorithms

### ✅ Testable & Reusable
- Mesh resolver can be tested independently
- Transformations in one place (not scattered)
- Reusable by mobile app, other clients

## Filter Flow Example

**Frontend sends:**
```javascript
{
  price: ['0-100'],
  br_product_category: ['Lumber']
}
```

**Mesh transforms to:**
```javascript
[
  { attribute: 'price', range: { from: 0, to: 100 } },
  { attribute: 'br_product_category', in: ['Lumber'] }
]
```

**Dropin queries ACO:**
```graphql
productSearch(
  filter: [
    { attribute: "price", range: { from: 0, to: 100 } }
    { attribute: "br_product_category", in: ["Lumber"] }
  ]
) { ... }
```

**Dropin returns complex structure:**
```javascript
{
  items: [{
    productView: {
      sku: "LBR-123",
      images: [{ url: "https://aco.../image.jpg" }],
      price: { final: { amount: { value: 45.99, currency: "USD" } } }
    }
  }]
}
```

**Mesh transforms to clean format:**
```javascript
{
  products: {
    items: [{
      sku: "LBR-123",
      imageUrl: "https://aco.../image.jpg", // or /images/products/LBR-123.jpg
      price: { value: 45.99, currency: "USD" }
    }]
  }
}
```

**Frontend renders:**
```html
<img src="{product.imageUrl}" />
<span>${product.price.value}</span>
```

## Comparison to Previous Approach

### Before (Level 3 Direct Dropin)
```
Frontend:
1. Import dropin: import { search } from '@dropins/...'
2. Build filter array: [{ attribute, in: [...] }]
3. Call dropin: dropinSearch({ filter })
4. Transform products: map(item => ({ sku, name, image: fallback(), ... }))
5. Transform facets: map(facet => ({ options: buckets.map(...) }))
6. Render

Lines: ~150 transformation code
Complexity: HIGH (filter formats, API structures, fallback logic)
Reusability: LOW (logic trapped in frontend)
```

### After (Hybrid Mesh Resolver)
```
Frontend:
1. Build simple filter: { price: ['0-100'] }
2. Call mesh: productSearchWithDropin({ filter })
3. Render clean data

Mesh:
1. Transform filter format
2. Call dropin
3. Transform response
4. Return clean data

Lines: ~90 fewer lines in frontend
Complexity: LOW (simple objects in/out)
Reusability: HIGH (mesh resolver used by all clients)
```

## Testing Checklist

### Mesh Deployment
- [ ] Build mesh: `node mesh/scripts/build-mesh.js --force`
- [ ] Deploy mesh: `aio app deploy`
- [ ] Verify endpoint: `https://edge-sandbox-graph.adobe.io/api/...`

### Frontend Testing
- [ ] Load catalog page: `http://localhost:8000/catalog`
- [ ] Verify products render with images
- [ ] Test facets (Product Category, Price Range)
- [ ] Test search functionality
- [ ] Test sorting (price, name)
- [ ] Test infinite scroll
- [ ] Verify persona pricing (login as different users)

### Validation
- [ ] Check browser console for errors
- [ ] Verify network tab shows mesh GraphQL call
- [ ] Confirm no direct dropin API calls
- [ ] Test filter combinations
- [ ] Verify images load correctly
- [ ] Check mobile responsiveness

## Deployment Commands

```bash
# 1. Build mesh
cd buildright-service
node mesh/scripts/build-mesh.js --force

# 2. Deploy mesh
aio app deploy

# 3. Test frontend (if not already running)
cd ../buildright-eds
npm start
```

## Rollback Plan

If issues arise:

1. **Revert frontend:** Change `product-grid.js` to call old `productSearchFilter` instead of `productSearchWithDropin`
2. **Keep mesh resolver:** No impact if not called
3. **Test old path:** Verify existing `BuildRight_productSearchFilter` still works

## Next Steps

1. Deploy mesh with new resolver
2. Test catalog page thoroughly
3. Monitor for any errors
4. If successful, consider applying same pattern to:
   - Search results page
   - Product recommendations
   - Related products

## Files Modified

### Mesh (buildright-service)
- `mesh/resolvers-src/product-discovery.js` (NEW)
- `mesh/schema/product-discovery.graphql` (NEW)
- `mesh/mesh.config.js` (added resolver)

### Frontend (buildright-eds)
- `blocks/product-grid/product-grid.js` (simplified)
- `scripts/services/mesh-client.js` (added function)
- `scripts/services/queries.js` (added query)

## Benefits for BuildRight

### Developer Experience
- **Simpler frontend code** - No transformation gymnastics
- **Single source of truth** - Mesh handles all transforms
- **Easier debugging** - Transformations in one place
- **Better testability** - Server-side logic is easier to test

### Performance
- **Same or better** - Mesh adds minimal overhead
- **Caching potential** - Mesh can cache transformed results
- **Reduced client bundle** - Less transformation code in frontend

### Maintainability
- **Future-proof** - Adobe updates dropin, we update mesh
- **Reusable** - Other clients (mobile, etc.) use same mesh API
- **Consistent** - Same data format everywhere

### Business Value
- **Faster development** - New features use clean mesh API
- **Fewer bugs** - Transformations in one place, easier to fix
- **Better UX** - Simpler code = faster iterations = better UX

---

**Status**: Ready for deployment and testing! 🚀

