# Persona Plan - Core Documentation Index

**Purpose**: Navigation hub to help you find the right documents for BuildRight persona implementation. This doc provides **context and pointers**, not comprehensive content.

**Use this to**: Orient yourself, find relevant docs, understand the plan structure  
**Don't use this as**: A single source of all information - follow links to detailed docs

**Last Updated**: November 24, 2025

---

## 🎯 How to Use This Document

1. **New to the project?** → Read "Start Here: Master Planning Documents" below
2. **Looking for something specific?** → Use "Quick Navigation by Task" at the bottom
3. **Want the complete roadmap?** → Go to [PHASE-PLANS-INDEX.md](./PHASE-PLANS-INDEX.md)
4. **Ready to implement?** → Go to [PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md)

---

## ⭐ Cross-Phase Reference Folders (Used Throughout All Phases)

These folders contain documentation referenced across **ALL phases** of the project:

| Folder | Contents | When to Use |
|--------|----------|-------------|
| **[personas/](./personas/)** | All 5 personas, flows, UX patterns, implementation plans | Implementing any persona feature |
| **[standards/](./standards/)** | CSS architecture, coding principles, components, animations | Writing any code or CSS |
| **[testing/](./testing/)** | Testing strategies, QA checklists | Testing any feature |
| **[adr/](./adr/)** | Architectural Decision Records (ADR-001 through ADR-006) | Making architectural decisions |

**These are NOT archived or phase-specific - they're active reference docs for all work!**

---

## 🎯 Start Here: Master Planning Documents

### Navigation Hubs

**[PHASE-PLANS-INDEX.md](./PHASE-PLANS-INDEX.md)** ⭐ **NAVIGATION HUB**
**The Roadmap** - Complete index of all phase plans
- Start here to navigate the entire plan
- Links to all phase documents
- Status tracking

**[PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md)** 🚧 **CURRENT WORK**
**Active Implementation** - Phases 6B-7 (Marcus, Lisa, David, Kevin personas)
- Detailed implementation plans for each persona
- Data requirements
- Success criteria
- Demo scripts

### Personas (All Documentation)

**[personas/](./personas/)** folder contains:
- **BUILDRIGHT-PERSONAS-AND-FLOWS.md** - All 5 personas and user flows
- **PERSONA-META-PLAN.md** - Overall strategy and phased rollout
- **PERSONA-IMPLEMENTATION-PLAN.md** - Technical implementation details
- **PERSONA-UX-MAP.md** - UX patterns by persona

**See [personas/README.md](./personas/README.md) for complete index**

---

## 📋 Phase Plans (In Order)

### Completed Phases

| Phase | Document | Status | Key Deliverable |
|-------|----------|--------|-----------------|
| 0 | PHASE-0-RESEARCH-AND-DECISIONS.md | ✅ Complete | Architecture decisions |
| 1 | PHASE-1-ACO-DATA-FOUNDATION.md | ✅ Complete | Data structure |
| 2 | PHASE-2-FINAL-SUMMARY.md | ✅ Complete | Design system foundation |
| 3 | PHASE-3-CORE-ARCHITECTURE.md | ✅ Complete | Core EDS architecture |
| 4 | PHASE-4-COMPLETION-SUMMARY.md | ✅ Complete | Shared components |
| 5 | PHASE-5-TASK-5-COMPLETION-SUMMARY.md | ✅ Complete | PDP & catalog refinements |
| 6A | PHASE-6A-PERSONA-SARAH.md | ✅ Complete | Sarah persona implementation |

### Active/Upcoming Phases

| Phase | Document | Status | Key Deliverable |
|-------|----------|--------|-----------------|
| 6B | PHASES-6B-TO-7-CONSOLIDATED.md | 🚧 In Progress | Marcus persona |
| 6C | PHASES-6B-TO-7-CONSOLIDATED.md | 📋 Planned | Lisa persona |
| 6D | PHASES-6B-TO-7-CONSOLIDATED.md | 📋 Planned | David persona |
| 6E | PHASES-6B-TO-7-CONSOLIDATED.md | 📋 Planned | Kevin persona |
| 7 | PHASES-6B-TO-7-CONSOLIDATED.md | 📋 Planned | Demo polish & integration |
| 8 | PHASE-8-BACKEND-SETUP-UPDATED.md | 📋 Planned | Adobe Commerce + ACO backend |
| 9 | PHASE-9-PRODUCTION-DEPLOYMENT.md | 📋 Planned | Production deployment |
| 10 | PHASE-10-AUTHORING-TRANSITION.md | 📋 Planned | Content authoring transition |

---

## 🏗️ Architecture & Technical Decisions

### Architecture Decision Records (ADRs)

**[adr/](./adr/)** folder contains all architectural decisions:

| ADR | Title | Impact |
|-----|-------|--------|
| ADR-001 | Use Dropins for Commerce | ⭐⭐⭐ Critical - Core commerce approach |
| ADR-002 | Use EDS Blocks for Content | ⭐⭐⭐ Critical - Content architecture |
| ADR-003 | Mock ACO Service | ⭐⭐ High - Demo mode strategy |
| ADR-004 | Custom Attributes for Personas | ⭐⭐⭐ Critical - Persona implementation |
| ADR-005 | Dual Mode Authentication | ⭐⭐ High - Demo vs production auth |
| ADR-006 | Multi-Location Store Manager | ⭐⭐ High - Kevin's architecture |

**See [adr/README.md](./adr/README.md) for complete index**

### Standards (Cross-Phase Architecture)

**[standards/](./standards/)** folder contains:
- **CSS-ARCHITECTURE.md** ⭐⭐⭐ Critical - Design system & styling patterns
- **CODING-PRINCIPLES.md** ⭐⭐⭐ Critical - Code standards for this project
- **COMPONENT-DESIGN-LIBRARY.md** - Reusable component catalog
- **ADAPTIVE-LAYOUT-PATTERN.md** - Responsive layout patterns
- **ANIMATION_STANDARDIZATION.md** - Animation standards
- **image-guidelines.md** - Image standards

**See [standards/README.md](./standards/README.md) for complete index**

### Backend Integration (Phase 8)

**[phase-8-backend/](./phase-8-backend/)** folder contains:
- **DROPIN-ARCHITECTURE.md** - Adobe Commerce Dropins integration
- **AUTH-STRATEGY.md** - Authentication & persona detection
- **DATA-SOURCE-MATRIX.md** - Commerce PaaS vs ACO data sources
- **BLOCK-VS-DROPIN-MATRIX.md** - When to use blocks vs dropins
- Plus ACO, product data, and EDS integration docs

**See [phase-8-backend/README.md](./phase-8-backend/README.md) for complete index**

---

## 🚀 Migration & Deployment

### Backend Setup (Phase 8)

**Location**: [phase-8-backend/](./phase-8-backend/)

All documentation for Adobe Commerce PaaS + ACO backend setup, including:
- PHASE-8-BACKEND-SETUP-UPDATED.md - Main setup guide
- ACO documentation (6 files)
- Commerce integration (Dropins, auth, data sources)
- Product data flows
- EDS integration patterns

### Production Deployment (Phase 9)

**Location**: [phase-9-deployment/](./phase-9-deployment/)

| Document | Purpose | When to Use |
|----------|---------|-------------|
| **DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md** ⭐ | Step-by-step migration from mocks to live APIs | Phase 9 implementation |
| PHASE-9-PRODUCTION-DEPLOYMENT.md | Detailed deployment architecture | Phase 9 reference |

---

## 📊 Data & Integration

### Product & Catalog

| Document | Purpose |
|----------|---------|
| PRODUCT-FLOW-ADOBE-COMMERCE-TO-ACO.md | How products flow from Commerce to ACO |
| PRODUCT-RECORD-CREATION-FLOW.md | Product creation workflow |
| MOCK-ACO-API-SPEC.md | Mock ACO service specification |
| ACO-PRICING-RESEARCH.md | ACO pricing capabilities research |

### Data Architecture

| Document | Purpose |
|----------|---------|
| DATA-SOURCE-MATRIX.md | Hybrid Commerce + ACO architecture |
| ACO-COMMERCE-CATALOG-RELATIONSHIP-CORRECTION.md | Catalog sync explanation |
| FEED-TABLE-EXPLAINED.md | Data feed structure |

---

## 📖 Implementation Guides

### Developer Guides

| Document | Purpose | Audience |
|----------|---------|----------|
| DROPIN-INTEGRATION-GUIDE.md | How to integrate Adobe Commerce Dropins | Developers |
| FRAGMENT-AUTHORING-GUIDE.md | How to create content fragments | Content authors |
| EDS-MIGRATION-GUIDE.md | EDS patterns & best practices | Developers |
| CODING-PRINCIPLES.md | Code standards for this project | Developers |

### Reference

| Document | Purpose |
|----------|---------|
| PERSONA-UX-MAP.md | UX patterns by persona |
| PERSONA-IMPLEMENTATION-PLAN.md | Technical implementation details |
| COMPONENT-DESIGN-LIBRARY.md | Reusable component catalog |
| EDS-BLOCK-PATTERNS.md | EDS block pattern library |

---

## 🧪 Testing

| Document | Purpose |
|----------|---------|
| TESTING-GUIDE.md | Testing strategies & checklists |
| TESTING-GUIDE-PHASES-1-4.md | Testing for completed phases |
| PAGE-AUDIT-CHECKLIST.md | QA checklist for pages |

---

## 📚 Archive (Historical Reference)

These docs are archived but kept for historical context:

### Location: `docs/archive/`

- **old-project-builder/** - Previous project builder implementation
- **old-routing/** - Previous URL routing approach
- **product-images/** - Product image migration docs
- **bug-fixes/** - Historical bug fix documentation
- **old-audits/** - Previous code audits

**See**: `docs/archive/README.md` for details

---

## 🗺️ Quick Navigation by Task

### "I want to implement a new persona"
1. Read: **[personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](./personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)** (persona definition)
2. Read: **[PHASES-6B-TO-7-CONSOLIDATED.md](./PHASES-6B-TO-7-CONSOLIDATED.md)** (implementation plan)
3. Reference: **[personas/PERSONA-IMPLEMENTATION-PLAN.md](./personas/PERSONA-IMPLEMENTATION-PLAN.md)** (technical approach)
4. Check: **[adr/ADR-004](./adr/ADR-004-custom-attributes-for-personas.md)** (custom attributes strategy)

### "I want to understand the architecture"
1. Read: **[phase-0-5-foundation/PHASE-3-CORE-ARCHITECTURE.md](./phase-0-5-foundation/PHASE-3-CORE-ARCHITECTURE.md)** (core architecture)
2. Read: **[standards/CSS-ARCHITECTURE.md](./standards/CSS-ARCHITECTURE.md)** (design system)
3. Read: **[phase-8-backend/DROPIN-ARCHITECTURE.md](./phase-8-backend/DROPIN-ARCHITECTURE.md)** (commerce integration)
4. Read: **[phase-8-backend/DATA-SOURCE-MATRIX.md](./phase-8-backend/DATA-SOURCE-MATRIX.md)** (data sources)
5. Scan: **[adr/](./adr/)** (all architectural decisions)

### "I want to deploy to production"
1. Read: **[phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md](./phase-9-deployment/DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md)** (migration steps)
2. Read: **[phase-9-deployment/PHASE-9-PRODUCTION-DEPLOYMENT.md](./phase-9-deployment/PHASE-9-PRODUCTION-DEPLOYMENT.md)** (deployment architecture)
3. Read: **[phase-8-backend/PHASE-8-BACKEND-SETUP-UPDATED.md](./phase-8-backend/PHASE-8-BACKEND-SETUP-UPDATED.md)** (backend setup)
4. Reference: **[adr/ADR-003](./adr/ADR-003-mock-aco-service.md)** (mock to production transition)

### "I want to understand the overall plan"
1. Start: **[PHASE-PLANS-INDEX.md](./PHASE-PLANS-INDEX.md)** (navigation hub)
2. Read: **[personas/PERSONA-META-PLAN.md](./personas/PERSONA-META-PLAN.md)** (strategy)
3. Read: **[PHASE-PLANS-SUMMARY.md](./PHASE-PLANS-SUMMARY.md)** (quick overview)
4. Scan: **[personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md](./personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md)** (use cases)

### "I want to contribute code"
1. Read: **[standards/CODING-PRINCIPLES.md](./standards/CODING-PRINCIPLES.md)** (standards)
2. Read: **[standards/CSS-ARCHITECTURE.md](./standards/CSS-ARCHITECTURE.md)** (CSS patterns)
3. Read: **[phase-8-backend/EDS-MIGRATION-GUIDE.md](./phase-8-backend/EDS-MIGRATION-GUIDE.md)** (EDS best practices)
4. Reference: **[standards/COMPONENT-DESIGN-LIBRARY.md](./standards/COMPONENT-DESIGN-LIBRARY.md)** (reusable components)

---

## 📈 Documentation Maintenance

### Recently Updated (Nov 2025)
- ✅ DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md (NEW)
- ✅ ADR-006-multi-location-store-manager.md (NEW)
- ✅ PHASES-6B-TO-7-CONSOLIDATED.md (Phase 6E updated)
- ✅ DATA-SOURCE-MATRIX.md (Hybrid architecture)
- ✅ PHASE-PLANS-INDEX.md (Navigation hub)
- ✅ Documentation reorganization (personas/, standards/, testing/ folders)

### Deprecated (Kept for Reference in archive/)
- 🗄️ IMPLEMENTATION-ROADMAP.md (superseded by phase-specific plans)
- 🗄️ UX-AUDIT-AND-VISION.md (pre-dates persona plan)
- 🗄️ PHASE-2-DESIGN-SYSTEM-AND-ICONS-ORIGINAL.md (superseded by DEFERRED version)
- 🗄️ PHASE-8-BACKEND-SETUP.md (superseded by UPDATED version)
- 🗄️ ACO-COMMERCE-CATALOG-RELATIONSHIP.md (incorrect info - deleted)

---

## 🎯 Critical Path Documents

If you only read **5 documents** to understand the entire persona plan:

1. **PHASE-PLANS-INDEX.md** - Navigation & roadmap
2. **BUILDRIGHT-PERSONAS-AND-FLOWS.md** - Who are the users?
3. **PHASES-6B-TO-7-CONSOLIDATED.md** - Current implementation plan
4. **DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md** - How to go live
5. **docs/adr/README.md** - Key architectural decisions

---

**Next Steps**:
1. Bookmark this document for quick reference
2. Navigate using **PHASE-PLANS-INDEX.md** for detailed exploration
3. Check **PHASES-6B-TO-7-CONSOLIDATED.md** for current work
4. Consult **ADRs** when making architectural decisions


