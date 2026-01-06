# Category Ordering

**What it does**: Explains how navigation categories honor Commerce backend ordering
**Audience**: Technical consultants, solution architects, pre-sales engineers

---

## The Problem

Categories come from two different systems with different capabilities:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     TWO SOURCES, ONE NAVIGATION                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────────────────┐     ┌─────────────────────────────┐       │
│   │     ACO (Adobe Commerce     │     │      Commerce (Adobe        │       │
│   │         Optimizer)          │     │      Commerce PaaS)         │       │
│   ├─────────────────────────────┤     ├─────────────────────────────┤       │
│   │                             │     │                             │       │
│   │  Has:                       │     │  Has:                       │       │
│   │  • Category names           │     │  • Category names           │       │
│   │  • URL slugs                │     │  • URL keys                 │       │
│   │  • Hierarchy (children)     │     │  • Position (sort order)    │       │
│   │  • Persona-filtered views   │     │  • Admin-managed ordering   │       │
│   │                             │     │                             │       │
│   │  Missing:                   │     │  Missing:                   │       │
│   │  • Position field           │     │  • Persona filtering        │       │
│   │                             │     │                             │       │
│   └─────────────────────────────┘     └─────────────────────────────┘       │
│                                                                             │
│   Navigation needs BOTH:                                                    │
│   • Persona-aware categories from ACO                                       │
│   • Sort order from Commerce Admin                                          │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## The Solution

The mesh resolver fetches from both sources in parallel, then merges the data:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        PARALLEL FETCH + MERGE                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                    BuildRight_getCategories resolver                        │
│                    ═════════════════════════════════                        │
│                                 │                                           │
│                    ┌────────────┴────────────┐                              │
│                    │     Promise.all()       │                              │
│                    └────────────┬────────────┘                              │
│                         ┌───────┴───────┐                                   │
│                         │               │                                   │
│                         ▼               ▼                                   │
│                  ┌─────────────┐  ┌─────────────┐                           │
│                  │     ACO     │  │  Commerce   │                           │
│                  │ navigation  │  │ categories  │                           │
│                  └─────────────┘  └─────────────┘                           │
│                         │               │                                   │
│                         ▼               ▼                                   │
│                  ┌─────────────┐  ┌─────────────┐                           │
│                  │   slug      │  │   url_key   │                           │
│                  │   name      │  │   position  │                           │
│                  │   children  │  │   children  │                           │
│                  └─────────────┘  └─────────────┘                           │
│                         │               │                                   │
│                         └───────┬───────┘                                   │
│                                 │                                           │
│                         ┌───────┴───────┐                                   │
│                         │  Merge by     │                                   │
│                         │  slug=url_key │                                   │
│                         └───────┬───────┘                                   │
│                                 │                                           │
│                         ┌───────┴───────┐                                   │
│                         │  Sort by      │                                   │
│                         │  position     │                                   │
│                         └───────┬───────┘                                   │
│                                 │                                           │
│                                 ▼                                           │
│                    ┌────────────────────────┐                               │
│                    │   Sorted Categories    │                               │
│                    │   with positions       │                               │
│                    └────────────────────────┘                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## How It Works

### 1. ACO provides category data (persona-aware)

```graphql
# ACO navigation query
navigation(family: "default") {
  slug        # "structural-materials"
  name        # "Structural Materials"
  children {
    slug
    name
  }
}
```

### 2. Commerce provides positions (direct fetch)

```graphql
# Commerce categories query
categories(filters: { parent_id: { eq: "3" } }) {
  items {
    url_key     # "structural-materials"
    position    # 2
  }
}
```

### 3. Resolver merges and sorts

```javascript
// Build position map: url_key → position
const positionMap = {
  'all-products': 1,
  'structural-materials': 2,
  'framing-drywall': 3,
  // ...
};

// Add position to each category
categories.forEach(cat => {
  cat.position = positionMap[cat.slug] ?? 999;
});

// Sort by position
categories.sort((a, b) => a.position - b.position);
```

---

## Why Direct Fetch for Commerce?

The mesh's Commerce source excludes category queries to prevent conflicts with ACO:

```javascript
// mesh.config.js - Commerce source
transforms: [{
  filterSchema: {
    filters: [
      'Query.!categories',  // Excluded - ACO owns categories
      'Query.!products',    // Excluded - ACO owns products
    ]
  }
}]
```

The resolver uses direct `fetch()` to Commerce for positions only, bypassing the filter.

---

## Graceful Degradation

If Commerce is unavailable or `COMMERCE_ENDPOINT` isn't configured:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        FALLBACK BEHAVIOR                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Commerce Available?              Result                                   │
│   ══════════════════               ══════                                   │
│                                                                             │
│   ✓ Yes                            Categories sorted by Commerce position   │
│                                                                             │
│   ✗ No (endpoint missing)          Categories use ACO order                 │
│                                    (position defaults to 999)               │
│                                                                             │
│   ✗ No (fetch fails)               Same fallback, logged as warning         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Changing Category Order

To reorder categories in the navigation:

1. Open **Commerce Admin** → **Catalog** → **Categories**
2. Drag categories to desired order (or edit position numbers)
3. Save
4. **Clear browser sessionStorage** (categories are cached client-side)

The mesh returns the new order immediately—no code changes or deployments needed.

---

## Schema

The `BuildRight_Category` type includes position:

```graphql
type BuildRight_Category {
  slug: String!
  name: String!
  parentSlug: String
  path: String!
  productCount: Int
  position: Int       # From Commerce backend
}
```

---

## Quick Reference

| Field | Source | Purpose |
|-------|--------|---------|
| `slug` | ACO | URL identifier |
| `name` | ACO | Display name |
| `parentSlug` | ACO | Hierarchy |
| `position` | Commerce | Sort order |

---

## Related Documentation

- [Source Architecture](./source-architecture.md) - The three mesh sources
- [Mesh Resolvers](./mesh-resolvers.md) - Resolver overview
- [Backend Services](./backend-services.md) - ACO vs Commerce responsibilities
