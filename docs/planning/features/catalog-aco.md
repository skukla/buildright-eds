# Catalog & ACO Integration

**Status:** Mostly Complete

---

## What It Is

Product catalog powered by Adobe Commerce Optimizer (ACO) with:
- Persona-based catalog views
- Tier pricing per price book
- Category navigation
- Product search and filtering

---

## Current State

| Component | Status |
|-----------|--------|
| ACO Products | Working |
| API Mesh routing | Working |
| Persona headers (AC-View-Id) | Working |
| Catalog page | Working (dropin) |
| Category routing | Working |

---

## Remaining Tasks

- [ ] Custom SDK dropin for ACO products (Phase 7)
- [ ] Improve category breadcrumb UX
- [ ] Add facet persistence across navigation

---

## Architecture

```
Browser → API Mesh → ACO
           ↓
    Headers injected:
    - AC-View-Id: [persona UUID]
    - AC-Price-Book-Id: [tier ID]
```

---

## Key Files

```
blocks/product-list/product-list.js - Catalog dropin block
scripts/services/catalog-service.js - ACO queries (648 lines)
mesh/resolvers-src/dropin-search.js - Query adapter
```

---

## Detailed Specs

Source: `docs/implementation/sarah-martinez/features/`
- `aco-catalog-data-flow.md`
- `catalog-service-design.md`
- `bom-integration-architecture.md`

---

**See Also:** `docs/explanations/CATALOG-FLOW.md` | `docs/explanations/MESH-ADAPTER.md`
