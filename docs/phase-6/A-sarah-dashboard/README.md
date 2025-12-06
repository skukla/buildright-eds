# Phase 6A: Sarah's Dashboard - Documentation Index

**Phase Status**: In Progress  
**Current Task**: Layout Consistency Standardization  
**Last Updated**: December 4, 2025

---

## Overview

This folder contains all documentation related to Phase 6A of the persona implementation plan, focusing on Sarah Martinez's production builder dashboard and related pages.

---

## Documents in This Folder

### Planning & Design

1. **[PHASE-6A-DASHBOARD-REDESIGN-PLAN.md](./PHASE-6A-DASHBOARD-REDESIGN-PLAN.md)**
   - Original design plan for Sarah's dashboard
   - Template configuration workflow
   - BOM generation process
   - Material options structure
   - Status: ✅ Mostly implemented

### Layout Consistency (NEW - Dec 4, 2025)

2. **[LAYOUT-CONSISTENCY-AUDIT.md](./LAYOUT-CONSISTENCY-AUDIT.md)** ⭐ START HERE
   - Comprehensive technical analysis
   - Identifies all layout/typography inconsistencies
   - Compares patterns across all pages
   - Detailed findings with code examples
   - **Purpose**: Understanding the problem
   - **Audience**: Developers, architects

3. **[VISUAL-CONSISTENCY-EXAMPLES.md](./VISUAL-CONSISTENCY-EXAMPLES.md)**
   - Side-by-side code comparisons
   - Before/after examples
   - Visual pattern guides
   - Quick reference for common patterns
   - **Purpose**: Seeing specific examples
   - **Audience**: Developers implementing fixes

4. **[STANDARDIZATION-ACTION-PLAN.md](./STANDARDIZATION-ACTION-PLAN.md)** ⭐ IMPLEMENTATION GUIDE
   - Step-by-step implementation plan
   - Critical decisions needed
   - Time estimates per phase
   - Testing checklist
   - **Purpose**: Executing the fixes
   - **Audience**: Developer implementing changes

---

## Quick Navigation

### If you want to...

**Understand what's inconsistent:**  
→ Read [LAYOUT-CONSISTENCY-AUDIT.md](./LAYOUT-CONSISTENCY-AUDIT.md)

**See specific code examples:**  
→ Read [VISUAL-CONSISTENCY-EXAMPLES.md](./VISUAL-CONSISTENCY-EXAMPLES.md)

**Fix the issues:**  
→ Follow [STANDARDIZATION-ACTION-PLAN.md](./STANDARDIZATION-ACTION-PLAN.md)

**Review original Sarah dashboard plan:**  
→ Read [PHASE-6A-DASHBOARD-REDESIGN-PLAN.md](./PHASE-6A-DASHBOARD-REDESIGN-PLAN.md)

---

## Key Findings Summary

### Main Issues Discovered

1. **Account Dashboard** (`pages/account.html`)
   - ❌ Heavy use of inline styles
   - ❌ Inline `<style>` block in HTML
   - ❌ Hardcoded values instead of design tokens
   - ❌ Inline layout grids

2. **Template Dashboard** (`pages/dashboard-templates.html`)
   - ⚠️ Custom max-width (1600px) not using design token
   - ⚠️ Custom container class instead of standard pattern

3. **Catalog Page** (`pages/catalog.html`)
   - ❌ Missing h1 (accessibility issue)

### Pages That Are Good Examples

✅ **Build Configurator** (`pages/build-configurator.html`)
- Proper external CSS
- Uses design system tokens
- Clean HTML structure
- Good patterns to follow

✅ **BOM Review** (`pages/bom-review.html`)
- Same as build configurator
- Consistent with design system
- Good patterns to follow

---

## Recommendations

### Priority 1: Remove Inline Styles (HIGH)

**Account Dashboard needs:**
- Remove `<style>` block from HTML
- Remove all `style="..."` attributes
- Create proper CSS file
- Use design system tokens

**Estimated Time:** 1.5 hours

---

### Priority 2: Standardize Containers (MEDIUM)

**All pages should:**
- Use consistent max-width approach
- Use design system tokens
- Follow standard `.section` → `.container` pattern

**Estimated Time:** 1 hour

---

### Priority 3: Fix Accessibility (HIGH)

**Catalog page needs:**
- Add h1 element

**Estimated Time:** 15 minutes

---

### Priority 4: Create Global Utilities (LOW)

**Add to design system:**
- `.page-subtitle` class
- `.section-description` class
- Sidebar width tokens

**Estimated Time:** 30 minutes

---

## Implementation Status

### Completed ✅
- Analysis and audit complete
- Documentation written
- Action plan defined

### In Progress 🔄
- Awaiting decisions on standards
- Ready to implement fixes

### Blocked ⏸️
- Need decisions on:
  1. Container max-width approach
  2. Section header style preference
  3. Page structure standard
  4. Sidebar width standards

---

## Critical Decisions Needed

Before implementation can proceed, decide:

### Decision 1: Container Max-Width
- [ ] **Option A**: Enforce `1280px` everywhere (simplest)
- [ ] **Option B**: Allow wider containers via modifier classes (flexible)

### Decision 2: Section Headers
- [ ] **Option A**: Plain h2 everywhere (simplest)
- [ ] **Option B**: Gradient headers for complex pages only (flexible)
- [ ] **Option C**: Gradient headers everywhere (consistent)

### Decision 3: Page Structure
- [ ] **Option A**: Standard EDS `.section` → `.container` pattern (recommended)
- [ ] **Option B**: Custom container per page (flexible)

### Decision 4: Sidebar Widths
- [ ] **Option A**: Single standard width (`360px`)
- [ ] **Option B**: Two standards (recommended)
  - `250px` for navigation
  - `360px` for summaries

---

## Files Affected

### To Be Created (1)
- `styles/dashboards/account-dashboard.css`

### To Be Modified (5)
- `pages/account.html`
- `pages/catalog.html`
- `styles/dashboards/template-dashboard.css`
- `styles/utilities.css`
- `styles/base.css` (optional)

### Documentation (1)
- `docs/standards/CSS-ARCHITECTURE.md`

---

## Time Estimate

**Total Implementation Time:** 4-6 hours

| Phase | Time |
|-------|------|
| Create CSS file | 30 min |
| Update account HTML | 1 hour |
| Update template dashboard | 30 min |
| Add utilities | 30 min |
| Fix catalog | 15 min |
| Testing | 1 hour |
| Documentation | 30 min |

---

## Success Criteria

Implementation complete when:

- [ ] Zero inline `style="..."` attributes
- [ ] Zero `<style>` blocks in HTML
- [ ] All pages use design system tokens
- [ ] Consistent heading sizes
- [ ] Consistent spacing
- [ ] All pages have h1
- [ ] Mobile responsive
- [ ] CSS organized and commented
- [ ] Documentation updated

---

## Related Documentation

### Design System
- `styles/base.css` - Design tokens and variables
- `styles/components.css` - Reusable component styles
- `docs/standards/CSS-ARCHITECTURE.md` - CSS organization guide

### Phase 6 Planning
- `docs/personas/PERSONA-IMPLEMENTATION-PLAN.md` - Overall persona plan
- `docs/phase-6/` - Other persona implementation docs

### Testing
- `docs/testing/` - Testing guidelines and checklists

---

## Change Log

### December 4, 2025
- Created layout consistency audit
- Identified all inconsistencies across pages
- Documented recommended patterns
- Created action plan for standardization

### [Previous Dates]
- See git history for earlier changes

---

## Contact

Questions about this phase? See:
- **Technical questions**: Review `LAYOUT-CONSISTENCY-AUDIT.md`
- **Implementation**: Follow `STANDARDIZATION-ACTION-PLAN.md`
- **Examples**: Check `VISUAL-CONSISTENCY-EXAMPLES.md`

---

## Quick Start for Implementer

1. ✅ **Read** `LAYOUT-CONSISTENCY-AUDIT.md` (10 min)
2. 📋 **Review** `VISUAL-CONSISTENCY-EXAMPLES.md` (10 min)
3. ✏️ **Make decisions** on the 4 critical choices
4. 🚀 **Follow** `STANDARDIZATION-ACTION-PLAN.md` phase by phase
5. ✔️ **Test** against success criteria
6. 📚 **Update** documentation when complete
