# Planning Documents

**Audience:** AI/Dev
**Purpose:** Implementation guides, task tracking, actionable checklists

---

## Quick Links

| Doc | Purpose |
|-----|---------|
| [phase-tracker.md](./phase-tracker.md) | Current phase status and remaining tasks |
| [master-implementation-plan.md](./master-implementation-plan.md) | Authoritative project plan |

---

## Feature Plans

Consolidated actionable guides per feature area:

| Feature | Status | File |
|---------|--------|------|
| Commerce Dropins | 70% | [features/commerce-dropins.md](./features/commerce-dropins.md) |
| Sarah Dashboard | 40% | [features/sarah-dashboard.md](./features/sarah-dashboard.md) |
| Shared Backend Services | Production | [features/shared-backend-services.md](./features/shared-backend-services.md) |
| Catalog/ACO | Working | [features/catalog-aco.md](./features/catalog-aco.md) |
| Product Data | Working | [features/product-data.md](./features/product-data.md) |

---

## Backend Architecture

All personas share backend services from `buildright-service`:

| Resolver | Purpose | Doc |
|----------|---------|-----|
| `bom-from-template.js` | BOM generation | [shared-backend-services.md](./features/shared-backend-services.md) |
| `dropin-search.js` | Product grid queries | [../explanations/backend-services.md](../explanations/backend-services.md) |
| `persona.js` | Pricing headers | [../explanations/backend-services.md](../explanations/backend-services.md) |

---

## Detailed Specs (Reference)

For deep-dive specifications, see source directories:

| Area | Location | Status |
|------|----------|--------|
| Sarah E2E Features | `docs/implementation/sarah-martinez/features/` | See note below |
| Dropin Integration | `docs/implementation/sarah-martinez/dropins/` | Active |
| Other Personas | `docs/implementation/other-personas/` | Planned |
| Completed Phases | `docs/archive/completed/` | Historical |

> **Note:** Phase 6-Foundation planning docs (00-07 series) describing a frontend ProjectManager have been archived to `docs/archive/phase-6-foundation-obsolete/`. Business requirements were consolidated to [buildright-requirements.md](../explanations/buildright-requirements.md).

---

**Navigation:**
- [← Back to Docs](../README.md)
- [ADRs](../adr/README.md)
- [Explanations](../explanations/index.md)
