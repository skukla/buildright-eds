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

**Organize documentation into 4 primary categories by audience and purpose:**

| Category | Audience | Purpose |
|----------|----------|---------|
| `docs/planning/` | AI/Dev | Implementation guides, task tracking, actionable checklists |
| `docs/adr/` | Dev/Architect | Architectural decisions, principles, rationale |
| `docs/explanations/` | Non-technical/Presentation | Visual diagrams, system overviews, how-it-works |
| `docs/reference/` | Dev/Technical | Technical specs, API docs, standards, data flows |

### Structure

```
docs/
├── planning/          # AI/Dev implementation guides
│   ├── index.md
│   ├── phase-tracker.md
│   ├── features/      # Consolidated feature plans
│   ├── quick-start/   # Fast 1-page guides
│   ├── testing/       # QA strategies and checklists
│   └── component-extraction/  # EDS blocks analysis
├── adr/               # Architecture decisions (existing)
│   └── README.md
├── explanations/      # Non-technical visual docs
│   ├── index.md
│   ├── personas/      # Persona visual overviews
│   └── *.md           # ASCII diagrams, system flows
├── reference/         # Technical specifications
│   ├── standards/     # CSS, coding, design standards
│   ├── backend/       # Backend specs, API docs
│   ├── authoring/     # Content authoring specs
│   ├── deployment/    # Deployment configurations
│   └── decisions/     # Research-backed decisions
├── implementation/    # Detailed implementation specs
│   ├── sarah-end-to-end/
│   ├── store-manager/
│   └── other-personas/
└── archive/           # Historical reference
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
- `reference/` category separates technical specs from actionable planning docs

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

Created in initial restructure:
- `docs/planning/index.md`
- `docs/planning/phase-tracker.md`
- `docs/planning/features/*.md` (5 consolidated files)
- `docs/explanations/index.md`
- `docs/explanations/*.md` (5 visual explanation docs)

---

## Amendment: 4th Category Added (2026-01-02)

**Reason**: Analysis revealed that 3 categories could not accommodate technical reference material:
- Standards (CSS, coding) are NOT decisions → don't belong in `adr/`
- API specs are NOT actionable checklists → don't belong in `planning/`
- Technical data flows are NOT for non-technical audience → don't fit `explanations/`

**Changes**:
1. Added `reference/` as 4th primary category
2. Restructured planning sub-folders for better organization
3. Migrated content from non-conforming folders:
   - `planning/quick-start/` → `planning/quick-start/`
   - `testing/` → `planning/testing/`
   - `planning/component-extraction/` → `planning/component-extraction/`
   - `standards/` → `reference/standards/`
   - `personas/` → split between `explanations/personas/` and `reference/`
