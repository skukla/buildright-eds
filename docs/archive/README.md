# Documentation Archive

Historical documentation preserved for reference. These documents are no longer actively maintained but provide valuable context for architectural decisions and past implementations.

---

## Archive Structure

```
archive/
├── dropin-migration/       # Commerce dropin integration work (22 files)
├── phase-progress/         # Phase progress summaries (3 files)
├── aco-catalog/            # ACO and catalog implementation (3 files)
├── analysis/               # UX audits, research, roadmaps (3 files)
├── meta-docs/              # Documentation organization (15 files)
├── completed/              # Completed phase summaries (28 files)
├── sarah-completed/        # Sarah persona work (21 files)
├── reference-old/          # Superseded reference docs (15 files)
├── outdated-plans/         # Obsolete planning docs (8 files)
├── phase-6-foundation-obsolete/  # Old Phase 6 plans (8 files)
├── product-images/         # Product image mapping (5 files)
├── session-logs/           # Agent handoff logs (3 files)
├── bug-fixes/              # Resolved bug documentation (2 files)
├── old-project-builder/    # Legacy project builder (12 files)
├── old-audits/             # Historical audits (2 files)
├── old-routing/            # Legacy routing docs (3 files)
└── theme-exploration-old/  # Design explorations (varies)
```

---

## Category Descriptions

### `dropin-migration/` (22 files)
**Purpose**: All Commerce dropin integration research, migration plans, and comparisons

**Contents**:
- Product List Page (PLP) dropin migration (7 files)
- MiniCart/Cart dropin work (3 files)
- Auth dropin research
- Dropin CSS strategy and slot analysis
- Catalog vs dropin comparisons

**Key Documents**:
- `plp-dropin-migration-plan.md` - PLP migration strategy
- `dropin-css-strategy-analysis.md` - CSS override approach
- `minicart-user-menu-analysis.md` - Cart dropin options

---

### `phase-progress/` (3 files)
**Purpose**: Progress summaries for major implementation phases

**Contents**:
- `phase-5.5-cart-progress.md` - Cart dropin integration
- `phase-5.5-progress-summary.md` - Commerce dropins overall
- `phase-8-backend-setup.md` - Backend configuration

---

### `aco-catalog/` (3 files)
**Purpose**: Adobe Commerce Optimizer (ACO) and catalog implementation

**Contents**:
- `aco-category-routes-fix-dec-19-2025.md` - Category routing fix
- `aco-category-routes-implementation-complete.md` - Completion summary
- `implementation-impact-analysis.md` - ACO sync impact

---

### `analysis/` (3 files)
**Purpose**: Research, audits, and strategic planning documents

**Contents**:
- `ux-audit-and-vision.md` - Comprehensive UX analysis
- `adobe-best-practices-comparison.md` - CSS/JS audit validation
- `implementation-roadmap.md` - Original implementation roadmap

---

### `meta-docs/` (15 files)
**Purpose**: Documentation about documentation - organization, audits, rotation plans

**Contents**:
- Documentation rotation plans (v1, v2)
- Documentation audits and updates
- Navigation maps and efficiency assessments
- Categorization manifests

---

### `completed/` (28 files)
**Purpose**: Completed phase summaries (Phases 0-5)

**Key Documents**:
- `phase-0-research-and-decisions.md` - Initial research
- `phase-1-aco-data-foundation.md` - ACO data setup
- `phase-2-final-summary.md` - Design system
- `phase-3-completion-summary.md` - Core architecture
- `phase-4-completion-summary.md` - Shared components
- `phase-5-task-*-completion-summary.md` - Page refactoring

---

### `sarah-completed/` (21 files)
**Purpose**: Sarah Martinez persona implementation work

**Contents**:
- Wireframes and design sprints
- Product catalog audits
- Font weight and visual hierarchy analysis
- BOM (Bill of Materials) service

---

### `reference-old/` (15 files)
**Purpose**: Superseded reference documentation

**Key Documents**:
- `auth-strategy.md` - Original auth approach
- `mock-aco-api-spec.md` - Mock API specification
- `dropin-architecture.md` - Early dropin patterns
- `perplexity-dropin-customization-research.md` - Research findings

---

### Other Subdirectories

| Directory | Files | Description |
|-----------|-------|-------------|
| `outdated-plans/` | 8 | Obsolete implementation plans |
| `phase-6-foundation-obsolete/` | 8 | Old Phase 6 foundation docs |
| `product-images/` | 5 | Product image mapping |
| `session-logs/` | 3 | Agent handoff context |
| `bug-fixes/` | 2 | Resolved bug documentation |
| `old-project-builder/` | 12 | Legacy project builder |
| `old-audits/` | 2 | Historical code audits |
| `old-routing/` | 3 | Legacy URL routing |

---

## Finding Information

| Looking For | Check |
|-------------|-------|
| Dropin implementation decisions | `dropin-migration/` |
| Phase completion details | `completed/` |
| Sarah persona work | `sarah-completed/` |
| API specifications | `reference-old/` |
| Documentation history | `meta-docs/` |

---

## Current Active Documentation

**For current project documentation, see:**

- [Master Implementation Plan](../planning/master-implementation-plan.md)
- [Dropin Architecture](../reference/dropin-architecture.md)
- [ADRs](../adr/) - Architectural decisions

---

**Last Updated**: 2026-01-02
