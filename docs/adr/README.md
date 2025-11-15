# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records (ADRs) for the BuildRight EDS persona-driven implementation.

## What is an ADR?

An Architecture Decision Record (ADR) captures an important architectural decision made during the project, along with its context, consequences, and alternatives considered.

## Index of ADRs

| ADR | Title | Status | Date |
|-----|-------|--------|------|
| [ADR-001](./ADR-001-use-dropins-for-commerce.md) | Use Adobe Commerce Dropins for Core Commerce Functions | Accepted | 2024-11-15 |
| [ADR-002](./ADR-002-use-eds-blocks-for-content.md) | Use EDS Blocks for Content-Driven Components | Accepted | 2024-11-15 |
| [ADR-003](./ADR-003-mock-aco-service.md) | Mock ACO Service with CCDM Simulation | Accepted | 2024-11-15 |
| [ADR-004](./ADR-004-custom-attributes-for-personas.md) | Use Custom Attributes for Persona Assignment | Accepted | 2024-11-15 |
| [ADR-005](./ADR-005-dual-mode-authentication.md) | Dual-Mode Authentication (Demo + Production) | Accepted | 2024-11-15 |

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

- [Phase 0: Research & Architecture Decisions](../PHASE-0-RESEARCH-AND-DECISIONS.md)
- [Dropin Architecture](../DROPIN-ARCHITECTURE.md)
- [Block vs Dropin Matrix](../BLOCK-VS-DROPIN-MATRIX.md)
- [Mock ACO API Spec](../MOCK-ACO-API-SPEC.md)
- [Authentication Strategy](../AUTH-STRATEGY.md)

---

**Last Updated**: November 15, 2024

