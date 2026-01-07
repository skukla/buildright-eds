# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the BuildRight EDS persona-driven implementation.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made during the project, along with its context, consequences, and alternatives considered.

## Index of ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-use-dropins-for-commerce.md) | Use Adobe Commerce Dropins for Core Commerce Functions | Accepted | 2025-11-15 |
| [ADR-002](./ADR-002-use-eds-blocks-for-content.md) | Use EDS Blocks for Content-Driven Components | Accepted | 2025-11-15 |
| [ADR-004](./ADR-004-persona-assignment-strategy.md) | Persona Assignment Strategy (via Persona Service) | Accepted | 2025-11-15 |
| [ADR-007](./ADR-007-aco-catalog-integration-strategy.md) | ACO Catalog Integration Strategy | Accepted | 2025-12 |
| [ADR-008](./ADR-008-dropin-css-refactoring-strategy.md) | Dropin CSS Refactoring Strategy | Implemented | 2025-12-24 |
| [ADR-009](./ADR-009-mesh-adapter-resolver-pattern.md) | Mesh Adapter Resolver Pattern | Accepted | 2025-12-31 |
| [ADR-010](./ADR-010-dropin-slot-customization-pattern.md) | Dropin Slot Customization Pattern | Accepted | 2025-12-31 |
| [ADR-011](./ADR-011-documentation-category-structure.md) | Documentation Category Structure | Accepted | 2026-01-01 |
| [ADR-012](./ADR-012-commerce-dropins-direct-connection.md) | Commerce Dropins Direct Connection Pattern | Accepted | 2025-12-12 |
| [ADR-013](./ADR-013-unified-product-taxonomy.md) | Unified Product Taxonomy | Accepted | 2025-11-15 |
| [ADR-014](./ADR-014-eds-blocks-vs-dropins.md) | EDS Blocks vs Dropins Decision Framework | Accepted | 2026-01-02 |
| [ADR-015](./ADR-015-parallel-dynamic-imports.md) | Parallel Dynamic Imports | Accepted | 2026-01-03 |
| [ADR-016](./ADR-016-navigation-category-architecture.md) | Navigation Category Architecture | Accepted | 2026-01-04 |
| [ADR-017](./ADR-017-dropin-loading-performance.md) | Dropin Loading Performance | Accepted | 2026-01-04 |
| [ADR-018](./ADR-018-mesh-based-persona-authentication.md) | Mesh-Based Persona Authentication | Accepted | 2026-01-05 |
| [ADR-019](./ADR-019-attribute-visibility-pattern.md) | Attribute Visibility Pattern | Accepted | 2026-01-06 |
| [ADR-020](./ADR-020-user-context-initialization-pattern.md) | User Context Initialization Pattern | Accepted | 2026-01-07 |
| [ADR-021](./ADR-021-inline-header-for-instant-visibility.md) | Inline Header HTML for Instant Visibility | Accepted | 2026-01-07 |

## Archived ADRs

These ADRs documented approaches that were used during development but have been superseded:

| ADR | Title | Status | Archived |
|-----|-------|--------|----------|
| [ADR-003](../archive/ADR-003-mock-aco-service.md) | Mock ACO Service | Superseded by real API Mesh → ACO | 2026-01 |
| [ADR-005](../archive/ADR-005-dual-mode-authentication.md) | Dual-Mode Authentication | Superseded by Commerce Dropins | 2026-01 |

## ADR Status Definitions

- **Proposed**: Under consideration, not yet approved
- **Accepted**: Approved and currently in use
- **Deprecated**: No longer relevant, but kept for historical context
- **Superseded by ADR-XXX**: Replaced by a newer decision

## How to Use This Directory

1. **When implementing**: Review relevant ADRs to understand architectural decisions
2. **When proposing changes**: Check if an existing ADR covers the area
3. **When making new decisions**: Create a new ADR using the template
4. **When learning the system**: Read ADRs to understand the "why" behind the architecture

## ADR Template

```markdown
# ADR-XXX: [Decision Title]

**Status**: Proposed | Accepted | Deprecated | Superseded by ADR-XXX

**Date**: YYYY-MM-DD

**Context**: 
What is the issue we're facing? What factors are influencing this decision?

**Decision**: 
What did we decide to do?

**Consequences**: 
What are the positive and negative outcomes?

**Alternatives Considered**:
- Option 1: Why we didn't choose this
- Option 2: Why we didn't choose this

**Related Decisions**:
- Links to related ADRs
```

## Related Documentation

- [Phase 0: Research & Architecture Decisions](../archive/completed/phase-0-research-and-decisions.md)
- [Dropin Architecture](../reference/dropin-architecture.md)
- [Block vs Dropin Matrix](../reference/backend/block-vs-dropin-decision.md)
- [Mock ACO API Spec](../archive/reference-old/mock-aco-api-spec.md)
- [Authentication Strategy](../archive/reference-old/auth-strategy.md)

---

**Last Updated**: January 7, 2026 (Added ADR-021: Inline Header for Instant Visibility)

