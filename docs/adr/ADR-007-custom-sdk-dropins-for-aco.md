# ADR-007: Custom SDK Dropins for ACO-Sourced Components

**Status**: Partially Implemented (Pragmatically Revised)

**Date**: December 2024

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight uses Adobe Commerce Optimizer (ACO) for its product catalog, while Adobe Commerce PaaS handles customer management, cart, and orders. This creates a hybrid data architecture.

Adobe provides native Commerce Dropins for product display:
- `@dropins/storefront-product-discovery` — Product search and listing
- `@dropins/storefront-pdp` — Product detail pages

However, these dropins are **hardcoded to Commerce data sources**:
- Product Discovery uses **Live Search** (Commerce)
- PDP uses **Commerce Catalog Service**

BuildRight products live in **ACO**, not Commerce. The native dropins cannot query ACO — they don't know it exists.

### Options Considered

1. **Plain EDS blocks** — Custom HTML/CSS/JS blocks for product display
2. **Custom SDK dropins** — Use the Drop-in SDK to build ACO-connected dropins
3. **Fork native dropins** — Modify Commerce dropins to query ACO

---

## Decision

**We will create custom dropins using the Adobe Commerce Storefront SDK for all ACO-sourced components.**

### Custom Dropins to Create

| Dropin | Replaces | Purpose |
|--------|----------|---------|
| `@buildright/product-discovery` | `blocks/product-grid/`, `blocks/filters-sidebar/` | Product listing with ACO search |
| `@buildright/product-detail` | `pages/product-detail.html` | PDP with persona-based pricing |
| `@buildright/project-builder` | `blocks/project-builder/` | BOM wizard |
| `@buildright/pricing-display` | `blocks/pricing-display/` | Tiered pricing display |
| `@buildright/tier-badge` | `blocks/tier-badge/` | Customer tier indicator |

### SDK Features Used

The [Drop-in SDK](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/) provides:

| Feature | Benefit |
|---------|---------|
| **Design Tokens** | Shared CSS variables — automatic visual consistency with Commerce dropins |
| **UI Components** | 30+ pre-built components: `Button`, `Card`, `Price`, `ProductItemCard`, `Skeleton`, etc. |
| **Event Bus** | Standard `events.emit()` / `events.on()` — interoperates with Commerce dropins |
| **Slots** | Extension points without forking |
| **CLI** | `npx elsie generate container --pathname <name>` for scaffolding |

---

## Implementation Status (December 2024 Update)

**This section documents divergence between the original decision and actual implementation.**

### What Changed

The original decision proposed creating custom SDK dropins for ACO-sourced components. During implementation, a more pragmatic approach emerged:

| Component | Original Proposal | Actual Implementation | Rationale |
|-----------|-------------------|----------------------|-----------|
| Product Discovery | Custom SDK dropin (`@buildright/product-discovery`) | Native Adobe Product Discovery dropin | Works with ACO when mesh adapters provide correct headers (`AC-View-Id`, `AC-Price-Book-Id`) |
| Product Detail | Custom SDK dropin (`@buildright/product-detail`) | Planned: Native PDP dropin + slots | Same header-based approach expected to work |
| Project Builder | Custom SDK dropin (`@buildright/project-builder`) | EDS block (`blocks/project-builder/`) | BuildRight-specific; no cross-site reuse needed |
| Pricing Display | Custom SDK dropin (`@buildright/pricing-display`) | EDS block (`blocks/pricing-display/`) | Simple component; SDK overhead unnecessary |
| Tier Badge | Custom SDK dropin (`@buildright/tier-badge`) | EDS block (`blocks/tier-badge/`) | Simple component; SDK overhead unnecessary |

### Why This Divergence is Valid

1. **Native Dropins Work with ACO**: The mesh adapter pattern (see `buildright-service/mesh/README.md`) allows native Commerce dropins to query ACO by injecting proper headers. This eliminated the need for custom product discovery.

2. **EDS Blocks are Simpler**: For BuildRight-specific components (project builder, pricing, tier badge), EDS blocks per ADR-002 are more appropriate. These components are content-driven and don't benefit from SDK features like design tokens or event bus interoperability.

3. **SDK Dropins Still Valuable For**: Any future components that need to be published as reusable NPM packages or require deep integration with Commerce dropin ecosystem.

### Decision Matrix Update

| Use Case | Recommended Approach |
|----------|---------------------|
| Commerce functions (auth, cart, checkout) | Native Commerce Dropins |
| ACO product listing/search | Native Product Discovery Dropin + mesh adapters |
| BuildRight-specific wizards/dashboards | EDS Blocks (per ADR-002) |
| Reusable cross-site components | Custom SDK Dropins (original ADR-007) |

### Status of Original Proposed Dropins

- [x] `@buildright/product-discovery` - **Not needed** - native dropin works
- [ ] `@buildright/product-detail` - **Deferred** - evaluating native PDP first
- [x] `@buildright/project-builder` - **Implemented as EDS block**
- [x] `@buildright/pricing-display` - **Implemented as EDS block**
- [x] `@buildright/tier-badge` - **Implemented as EDS block**

---

## Consequences

### Positive Outcomes

**Visual Consistency**
- Custom dropins use the same design tokens as Commerce dropins
- Unified look and feel across ACO and Commerce components
- Professional appearance without custom styling effort

**Behavioral Consistency**
- Standard event bus enables communication between Commerce and custom dropins
- Auth Dropin events can trigger catalog refresh in custom dropins
- Cart Dropin can receive add-to-cart from custom PDP

**Maintainability**
- SDK provides standard patterns and utilities
- Updates to SDK benefit all dropins
- Reusable component library

**Extensibility**
- Slots system allows customization without forking
- Can publish as NPM packages for reuse

### Negative Outcomes

**Development Effort**
- Must build and maintain custom dropins
- Learning curve for SDK patterns
- More initial work than plain blocks

**SDK Dependency**
- Tied to Adobe's SDK release cycle
- Must update when SDK changes
- Cannot easily switch to different architecture

---

## Alternatives Rejected

### Alternative 1: Plain EDS Blocks (Keep Current Approach)

**Approach**: Continue using custom HTML/CSS/JS blocks for product display.

**Pros**:
- Already working
- No additional dependencies
- Full control over implementation

**Cons**:
- Inconsistent styling with Commerce dropins
- Custom event patterns don't interoperate
- No design token sharing
- Manual maintenance of all patterns

**Why Rejected**: Creates visual and behavioral inconsistency between ACO and Commerce components. As we add more Commerce dropins, the gap widens.

### Alternative 2: Fork Native Commerce Dropins

**Approach**: Clone Commerce dropins and modify to query ACO instead of Commerce.

**Pros**:
- Start with working code
- Maintain feature parity with Commerce
- Same patterns as native dropins

**Cons**:
- Significant modification required (different data models)
- Cannot receive upstream updates
- Maintenance burden for all changes
- ACO API shape differs from Commerce Catalog Service

**Why Rejected**: ACO's API shape differs significantly from Commerce Catalog Service. The forked code would diverge immediately and become unmaintainable.

### Alternative 3: Wrap Native Dropins with Data Adapter

**Approach**: Create an adapter layer that translates ACO data to Commerce format, then use native dropins.

**Pros**:
- Use native dropins unchanged
- Adapter isolates translation logic
- Could receive upstream updates

**Cons**:
- ACO data model doesn't map cleanly to Commerce
- Performance overhead from translation
- Some ACO features (persona pricing) have no Commerce equivalent
- Adapter complexity would grow over time

**Why Rejected**: The data models are too different. ACO has persona-based pricing and catalog views that have no Commerce equivalent. The adapter would become a complex translation layer.

---

## Implementation

### Directory Structure

```
scripts/dropins/
├── product-discovery/
│   ├── api.js              # Public API
│   ├── render.js           # Rendering utilities
│   ├── index.js            # Entry point
│   ├── containers/
│   │   ├── ProductList.js
│   │   ├── Facets.js
│   │   └── SearchBar.js
│   └── styles/
│       └── product-discovery.css
├── product-detail/
│   ├── containers/
│   │   ├── ProductDetail.js
│   │   ├── ProductGallery.js
│   │   └── PersonaPricing.js
│   └── styles/
└── project-builder/
    ├── containers/
    │   ├── ProjectWizard.js
    │   ├── BOMPreview.js
    │   └── PhaseSelector.js
    └── styles/
```

### Example: Product List Container

```javascript
// scripts/dropins/product-discovery/containers/ProductList.js
import { ProductItemCard, Skeleton, Pagination } from '@dropins/tools/components.js';
import { events } from '@dropins/tools/event-bus.js';
import { catalogService } from '../../../services/catalog-service.js';

export const ProductList = async (props) => {
  const { pageSize = 20, routeProduct, routeAddToCart } = props;
  
  // Standard SDK event patterns
  events.on('search/query', async (query) => {
    const results = await catalogService.searchProducts(query);
    renderProducts(results);
  });
  
  // SDK components for consistency
  const renderProducts = (results) => {
    return results.items.map(product => 
      ProductItemCard({
        sku: product.sku,
        name: product.name,
        price: { value: product.price.value, currency: 'USD' },
        image: { url: product.imageUrl, label: product.name },
        onClick: () => routeProduct(product),
        onAddToCart: () => routeAddToCart(product.sku)
      })
    );
  };
};
```

### Event Integration with Commerce Dropins

```javascript
// Custom dropin emits standard events
events.emit('product/add-to-cart', { sku: 'ABC-123', quantity: 1 });

// Commerce Cart dropin listens and handles
// (automatic via event bus)
```

---

## Related Decisions

- [ADR-001: Use Dropins for Commerce Functions](./ADR-001-use-dropins-for-commerce.md) — Commerce Dropins for auth/cart/checkout
- [ADR-002: Use EDS Blocks for Content-Driven Components](./ADR-002-use-eds-blocks-for-content.md) — Why EDS blocks are used for project-builder, pricing-display, tier-badge
- [master-implementation-plan.md](../master-implementation-plan.md) — Overall implementation plan

---

## References

- [Adobe Commerce Storefront SDK Documentation](https://experienceleague.adobe.com/developer/commerce/storefront/sdk/)
- [codebase-audit-dropins.md](../implementation/sarah-end-to-end/dropins/codebase-audit-dropins.md) — Detailed migration plan

---

**Last Updated**: December 2024 (Implementation Status section added)

