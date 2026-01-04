# Product Query Flows

**What it does**: Explains how product data travels through the system via different paths
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Key Concept

BuildRight has **two ways to get product data**, but both ultimately come from the same source (ACO). The difference is in how the data is packaged for different consumers.

```
                    ┌──────────────────────────────────────────┐
                    │       ACO (Single Source of Truth)       │
                    │                                          │
                    │   Products + Pricing + Categories        │
                    │                                          │
                    └──────────────────┬───────────────────────┘
                                       │
              ┌────────────────────────┴─────────────────────────┐
              │                                                  │
              ▼                                                  ▼
┌──────────────────────────────┐            ┌──────────────────────────────┐
│     DROPIN PATH              │            │     CUSTOM PATH              │
│                              │            │                              │
│  For: Adobe Commerce dropins │            │  For: Custom BuildRight      │
│       (Product Discovery)    │            │       blocks (Featured       │
│                              │            │       Products, etc.)        │
│  Uses: Standard Adobe format │            │  Uses: BuildRight format     │
└──────────────────────────────┘            └──────────────────────────────┘
```

---

## Why Two Paths?

| | Dropin Path | Custom Path |
|---|-------------|-------------|
| **Who uses it** | Adobe Commerce dropins | Custom BuildRight blocks |
| **Entry point** | Product Discovery dropin | Featured Products, Search |
| **Data format** | Adobe's standard schema | BuildRight's custom schema |
| **Resolver** | dropin-plp | product-search |

**Think of it like this**: Both paths are ordering from the same restaurant (ACO), but one customer wants the food plated in restaurant style (dropins) while another wants it in takeout containers (custom blocks).

---

## Flow 1: Catalog Page (Dropin Path)

When a customer browses the product catalog:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. Customer visits catalog page and browses "Lumber" category           │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. Product Discovery dropin asks for products                           │
│     "Give me products in the Lumber category"                            │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. Mesh intercepts and routes to dropin-plp resolver                    │
│                                                                          │
│     The resolver:                                                        │
│     • Validates the request                                              │
│     • Transforms the filter format                                       │
│     • Adds persona headers for pricing                                   │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. ACO returns products with BuildRight pricing                         │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. Resolver reformats data for the dropin                               │
│                                                                          │
│     ACO returns: BuildRight_SimpleProductView                            │
│     Dropin expects: SimpleProductView                                    │
│     Resolver: Removes the "BuildRight_" prefix                           │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  6. Dropin renders the product grid with BuildRight prices               │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Flow 2: Featured Products (Custom Path)

When the homepage shows featured products:

```
┌──────────────────────────────────────────────────────────────────────────┐
│  1. Homepage loads and needs to show 6 featured products                 │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  2. Featured Products block calls the catalog service                    │
│     "Give me 6 products to feature"                                      │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  3. Mesh routes to product-search resolver                               │
│                                                                          │
│     The resolver:                                                        │
│     • Passes request directly to ACO (no transformation needed)          │
│     • Adds persona headers for pricing                                   │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  4. ACO returns products (same source as the dropin path!)               │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  5. Resolver maps to BuildRight format                                   │
│                                                                          │
│     Custom blocks expect BuildRight format directly                      │
│     No prefix transformation needed                                      │
└─────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  6. Block renders featured product cards                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Side-by-Side Comparison

| Aspect | Catalog Page (Dropin) | Featured Products (Custom) |
|--------|----------------------|---------------------------|
| **Component** | Product Discovery dropin | Featured Products block |
| **Data source** | ACO | ACO (same!) |
| **Resolver** | dropin-plp | product-search |
| **Transformation** | Removes prefix for dropin | Maps to custom format |
| **Result** | Product grid | Featured cards |

---

## What This Means for Demos

When explaining product queries to clients:

1. **"All product data comes from one place"** - ACO is the single source of truth
2. **"Different components can use the same data differently"** - Dropins and custom blocks both access ACO
3. **"Pricing is always persona-aware"** - Both paths include customer-specific pricing
4. **"The mesh handles the complexity"** - Frontend doesn't need to know about data transformations

---

## Common Questions

**Q: Why not just use one path for everything?**
A: Adobe's dropins expect data in a specific format. Custom blocks have different needs. The mesh lets us serve both from the same source.

**Q: Does the customer see different data on different pages?**
A: No - they see the same products and prices. Only the display format differs.

**Q: What if I want to add a new type of product display?**
A: You can create a new resolver that reads from ACO and formats data however your component needs.

---

**Related**: [Mesh Resolvers](./mesh-adapter.md) | [Backend Services](./backend-services.md)
