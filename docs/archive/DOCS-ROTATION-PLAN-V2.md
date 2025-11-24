# Documentation Rotation Plan v2 - Phase-Organized

**Date**: November 24, 2025  
**Purpose**: Organize docs by implementation phase for easy reference when needed

---

## Strategy: Phase-Based Organization

Instead of just archiving, we'll organize documents by **when they're needed** in the implementation:

```
docs/
├─ [Core Planning - Always Active]
├─ phase-0-5-foundation/ (Completed - Reference Only)
├─ phase-6-personas/ (CURRENT - Active Work)
├─ phase-7-demo-polish/ (Next - Active Work)
├─ phase-8-backend/ (Future - Backend Setup Reference)
├─ phase-9-deployment/ (Future - Production Deployment Reference)
├─ phase-10-authoring/ (Future - Content Authoring Reference)
└─ archive/ (Historical/Superseded)
```

---

## 📁 Proposed Organization

### Root Level (Always Active - Core Planning)

**Master Planning & Navigation**
- ✅ PERSONA-PLAN-CORE-DOCS.md (NEW - Start here)
- ✅ PHASE-PLANS-INDEX.md (Navigation hub)
- ✅ PHASE-PLANS-SUMMARY.md (Quick overview)
- ✅ README.md (Main docs README)

**Personas**
- ✅ BUILDRIGHT-PERSONAS-AND-FLOWS.md (All 5 personas)
- ✅ PERSONA-META-PLAN.md (Overall strategy)
- ✅ PERSONA-IMPLEMENTATION-PLAN.md (Technical implementation)
- ✅ PERSONA-UX-MAP.md (UX patterns)

**Architecture (Cross-Phase)**
- ✅ adr/ (ADR-001 through ADR-006)
- ✅ CSS-ARCHITECTURE.md
- ✅ CODING-PRINCIPLES.md
- ✅ COMPONENT-DESIGN-LIBRARY.md
- ✅ ANIMATION_STANDARDIZATION.md
- ✅ ADAPTIVE-LAYOUT-PATTERN.md
- ✅ image-guidelines.md

**Testing (Cross-Phase)**
- ✅ TESTING-GUIDE.md
- ✅ PAGE-AUDIT-CHECKLIST.md

---

### phase-0-5-foundation/ (Completed Phases - Reference)

**Foundation Phases**
- PHASE-0-RESEARCH-AND-DECISIONS.md (Keep active - referenced often)
- PHASE-1-ACO-DATA-FOUNDATION.md (Keep active - data foundation)
- PHASE-3-CORE-ARCHITECTURE.md (Keep active - core architecture)

**Phase Completion Summaries** (Archive for historical record)
- PHASE_1_BUGFIXES.md
- PHASE_1_COMPLETE.md
- PHASE-2-COMPLETION-SUMMARY.md
- PHASE-2-FINAL-SUMMARY.md
- PHASE-2-CORE-WEB-VITALS-IMPACT.md
- PHASE-2-DESIGN-SYSTEM-AND-ICONS-DEFERRED.md
- PHASE-2-DESIGN-SYSTEM-AND-ICONS-ORIGINAL.md
- PHASE-3-COMPLETION-SUMMARY.md
- PHASE-4-COMPLETION-SUMMARY.md
- PHASE-4-SHARED-COMPONENTS.md
- PHASE-4-ASSESSMENT.md
- PHASE-4-FIXES-SUMMARY.md
- PHASE_4_BUNDLE_OPTIMIZATION_AUDIT.md
- PHASE-5-EXISTING-PAGE-REFACTOR.md
- PHASE-5-TASK-2-COMPLETION-SUMMARY.md
- PHASE-5-TASK-2-DESIGN-DECISION.md
- PHASE-5-TASK-4-COMPLETION-SUMMARY.md
- PHASE-5-TASK-4-PDP-LAYOUT-SUMMARY.md
- PHASE-5-TASK-5-COMPLETION-SUMMARY.md

**Supporting Docs**
- UNUSED_BLOCKS_AUDIT.md
- ICON-READINESS-ASSESSMENT.md
- MINI_CART_REFINEMENT.md
- FRAGMENT-IMPLEMENTATION-SUMMARY.md
- FRAGMENT-AUTHORING-GUIDE.md
- TESTING-GUIDE-PHASES-1-4.md
- TESTING-SESSION-PHASES-1-4.md

---

### phase-6-personas/ (CURRENT - Keep at Root for Easy Access)

**Active Implementation**
- ✅ PHASES-6B-TO-7-CONSOLIDATED.md (Current work - Marcus, Lisa, David, Kevin)
- ✅ PHASE-6A-PERSONA-SARAH.md (Reference implementation)

---

### phase-7-demo-polish/ (NEXT - Keep at Root for Now)

Currently no specific docs - will be added during Phase 7

---

### phase-8-backend/ (Backend Setup - Future Reference)

**Backend Setup Guides**
- PHASE-8-BACKEND-SETUP-UPDATED.md (Main guide)
- PHASE-8-REQUIRED-SCRIPTS.md (Script requirements)

**Adobe Commerce Optimizer (ACO)**
- MOCK-ACO-API-SPEC.md (API specification)
- ACO-PRICING-RESEARCH.md (Pricing capabilities)
- ACO-COMMERCE-CATALOG-RELATIONSHIP.md (Catalog sync)
- ACO-COMMERCE-CATALOG-RELATIONSHIP-CORRECTION.md (Sync clarification)
- FEED-TABLE-EXPLAINED.md (Data feeds)

**Commerce Integration**
- DROPIN-ARCHITECTURE.md (Dropins overview)
- DROPIN-INTEGRATION-GUIDE.md (How to integrate)
- BLOCK-VS-DROPIN-MATRIX.md (Decision matrix)
- AUTH-STRATEGY.md (Authentication)
- DATA-SOURCE-MATRIX.md (Commerce + ACO data sources)

**Product Data**
- PRODUCT-FLOW-ADOBE-COMMERCE-TO-ACO.md (Product sync)
- PRODUCT-RECORD-CREATION-FLOW.md (Product creation)
- PRODUCT-RECORD-VISUALIZATION.md (Data visualization)

**EDS Integration**
- EDS-MIGRATION-GUIDE.md (EDS best practices)
- EDS-BLOCK-PATTERNS.md (Block patterns)
- EDS-PATTERN-DEVIATIONS.md (Our deviations from standard)

---

### phase-9-deployment/ (Production Deployment - Future Reference)

**Deployment Guides**
- PHASE-9-PRODUCTION-DEPLOYMENT.md (Deployment architecture)
- DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md (Step-by-step migration)

---

### phase-10-authoring/ (Content Authoring - Future Reference)

**Authoring Guides**
- PHASE-10-AUTHORING-TRANSITION.md (Authoring transition)
- FRAGMENT-AUTHORING-GUIDE.md (Fragment authoring - move from phase-0-5)

---

### archive/ (Historical/Superseded Only)

**Superseded Documents**
- PHASE-8-BACKEND-SETUP.md (Replaced by -UPDATED version)
- IMPLEMENTATION-ROADMAP.md (Replaced by phase plans)

**Historical Research**
- UX-AUDIT-AND-VISION.md (Pre-dates persona plan)
- IMPLEMENTATION-IMPACT-ANALYSIS.md (Historical assessment)
- ADOBE_BEST_PRACTICES_COMPARISON.md (Research)

**Existing Archive Folders** (Keep as-is)
- old-project-builder/
- old-routing/
- product-images/
- bug-fixes/
- old-audits/
- theme-exploration-old/

---

## 📊 New Structure Summary

```
docs/
├─ README.md (Updated with navigation)
├─ PERSONA-PLAN-CORE-DOCS.md ⭐ (Start here)
├─ PHASE-PLANS-INDEX.md (Navigation hub)
├─ PHASE-PLANS-SUMMARY.md
│
├─ [Personas] (4 files)
├─ [Architecture] (7 files + adr/)
├─ [Testing] (2 files)
│
├─ PHASES-6B-TO-7-CONSOLIDATED.md (CURRENT)
├─ PHASE-6A-PERSONA-SARAH.md (CURRENT)
│
├─ phase-0-5-foundation/
│  ├─ README.md (Phase 0-5 index)
│  ├─ PHASE-0-RESEARCH-AND-DECISIONS.md
│  ├─ PHASE-1-ACO-DATA-FOUNDATION.md
│  ├─ PHASE-3-CORE-ARCHITECTURE.md
│  └─ [19 completion summaries & audits]
│
├─ phase-8-backend/
│  ├─ README.md (Phase 8 index - "Backend Setup Reference")
│  ├─ PHASE-8-BACKEND-SETUP-UPDATED.md
│  ├─ PHASE-8-REQUIRED-SCRIPTS.md
│  ├─ [ACO docs] (6 files)
│  ├─ [Commerce Integration] (5 files)
│  ├─ [Product Data] (3 files)
│  └─ [EDS Integration] (3 files)
│
├─ phase-9-deployment/
│  ├─ README.md (Phase 9 index - "Production Deployment Reference")
│  ├─ PHASE-9-PRODUCTION-DEPLOYMENT.md
│  └─ DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md
│
├─ phase-10-authoring/
│  ├─ README.md (Phase 10 index - "Content Authoring Reference")
│  ├─ PHASE-10-AUTHORING-TRANSITION.md
│  └─ FRAGMENT-AUTHORING-GUIDE.md
│
└─ archive/
   ├─ README.md (Updated)
   ├─ PHASE-8-BACKEND-SETUP.md (superseded)
   ├─ IMPLEMENTATION-ROADMAP.md (superseded)
   ├─ UX-AUDIT-AND-VISION.md (historical)
   ├─ IMPLEMENTATION-IMPACT-ANALYSIS.md (historical)
   ├─ ADOBE_BEST_PRACTICES_COMPARISON.md (research)
   └─ [existing folders]
```

---

## 📋 Benefits of This Organization

1. **Current Work Clearly Visible** - Phase 6 & 7 docs stay at root
2. **Future Phases Pre-Organized** - When you hit Phase 8, all backend docs are ready
3. **Foundation Archived** - Phase 0-5 completion summaries organized but accessible
4. **Easy Navigation** - Each phase folder has its own README
5. **Clean Root** - Only 20-25 files at root (vs 74 currently)

---

## 🎯 Phase Folder READMEs

Each phase folder will have a README explaining:
- What phase this is
- When to reference these docs
- Key documents in the folder
- Links back to master plan

Example for `phase-8-backend/README.md`:
```markdown
# Phase 8: Backend Setup - Reference Documentation

**Status**: Future (After Phases 6-7)
**When to Use**: When setting up Adobe Commerce + ACO backend

## Key Documents
- PHASE-8-BACKEND-SETUP-UPDATED.md - Main setup guide
- MOCK-ACO-API-SPEC.md - ACO API specification
- DATA-SOURCE-MATRIX.md - Commerce vs ACO data sources
...
```

---

## 🚀 Next Steps

1. Create phase folder structure
2. Create README for each phase folder
3. Move documents to appropriate phase folders
4. Update PERSONA-PLAN-CORE-DOCS.md with new structure
5. Update main README.md with navigation
6. Test all links

**Ready to proceed?** This keeps everything organized by when you'll need it!

