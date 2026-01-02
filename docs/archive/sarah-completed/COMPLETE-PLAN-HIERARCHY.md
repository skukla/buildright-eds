# Complete Project Plan: Phase-by-Phase Breakdown

**Last Updated**: December 2, 2025  
**Current Phase**: Phase 6A, Sub-Phase 1 (Design)  
**Status**: On Track

---

## 📊 Overall Project Structure

```
BuildRight EDS Persona-Driven Experience

├─ Phase 0-5: Foundation (COMPLETE)
├─ Phase 6: Persona Implementations (IN PROGRESS)
│   ├─ 6-0: Foundation
│   ├─ 6A: Sarah Martinez (Production Builder) ← CURRENT
│   ├─ 6B: Marcus Johnson (General Contractor)
│   ├─ 6C: Lisa Chen (Remodeling Contractor)
│   ├─ 6D: David Thompson (DIY Homeowner)
│   └─ 6E: Kevin Rodriguez (Store Manager)
├─ Phase 7: Integration & Polish
├─ Phase 8: Backend Integration (Adobe Commerce + ACO)
├─ Phase 9: Production Deployment
└─ Phase 10: Authoring Transition
```

---

## ✅ COMPLETED PHASES (Phases 0-5)

### Phase 0: Research & Architecture Decisions
**Status**: ✅ Complete  
**Deliverables**:
- Architecture Decision Records (ADR-001 through ADR-006)
- Technology stack decisions
- EDS vs. custom framework decision
- Mock ACO service strategy

---

### Phase 1: ACO Data Generation
**Status**: ✅ Complete  
**Location**: `buildright-aco` repository  
**Deliverables**:
- Product definitions with persona-specific attributes
- Price books for 6 customer groups
- Catalog views (5 personas)
- Custom attributes for CCDM

---

### Phase 2: Design System Foundation
**Status**: ✅ Complete  
**Deliverables**:
- CSS architecture (`styles/styles.css`)
- Design tokens (spacing, colors, typography)
- Base components (buttons, forms, cards)
- Icon system (Lucide icons)

---

### Phase 3: Core Architecture
**Status**: ✅ Complete  
**Deliverables**:
- EDS blocks system
- URL routing (`scripts/url-router.js`)
- Authentication system (`scripts/auth.js`)
- Persona configuration (`scripts/persona-config.js`)
- Dashboard router (`scripts/dashboard.js`)

---

### Phase 4: Shared Components
**Status**: ✅ Complete  
**Deliverables**:
- Header block
- Footer block
- Cart system (`scripts/cart-manager.js`)
- Mini cart block
- Product tiles
- Fragment loader

---

### Phase 5: Page Refinements
**Status**: ✅ Complete  
**Deliverables**:
- Product detail page improvements
- Catalog page enhancements
- Order history page
- Account page structure
- Responsive design updates

---

## 🚧 CURRENT PHASE: Phase 6 (Persona Implementations)

### Phase 6-0: Foundation (Project Entity & Services)
**Status**: ✅ Complete (Planning)  
**Time**: 5-7 hours  
**Documents**: `docs/phase-6/0-foundation/`

**Deliverables**:
- [ ] Project entity schema (~80 fields)
- [ ] ProjectManager service (CRUD operations)
- [ ] LocalStorage adapter
- [ ] Terminology mapping (Build/Job/Project)
- [ ] Product taxonomy decisions
- [ ] ACO catalog architecture

**Files to Create**:
- `scripts/services/project-manager.js`
- `scripts/services/project-storage.js`

---

### Phase 6A: Sarah Martinez (Production Builder) 🎨 CURRENT
**Status**: 🚧 In Progress (Design Phase)  
**Time**: 2-3 weeks  
**Documents**: `docs/phase-6/A-sarah-dashboard/`

---

#### Sub-Phase 1: Dashboard Simplification ✅ COMPLETE
**Time**: 2-3 hours  
**Status**: ✅ Complete

**Completed Tasks**:
- [x] Simplified `template-dashboard.js` (removed browsing features)
- [x] Updated `template-dashboard.css` (compact layout, 4-column grid)
- [x] Removed statistics display
- [x] Removed dual-image layout
- [x] Added "Start New Build" primary action
- [x] Tested responsive design

**Files Modified**:
- `scripts/dashboards/template-dashboard.js`
- `styles/dashboards/template-dashboard.css`

**Result**: Clean, action-oriented dashboard focusing on quick build initiation

---

#### Sub-Phase 2: Template Selection Page ⏭️ OPTIONAL
**Time**: 1-2 hours  
**Status**: ⏭️ May Skip (redundant with simplified dashboard)

**Scope**:
- Standalone template selection page
- Large images, clean spacing
- Could be skipped if dashboard is sufficient

**Decision**: Defer until we test Sub-Phase 1 results

---

#### Sub-Phase 3: Build Configurator 🎨 DESIGN PHASE (CURRENT)
**Time**: 
- Design: 4-6 hours
- Implementation: 8-10 hours

**Status**: 🎨 Design In Progress

**Design Deliverables**:
- [ ] Wireframe: Single-page configurator layout
- [ ] Component: Variant selector (radio button cards)
- [ ] Component: Package selector (comparison cards)
- [ ] Component: Phase selection (checkboxes)
- [ ] Component: Upgrades selector (grouped checkboxes)
- [ ] Component: Cost calculator (real-time summary)
- [ ] Interaction flow: Configuration → BOM generation

**Implementation Deliverables** (Future):
- [ ] Create `pages/build-configurator.html`
- [ ] Create `scripts/builders/project-configurator.js`
- [ ] Create `styles/builders/project-configurator.css`
- [ ] Integrate with template-dashboard flow
- [ ] ProjectManager integration (save configuration)

**Key Design Questions**:
- ✅ Single page vs. wizard? → Single page (decided)
- ✅ Variants: Pre-configured or discretionary? → Pre-configured (clarified)
- ✅ Packages: How to display? → Side-by-side comparison cards
- 🎨 Upgrades: How to organize? → Group by construction phase

---

#### Sub-Phase 4: BOM Generation Update ⏭️ IMPLEMENTATION PHASE
**Time**: 2-3 hours  
**Status**: ⏭️ Planned (after design complete)

**Scope**:
- Update `scripts/builders/template-builder.js`
- Accept Project configuration as input
- Apply variant selections (structural changes)
- Apply package selections (SKU mappings)
- Apply upgrade selections (add specific products)
- Filter by selected phases (Foundation, Envelope, Interior)
- Integrate with `buildright-service` GraphQL API

**Files to Modify**:
- `scripts/builders/template-builder.js`
- `scripts/aco-service.js` (add GraphQL BOM query)

**Dependencies**:
- Sub-Phase 3 complete (configurator design)
- `buildright-service` running locally

---

#### Sub-Phase 5: My Builds Dashboard 🎨 DESIGN PHASE
**Time**:
- Design: 3-4 hours
- Implementation: 6-8 hours

**Status**: 🎨 Pending Design

**Design Deliverables**:
- [ ] Wireframe: Dashboard layout
- [ ] Component: Build status cards
- [ ] Component: Order history timeline (per build)
- [ ] Component: Quick action buttons (Order Next Phase, Clone Build)
- [ ] Component: Empty state ("No active builds")
- [ ] Component: Active builds filter/sort

**Implementation Deliverables** (Future):
- [ ] Create "My Builds" view in dashboard router
- [ ] Update `scripts/dashboard.js` routing
- [ ] Display builds from ProjectManager
- [ ] Show order history per build
- [ ] Implement "Clone Build" functionality
- [ ] Implement "Order Next Phase" flow

**Files to Create/Modify**:
- Update `scripts/dashboards/template-dashboard.js` (add "My Builds" tab)
- Create styles in `styles/dashboards/template-dashboard.css`

---

#### Sub-Phase 6: BOM Review Page 🎨 DESIGN PHASE
**Time**:
- Design: 3-4 hours
- Implementation: 6-8 hours

**Status**: 🎨 Pending Design

**Design Deliverables**:
- [ ] Wireframe: Phase-based accordion layout
- [ ] Component: Phase accordion header (cost, percentage)
- [ ] Component: Category sub-groups (Concrete, Lumber, Windows, etc.)
- [ ] Component: Product line items (SKU, qty, price, specs, brand)
- [ ] Component: Override indicators (★ for package upgrades)
- [ ] Component: Metadata footer (generated date, overrides count)
- [ ] Component: Action buttons (Edit Configuration, Print BOM, Add to Cart)

**Implementation Deliverables** (Future):
- [ ] Create `pages/bom-review.html`
- [ ] Render BOM grouped by phase
- [ ] Show category sub-groups within phases
- [ ] Display product details (from ACO/buildright-service)
- [ ] Highlight package overrides with star icon (★)
- [ ] "Edit Configuration" returns to configurator
- [ ] "Add to Cart" integration

**Files to Create**:
- `pages/bom-review.html`
- `styles/bom-review.css` (or reuse existing components)

**Design Pattern** (from research):
- Phase-grouped accordion (industry standard)
- Collapse/expand sections
- Category sub-grouping for scanability
- Product specs inline (brand, quality tier)

---

#### Sub-Phase 7: Integration & Polish ⏭️ IMPLEMENTATION PHASE
**Time**: 2-3 hours  
**Status**: ⏭️ Planned (after all designs complete)

**Scope**:
- Header navigation updates (add "My Builds" link)
- Breadcrumbs on all new pages
- Success/error messages
- Loading states (BOM generation)
- Mobile responsive testing
- Cross-browser testing
- Performance optimization
- End-to-end flow testing

**Files to Modify**:
- `blocks/header/header.js`
- `blocks/breadcrumbs/breadcrumbs.js`
- All new pages (add loading overlays)

---

### Phase 6B: Marcus Johnson (General Contractor) ⏭️ PLANNED
**Status**: ⏭️ Planned (after 6A complete)  
**Time**: 1 week  
**Documents**: `docs/phase-6/B-to-7-consolidated/PHASES-6B-TO-7-CONSOLIDATED.md`

**Key Features**:
- Semi-custom project builder wizard
- Phase-based ordering (order Phase 1, come back later for Phase 2)
- Project persistence across sessions
- Material quality selection (budget/professional/premium)
- Catalog browsing with context (filtered by project specs)

**Deliverables**:
- [ ] Enhanced project wizard (5 steps)
- [ ] Phase selection modal
- [ ] Saved projects dashboard
- [ ] Phase 2+ ordering flow

---

### Phase 6C: Lisa Chen (Remodeling Contractor) ⏭️ PLANNED
**Status**: ⏭️ Planned  
**Time**: 1 week

**Key Features**:
- Package comparison (Good/Better/Best)
- Room-based configuration (bathroom, kitchen)
- Quote generation & sharing
- Client approval workflow

**Deliverables**:
- [ ] Package comparison page (3-column grid)
- [ ] Customization within tier (swap products)
- [ ] Add-ons page (checkboxes for extras)
- [ ] Quote generation ("Email to Client")

---

### Phase 6D: David Thompson (DIY Homeowner) ⏭️ PLANNED
**Status**: ⏭️ Planned  
**Time**: 1 week

**Key Features**:
- Project builder wizard (deck/fence/patio)
- Guided step-by-step configuration
- Save & resume functionality
- Educational content (tooltips, recommendations)

**Deliverables**:
- [ ] Project type selection
- [ ] 5-step wizard (shape, size, material, railing, accessories)
- [ ] Save/resume project
- [ ] Educational tooltips

---

### Phase 6E: Kevin Rodriguez (Store Manager) ⏭️ PLANNED
**Status**: ⏭️ Planned  
**Time**: 3-4 days

**Key Features**:
- Restock dashboard (velocity-based)
- Priority category highlighting (low stock alerts)
- Quick reorder (suggested quantities)
- Delivery scheduling

**Deliverables**:
- [ ] Restock dashboard (health bars per category)
- [ ] Category detail view (velocity suggestions)
- [ ] Order summary (delivery scheduling)

**Note**: Kevin does NOT use the Project entity (different workflow)

---

## ⏭️ FUTURE PHASES

### Phase 7: Integration & Polish
**Status**: ⏭️ Planned  
**Time**: 1 week

**Scope**:
- Cross-persona feature testing
- Performance optimization (lazy loading, code splitting)
- Accessibility audit (WCAG 2.1 AA compliance)
- Browser compatibility testing
- Mobile responsive refinements
- Documentation updates

**Deliverables**:
- [ ] All 5 personas working seamlessly
- [ ] Shared components optimized
- [ ] Performance benchmarks met (< 2s page load)
- [ ] Accessibility compliance

---

### Phase 8: Backend Integration (Adobe Commerce + ACO)
**Status**: ⏭️ Planned  
**Time**: 2-3 weeks  
**Documents**: `docs/phase-8-backend/`

**Scope**:
- Adobe Commerce PaaS setup
- ACO integration (real product data)
- Dropins integration (cart, checkout, auth)
- API Mesh configuration
- Real GraphQL queries (replace mocks)

**Key Milestones**:
- [ ] Commerce PaaS instance provisioned
- [ ] ACO connected to Commerce
- [ ] Products synced to ACO
- [ ] Catalog views configured (5 personas)
- [ ] Dropins integrated on frontend
- [ ] Mock ACO service replaced with real ACO

**Reference Documents**:
- `DROPIN-ARCHITECTURE.md`
- `ACO-INTEGRATION-GUIDE.md`
- `DATA-SOURCE-MATRIX.md`

---

### Phase 9: Production Deployment
**Status**: ⏭️ Planned  
**Time**: 1 week  
**Documents**: `docs/phase-9-deployment/`

**Scope**:
- GitHub repository setup (public or private)
- Franklin (AEM EDS) project configuration
- CDN setup (Fastly)
- Domain configuration
- Environment variables (prod vs. staging)
- Monitoring setup (Sentry, Google Analytics)

**Deliverables**:
- [ ] Live production site on aem.page or custom domain
- [ ] CI/CD pipeline (auto-deploy on main branch)
- [ ] Monitoring & error tracking
- [ ] Performance monitoring

**Reference Documents**:
- `PHASE-9-PRODUCTION-DEPLOYMENT.md`
- `DEMO-TO-PRODUCTION-MIGRATION-GUIDE.md`

---

### Phase 10: Authoring Transition
**Status**: ⏭️ Planned  
**Time**: 3-5 days  
**Documents**: `docs/phase-10-authoring/`

**Scope**:
- Migrate content from HTML to Google Docs/SharePoint
- Document authoring workflows
- Train content authors on EDS authoring
- Create content templates

**Deliverables**:
- [ ] All pages authored in Google Docs (or SharePoint)
- [ ] Fragment authoring guide
- [ ] Author training documentation
- [ ] Content governance guidelines

---

## 📊 Current Progress Summary

| Phase | Status | Progress | Est. Time | Notes |
|-------|--------|----------|-----------|-------|
| **0-5** | ✅ Complete | 100% | ~6 weeks | Foundation laid |
| **6-0** | ✅ Planning Complete | 100% | 5-7h | Ready for implementation |
| **6A-1** | ✅ Complete | 100% | 2-3h | Dashboard simplified |
| **6A-2** | ⏭️ Optional | 0% | 1-2h | May skip |
| **6A-3** | 🎨 Design | 20% | 4-6h | Configurator wireframes |
| **6A-4** | ⏭️ Planned | 0% | 2-3h | BOM generation |
| **6A-5** | 🎨 Design | 0% | 3-4h | My Builds dashboard |
| **6A-6** | 🎨 Design | 0% | 3-4h | BOM review page |
| **6A-7** | ⏭️ Planned | 0% | 2-3h | Integration & polish |
| **6B-E** | ⏭️ Planned | 0% | 3-4 weeks | Other personas |
| **7** | ⏭️ Planned | 0% | 1 week | Cross-persona integration |
| **8** | ⏭️ Planned | 0% | 2-3 weeks | Backend setup |
| **9** | ⏭️ Planned | 0% | 1 week | Production deployment |
| **10** | ⏭️ Planned | 0% | 3-5 days | Authoring transition |

---

## 🎯 Current Focus: Phase 6A Design

### Active Work (This Week)
```
🎨 DESIGN PHASE (Sub-Phases 3, 5, 6)

1. Build Configurator Design
   ├─ Wireframe single-page layout
   ├─ Design variant selector
   ├─ Design package comparison
   ├─ Design upgrades selector
   └─ Design cost calculator

2. BOM Review Design
   ├─ Wireframe phase accordion
   ├─ Design line item display
   ├─ Design override indicators
   └─ Design action buttons

3. My Builds Dashboard Design
   ├─ Wireframe dashboard layout
   ├─ Design build status cards
   ├─ Design order history
   └─ Design quick actions
```

### Next Steps (After Design)
```
💻 IMPLEMENTATION PHASE (Sub-Phases 4, 7)

1. Build Components
   ├─ Create HTML pages
   ├─ Write JavaScript modules
   ├─ Add CSS styles
   └─ Wire up routing

2. Integrate Backend
   ├─ Connect to buildright-service
   ├─ Call GraphQL BOM API
   ├─ Update ProjectManager
   └─ Test end-to-end flow

3. Polish & Test
   ├─ Mobile responsive
   ├─ Cross-browser testing
   ├─ Performance optimization
   └─ User acceptance testing
```

---

## 📚 Key Documents by Phase

### Phase 6A (Current)
- `PHASE-6A-DASHBOARD-REDESIGN-PLAN.md` - Complete plan
- `DESIGN-REQUIREMENTS.md` - UI/UX specs
- `VARIANTS-VS-UPGRADES.md` - Configuration options
- `PLAN-ALIGNMENT-AND-REAL-WORLD-CONTEXT.md` - Real-world research
- `COMPLETE-PLAN-HIERARCHY.md` - This document

### Phase 6 Foundation
- `docs/phase-6/0-foundation/README.md` - Foundation overview
- `docs/phase-6/0-foundation/02-PROJECT-MANAGER-API.md` - API reference

### Overall Project
- `docs/PERSONA-PLAN-CORE-DOCS.md` - Navigation hub
- `docs/PHASE-PLANS-INDEX.md` - All phase plans index
- `docs/explanations/personas/BUILDRIGHT-PERSONAS-AND-FLOWS.md` - All 5 personas

---

## ✅ Definition of Done

### Phase 6A Complete When:
- [x] Sub-Phase 1: Dashboard simplified ✅
- [ ] Sub-Phase 3: Configurator designed & built
- [ ] Sub-Phase 4: BOM generation integrated with buildright-service
- [ ] Sub-Phase 5: My Builds dashboard designed & built
- [ ] Sub-Phase 6: BOM review page designed & built
- [ ] Sub-Phase 7: All flows tested end-to-end
- [ ] No console errors, no linter errors
- [ ] Mobile responsive on all pages
- [ ] Cross-browser compatible (Chrome, Safari, Firefox)
- [ ] Sarah can complete a build order in < 3 minutes

### Overall Project Complete When:
- [ ] All 5 personas implemented
- [ ] Real ACO backend integrated
- [ ] Production deployment live
- [ ] Content authored in Google Docs
- [ ] Documentation complete

---

**Last Updated**: December 2, 2025  
**Current Status**: Phase 6A, Sub-Phase 3 (Design)  
**Next Milestone**: Complete Build Configurator design  
**Estimated Completion**: Phase 6A by end of week 2

