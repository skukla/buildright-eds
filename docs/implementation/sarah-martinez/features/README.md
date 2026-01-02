# Sarah Implementation Features

**Status**: Phase 6A In Progress
**Purpose**: Feature specifications, wireframes, and product data for Sarah Martinez implementation

---

## Architecture Change Notice

The original Phase 6-Foundation planning (00-07 series) described a frontend `ProjectManager` service that was **never implemented**. The actual architecture uses:

- **Backend**: `buildright-service/mesh/resolvers-src/` - GraphQL resolvers for BOM, pricing, categories
- **Frontend**: `scripts/dashboards/template-dashboard.js` - Simple UI calling backend

For the business requirements extracted from that planning, see:
**[docs/explanations/buildright-requirements.md](../../../explanations/buildright-requirements.md)**

---

## Current Documentation

### Architecture

| Document | Purpose |
|----------|---------|
| [product-category-structure.md](./product-category-structure.md) | Unified vs. persona-per-catalog decision |
| [aco-catalog-data-flow.md](./aco-catalog-data-flow.md) | ACO + EDS implementation patterns |
| [bom-service-implementation.md](./bom-service-implementation.md) | BOM service architecture |
| [catalog-service-design.md](./catalog-service-design.md) | Catalog service design |

### Product Data

| Document | Purpose |
|----------|---------|
| [bom-calculation-formulas.md](./bom-calculation-formulas.md) | BOM calculation formulas |
| [product-data-improvements.md](./product-data-improvements.md) | Product enhancement strategy |
| [image-strategy.md](./image-strategy.md) | Image handling |

### Wireframes & Design

| Document | Purpose |
|----------|---------|
| [sarah-wireframes.md](./sarah-wireframes.md) | Final UI wireframes (visual selection pattern) |
| [visual-design-requirements.md](./visual-design-requirements.md) | Visual specifications |
| [ui-component-specs.md](./ui-component-specs.md) | Component details |
| [configurator-ui-design.md](./configurator-ui-design.md) | Configurator UI patterns |

### Implementation Plans

| Document | Purpose |
|----------|---------|
| [sarah-implementation-plan.md](./sarah-implementation-plan.md) | Current active plan |
| [bom-integration-architecture.md](./bom-integration-architecture.md) | Backend integration strategy |
| [sarah-persona-overview.md](./sarah-persona-overview.md) | Sarah persona details |

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

**Last Updated**: 2026-01-01
