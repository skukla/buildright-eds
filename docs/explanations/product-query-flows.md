# Product Query Flows

**Audience:** Developers
**Purpose:** Understand how product data flows through different resolver paths

---

## The Key Insight

Both the **PLP Product Grid** (Product Discovery dropin) and **Featured Products** (custom block) ultimately call the **same ACO query** (`BuildRight_productSearch`), but through different resolver paths.

```
                    ┌─────────────────────────────────────────┐
                    │         ACO_BuildRight Source           │
                    │                                         │
                    │   BuildRight_productSearch              │
                    │   (THE SINGLE SOURCE OF TRUTH)          │
                    │                                         │
                    │   Returns: products with pricing        │
                    │   Requires: AC-View-Id, AC-Price-Book-Id│
                    └──────────────────┬──────────────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              │                                                  │
              ▼                                                  ▼
┌─────────────────────────────┐            ┌─────────────────────────────┐
│     DROPIN PATH             │            │     CUSTOM PATH             │
│     (dropin-plp.js)         │            │     (product-search.js)     │
│                             │            │                             │
│  Entry: productSearch       │            │  Entry: BuildRight_*        │
│  (unprefixed)               │            │  (prefixed queries)         │
│                             │            │                             │
│  Output: Native schema      │            │  Output: Custom schema      │
│  (SimpleProductView)        │            │  (BuildRight_Product)       │
│                             │            │                             │
│  Used by: Adobe dropins     │            │  Used by: Custom blocks     │
└─────────────────────────────┘            └─────────────────────────────┘
```

---

## Flow 1: PLP Product Grid (Dropin Path)

The Product Discovery dropin uses Adobe's native `productSearch` query.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. product-list block initializes Product Discovery dropin             │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. Dropin calls: productSearch(phrase, filter, page_size)              │
│     (unprefixed query - native Adobe schema)                            │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. dropin-plp.js INTERCEPTS the query                                  │
│                                                                          │
│     Why intercept? For extensibility control:                           │
│     • Add custom BuildRight fields                                      │
│     • Transform filter attributes (categoryPath → subcategory)          │
│     • Centralized logging and error handling                            │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. Resolver delegates to ACO_BuildRight source:                        │
│                                                                          │
│     context.ACO_BuildRight.Query.BuildRight_productSearch({             │
│       selectionSet: `{                                                  │
│         items {                                                         │
│           productView {                                                 │
│             ... on BuildRight_SimpleProductView {  ◄── MUST use prefix  │
│               price { final { amount { value } } }                      │
│             }                                                           │
│           }                                                             │
│         }                                                               │
│       }`                                                                │
│     })                                                                  │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. ACO returns products with BuildRight_ prefixed types                │
│     __typename: "BuildRight_SimpleProductView"                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. Resolver TRANSFORMS response for dropin compatibility:              │
│                                                                          │
│     • Strips "BuildRight_" prefix from __typename                       │
│     • BuildRight_SimpleProductView → SimpleProductView                  │
│     • BuildRight_ScalarBucket → ScalarBucket                            │
│                                                                          │
│     Why? Dropins expect native Adobe schema types.                      │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  7. Dropin receives native schema, renders product grid                 │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key File:** `buildright-service/mesh/resolvers-src/dropin-plp.js`

---

## Flow 2: Featured Products (Custom Path)

Custom blocks use prefixed `BuildRight_*` queries directly.

```
┌─────────────────────────────────────────────────────────────────────────┐
│  1. featured-products block calls catalogService.searchProducts()       │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  2. Service sends: BuildRight_searchProducts(phrase, pageSize)          │
│     (prefixed query - custom BuildRight schema)                         │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  3. product-search.js handles the query directly                        │
│                                                                          │
│     No interception needed - query is already prefixed                  │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  4. Resolver delegates to SAME ACO source:                              │
│                                                                          │
│     context.ACO_BuildRight.Query.BuildRight_productSearch({             │
│       selectionSet: `{                                                  │
│         items {                                                         │
│           productView {                                                 │
│             ... on BuildRight_SimpleProductView {  ◄── MUST use prefix  │
│               price { final { amount { value } } }                      │
│             }                                                           │
│           }                                                             │
│         }                                                               │
│       }`                                                                │
│     })                                                                  │
│                                                                          │
│     ⚠️  SAME underlying call as dropin-plp.js!                          │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  5. ACO returns products with BuildRight_ prefixed types                │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  6. Resolver transforms via transformACOProduct():                      │
│                                                                          │
│     • Maps ACO fields to BuildRight_Product schema                      │
│     • No prefix stripping needed (custom blocks expect prefixed)        │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│  7. Block receives BuildRight_Product type, renders cards               │
└─────────────────────────────────────────────────────────────────────────┘
```

**Key File:** `buildright-service/mesh/resolvers-src/product-search.js`

---

## Side-by-Side Comparison

| Aspect | Dropin Path (PLP) | Custom Path (Featured) |
|--------|-------------------|------------------------|
| **Entry Point** | `productSearch` (unprefixed) | `BuildRight_searchProducts` (prefixed) |
| **Resolver** | `dropin-plp.js` | `product-search.js` |
| **Underlying Call** | `BuildRight_productSearch` | `BuildRight_productSearch` |
| **Source** | `ACO_BuildRight` | `ACO_BuildRight` |
| **Output Schema** | Native (`SimpleProductView`) | Custom (`BuildRight_Product`) |
| **Used By** | Adobe dropins | Custom EDS blocks |
| **Needs Transform?** | Yes (strip prefix) | Yes (map to custom type) |

---

## Why Two Paths?

### Dropin Path Exists Because:
- Adobe dropins expect native Commerce/ACO schema
- Dropins can't be modified to use prefixed types
- Interception provides extensibility without forking dropins

### Custom Path Exists Because:
- Custom blocks aren't constrained by dropin schema
- Can define BuildRight-specific types and fields
- Simpler queries without schema transformation overhead

### They Share The Same Source Because:
- Single source of truth for product data
- Consistent pricing across all displays
- Persona headers work identically for both

---

## Critical Implementation Detail

When delegating to `ACO_BuildRight`, inline fragment types **MUST** use the `BuildRight_` prefix:

```javascript
// ✅ CORRECT - matches ACO_BuildRight source prefix
... on BuildRight_SimpleProductView {
  price { final { amount { value } } }
}

// ❌ WRONG - type doesn't exist in prefixed source, returns NULL
... on ACO_SimpleProductView {
  price { final { amount { value } } }
}

// ❌ WRONG - unprefixed type, returns NULL
... on SimpleProductView {
  price { final { amount { value } } }
}
```

This applies to ALL types from the prefixed source:
- `BuildRight_SimpleProductView` / `BuildRight_ComplexProductView`
- `BuildRight_ScalarBucket` / `BuildRight_RangeBucket` / `BuildRight_CategoryBucket`

---

## Query Inventory

| Query | Resolver | Purpose |
|-------|----------|---------|
| `productSearch` | `dropin-plp.js` | Product Discovery dropin (PLP) |
| `products` | `dropin-pdp.js` | Product Details dropin (PDP) |
| `refineProduct` | `dropin-pdp.js` | Variant selection |
| `BuildRight_searchProducts` | `product-search.js` | Featured products, legacy search |
| `BuildRight_searchSuggestions` | `product-search.js` | Search autocomplete |
| `BuildRight_productSearchFilter` | `product-search.js` | Advanced search with facets |
| `BuildRight_getProductBySKU` | `product-search.js` | Single product lookup |

---

**Source:** `buildright-service/mesh/resolvers-src/`
**See Also:** [Mesh Adapter Reference](./mesh-adapter.md) | [Dropin Architecture](../reference/dropin-architecture.md)
