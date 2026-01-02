# Phase 6-Foundation: Project Entity & ProjectManager Service

**📊 Document Type**: Foundation Plan (Cross-Cutting Overview)  
**📖 Reading Time**: 10-15 minutes  
**⏱️ Implementation Time**: 5-7 hours  
**🎯 Status**: 🔵 [Planning] Design Complete - Implementation Pending  
**👥 Audience**: All developers implementing Phases 6A-6E

---

## 🔗 Related Documents

This is **Part 1 of 6** in the Phase 6-Foundation planning series:

1. **[00-OVERVIEW.md](./00-OVERVIEW.md)** ← You are here
2. [01-PROJECT-ENTITY-SCHEMA.md](./01-PROJECT-ENTITY-SCHEMA.md) - Complete data structure
3. [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md) - Complete API reference
4. [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md) - Sarah's complete flow
5. [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md) - Marcus, Lisa, David
6. [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md) - Tasks & timeline
7. [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md) - All decisions documented

**External References**:
- **Persona Flows**: [../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](../../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)
- **Phase 6A Plan**: [../A-sarah-dashboard/PHASE-6A-DASHBOARD-REDESIGN-PLAN.md](../A-sarah-dashboard/PHASE-6A-DASHBOARD-REDESIGN-PLAN.md)
- **Remaining Phases**: [../B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md](../B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md)
- **UX Patterns**: [../../personas/PERSONA-UX-MAP.md](../../personas/PERSONA-UX-MAP.md)

---

## 📍 Reading Order

1. **Start here** (00-OVERVIEW.md) - Why we need this, BuildRight's scope, rationale
2. Read [01-PROJECT-ENTITY-SCHEMA.md](./01-PROJECT-ENTITY-SCHEMA.md) - Understand the data structure
3. Read [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md) - Learn the API you'll use
4. Read your persona's implementation:
   - **Sarah?** → [03-SARAH-IMPLEMENTATION.md](./03-SARAH-IMPLEMENTATION.md)
   - **Others?** → [04-OTHER-PERSONAS.md](./04-OTHER-PERSONAS.md)
5. Ready to implement? → [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)
6. Curious about decisions? → [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)

**Total reading time**: ~45-60 minutes across all documents

---

## BuildRight's Scope: Materials Supplier

### ⚠️ Critical Context

**BuildRight is a materials supplier/distributor**, NOT a construction management platform.

**What BuildRight Does**:
- ✅ Generate Bills of Materials (BOMs) for construction projects
- ✅ Enable materials ordering (with configuration options)
- ✅ Track delivery of materials to job sites
- ✅ Provide pricing, availability, and recommendations
- ✅ Support multi-phase ordering (order foundation now, envelope later)
- ✅ Enable configuration reuse across multiple builds

**What BuildRight Does NOT Do**:
- ❌ Track construction schedules or timelines
- ❌ Manage project budgets (beyond materials costs from BuildRight)
- ❌ Coordinate subcontractors or labor
- ❌ Track inspections, permits, or compliance
- ❌ General project status (on schedule, behind, etc.)

**Sarah's Actual Workflow**:
- Uses BuildRight: Order materials, track deliveries, generate BOMs
- Uses other tools (Buildertrend, Procore, etc.): Schedule, budget, inspections, coordination

**The "Project" Entity in BuildRight**:
A "Project" (or "Build" for Sarah) represents:
> **"A materials ordering context for a specific construction job"**

It tracks what materials are needed, what's been ordered, what's been delivered, and what configuration applies—NOT the overall construction project status.

---

## Rationale

### The Problem

Looking at the existing persona flows in [BUILDRIGHT-PERSONAS-AND-FLOWS.md](../personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md), we see **implicit project concepts** scattered throughout:

**Evidence from Documentation**:

**Marcus (Lines 99-158)**:
```
1. LOGIN & START PROJECT
   └─ Enter project name: "Patterson Residence"
   
6. SAVE & ORDER
   └─ "Save project for future phases" → Saved
   
7. FUTURE PHASES
   └─ In 3 weeks: Return to "Patterson Residence" project
   └─ System remembers project specs
```

**Lisa (Lines 244)**:
```
6. REVIEW & ORDER
   └─ Save as: "Chen Project #2401 - Wilson Bathroom"
```

**Sarah (Phase 6A Plan, Line 178)**:
```javascript
this.selections = {
  projectName: 'House #47',  // Auto-generated
  variant: null,
  materialOptions: {...}
}
```

**David (Lines 361-377)**:
```
7. COMPLETE KIT REVIEW
   └─ "Your Deck Kit: 16x20 Composite with Aluminum Railing"
   // This IS a project, just not named as such
```

### The Solution

**Formalize "Project" as a first-class entity** used consistently across all personas (except Kevin, whose restock workflow is fundamentally different).

### Why Now?

**If we wait**:
- ❌ Each persona implementation will create ad-hoc project concepts
- ❌ Incompatible data structures across personas
- ❌ 3-4 refactoring cycles as we encounter each persona's needs
- ❌ Difficult to implement cross-persona features (project history, analytics)

**If we do it now**:
- ✅ Single, unified data model
- ✅ One ProjectManager implementation used by everyone
- ✅ Build once, use everywhere
- ✅ Consistent UX patterns
- ✅ Future-proof for Adobe Commerce integration

---

## Industry Research: How Production Builders Actually Work

### Key Findings (November 2024 Research)

**Research Methods**: 
- Perplexity MCP deep research on production builder workflows
- Analysis of leading platforms: Buildertrend, MarkSystems, Buildern, LotVue
- Industry best practices for construction management dashboards

**Primary Organization: Subdivision-First, Not Template-First**

Production homebuilders organize their active construction tracking **primarily around subdivisions/developments**, NOT around model types. This makes practical sense because:

1. **Construction workflows are tied to specific developments**:
   - Permits, utilities, and suppliers are development-specific
   - Community managers and superintendents organize around neighborhoods, not models
   - A single subdivision contains multiple model types at various stages

2. **Model types serve as secondary categorization**:
   - Used for templating and filtering, not primary organization
   - Helps with marketing analysis and sales forecasting
   - Applied within the context of a subdivision

3. **Dashboard patterns observed**:
   - **Centralized "Jobs List"**: Shows all active projects with customizable columns
   - **Interactive Site Maps** (e.g., LotVue): Visual representation of entire subdivisions with color-coded lot status
   - **Phase-Based Portfolio Views**: Distribution like "2 in permitting, 8 in foundation, 15 in framing"
   - **Color-Coded Health Status**: Green/Yellow/Red at project level, not template level

### Implications for Sarah's Dashboard Design

**Critical Insight**: Sarah's template dashboard is for **browsing/selecting templates to start new builds**, NOT for managing active builds.

**Two Separate Dashboard Views**:

1. **Template Dashboard** (Browsing/Selection):
   - Purpose: Catalog for selecting templates
   - User action: "Start New Build"
   - Analogy: Product catalog (you don't see "active orders" when browsing products)

2. **Active Builds Dashboard** (Operational Management):
   - Purpose: Manage ongoing construction
   - Organization: Subdivision-first (with template filtering)
   - User actions: View details, track progress, manage orders

This separation of concerns aligns with how production builders actually work and creates clearer, more focused UX.

---

## Final Decisions Summary

### ✅ All Questions Resolved (12 Total)

| # | Question | Decision |
|---|----------|----------|
| 1 | Terminology | Code: "Project", UI: "Build" (Sarah) / "Job" (Marcus, Lisa) / "Project" (David) |
| 2 | Naming | Smart defaults (subdivision + lot), allow override |
| 3 | Organization | Subdivision-first tracking |
| 4 | Storage | LocalStorage MVP (focus on Commerce + ACO demo) |
| 5 | Template Selection | 3-col grid, large images, clean spacing |
| 6 | Configuration | Sidebar layout, package cards, single page |
| 7 | Selection Packages | Pre-defined combinations (industry standard) ⭐ |
| 8 | Post-Config | Save → Dashboard (order materials later) |
| 9 | Phase Ordering | Modal → Filtered BOM → Cart |
| 10 | BOM Display | Existing design system components (zero new CSS) |
| 11 | Package Management | Hard-coded in templates.json (MVP) |
| 12 | BOM Storage | Custom Entity (LocalStorage) ⭐ |

Full decision rationale: See [06-COLLABORATIVE-REVIEW.md](./06-COLLABORATIVE-REVIEW.md)

---

## What's Next?

1. ✅ **You've read the overview** (you're here!)
2. ⏭️ **Understand the data**: [01-PROJECT-ENTITY-SCHEMA.md](./01-PROJECT-ENTITY-SCHEMA.md)
3. ⏭️ **Learn the API**: [02-PROJECT-MANAGER-API.md](./02-PROJECT-MANAGER-API.md)
4. ⏭️ **See your persona**: Sarah ([03](./03-SARAH-IMPLEMENTATION.md)) or Others ([04](./04-OTHER-PERSONAS.md))
5. ⏭️ **Implement it**: [05-IMPLEMENTATION-PLAN.md](./05-IMPLEMENTATION-PLAN.md)

---

**Document Version**: 1.0  
**Created**: 2024-11-25  
**Status**: ✅ Ready for Implementation

