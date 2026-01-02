# Implementation Decisions

This folder contains detailed decision records for key implementation patterns and approaches.

---

## Available Documents

### Commerce Dropins

**[ADR-008-COMMERCE-DROPINS-DIRECT-CONNECTION.md](./ADR-008-COMMERCE-DROPINS-DIRECT-CONNECTION.md)** ⭐ **ARCHITECTURE DECISION**

**Decision**: Connect Commerce Dropins directly to Commerce, not through API Mesh

**Why**: 
- Best practice recommended by Adobe documentation
- Simpler architecture (no fetch adapter needed)
- Better performance (no extra mesh hop)
- Standard Dropins integration pattern

**Status**: Accepted (December 12, 2024)

**Key Sections**:
- Dual-endpoint architecture diagram
- Migration from fetch adapter approach
- Product synchronization requirements
- Benefits and trade-offs

**Related Docs**:
- **Pattern**: [standards/DROPIN-INTEGRATION-PATTERN.md](../../reference/standards/DROPIN-INTEGRATION-PATTERN.md)
- **Architecture**: [planning/quick-start/architecture-overview.md](../../planning/quick-start/architecture-overview.md)

---

**[AUTH-DROPIN-API-ONLY.md](./AUTH-DROPIN-API-ONLY.md)** ⭐ **CRITICAL DECISION**

**Decision**: Use Auth Dropin APIs directly without using UI containers

**Why**: 
- Auth Dropin has ZERO slots for form customization
- BuildRight requires pixel-perfect design matching
- API-only is Adobe's officially supported advanced pattern

**Status**: Accepted (December 11, 2024)

**Key Sections**:
- Decision rationale (why API-only is correct)
- Implementation approach (event sync, state management)
- What we must handle (5 key requirements)
- Testing strategy
- Upgrade path

**Related Docs**:
- **Pattern**: [standards/DROPIN-INTEGRATION-PATTERN.md](../../reference/standards/DROPIN-INTEGRATION-PATTERN.md)
- **Research**: [research/PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md](../research/PERPLEXITY-DROPIN-CUSTOMIZATION-RESEARCH.md)
- **Validation**: [research/RESEARCH-VALIDATION.md](../research/RESEARCH-VALIDATION.md)

---

## Decision Process

When making implementation decisions:

1. **Document WHY** - What problem are we solving?
2. **Research** - What do Adobe docs say? What are best practices?
3. **Validate** - Does this align with EDS and Commerce patterns?
4. **Document Trade-offs** - What are we gaining? What are we risking?
5. **Plan Testing** - How will we verify this works?
6. **Track Status** - Proposed → Accepted → Implemented

---

## Related Folders

- **[adr/](../../adr/)** - Architecture Decision Records (high-level architectural decisions)
- **[standards/](../../reference/standards/)** - Implementation standards and patterns
- **[research/](../research/)** - External research and validation

