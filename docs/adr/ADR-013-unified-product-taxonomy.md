# ADR-013: Unified Product Taxonomy

**Date**: 2025-11-15 (original analysis)
**Status**: Accepted
**Impact**: High - Affects entire BuildRight data architecture

---

## Context

BuildRight has 5 distinct personas (Sarah, Marcus, Lisa, David, Kevin) with different mental models for organizing materials. The question: Should we use unified taxonomy or separate catalogs per persona?

## Decision

**Use unified multi-level taxonomy** (one catalog for all personas) with attribute-based filtering.

## Options Considered

### Option A: Unified Multi-Level Taxonomy (Chosen)
Single catalog with rich attributes, persona-specific views via filtering.

### Option B: Catalog-Per-Persona
5 separate ACO catalogs, each optimized for one persona.

## Rationale

**Why Unified:**

1. **Reflects Reality**: BuildRight is one materials supplier with one inventory
2. **Demonstrates ACO's Strength**: Attribute-based filtering showcases ACO's core value
3. **Maintainable**: Update product once, available to all personas
4. **Scalable**: Add personas without duplicating catalogs
5. **Cross-Persona Features**: Marcus can use Sarah's templates

**Why Not Separate Catalogs:**

- Same product duplicated 4-5 times
- Price/image updates must happen 4-5 times
- Demonstrates data silos, not flexible commerce
- Add 6th persona = create 6th catalog

## Implementation

### Attribute Schema

```javascript
// Construction Context
construction_phase: ['foundation_framing', 'envelope', 'interior_finish']
quality_tier: ['builder_grade', 'professional', 'premium', 'luxury']
package_tier: ['good', 'better', 'best']

// Persona-Specific
selection_category: ['windows', 'doors', 'roofing', ...] // Sarah
room_category: ['bathroom', 'kitchen', ...] // Lisa
project_type: ['deck', 'fence', ...] // David
store_velocity_category: ['high', 'medium', 'low'] // Kevin
```

### Persona Catalog Views

| Persona | Default Filter | Category View | Products |
|---------|----------------|---------------|----------|
| Sarah | construction_phase | By phase | ~150 |
| Marcus | construction_phase | Traditional categories | ~300 |
| Lisa | room_category | By room | ~200 |
| David | project_type | By project | ~100 |
| Kevin | (all) | By velocity | ~500 |

## Consequences

**Positive:**
- Single source of truth for products
- Consistent SKUs across personas
- Easier to add new products and personas

**Negative:**
- Every product needs 15-20 attributes
- Requires discipline in attribute tagging
- Need efficient ACO queries for filtering

## Validation

Phase 0.5 product expansion (108 → 265 products) successfully used this taxonomy with no schema modifications needed.

## Related

- **Full Analysis**: [implementation/sarah-martinez/features/product-data/product-category-structure.md](../implementation/sarah-martinez/features/product-data/product-category-structure.md)
- **ADR-004**: Custom Attributes for Personas
- **ADR-009**: Mesh Adapter Resolver Pattern

---

**Last Updated**: 2026-01-02
