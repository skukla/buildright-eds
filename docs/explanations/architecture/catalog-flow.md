# Catalog Flow

**What it does**: Shows exactly what happens when a customer browses the catalog
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The End-to-End Flow

When a customer visits the catalog page, here's what happens behind the scenes:

```
┌─────────────────────────────────────────────────────────────────┐
│  1. CUSTOMER VISITS THE CATALOG PAGE                             │
│                                                                  │
│     Sarah types buildright.com/catalog in her browser            │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  2. PAGE LOADS AND IDENTIFIES THE CUSTOMER                       │
│                                                                  │
│     The page checks if Sarah is logged in                        │
│     Gets her persona: "Production Builder"                       │
│     Retrieves her pricing headers                                │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  3. PRODUCT DISCOVERY DROPIN REQUESTS PRODUCTS                   │
│                                                                  │
│     "Show me products"                                           │
│     Includes: AC-View-Id (what she can see)                      │
│              AC-Price-Book-Id (what she pays)                    │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  4. API MESH ROUTES THE REQUEST                                  │
│                                                                  │
│     Recognizes this as a product query                           │
│     Routes to the Product List resolver                          │
│     Forwards Sarah's pricing headers to ACO                      │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  5. ACO RETURNS PERSONALIZED PRODUCTS                            │
│                                                                  │
│     Products filtered by Sarah's catalog view                    │
│     Prices from her wholesale price book                         │
│     Categories and facets for filtering                          │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  6. MESH FORMATS THE RESPONSE                                    │
│                                                                  │
│     Prepares data for the dropin                                 │
│     Ensures format matches what the dropin expects               │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  7. DROPIN RENDERS THE CATALOG                                   │
│                                                                  │
│     Product cards with images, names, prices                     │
│     Filter sidebar with categories and facets                    │
│     Sort dropdown (price, name, relevance)                       │
│     Pagination for browsing all products                         │
└─────────────────────────┬───────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│  8. SARAH SEES HER PERSONALIZED CATALOG                          │
│                                                                  │
│     Wholesale prices (not retail)                                │
│     Commercial products (not consumer-only)                      │
│     Professional filters and categories                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## What Happens When Sarah Filters Products

When Sarah clicks a filter (like "Lumber"):

```
┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│  Sarah clicks    │     │  Dropin adds     │     │  Mesh sends to   │
│  "Lumber"        │────▶│  filter to       │────▶│  ACO with        │
│  filter          │     │  current query   │     │  filter applied  │
└──────────────────┘     └──────────────────┘     └──────────────────┘
                                                           │
                              ┌─────────────────────────────┘
                              ▼
┌──────────────────┐     ┌──────────────────┐
│  Grid updates    │◀────│  ACO returns     │
│  to show only    │     │  filtered        │
│  lumber products │     │  products        │
└──────────────────┘     └──────────────────┘
```

The filter happens without reloading the page - just the product grid updates.

---

## The Persona Difference

The same catalog page shows different content to different customers:

| Customer | Catalog View | Price Book | What They See |
|----------|--------------|------------|---------------|
| **Sarah** (Production Builder) | Commercial | Wholesale | Pro products, low prices |
| **David** (DIY Homeowner) | Consumer | Retail | Consumer products, standard prices |
| **Guest** (Not logged in) | Default | Retail | General products, standard prices |

---

## Key Takeaways

1. **Persona headers drive personalization** - The AC-View-Id and AC-Price-Book-Id headers make everything work
2. **Single query, personalized results** - Same catalog page, different content per customer
3. **Real-time filtering** - Facets work without page reloads
4. **Mesh handles complexity** - Frontend just asks for products, mesh figures out the rest

---

**Related**: [Architecture Overview](./architecture-overview.md) | [Data Ownership](./data-ownership.md) | [Mesh Resolvers](../mesh/mesh-adapter.md)
