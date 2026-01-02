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

**See Also:** [dropin-pattern.md](./dropin-pattern.md) | [product-data-flow.md](../reference/backend/product-data-flow.md) | [ADR-007](../adr/ADR-007-custom-sdk-dropins-for-aco.md)
