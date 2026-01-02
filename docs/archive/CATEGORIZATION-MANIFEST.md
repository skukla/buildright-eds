# Documentation Categorization Manifest

**Total Documents:** 275 markdown files
**Date:** 2026-01-01
**Status:** Categorization complete

## Category Summary

| Category | Count | Purpose |
|----------|-------|---------|
| planning/ | ~85 | AI/Dev implementation guides |
| explanations/ | ~35 | Non-technical visual docs |
| adr/ | 11 | Architecture decisions (already organized) |
| archive/ | 71 | Historical reference (already organized) |
| **Root (keep)** | ~8 | Top-level navigation docs |
| **To consolidate** | ~65 | Merge into fewer files |

## Categorization by Current Location

### docs/ (Root Level) - 20 files

| File | Target | Action |
|------|--------|--------|
| CLAUDE.md | **keep** | Project guidelines - stays at root |
| README.md | **keep** | Entry point - stays at root |
| DROPIN-ARCHITECTURE.md | explanations/ | Move (canonical reference) |
| MASTER-IMPLEMENTATION-PLAN.md | planning/ | Move |
| PHASE-5.5-PROGRESS-SUMMARY.md | planning/ | Move |
| PHASE-PLANS-INDEX.md | planning/ | Move |
| BACKEND-SERVICE-REFERENCE.md | explanations/ | Move |
| AUTH-STRATEGY.md | explanations/ | Move |
| BLOCK-VS-DROPIN-MATRIX.md | explanations/ | Move |
| MOCK-ACO-API-SPEC.md | explanations/ | Move |
| PHASE-0-RESEARCH-AND-DECISIONS.md | archive/ | Historical |
| HANDOFF-*.md (various) | planning/ | Move (session handoffs) |
| SESSION-*.md (various) | archive/ | Historical session logs |
| DOCUMENTATION-*.md | archive/ | Meta docs about docs |

### docs/implementation/ - 101 files

| Subdirectory | Target | Action |
|--------------|--------|--------|
| sarah-end-to-end/features/ (60) | planning/ | Move (active planning) |
| sarah-end-to-end/dropins/ (5) | planning/ | Move |
| completed/ (29) | archive/ | Historical (completed work) |
| other-personas/ (2) | planning/ | Move |
| root files (4) | planning/ | Move |

### docs/personas/ - 5 files

| File | Target | Action |
|------|--------|--------|
| PERSONAS-OVERVIEW.md | explanations/ | Visual persona reference |
| Implementation plans | planning/ | Move |

### docs/component-architecture/ - 7 files

| All files | explanations/ | Move (architecture docs) |

### docs/quick-reference/ - 7 files

| All files | explanations/ | Move (how-to guides) |

### docs/reference/ - 38 files (including subdirs)

| Subdirectory | Target | Action |
|--------------|--------|--------|
| backend/ (19) | explanations/ | API references |
| research/ (4) | planning/ | Implementation research |
| decisions/ (4) | adr/ or archive/ | Review for ADR candidates |
| deployment/ (3) | explanations/ | Deployment guides |
| authoring/ (3) | explanations/ | Content authoring |
| root (5) | explanations/ | General references |

### docs/standards/ - 10 files

| File Type | Target | Action |
|-----------|--------|--------|
| Coding standards | explanations/ | How-to for devs |
| Decision standards | adr/ | If captures decisions |

### docs/testing/ - 3 files

| All files | planning/ | Move (test implementation guides) |

### docs/adr/ - 11 files

**Already organized** - No changes needed

### docs/archive/ - 71 files

**Already organized** - No changes needed

---

## Consolidation Opportunities (Step 5)

These directories contain many small files that should be merged:

| Directory | Current Files | Target Files | Strategy |
|-----------|---------------|--------------|----------|
| sarah-end-to-end/features/ | 60 | ~15 | Merge by topic |
| completed/ | 29 | archive/ | Move to archive |
| reference/backend/ | 19 | ~5 | Merge by service |

---

## Obsolete Documents (Resolved 2026-01-01)

Phase 6-Foundation planning docs described a frontend ProjectManager that was **never built**.

| Action | Status |
|--------|--------|
| Archive 8 Phase 6-Foundation docs (00-07 series) | ✅ Done |
| Create consolidated requirements doc | ✅ Done |
| Update stale references in README files | ✅ Done |

**Archived To:** `docs/archive/phase-6-foundation-obsolete/`

**Consolidated Requirements:** [docs/explanations/BUILDRIGHT-REQUIREMENTS.md](./explanations/BUILDRIGHT-REQUIREMENTS.md)

**Actual Implementation:**
- `scripts/dashboards/template-dashboard.js` (simple frontend)
- `buildright-service/mesh/resolvers-src/` (backend services)

---

## Ambiguous Cases (Needs Review)

| File | Question | Recommendation |
|------|----------|----------------|
| docs/standards/*.md | ADR or explanation? | explanations/ (how-to focus) |
| docs/reference/decisions/*.md | ADR candidates? | Review in Step 6 |

---

## Verification Checklist

- [x] All 275 docs accounted for
- [x] Each doc has one target category
- [x] Archive already contains historical docs
- [x] ADRs already organized
- [x] Phase 6-Foundation obsolete docs archived
- [x] Consolidated requirements created
- [x] README files updated with architecture notes

---

**Status:** Audit and consolidation complete (2026-01-01)
