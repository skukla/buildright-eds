# BuildRight Persona Implementation - Complete Phase Plans Index

## Overview

This directory contains a comprehensive, phased implementation plan for transforming the BuildRight EDS prototype into a persona-driven experience. The plan is broken down into 13 focused, testable phases.

---

## Meta-Level Documents

### 📋 PERSONA-META-PLAN.md
**Overall orchestration document**
- Phases overview and dependencies
- Dependency graph
- Mock ACO strategy
- Progress tracking
- Risk management
- Communication plan

### 📋 PERSONA-IMPLEMENTATION-PLAN.md
**Original comprehensive plan** (for reference)
- Complete vision document
- All personas defined
- Full requirements
- Success criteria

### 📋 BUILDRIGHT-PERSONAS-AND-FLOWS.md
**Persona definitions and user journeys**
- Detailed persona profiles
- User flows for each persona
- Pain points and goals

---

## Phase Plans (Detailed)

### Phase 0: Foundation

#### 📄 PHASE-0-RESEARCH-AND-DECISIONS.md
**Duration**: 1-2 weeks | **Dependencies**: None

**Research & Architecture**
- Adobe Commerce Storefront SDK (Dropins)
- EDS DOM manipulation patterns
- Block vs. Dropin decision matrix
- Mock ACO service design
- Authentication strategy
- Architecture Decision Records (ADRs)

**Deliverables**:
- Technical documentation
- Architecture decisions
- Integration guides
- Decision records

---

### Phase 1: Data Foundation

#### 📄 PHASE-1-ACO-DATA-FOUNDATION.md
**Duration**: 2-3 weeks | **Dependencies**: None (parallel to Phase 0)

**Mock Data Generation (buildright-aco repo)**
- Product definitions with persona attributes
- 6 customer group price books
- Policy definitions documentation
- EDS-compatible data generation
- Documentation updates (BUILDRIGHT-CASE-STUDY, SETUP-GUIDE)

**Deliverables**:
- Enhanced product definitions
- Generation & ingestion scripts
- Mock data files
- Updated documentation

---

### Phase 2: Design System

#### 📄 PHASE-2-DESIGN-SYSTEM-AND-ICONS.md
**Duration**: 1 week | **Dependencies**: Phase 0

**Professional Custom Icons**
- ~40 custom SVG icons (24x24px)
- Icon library organization
- Icon CSS classes and helpers
- Emoji replacement strategy
- Design system documentation

**Deliverables**:
- Complete icon library
- Icon helper utilities
- Design system guide
- Emoji removal checklist

---

### Phase 3: Core Architecture

#### 📄 PHASE-3-CORE-ARCHITECTURE.md
**Duration**: 1-2 weeks | **Dependencies**: Phase 0, Phase 1

**Foundation Systems**
- Persona configuration system
- Mock ACO service layer (mirrors real API)
- Authentication system (demo + production plan)
- Generic dashboard & builder pages
- Routing patterns

**Deliverables**:
- persona-config.js
- aco-service.js
- auth.js
- dashboard.js & builder.js
- Unit tests

---

### Phase 4: Shared Components

#### 📄 PHASE-4-SHARED-COMPONENTS.md
**Duration**: 2 weeks | **Dependencies**: Phase 2, Phase 3

**Reusable EDS Blocks**
- Loading overlay (CCDM demo)
- Wizard vertical progress
- Template card
- Product tile
- Package comparison

**Deliverables**:
- 5 shared EDS blocks
- Block documentation
- Component tests

---

### Phase 5: Existing Page Refactor

#### 📄 PHASE-5-EXISTING-PAGE-REFACTOR.md
**Duration**: 2-3 weeks | **Dependencies**: Phase 3, Phase 4

**Page Audit & Updates**
- Complete page audit (PAGE-AUDIT-CHECKLIST.md)
- Login page with persona selection
- Catalog page (remove kit mode, add CCDM)
- Product detail page (customer group pricing)
- Cart page integration
- Remove all emojis

**Deliverables**:
- Updated pages (login, catalog, PDP, cart, account)
- Kit mode removed
- Emoji-free codebase
- Page audit document

---

### Phase 6: Persona Implementations

#### 📄 PHASE-6A-PERSONA-SARAH.md
**Sarah Martinez - Production Builder**
**Duration**: 1-2 weeks | **Dependencies**: Phase 4, Phase 5

**Features**:
- Template dashboard
- Floor plan data (6 templates)
- Floor plan diagrams
- Finished home images
- Template ordering with variants
- Phase-based BOM generation

**Customer Group**: Commercial Tier 2

---

#### 📄 PHASES-6B-TO-7-CONSOLIDATED.md
**Remaining Personas & Integration (Consolidated Document)**

Contains detailed plans for:

**Phase 6B: Marcus Johnson - General Contractor**
- Duration: 2 weeks
- Project wizard with phase selection
- Educational content
- CCDM filtering demonstration
- Quality tier selection
- Phase-based BOM
- Customer Group: Residential Builder

**Phase 6C: Lisa Chen - Remodeling Contractor**
- Duration: 2 weeks
- Good/Better/Best package builder
- Complete bathroom package photos
- Visual comparison
- Customization within tier
- Quote generation
- Customer Group: Pro Specialty

**Phase 6D: David Thompson - Pro Homeowner** ⭐ **PRIMARY CCDM DEMO**
- Duration: 2-3 weeks
- DIY deck builder
- Large hero images
- Progressive disclosure
- **Product count visualization**
- **Visible CCDM filtering**
- Educational DIY content
- Customer Group: Retail Homeowner

**Phase 6E: Kevin Rodriguez - Store Manager**
- Duration: 1 week
- Velocity-based restock dashboard
- Smart suggestions
- Priority indicators
- Category-based view
- Customer Group: Retail Chain Buyer

**Phase 7: Integration & Polish**
- Duration: 2 weeks
- Cross-persona testing
- Performance optimization
- Responsive design verification
- Accessibility compliance
- Demo walkthrough guide
- Bug fixes & polish

---

## Supporting Documents

### 📄 PHASE-PLANS-SUMMARY.md
Quick reference guide listing all phases with brief descriptions

### 📄 CSS-ARCHITECTURE.md
Existing design system documentation

### 📄 EDS-MIGRATION-GUIDE.md
Existing EDS patterns and best practices

### 📄 TESTING-GUIDE.md
Testing strategies and checklists

---

## Implementation Strategy

### Parallel Work Opportunities

```
Phase 0 (Research)     ┐
                       ├─→ Phase 2 (Icons) ─────┐
Phase 1 (Data)         ┘                        │
                                                ↓
                                         Phase 3 (Architecture)
                                                ↓
                                         Phase 4 (Components)
                                                ↓
                                         Phase 5 (Page Refactor)
                                                ↓
                    ┌───────────────────────────┼────────────────────────┐
                    ↓                           ↓                        ↓
              Phase 6A (Sarah)          Phase 6B (Marcus)        Phase 6C (Lisa)
                                        Phase 6D (David)         Phase 6E (Kevin)
                                                ↓
                                         Phase 7 (Integration)
```

**Phases 6B-6E can run in parallel** (2-3 at a time with sufficient team resources)

---

## Key Principles

### 🎭 Mock-First Approach
All ACO connections are **MOCKED** but designed to mirror production API format exactly. This enables seamless transition to real ACO when ready.

### 🎯 Persona-Agnostic Architecture
All file names, blocks, and components are generic. Persona-specific logic is isolated in configuration and dashboard/builder modules.

### ✅ Testable Phases
Each phase has explicit success criteria, testing checklists, and clear deliverables.

### 📊 Incremental Delivery
Phases deliver working, testable functionality that builds on previous phases.

### 🎨 Professional UX
- No emojis - custom SVG icons throughout
- Immersive visual experiences
- Educational content where appropriate
- Mobile responsive
- Accessibility compliant

---

## CCDM Demonstration Strategy

### Primary Demo: David's Deck Builder (Phase 6D)
The deck builder provides the **clearest demonstration of CCDM filtering**:

1. **Entry**: 2,847 products available (all deck products)
2. **Shape Selection**: ⬇ to 643 products (rectangular only)
3. **Material Selection**: ⬇ to 127 products (composite material)
4. **Railing Selection**: ⬇ to 89 products (compatible railings)

Each step shows:
- Loading state with specific message
- Visual product count change
- Catalog progressively filtered

### Supporting Demos:
- **Marcus**: Phase-based filtering (foundation → envelope → interior)
- **Lisa**: Package tier filtering (good → better → best)

---

## Success Metrics

### Technical
- ✅ All 5 personas functional
- ✅ Mock ACO mirrors production format
- ✅ 6 customer groups with differentiated pricing
- ✅ CCDM policies filter correctly
- ✅ No emojis (professional icons)
- ✅ Mobile responsive
- ✅ Performance targets met

### User Experience
- ✅ Each persona has unique, optimized journey
- ✅ Visual, immersive experiences
- ✅ Educational content where needed
- ✅ CCDM filtering clearly demonstrated
- ✅ Professional UX throughout

### Documentation
- ✅ All phase plans complete
- ✅ Architecture decisions documented
- ✅ Component library documented
- ✅ Demo walkthrough created

---

## Timeline Summary

| Phase Group | Duration | Can Parallelize? |
|-------------|----------|------------------|
| Phase 0-1 | 2-3 weeks | ✅ Yes |
| Phase 2 | 1 week | Partial (during Phase 0) |
| Phase 3 | 1-2 weeks | No |
| Phase 4 | 2 weeks | No |
| Phase 5 | 2-3 weeks | No |
| Phase 6A-6E | 7-10 weeks | ✅ Yes (2-3 at once) |
| Phase 7 | 2 weeks | No |

**Total Estimated Duration**: 17-23 weeks (4-6 months)

With parallel work on Phase 6: **15-20 weeks (4-5 months)**

---

## Getting Started

1. **Review meta-plan**: Read `PERSONA-META-PLAN.md` for overall strategy
2. **Understand personas**: Read `BUILDRIGHT-PERSONAS-AND-FLOWS.md`
3. **Start with Phase 0**: Begin research and architecture decisions
4. **Follow dependencies**: Each phase document lists what must complete first
5. **Track progress**: Use the progress table in `PERSONA-META-PLAN.md`

---

## Questions or Issues

Refer to:
- **Architecture questions**: Phase 0 research documents
- **Data questions**: Phase 1 documents
- **UI/UX questions**: Phase 2 (icons), existing `CSS-ARCHITECTURE.md`
- **Persona-specific questions**: Individual Phase 6 documents
- **Integration questions**: Phase 7 document

---

**Index Version**: 1.0  
**Created**: November 15, 2024  
**Last Updated**: November 15, 2024

**Total Phase Plans**: 13 detailed plans covering all aspects of implementation

