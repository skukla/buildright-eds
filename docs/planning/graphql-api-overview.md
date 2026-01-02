# BuildRight GraphQL API Architecture

**Date**: December 20, 2025  
**Status**: Production Architecture

---

## Overview

BuildRight exposes a **unified GraphQL API** through the Adobe API Mesh that combines:
1. **Standard ACO queries** (unprefixed) - For Adobe Commerce Dropins
2. **BuildRight custom queries** (BuildRight_ prefix) - For custom blocks and business logic

---

## Architecture

### Two ACO Sources in the Mesh

```javascript
// Source 1: Dropins (Unprefixed)
// For: Adobe Commerce Dropins
// Queries: productSearch, products, attributeMetadata, refineProduct, navigation, etc.

// Source 2: CustomBlocks (BuildRight_ Prefix)
// For: BuildRight custom blocks and business logic
// Queries: BuildRight_productSearch, BuildRight_navigation, BuildRight_products, etc.
```

### Why Two Sources?

**Problem**: Dropins expect specific query names (`productSearch`), but BuildRight custom blocks also need to query ACO without naming conflicts.

**Solution**: Expose ACO twice with descriptive source names:
- **Dropins** source - unprefixed for Adobe Commerce Dropins
- **CustomBlocks** source - BuildRight_ prefix for custom blocks

---

## What Developers Can Use

### For Commerce Dropins

Dropins query **unprefixed ACO** directly:

```graphql
query DropinQuery {
  productSearch(phrase: "lumber", page_size: 20) {
    total_count
    items {
      productView {
        sku
        name
        price { final { amount { value currency } } }
      }
    }
    facets { attribute title buckets { title count } }
  }
}
```

✅ **Works with**: Product Discovery, Cart, Checkout dropins  
⚠️ **Limitation**: Dropins go straight to ACO - BuildRight intelligence (persona, custom filtering) is **NOT automatically applied**

### For Custom Blocks

Custom blocks use **BuildRight_ prefixed queries**:

```graphql
query CustomBlockQuery {
  BuildRight_searchProducts(phrase: "lumber", pageSize: 20) {
    items {
      sku
      name
      price { value currency }  # Flat, clean structure
      imageUrl
      inStock
    }
    totalCount
    facets { key title options { name count } }
  }
  
  BuildRight_getCategories {
    categories { slug name parentSlug path }
    totalCount
  }
  
  BuildRight_generateBOMFromTemplate(
    templateId: "modern-farmhouse"
    packageId: "structural"
  ) {
    totalCost { value currency }
    lineItems { sku name quantity unitPrice totalPrice }
  }
}
```

✅ **Includes**: Persona detection, custom filtering, BuildRight business logic  
✅ **Returns**: Flat, clean data structures designed for developers

---

## How Persona Intelligence Works

### Current Implementation

**Frontend** sends persona via headers:
```javascript
headers: {
  'x-catalog-view-id': '6792f1d5-9e79-4813-8d8e-df5ed76e5692',  // Persona's catalog view
  'x-price-book-id': 'Production-Builder'                        // Persona's price book
}
```

**ACO** enforces persona at the data layer:
- Catalog views filter products by persona policies
- Price books return persona-specific pricing
- All queries (both unprefixed and BuildRight_) respect these headers

### Persona Flow

1. **Authentication** → Custom auth block detects logged-in customer
2. **Persona Lookup** → Calls `BuildRight_personaForCustomer(customerGroupId)`
3. **Header Setting** → Sets `x-catalog-view-id` and `x-price-book-id` globally
4. **All Queries** → Automatically filtered and priced per persona

**Result**: Both dropins and custom blocks get persona-appropriate data transparently.

---

## The Answer: Can Dropins Use BuildRight Intelligence?

### ✅ YES - Via Header-Based Persona

Dropins **DO** benefit from BuildRight persona intelligence because:
- Frontend sets `x-catalog-view-id` and `x-price-book-id` headers globally
- These headers flow through mesh to ACO
- ACO enforces catalog views and price books at the data layer
- Dropins get persona-filtered results without knowing about BuildRight

**Example**:
```javascript
// Production Builder persona (catalogViewId: '22c02790...')
productSearch(phrase: "windows") 
  → Returns only products in "Production Builder" catalog view
  → Prices from "Production-Builder" price book
  → No retail-only or specialty products

// DIY Homeowner persona (catalogViewId: '0a4dbd61...')
productSearch(phrase: "windows")
  → Returns products in "DIY Retail" catalog view
  → Prices from "Retail-Registered" price book  
  → Different products, different pricing
```

### ❌ NO - Via Custom Query Logic

Dropins **CANNOT** use BuildRight custom query logic (beyond ACO's native capabilities) because:
- Dropins call unprefixed ACO queries directly
- No custom resolvers intercept these calls
- BuildRight custom logic lives only in `BuildRight_` prefixed queries

**What This Means**:
- ✅ Persona-based catalog views and pricing: **Works**
- ✅ ACO native filtering and faceting: **Works**
- ❌ Custom BuildRight search algorithms: **Doesn't work**
- ❌ Custom BOM integration in search results: **Doesn't work**
- ❌ Custom product recommendations: **Doesn't work**

---

## Future: True Unified API (If Needed)

If you need dropins to leverage **all** BuildRight custom logic, you would need to:

### Option A: Custom Resolvers That Wrap ACO

```javascript
// Remove unprefixed ACO source
// Add custom resolvers that intercept dropin queries

Query: {
  productSearch: async (root, args, context) => {
    // 1. Detect persona
    const persona = await detectPersona(context);
    
    // 2. Apply BuildRight custom logic
    args = applyCustomFiltering(args, persona);
    
    // 3. Query ACO via BuildRight_ source
    const results = await context.ACO_Custom.Query.BuildRight_productSearch(args);
    
    // 4. Transform back to standard format
    return transformToACOFormat(results);
  }
}
```

**Challenges**:
- Mesh resolver delegation patterns are complex
- Type name prefixing makes this difficult
- Performance overhead of extra transformation layer
- Need to maintain both custom and standard schemas

### Option B: Stop Using Dropins

Build custom blocks for everything that call `BuildRight_` queries directly:
- ✅ Full control over all logic
- ✅ Clean, flat return structures
- ✅ No dropin limitations
- ❌ More code to maintain
- ❌ Lose Adobe's maintained UI components

---

## Recommendation

**Current architecture is appropriate for BuildRight because**:

1. **Persona intelligence via headers works** for both dropins and custom blocks
2. **ACO's native features** (catalog views, price books, filtering) cover 80% of BuildRight needs
3. **BuildRight_ custom queries** handle the 20% that's truly unique (BOM, templates, advanced search)
4. **Dropins provide value** for standard commerce (cart, checkout, auth)
5. **Complexity vs. benefit** of "true unified API" doesn't justify it yet

**When to revisit**:
- If BuildRight custom search logic becomes critical for dropins
- If persona-based recommendations need to be in dropin results
- If BOM integration needs to happen at search result level

---

## Developer Experience Summary

### What Developers Get

**One GraphQL endpoint** with two query namespaces:

```graphql
# Dropin queries (unprefixed) - Standard ACO
productSearch          # Intercepted by dropin-search.js adapter
products               # Intercepted by dropin-pdp.js adapter
attributeMetadata      # Intercepted by dropin-metadata.js adapter (filters SortBy options)
refineProduct          # Intercepted by dropin-pdp.js adapter
navigation
cart
customer

# BuildRight queries (BuildRight_ prefix) - Custom logic  
BuildRight_searchProducts      # Enhanced search with flat return structure
BuildRight_getCategories        # Category management
BuildRight_generateBOMFromTemplate  # BOM generation
BuildRight_personaForCustomer   # Persona detection
BuildRight_getProductBySKU      # Product lookup with persona pricing
```

### When to Use Which

| Use Case | Query To Use | Why |
|----------|--------------|-----|
| Product Discovery Dropin | `productSearch` | Dropin expects this |
| Custom product search block | `BuildRight_searchProducts` | Cleaner return structure, custom logic |
| Category navigation | `BuildRight_getCategories` | BuildRight-specific category features |
| BOM generation | `BuildRight_generateBOMFromTemplate` | BuildRight-only feature |
| Cart/Checkout dropins | `cart`, `customer` | Dropins expect these |

### The Golden Rule

**Dropins → Standard queries (unprefixed)**  
**Custom blocks → BuildRight queries (BuildRight_ prefix)**

Both get persona intelligence via headers. Both query the same ACO instance. Different entry points for different needs.

---

## Mesh Endpoint

```
https://edge-sandbox-graph.adobe.io/api/2463edc1-5cf7-4393-af04-95a3d1b6973c/graphql
```

**Required Headers**:
```
x-catalog-view-id: <persona-catalog-view-id>
x-price-book-id: <persona-price-book-id>  (optional)
```


