# Technical Reference

**Audience**: Developers, implementation engineers
**Purpose**: Code examples, API specifications, implementation details

---

## Overview

This directory contains developer-focused technical documentation with:
- Code examples and patterns
- API specifications
- Configuration references
- Implementation details

**Looking for high-level explanations?** See [docs/explanations/](../explanations/) for visual documentation aimed at technical consultants and architects.

---

## Directory Structure

```
reference/
├── Dropins                        # Adobe dropin integration
│   ├── dropin-architecture.md     # Canonical dropin reference (containers, slots)
│   ├── dropin-integration-reference.md   # Configuration and patterns
│   ├── dropin-slots-inventory.md  # Complete slot catalog
│   ├── dropin-styling-comparison.md      # CSS override strategies
│   ├── slot-method-limitations.md # Known slot API limitations
│   └── dropins/                   # Per-dropin technical details
│       └── dropin-pattern.md      # Slot customization code examples
│
├── Mesh                           # API Mesh layer
│   └── mesh/
│       ├── mesh-resolvers.md      # Complete resolver catalog
│       ├── product-query-flows.md # Dropin vs custom query paths
│       └── backend-services.md    # Shared service architecture
│
├── Backend                        # Backend services
│   ├── backend-service-reference.md   # Service overview
│   └── backend/                   # Per-service documentation
│
├── Standards                      # Code standards
│   └── standards/                 # CSS, JS, accessibility standards
│
├── Authoring                      # Content authoring
│   └── authoring/                 # EDS authoring patterns
│
└── Deployment                     # Deployment configuration
    └── deployment/                # Environment setup
```

---

## Quick Links by Topic

### Dropins (Adobe Commerce UI Components)

| Document | Purpose |
|----------|---------|
| [dropin-architecture.md](./dropin-architecture.md) | **Canonical reference** - dropin hierarchy, integration pattern |
| [dropin-integration-reference.md](./dropin-integration-reference.md) | Configuration options, slot patterns |
| [dropin-slots-inventory.md](./dropin-slots-inventory.md) | Complete slot catalog by dropin |
| [dropin-styling-comparison.md](./dropin-styling-comparison.md) | CSS override strategies comparison |
| [slot-method-limitations.md](./slot-method-limitations.md) | Known issues and workarounds |
| [dropins/dropin-pattern.md](./dropins/dropin-pattern.md) | Slot customization code examples |

### Mesh (API Layer)

| Document | Purpose |
|----------|---------|
| [mesh/mesh-resolvers.md](./mesh/mesh-resolvers.md) | Complete resolver catalog with code examples |
| [mesh/product-query-flows.md](./mesh/product-query-flows.md) | Dropin vs custom query comparison |
| [mesh/backend-services.md](./mesh/backend-services.md) | Shared backend architecture |

### Backend Services

| Document | Purpose |
|----------|---------|
| [backend-service-reference.md](./backend-service-reference.md) | Service overview and endpoints |
| [backend/](./backend/) | Per-service technical documentation |

---

## Code Example: Slot Customization

```javascript
// blocks/product-list/product-list.js
import { SearchResults } from '@dropins/storefront-product-discovery/containers';

SearchResults.render(container, {
  slots: {
    ProductCardPrice: (ctx) => {
      const el = document.createElement('div');
      el.className = 'buildright-price';
      el.textContent = formatPrice(ctx.product.price);
      ctx.replaceWith(el);  // Replace Adobe default with BuildRight styling
    }
  }
});
```

## Code Example: Mesh Resolver

```javascript
// mesh/resolvers-src/dropin-plp.js
export async function productSearch(args, context) {
  // 1. Validate inputs
  const pageSize = Math.min(args.page_size || 20, 100);

  // 2. Transform for ACO
  const filter = {
    ...args.filter,
    subcategory: extractSubcategory(args.filter?.categoryPath)
  };

  // 3. Delegate to ACO
  const result = await context.ACO_BuildRight.Query.BuildRight_productSearch({
    ...args,
    filter,
    page_size: pageSize
  });

  // 4. Strip type prefixes for dropin compatibility
  return stripBuildRightPrefix(result);
}
```

---

## Related Documentation

- [Explanations](../explanations/) - Visual docs for technical consultants
- [ADRs](../adr/) - Architecture Decision Records
- [Planning](../planning/) - Implementation plans and roadmaps
- [blocks/CLAUDE.md](../../blocks/CLAUDE.md) - Block inventory (29 blocks)
- [scripts/CLAUDE.md](../../scripts/CLAUDE.md) - Service layer documentation

---

**Navigation:**
- [← Back to Docs](../README.md)
- [Explanations](../explanations/index.md) (for non-developers)
- [ADRs](../adr/README.md)
