# Phase 6-Foundation: Collaborative Review Summary

**📊 Document Type**: Decision Log  
**📖 Reading Time**: 5-10 minutes  
**👥 Audience**: All stakeholders

This is **Part 7 of 7** in the Phase 6-Foundation planning series.

**← Previous**: [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)

---

## Overview

This document summarizes all collaborative decisions made during the planning of Phase 6-Foundation: Project Entity & ProjectManager Service.

**Total Questions Resolved**: 12  
**Planning Duration**: 3 sessions  
**Status**: ✅ All decisions finalized

---

## Decisions Summary

### ✅ Question 1: Terminology - RESOLVED

**Decision**: Code uses "Project", UI adapts per persona

**Implementation**:
- **In Code**: Always use "Project" (`ProjectManager`, `createProject()`, `project.id`)
- **In UI**: Persona-specific terms via `persona-config.js`

| Persona | UI Term | Example Usage |
|---------|---------|---------------|
| Sarah Martinez | Build | "Active Builds", "3 builds in progress" |
| Marcus Johnson | Job | "My Jobs", "Job in progress" |
| Lisa Chen | Job | "Active Jobs", "Client jobs" |
| David Thompson | Project | "My Projects", "Home projects" |

**Files Updated**:
- `scripts/persona-config.js` - Add `workItemLabel`, `workItemLabelPlural`
- Add helper function: `getWorkItemLabel(personaId, plural)`

---

### ✅ Question 2: Sarah's Build Naming - RESOLVED

**Decision**: Flexible with Smart Defaults

**Implementation**:
- **Default**: "Subdivision + Lot Number" (e.g., "Desert Ridge Lot 12")
- **Allow Override**: Sarah can rename to custom names, build numbers, or addresses
- **System Tracks**: Relationship between build, subdivision, template, and job site

**Rationale**: Based on industry research showing production builders organize by subdivision and lot numbers

---

### ✅ Question 3: Active Builds Tracking - RESOLVED

**Decision**: Subdivision-first organization

**Implementation**:
- Dashboard shows summary by subdivision (not by template)
- Active builds organized by location (matches real-world workflow)
- Template type is secondary filter/grouping

**Rationale**: Industry research confirmed production builders organize by subdivision, not template

---

### ✅ Question 4: Storage Strategy - RESOLVED

**Decision**: LocalStorage for MVP

**Rationale**:
- Focus demo on Commerce + ACO capabilities (not backend persistence)
- Project entity is UI/UX context holder
- Backend migration path exists for future

**Implementation**:
- Create `LocalStorageAdapter` class
- Create `CommerceAPIAdapter` placeholder for future

---

### ✅ Question 5: Template Selection & Configuration UX - RESOLVED

**Decision**: Sidebar Configurator (Lowe's-inspired)

**Template Selection Page**:
- Simple 3-column card grid (`.grid .grid-3`)
- Large images, minimal text, clean spacing
- Reuse existing `.card` components

**Configurator Page**:
- Reuse `.catalog-layout` (sidebar + main content)
- Sidebar: Template info, section nav, pricing summary
- Main: Visual tiles for variant, package cards for materials
- Single page (not multi-step wizard)

**Files to Create**:
- `pages/templates.html`
- `pages/build-configurator.html`
- `scripts/builders/project-configurator.js`

---

### ✅ Question 6: Post-Configuration Flow - RESOLVED

**Decision**: Save & Return to Dashboard

**Flow**:
1. Sarah clicks "Save Build" in configurator
2. Build saved to LocalStorage (Project entity created)
3. Redirect to dashboard with success message
4. Build appears in "My Builds" list with "Order Materials" button
5. Sarah orders materials later when ready (phased ordering)

**Rationale**:
- Simple implementation (one code path)
- Realistic workflow (configure ahead, order when ready)
- Separates planning from purchasing

---

### ✅ Question 7: Phase-Based Ordering - RESOLVED

**Decision**: Clean modal for phase selection, then filtered BOM review

**Flow**:
1. Click "Order Materials" → Modal shows phase selection
2. Sarah checks which phase(s) to order
3. Clicks "Review Materials" → BOM page filtered to selected phases
4. BOM grouped by category with accordion
5. Edit quantities, add to cart

**Project Entity Tracking**:
```javascript
phases: {
  foundation_framing: { status: 'ordered', orderId: 'ORD-1234' },
  envelope: { status: 'pending', orderId: null },
  interior_finish: { status: 'pending', orderId: null }
}
```

**BOM Review UX**:
- Reuse existing components (`.simple-list-*`)
- Zero new CSS required

---

### ✅ Question 8: Material Selection Approach - RESOLVED ⭐

**Decision**: Pre-Defined Selection Packages (Industry Standard)

**Research Findings**:
- Production builders use "Selection Packages" (not individual SKU selection)
- Packages = curated combinations of materials for specific subdivisions
- Matches real-world workflow (M/I Homes, Conaway Homes, Ivory Home)

**Configuration Update**:
Instead of "Quality Tier + Individual Upgrades", Sarah selects a **Selection Package**:

```
Packages:
1. Builder's Choice (standard selections)
2. Desert Ridge Premium (subdivision-specific, +$18K)
3. Sunset Valley Executive (subdivision-specific, +$35K)

Each package includes:
- Windows brand/style
- Doors brand/style
- Roofing shingles/color
- Siding material/color
- Interior finishes
```

**Project Entity Schema**:
```javascript
{
  selectionPackage: {
    id: 'desert-ridge-premium',
    name: 'Desert Ridge Premium',
    subdivisionSpecific: true,
    selections: {
      windows: 'andersen-400-series',
      roofing: 'gaf-timberline-hdz-pewter-gray',
      siding: 'hardie-plank-monterey-taupe'
    },
    addedCost: 18000
  }
}
```

**Benefits**:
- Faster configuration (pick 1 package vs 50+ SKUs)
- Realistic workflow
- Simpler implementation
- Demonstrates CCDM (packages = policy-based filtering)

---

### ✅ Question 9: Package Definition & Management - RESOLVED

**Decision**: Hard-coded packages in `templates.json` (MVP), with B2B narrative

**Research Findings**:
- Production builders create pre-designed material packages
- Builder works with supplier to define SKU lists for each package
- Sarah selects from pre-configured packages (doesn't build them herself)

**Implementation**:
```javascript
// In templates.json
"packages": {
  "desert-ridge-premium": {
    "id": "desert-ridge-premium",
    "name": "Desert Ridge Premium",
    "subdivisionSpecific": "Desert Ridge",
    "addedCost": 18000,
    "skuMappings": {
      "windows_double_hung_3660": "WIN-ANDER-3660",
      "doors_entry": "DOOR-THERM-SS-3080",
      "roofing_shingles": "ROOF-GAF-HDZ-PEWTER"
    }
  }
}
```

**Demo Narrative**: "Your BuildRight account manager, John Smith, pre-configured these packages for your subdivisions."

**Future Enhancement**: Admin UI for reps to create/manage packages

---

### ✅ Question 10: Build Cloning - RESOLVED

**Decision**: Add if easy, otherwise skip for MVP

**Simple Implementation**:
```javascript
async function cloneBuild(buildId) {
  const original = await projectManager.getProject(buildId);
  const clone = {
    ...original,
    id: generateId(),
    name: `${original.name} (Copy)`,
    createdAt: new Date().toISOString(),
    orders: [] // Reset orders
  };
  await projectManager.saveProject(clone);
  return clone;
}
```

**UI**: Add "Clone" button in builds table row  
**Priority**: Nice-to-have, not MVP-critical

---

### ✅ Question 11: BOM Storage Strategy - RESOLVED ⭐

**Decision**: Custom Entity in LocalStorage (Option 1)

**Options Evaluated**:
1. **Custom Entity** (LocalStorage/JSON) ✅ SELECTED
   - Simple, flexible, full control
   - Works with LocalStorage MVP
   - Standard cart API for checkout
2. **CCDM Bundle Product** ❌ Too rigid
   - Can't easily edit quantities
   - Need bundle for every build config
3. **Requisition List** ❌ Not ideal
   - Designed for repeat ordering, not temp BOMs
   - Adds B2B module complexity

**BOM Generation Flow**:
```javascript
// 1. Generate BOM from package + template
const bom = await generateBOM(project);

// 2. Store temporarily
sessionStorage.setItem('current_bom', JSON.stringify(bom));

// 3. Display in BOM review page
const bom = JSON.parse(sessionStorage.getItem('current_bom'));

// 4. Add to cart
bom.forEach(item => {
  await addToCart(item.sku, item.quantity);
});

// 5. Standard Commerce checkout
window.location = 'cart.html';
```

**Benefits**:
- Simple implementation
- Full flexibility for BOM editing
- Easy migration path to backend later
- Works perfectly with LocalStorage MVP strategy

---

### ✅ Question 12: Demo Scenario (Happy Path) - RESOLVED

**Decision**: Confirmed proposed flow

**Scenario**:
1. Sarah logs in
2. Navigates to template selection
3. Configures new build with package
4. Saves build
5. Returns to dashboard
6. Orders materials for build (phased)
7. Views delivery schedule

**Status**: Approved as-is

---

## Implementation Readiness

### Design System Compliance ✅
- All layouts use existing patterns (`.catalog-layout`, `.grid .grid-3`, `.card`)
- All components exist (`.simple-list-row`, `.category-toggle`, `.btn`)
- All icons exist (`lucide/` directory)

### Data Model ✅
- Project entity schema defined (~80 fields)
- ProjectManager API complete (20+ methods)
- Phase tracking integrated

### User Flows ✅
- Template selection → Configuration → Save
- Dashboard → Order Materials → Phase Selection → BOM Review → Cart

### Files to Create
- `scripts/project-manager.js`
- `scripts/storage-adapter.js`
- `scripts/project-manager-demo.js`
- `pages/templates.html`
- `pages/build-configurator.html`
- `pages/bom-review.html`

### Files to Modify
- `scripts/persona-config.js` (add terminology)
- `data/templates.json` (add packages)

---

## Key Decisions Highlights

**Most Important Decisions** (⭐):
1. **Selection Packages** (Q8) - Industry-standard approach, realistic workflow
2. **BOM Storage** (Q11) - LocalStorage MVP, flexible and simple
3. **Subdivision-First Organization** (Q3) - Matches real-world builder workflows

**Innovation**:
- Persona-specific terminology with shared data model
- Pre-defined selection packages (matches production builders)
- Materials-focused scope (not construction management)

**Design Excellence**:
- Zero new CSS (100% design system reuse)
- Multi-screen approach (clean, focused)
- Smart defaults with flexibility

---

## Next Steps

**Ready to proceed with implementation!**

**Implementation Order**:
1. ✅ Create `project-manager.js` (2-3 hours)
2. ✅ Create `storage-adapter.js` (1 hour)
3. ✅ Update `persona-config.js` (30 min)
4. ✅ Update `templates.json` (1 hour)
5. ✅ Create demo interface (1 hour)
6. ✅ Test end-to-end (1 hour)

**Total**: 5-7 hours

**Then**: Proceed with Phase 6A (Sarah's Dashboard Redesign)

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Complete

