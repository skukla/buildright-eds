# ADR-009: Mesh Adapter Resolver Pattern

**Status**: Accepted

**Date**: December 2024

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight uses Adobe's pre-built dropin components (Product Discovery, PDP, etc.) for the storefront UI. These dropins make GraphQL queries to fetch product data.

### The Problem

Adobe dropins are designed to query Commerce Catalog Service or Live Search directly. BuildRight uses Adobe Commerce Optimizer (ACO) for its product catalog, which has a different data format and requires persona-based headers (AC-View-Id, AC-Price-Book-Id).

Without intervention:
- Dropins cannot be extended with custom BuildRight fields
- Business logic cannot be applied before dropins receive data
- Filter attributes (e.g., categoryPath) cannot be transformed to ACO-native format
- No centralized logging or debugging capability
- Persona headers cannot be injected programmatically

### Options Considered

1. **Direct ACO queries** - Let dropins query ACO directly via unprefixed source
2. **Custom dropins** - Replace Adobe dropins with custom implementations
3. **Mesh adapter resolvers** - Intercept dropin queries and route through extensibility layer

---

## Decision

**We use mesh adapter resolvers to intercept unprefixed dropin queries and route them through prefixed BuildRight_ sources for full extensibility control.**

### Key Architectural Elements

**Dual ACO Sources:**
| Source | Prefix | Purpose |
|--------|--------|---------|
| `ACO_Dropins` | None | Schema provider - types dropins expect |
| `ACO_BuildRight` | `BuildRight_` | Execution target - where queries run |

**Adapter Resolvers:**
| Resolver | Intercepts | Routes To |
|----------|------------|-----------|
| `dropin-search.js` | `productSearch` | `BuildRight_productSearch` |
| `dropin-pdp.js` | `products`, `refineProduct` | `BuildRight_products`, `BuildRight_refineProduct` |
| `dropin-metadata.js` | `attributeMetadata` | Filters sortable attributes |

### Query Flow

```
Adobe Product Discovery Dropin
         |
         | calls productSearch(phrase, filter, ...)
         v
+---------------------------+
|     dropin-search.js      |  <-- Intercepts for control
|     (Adapter Resolver)    |
+---------------------------+
         |
         | Routes through BuildRight_ source
         | - Transforms categoryPath filter
         | - Injects persona headers
         v
+---------------------------+
|     ACO_BuildRight        |  <-- Prefixed source
|     (BuildRight_ prefix)  |
+---------------------------+
         |
         | ACO API with AC-View-Id + AC-Price-Book-Id
         v
+---------------------------+
|     ACO Backend           |  <-- Returns pricing
+---------------------------+
         |
         v
+---------------------------+
|     dropin-search.js      |  <-- Transform response
|     - Strip BuildRight_ prefix from __typename
|     - BuildRight_SimpleProductView -> SimpleProductView
+---------------------------+
         |
         v
Adobe Product Discovery Dropin (displays products with prices)
```

### Filter Transformation (Critical)

The adapter transforms dropin filter attributes to ACO-native format:

```javascript
// dropin-search.js transformDropinFilter()
if (attribute === 'categoryPath') {
  const segments = value.split('/');
  if (segments.length === 1) {
    return { attribute: 'category', value };     // Top-level
  } else {
    return { attribute: 'subcategory', value: segments[segments.length - 1] };  // Nested
  }
}
```

This enables category context preservation when users click facets.

---

## Consequences

### Positive Outcomes

**Full Extensibility Control**
- Can add custom BuildRight fields to product responses
- Business rules applied centrally before dropins receive data
- Single point for logging and debugging all commerce queries

**Dropin Compatibility**
- Adobe dropins work unmodified (receive expected schema)
- Response transformation handles __typename normalization
- Filter transformation enables category context preservation

**Separation of Concerns**
- Dropins handle UI rendering
- Mesh handles data orchestration and business logic
- Clear boundary between frontend and backend responsibilities

### Negative Outcomes

**Added Complexity**
- Two ACO sources to understand and maintain
- __typename transformation logic required
- Filter transformation adds cognitive overhead

**Performance Considerations**
- Additional resolver execution per query
- Small latency added by routing layer
- Selection set parsing adds minimal overhead

---

## Alternatives Rejected

### Alternative 1: Direct ACO Queries (No Adapter)

**Approach**: Configure dropins to query ACO directly via unprefixed source.

**Pros**:
- Simpler architecture (one source)
- No resolver maintenance
- Direct query path

**Cons**:
- No extensibility hooks for custom fields
- Cannot transform filters (categoryPath issue)
- No centralized business logic layer
- Harder to debug (no logging interception)

**Why Rejected**: Loses all programmatic control. The categoryPath transformation alone justifies the adapter pattern.

### Alternative 2: Custom Dropins Only (ADR-007)

**Approach**: Replace all Adobe dropins with custom BuildRight dropins.

**Pros**:
- Full control over everything
- No need for adapters
- Direct ACO queries

**Cons**:
- Significant development effort
- Lose Adobe dropin updates and improvements
- Must maintain all UI components

**Why Rejected**: The hybrid approach (Commerce dropins + adapters) provides the best balance of control and maintainability.

### Alternative 3: Fork Adobe Dropins

**Approach**: Copy dropin source and modify to query ACO.

**Pros**:
- Start with working code
- Can customize everything

**Cons**:
- Cannot receive upstream updates
- Maintenance burden for all changes
- ACO API differs from Commerce Catalog Service

**Why Rejected**: Unmaintainable long-term as Adobe evolves their dropins.

---

## Implementation

**Resolver Location**: `buildright-service/mesh/resolvers-src/`

**Key Files**:
- `dropin-search.js` - ProductSearch adapter
- `dropin-pdp.js` - PDP adapter
- `dropin-metadata.js` - Metadata/SortBy adapter

**Selection Set Pattern** (must use prefixed types):
```javascript
const PRODUCT_SEARCH_SELECTION = `{
  items {
    productView {
      __typename
      sku
      name
      ... on BuildRight_SimpleProductView {
        price { final { amount { value currency } } }
      }
    }
  }
  facets {
    attribute
    buckets {
      ... on BuildRight_ScalarBucket { count id title }
    }
  }
}`;
```

**Response Transformation**:
```javascript
function transformToNativeSchema(items) {
  return items.map(item => ({
    ...item,
    productView: {
      ...item.productView,
      __typename: item.productView.__typename.replace('BuildRight_', '')
    }
  }));
}
```

---

## Related Decisions

- [ADR-001: Use Dropins for Commerce Functions](./ADR-001-use-dropins-for-commerce.md) - Commerce dropins for auth/cart/checkout
- [ADR-007: Custom SDK Dropins for ACO](./ADR-007-custom-sdk-dropins-for-aco.md) - Custom dropins where adapters insufficient
- [ADR-010: Dropin Slot Customization Pattern](./ADR-010-dropin-slot-customization-pattern.md) - Frontend customization of dropins

---

## References

- [buildright-service/mesh/README.md](../../buildright-service/mesh/README.md) - Detailed implementation
- [dropin-architecture.md](../dropin-architecture.md) - Query flow diagrams
- [Adobe API Mesh Programmatic Resolvers](https://developer.adobe.com/graphql-mesh-gateway/mesh/advanced/extend/resolvers/programmatic-resolvers/)

---

**Last Updated**: December 2024
