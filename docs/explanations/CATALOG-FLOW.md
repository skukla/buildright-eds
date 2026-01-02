# Catalog Flow

## What It Does

Shows how a user browsing products triggers a complete flow from browser to database and back.

## End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  1. USER VISITS /catalog                                         │
│     Browser loads catalog.html                                   │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. product-list BLOCK LOADS                                     │
│     Initializes Product Discovery dropin                        │
│     Gets persona from cookie/session                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. DROPIN MAKES GraphQL QUERY                                   │
│     productSearch(phrase: "", filter: {...})                    │
│     Headers: AC-View-Id, AC-Price-Book-Id                       │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. API MESH RECEIVES QUERY                                      │
│     Routes to dropin-search.js resolver                         │
│     Transforms filters, forwards to ACO                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. ACO RETURNS PRODUCTS                                         │
│     Products filtered by catalog view                           │
│     Prices from persona's price book                            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. MESH ADAPTER TRANSFORMS RESPONSE                             │
│     Strips BuildRight_ prefix                                   │
│     Returns Commerce-compatible format                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. DROPIN RENDERS PRODUCTS                                      │
│     Product cards with images, names, prices                    │
│     Custom slots render BuildRight styling                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. USER SEES PERSONALIZED CATALOG                               │
│     Sarah sees wholesale prices                                  │
│     David sees retail prices                                    │
│     Same products, different experience                         │
└─────────────────────────────────────────────────────────────────┘
```

## What Each Step Involves

| Step | Component | File/Location |
|------|-----------|---------------|
| 1 | Page | `pages/catalog.html` |
| 2 | Block | `blocks/product-list/product-list.js` |
| 3 | Dropin | `@dropins/storefront-product-discovery` |
| 4 | Mesh | `buildright-service/mesh/mesh.json` |
| 5 | ACO | Adobe Commerce Optimizer (cloud) |
| 6 | Resolver | `mesh/resolvers-src/dropin-search.js` |
| 7 | Slots | Custom slot renderers in block |
| 8 | Browser | Final rendered DOM |

## Time Breakdown

```
Total: ~500ms (typical)

Browser → Mesh:     50ms
Mesh routing:       20ms
ACO query:         300ms
Response transform: 30ms
Dropin render:     100ms
```

## Facet (Filter) Flow

When user clicks a filter checkbox:

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   User       │     │   Dropin     │     │   Mesh/ACO   │
│   clicks     │────▶│   updates    │────▶│   filters    │
│   "Lumber"   │     │   filter     │     │   products   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                 │
                           ┌─────────────────────┘
                           ▼
┌──────────────┐     ┌──────────────┐
│   Grid       │◀────│   Returns    │
│   updates    │     │   filtered   │
│   instantly  │     │   results    │
└──────────────┘     └──────────────┘
```

---

**See Also:** [ARCHITECTURE-OVERVIEW.md](./ARCHITECTURE-OVERVIEW.md) | [DROPIN-PATTERN.md](./DROPIN-PATTERN.md)
