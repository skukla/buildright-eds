# Backend Reference Documentation

**Status**: Active Reference
**Purpose**: Backend architecture, data flows, and service specifications

---

## Overview

This folder contains technical reference documentation for backend services, data flows, and integration patterns. These documents describe reusable patterns applicable across the project.

---

## Architecture & Data Flow

| Document | Purpose |
|----------|---------|
| [aco-catalog-data-flow.md](./aco-catalog-data-flow.md) | ACO + EDS implementation patterns |
| [aco-commerce-relationship.md](./aco-commerce-relationship.md) | Commerce ↔ ACO catalog sync architecture |
| [backend-services-analysis.md](./backend-services-analysis.md) | Backend service architecture analysis |
| [catalog-service-design.md](./catalog-service-design.md) | Catalog service design patterns |
| [product-data-flow.md](./product-data-flow.md) | Product data journey from Commerce to EDS |
| [product-record-diagram.md](./product-record-diagram.md) | Product record structure visualization |
| [product-record-flow.md](./product-record-flow.md) | Product record creation workflow |

---

## BOM (Bill of Materials)

| Document | Purpose |
|----------|---------|
| [bom-calculation-formulas.md](./bom-calculation-formulas.md) | BOM calculation logic and formulas |
| [bom-integration-architecture.md](./bom-integration-architecture.md) | BOM backend integration strategy |
| [bom-service-implementation.md](./bom-service-implementation.md) | BOM service implementation details |

---

## ACO Reference

| Document | Purpose |
|----------|---------|
| [aco-feed-table-reference.md](./aco-feed-table-reference.md) | ACO feed table structure and fields |

---

## Additional Reference

| Document | Purpose |
|----------|---------|
| [data-source-comparison.md](./data-source-comparison.md) | Commerce vs ACO data source comparison |
| [eds-block-structure.md](./eds-block-structure.md) | EDS block patterns and conventions |

---

## Archived

The following files have been archived to `docs/archive/completed/`:
- `block-vs-dropin-decision.md` → Superseded by [ADR-014](../../adr/ADR-014-eds-blocks-vs-dropins.md)
- `aco-pricing-headers.md` → ACO pricing header documentation (reference only)
- `ADR-015-dynamic-pricing-rules.md` → Archived (documented ACO architecture, not a project decision)

---

## Related Documentation

- **ADRs**: [docs/adr/](../../adr/) - Architecture Decision Records
- **Explanations**: [docs/explanations/](../../explanations/) - Visual guides and overviews
- **Standards**: [docs/reference/standards/](../standards/) - Code standards and patterns

---

**Last Updated**: 2026-01-02
