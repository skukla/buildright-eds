# ADR-011: Documentation Category Structure

**Status**: Accepted

**Date**: 2026-01-01

**Decision Makers**: BuildRight Implementation Team

---

## Context

BuildRight's documentation grew organically to 270+ markdown files. Navigation became difficult:
- Session logs mixed with implementation guides
- Architectural decisions scattered across files
- No clear audience targeting
- Duplicate and conflicting information

### Key Requirements
1. Clear navigation for different audiences
2. Separation of concerns by document purpose
3. Minimal redundancy
4. Support for AI assistants and human developers

---

## Decision

**Organize documentation into 3 primary categories by audience and purpose:**

| Category | Audience | Purpose |
|----------|----------|---------|
| `docs/planning/` | AI/Dev | Implementation guides, task tracking, actionable checklists |
| `docs/adr/` | Dev/Architect | Architectural decisions, principles, rationale |
| `docs/explanations/` | Non-technical/Presentation | Visual diagrams, system overviews, how-it-works |

### Structure

```
docs/
├── planning/          # AI/Dev implementation guides
│   ├── INDEX.md
│   ├── phase-tracker.md
│   └── features/      # Consolidated feature plans
├── adr/               # Architecture decisions (existing)
│   └── README.md
├── explanations/      # Non-technical visual docs
│   ├── INDEX.md
│   └── *.md           # ASCII diagrams, system flows
├── archive/           # Historical reference (existing)
└── implementation/    # Detailed specs (reference)
```

### Explanation Docs Template

Each explanation doc follows this pattern:
- Title: "What It Does"
- ASCII diagram showing the flow
- Table summarizing components
- "See Also" linking to ADRs and related docs

---

## Consequences

### Positive
- Clear audience targeting per category
- Reduced cognitive load for navigation
- AI assistants can quickly find relevant context
- Visual docs support presentations and onboarding
- Planning docs use actionable checkbox format

### Negative
- Requires cross-referencing instead of self-contained docs
- Initial effort to consolidate and categorize
- Some duplication between planning (how) and explanation (what)

### Neutral
- Detailed specs remain in `implementation/` as reference
- Archive contains historical context for debugging

---

## Alternatives Considered

### 1. Flat Structure with Tags
- All docs in single directory with metadata tags
- Rejected: Hard to browse, requires search tool

### 2. Feature-Based Structure
- Organize by feature (auth/, cart/, catalog/)
- Rejected: Cross-cutting concerns don't fit, audience mixing

### 3. Timeline-Based Structure
- Organize by phase (phase-1/, phase-2/)
- Rejected: Hard to find current state, old phases clutter navigation

---

## Related Decisions

- [ADR-001](./ADR-001-use-dropins-for-commerce.md) - Dropin architecture decisions
- [ADR-007](./ADR-007-custom-sdk-dropins-for-aco.md) - ACO integration decisions

---

## Implementation Notes

Created in this restructure:
- `docs/planning/INDEX.md`
- `docs/planning/phase-tracker.md`
- `docs/planning/features/*.md` (5 consolidated files)
- `docs/explanations/INDEX.md`
- `docs/explanations/*.md` (5 visual explanation docs)
- `docs/CATEGORIZATION-MANIFEST.md`
