# Mesh Resolvers

**What it does**: Specialized handlers that process specific types of data requests
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## What Are Resolvers?

Think of the API Mesh as a post office. **Resolvers are the mail clerks** who handle specific types of mail. Each resolver knows exactly how to process its type of request.

```
Frontend Request → API Mesh → Resolver → Backend → Resolver → Frontend Response
                              │                       │
                              └── prepares request    └── formats response
```

---

## Resolver Catalog

BuildRight uses different resolvers for different jobs:

| Resolver | What It Handles | Who Uses It |
|----------|-----------------|-------------|
| **Product List (dropin-plp)** | Product grids on catalog pages | Product Discovery dropin |
| **Product Details (dropin-pdp)** | Single product pages | Product Detail dropin |
| **Sort Options (dropin-metadata)** | Dropdown sorting choices | SortBy component |
| **Custom Search (product-search)** | Featured products, search suggestions | Custom blocks |
| **Persona** | Customer → pricing headers | All authenticated queries |
| **Categories** | Navigation menus | Header, sidebar |
| **Breadcrumbs** | "Home > Lumber > Framing" trail | Category pages |
| **Bill of Materials (bom-from-template)** | Template-based material lists | Build configurator |

---

## How Resolvers Process Requests

### Product List Resolver

When a customer browses the catalog:

```
┌───────────────────────────┐
│  Customer browses         │
│  "Lumber" category        │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Product List Resolver    │
│                           │
│  1. Validates the request │  ← Checks page size, filters
│  2. Prepares for ACO      │  ← Formats category filter
│  3. Sends to ACO          │  ← Gets products + prices
│  4. Formats response      │  ← Prepares for dropin
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Dropin displays          │
│  product grid             │
└───────────────────────────┘
```

### Persona Resolver

When a logged-in customer makes any product request:

```
┌───────────────────────────┐
│  Sarah logs in            │
│  email: sarah@build.com   │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Persona Resolver         │
│                           │
│  "Who is this customer?"  │
│                           │
│  Sarah Martinez           │
│  → Production Builder     │
│  → Wholesale pricing      │
│  → Full catalog access    │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Returns pricing headers: │
│                           │
│  AC-View-Id: [what she    │
│              can see]     │
│  AC-Price-Book-Id:        │
│              "Wholesale"  │
└───────────────────────────┘
```

These headers are then attached to all her product requests.

### Bill of Materials Resolver

When Sarah configures a new build project:

```
┌───────────────────────────┐
│  Sarah selects:           │
│  • Template: Sedona Home  │
│  • Package: Standard      │
│  • Phase: Framing         │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  BOM Resolver             │
│                           │
│  1. Loads template specs  │
│  2. Queries 13 product    │
│     categories in parallel│
│  3. Calculates quantities │
│     using formulas        │
│  4. Applies her pricing   │
└─────────┬─────────────────┘
          │
          ▼
┌───────────────────────────┐
│  Returns itemized list:   │
│                           │
│  2×4×8 Lumber: 240 @ $4.79│
│  2×6×10 Lumber: 80 @ $7.29│
│  Simpson ties: 48 @ $2.99 │
│  ...                      │
│  ─────────────────────────│
│  Total: $2,847.50         │
└───────────────────────────┘
```

---

## How Persona Headers Flow Through

All product resolvers respect the persona headers:

```
┌─────────────────────────────────────────────────────────────────────┐
│  EVERY product request includes persona headers:                    │
│                                                                     │
│  AC-View-Id: 6792f1d5-9e79-4813-8d8e-df5ed76e5692                   │
│  AC-Price-Book-Id: US-Wholesale                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  ACO uses these headers to determine:                               │
│                                                                     │
│  • Which products to show (View-Id controls visibility)             │
│  • What prices to return (Price-Book-Id controls tier)              │
└─────────────────────────────────────────────────────────────────────┘
```

This is how the same product can show different prices to different customers.

---

## Quick Reference

| If you need... | Use this resolver |
|----------------|-------------------|
| Product grid on catalog page | Product List (dropin-plp) |
| Featured products on home page | Custom Search (product-search) |
| Single product details | Product Details (dropin-pdp) |
| Sort dropdown options | Sort Options (dropin-metadata) |
| Customer pricing tier | Persona |
| Navigation menu | Categories |
| "Home > Category" trail | Breadcrumbs |
| Material list for template | Bill of Materials |

---

**Related**: [Product Query Flows](./product-query-flows.md) | [Backend Services](./backend-services.md)
