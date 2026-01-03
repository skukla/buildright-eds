# Mesh Resolvers Reference

**Audience:** All stakeholders
**Purpose:** How each resolver affects data flow

---

## Overview

The mesh sits between frontend and ACO, intercepting queries to add business logic. Each resolver has a specific job.

```
Frontend → Mesh Resolver → ACO → Mesh Resolver → Frontend
              │                        │
              └── transforms request   └── transforms response
```

---

## Resolver Catalog

| Resolver | Purpose | Used By |
|----------|---------|---------|
| [dropin-plp](#dropin-plp) | Product grid queries | Product Discovery dropin |
| [dropin-pdp](#dropin-pdp) | Product detail queries | PDP dropin |
| [dropin-metadata](#dropin-metadata) | Sort dropdown options | SortBy component |
| [product-search](#product-search) | Custom product queries | Featured products, search suggestions |
| [persona](#persona) | Customer → pricing headers | All authenticated queries |
| [categories](#categories) | Category tree | Navigation menus |
| [breadcrumbs](#breadcrumbs) | Navigation trail | Category pages |
| [bom-from-template](#bom-from-template) | Bill of Materials | Sarah's build configurator |

> **Note:** Both `dropin-plp` and `product-search` ultimately call the same ACO query (`BuildRight_productSearch`). See [Product Query Flows](./product-query-flows.md) for a detailed comparison.

---

## dropin-plp

**What:** Intercepts product grid queries to add extensibility control.

```
┌─────────────────────┐
│  Product Discovery  │
│  Dropin             │
│  productSearch()    │
└─────────┬───────────┘
          │ filter: { categoryPath: "Lumber" }
          ▼
┌─────────────────────┐
│  dropin-plp.js      │
│  ┌───────────────┐  │
│  │ 1. Validate   │  │  ← page_size: 1-100, phrase: max 200 chars
│  │ 2. Transform  │  │  ← categoryPath → subcategory filter
│  │ 3. Route      │  │  ← Query BuildRight_ prefixed source
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  ACO                │
│  Returns products   │
│  with pricing       │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  dropin-plp.js      │
│  ┌───────────────┐  │
│  │ Strip prefix  │  │  ← BuildRight_SimpleProductView → SimpleProductView
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Dropin renders     │
│  product grid       │
└─────────────────────┘
```

**Key Transformation:**
```
IN:  categoryPath: "Building Materials/Lumber"
OUT: subcategory: "Lumber"
```

---

## product-search

**What:** Handles custom BuildRight_* product queries for non-dropin blocks.

```
┌─────────────────────┐
│  Featured Products  │
│  Block              │
│  searchProducts()   │
└─────────┬───────────┘
          │ phrase: " ", pageSize: 6
          ▼
┌─────────────────────┐
│  product-search.js  │
│  ┌───────────────┐  │
│  │ Route to ACO  │  │  ← Uses BuildRight_ prefixed types
│  │ Same source!  │  │  ← ACO_BuildRight.BuildRight_productSearch
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  ACO                │
│  Returns products   │
│  with pricing       │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  product-search.js  │
│  ┌───────────────┐  │
│  │ Transform     │  │  ← Maps to BuildRight_Product type
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Block renders      │
│  product cards      │
└─────────────────────┘
```

**Queries Provided:**
- `BuildRight_searchProducts` - Featured products, legacy search
- `BuildRight_searchSuggestions` - Search autocomplete
- `BuildRight_productSearchFilter` - Advanced search with facets
- `BuildRight_getProductBySKU` - Single product lookup

---

## dropin-pdp

**What:** Intercepts product detail queries for single products.

```
┌─────────────────────┐
│  PDP Dropin         │
│  products(sku)      │
│  refineProduct()    │
└─────────┬───────────┘
          │ sku: "LUM-2X4-8"
          ▼
┌─────────────────────┐
│  dropin-pdp.js      │
│  ┌───────────────┐  │
│  │ Route to ACO  │  │  ← Uses BuildRight_ prefixed types
│  │ Add pricing   │  │  ← Includes price fragments
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  ACO returns        │
│  full product data  │
│  + variant options  │
└─────────────────────┘
```

**Handles:** `products(skus)` and `refineProduct(sku, optionIds)`

---

## dropin-metadata

**What:** Customizes sort options in the SortBy dropdown.

```
┌─────────────────────┐
│  SortBy Component   │
│  attributeMetadata()│
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  dropin-metadata.js │
│  ┌───────────────┐  │
│  │ Query ACO     │  │
│  │ Filter attrs  │  │  ← Hide "position" (not useful)
│  │ Rename labels │  │  ← "relevance" → "Best Match"
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  SortBy shows:      │
│  • Best Match       │
│  • Name A-Z / Z-A   │
│  • Price Low-High   │
└─────────────────────┘
```

**Key Transformation:**
```
IN:  sortable: [{ attribute: "relevance", label: "Relevance" }, ...]
OUT: sortable: [{ attribute: "relevance", label: "Best Match" }, ...]
     (with "position" removed)
```

---

## persona

**What:** Maps customer identity to ACO pricing headers.

```
┌─────────────────────┐
│  Frontend auth      │
│  email: "sarah@..." │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  persona.js         │
│  ┌───────────────┐  │
│  │ personaByEmail│  │  ← Query: Who is this customer?
│  │ Map to ACO    │  │  ← sarah → catalog_view_id, price_book_id
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Returns:           │
│  AC-View-Id: UUID   │  ← What products they see
│  AC-Price-Book-Id   │  ← What prices they pay
└─────────────────────┘
```

**Queries Available:**
- `personaByEmail(email)` - Lookup by email
- `personaById(personaId)` - Lookup by persona ID
- `personaForCustomer(customerGroupId)` - Lookup by Commerce group
- `personas` - List all personas

---

## categories

**What:** Returns category tree for navigation menus.

```
┌─────────────────────┐
│  Header/Nav menu    │
│  getCategories()    │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  categories.js      │
│  ┌───────────────┐  │
│  │ Query ACO nav │  │  ← Uses ACO navigation query
│  │ Flatten tree  │  │  ← 4 levels max, cached
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Returns:           │
│  [                  │
│   { slug, name,     │
│     children: [...] │
│   }, ...            │
│  ]                  │
└─────────────────────┘
```

**Requires:** `AC-View-Id` header (determines category visibility)

---

## breadcrumbs

**What:** Builds navigation trail for category pages.

```
┌─────────────────────┐
│  Category page      │
│  slug: "lumber"     │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  breadcrumbs.js     │
│  ┌───────────────┐  │
│  │ Get categories│  │  ← Reuses ACO navigation
│  │ Walk parents  │  │  ← lumber → structural → root
│  │ Build trail   │  │  ← Add URLs for each level
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Returns:           │
│  Home > Structural  │
│  Materials > Lumber │
└─────────────────────┘
```

**Output Format:**
```json
{
  "trail": [
    { "slug": "structural-materials", "name": "Structural Materials", "url": "/pages/catalog.html?category=structural-materials" },
    { "slug": "lumber", "name": "Lumber", "url": "/pages/catalog.html?category=lumber" }
  ]
}
```

---

## bom-from-template

**What:** Generates Bill of Materials for construction templates.

```
┌─────────────────────┐
│  Build Configurator │
│  template: "sedona" │
│  package: "standard"│
│  phases: [framing]  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  bom-from-template  │
│  ┌───────────────┐  │
│  │ 1. Load specs │  │  ← Template + variant + package
│  │ 2. Query ACO  │  │  ← 13 parallel product queries
│  │ 3. Calculate  │  │  ← Quantities from formulas
│  │ 4. Price      │  │  ← Apply persona pricing
│  └───────────────┘  │
└─────────┬───────────┘
          ▼
┌─────────────────────┐
│  Returns BOM:       │
│  items: [           │
│   { sku, qty, $$ }  │
│  ]                  │
│  totals: { sum }    │
└─────────────────────┘
```

**Data Flow Detail:**
1. Frontend sends `templateId`, `variantId`, `packageId`
2. Resolver queries ACO with attribute filters (13 parallel queries)
3. Calls `/bom` action with products + IDs
4. Action resolves template specs, calculates quantities
5. Returns structured BOM with line items and totals

**Used By:** Sarah, Marcus, Lisa (Production Builders)

---

## Header Flow

All resolvers respect persona headers for pricing:

```
┌─────────────────────────────────────────────────────────┐
│  Frontend sets headers (from persona resolver):         │
│  ┌─────────────────────────────────────────────────┐   │
│  │ AC-View-Id: 6792f1d5-9e79-4813-8d8e-df5ed76e5692│   │
│  │ AC-Price-Book-Id: US-Wholesale                  │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────┬───────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Every resolver forwards headers to ACO                 │
│  ACO returns persona-specific:                          │
│  • Product visibility (what they can see)               │
│  • Pricing (what they pay)                              │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference

| Need | Resolver | Query |
|------|----------|-------|
| Product grid (dropin) | dropin-plp | `productSearch(phrase, filter)` |
| Featured products | product-search | `BuildRight_searchProducts(phrase)` |
| Search autocomplete | product-search | `BuildRight_searchSuggestions(phrase)` |
| Single product | dropin-pdp | `products(skus)` |
| Sort options | dropin-metadata | `attributeMetadata` |
| Who is user | persona | `personaByEmail(email)` |
| Nav menu | categories | `getCategories` |
| Page trail | breadcrumbs | `getCategoryBreadcrumbs(slug)` |
| Template BOM | bom-from-template | `bomFromTemplate(templateId, ...)` |

---

**Source:** `buildright-service/mesh/resolvers-src/`
**See Also:** [Product Query Flows](./product-query-flows.md) | [Backend Services](./backend-services.md) | [ADR-009](../adr/ADR-009-mesh-adapter-resolver-pattern.md)
