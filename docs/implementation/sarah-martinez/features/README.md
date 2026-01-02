# Sarah Implementation Features

**Status**: Phase 6A In Progress
**Purpose**: Feature specifications, wireframes, and product data for Sarah Martinez implementation

---

## Directory Structure

```
features/
├── product-data/    # Product specifications, catalog structure, images
├── design/          # UI/UX wireframes, component specs, visual design
└── plans/           # Implementation plans, user flows, persona details
```

---

## Architecture Change Notice

The original Phase 6-Foundation planning (00-07 series) described a frontend `ProjectManager` service that was **never implemented**. The actual architecture uses:

- **Backend**: `buildright-service/mesh/resolvers-src/` - GraphQL resolvers for BOM, pricing, categories
- **Frontend**: `scripts/dashboards/template-dashboard.js` - Simple UI calling backend

For the business requirements extracted from that planning, see:
**[docs/explanations/buildright-requirements.md](../../../explanations/buildright-requirements.md)**

---

## Architecture

> **Relocated**: Architecture files moved to `docs/reference/backend/` per ADR-011 (reference = reusable technical specifications).
>
> See: [`docs/reference/backend/`](../../../reference/backend/) for:
> - `aco-catalog-data-flow.md` - ACO + EDS implementation patterns
> - `backend-services-analysis.md` - Backend service architecture analysis
> - `bom-calculation-formulas.md` - BOM calculation logic and formulas
> - `bom-integration-architecture.md` - BOM backend integration strategy
> - `bom-service-implementation.md` - BOM service implementation details
> - `catalog-service-design.md` - Catalog service design patterns

**Related ADR**: [ADR-013: Unified Product Taxonomy](../../../adr/ADR-013-unified-product-taxonomy.md)

---

## Product Data

Product specifications, catalog structure, and image handling.

| Document | Purpose |
|----------|---------|
| [aco-product-ingestion-status.md](./product-data/aco-product-ingestion-status.md) | ACO product ingestion status |
| [catalog-header-options.md](./product-data/catalog-header-options.md) | Catalog header configuration |
| [image-strategy.md](./product-data/image-strategy.md) | Product image handling strategy |
| [persona-product-mapping.md](./product-data/persona-product-mapping.md) | Persona to product category mapping |
| [product-category-structure.md](./product-data/product-category-structure.md) | Detailed taxonomy analysis (see ADR-013 for decision) |
| [product-data-improvements.md](./product-data/product-data-improvements.md) | Product enhancement strategy |
| [product-image-guidelines.md](./product-data/product-image-guidelines.md) | Image naming and quality guidelines |
| [product-variants-explained.md](./product-data/product-variants-explained.md) | Product variant architecture |

---

## Design

UI/UX wireframes, component specifications, and visual design.

| Document | Purpose |
|----------|---------|
| [configurator-ui-design.md](./design/configurator-ui-design.md) | Configurator UI patterns |
| [design-consistency-examples.md](./design/design-consistency-examples.md) | Design system consistency examples |
| [industry-context-alignment.md](./design/industry-context-alignment.md) | Industry context and alignment |
| [layout-standardization-plan.md](./design/layout-standardization-plan.md) | Layout standardization approach |
| [sarah-wireframes.md](./design/sarah-wireframes.md) | Final UI wireframes (visual selection pattern) |
| [ui-component-specs.md](./design/ui-component-specs.md) | Component specifications |
| [visual-design-requirements.md](./design/visual-design-requirements.md) | Visual design specifications |

---

## Plans

Implementation plans, user flows, and persona details.

| Document | Purpose |
|----------|---------|
| [implementation-approach.md](./plans/implementation-approach.md) | Overall implementation approach |
| [project-builder-patterns.md](./plans/project-builder-patterns.md) | Project builder UI patterns |
| [sarah-account-page.md](./plans/sarah-account-page.md) | Account page implementation |
| [sarah-dashboard-redesign.md](./plans/sarah-dashboard-redesign.md) | Dashboard redesign plan |
| [sarah-implementation-plan.md](./plans/sarah-implementation-plan.md) | Current active implementation plan |
| [sarah-integration-plan.md](./plans/sarah-integration-plan.md) | Service integration plan |
| [sarah-persona-overview.md](./plans/sarah-persona-overview.md) | Sarah persona details and requirements |
| [sarah-templates-and-orders.md](./plans/sarah-templates-and-orders.md) | Template and order management |
| [sarah-user-flows.md](./plans/sarah-user-flows.md) | User flow diagrams and descriptions |

---

## Archived

### Phase 6-Foundation (Obsolete Architecture)
Frontend `ProjectManager` docs that were never built → `docs/archive/phase-6-foundation-obsolete/`

### Sarah Completed Work
Completed summaries, audits, and superseded wireframes → `docs/archive/sarah-completed/`

Business requirements extracted to: **[docs/explanations/buildright-requirements.md](../../../explanations/buildright-requirements.md)**

---

## Implementation Reference

### Actual Backend Services

```
buildright-service/mesh/resolvers-src/
├── bom-from-template.js     # BOM generation (used by Sarah)
├── dropin-search.js         # Product grid queries
├── persona.js               # Pricing headers
├── categories.js            # Category tree
└── breadcrumbs.js           # Navigation
```

### Actual Frontend

```
buildright-eds/scripts/
├── dashboards/
│   └── template-dashboard.js  # Sarah's template browser
└── services/
    └── mesh-client.js         # GraphQL client
```

---

## See Also

- [Business Requirements](../../../explanations/buildright-requirements.md) - Scope, terminology
- [Backend Services](../../../explanations/backend-services.md) - How resolvers work
- [Mesh Adapters](../../../explanations/mesh-adapter.md) - Per-resolver documentation

---

**Last Updated**: 2026-01-02
