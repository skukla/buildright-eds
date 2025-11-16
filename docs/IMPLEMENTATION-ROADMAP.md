# BuildRight Persona Demo - Implementation Roadmap

## Overview

This document provides a complete roadmap for implementing the BuildRight persona-driven demo, from research through production deployment.

**Last Updated**: November 16, 2024  
**Status**: Phase 0 Complete ✅, Phase 1 Complete ✅, Phase 2 Deferred ⏸️, Ready for Phase 3

---

## Quick Reference

### Phase Status

| Phase | Name | Duration | Status | Dependencies |
|-------|------|----------|--------|--------------|
| **Phase 0** | Research & Decisions | 1 week | ✅ Complete | None |
| **Phase 1** | ACO Data Foundation | 2 weeks | ✅ Complete | Phase 0 |
| **Phase 2** | Design System & Icons | - | ⏸️ Deferred | Redistributed to Phase 5-6 |
| **Phase 3** | Core Architecture | 2 weeks | 🔜 Next | Phase 0 |
| **Phase 4** | Shared Components | 2 weeks | ⏳ Pending | Phase 3 |
| **Phase 5** | Existing Pages | 2 weeks | ⏳ Pending | Phase 3, 4 |
| **Phase 6A** | Sarah's Dashboard | 1 week | ⏳ Pending | Phase 3, 4, 5 |
| **Phase 6B** | Marcus's Dashboard | 1 week | ⏳ Pending | Phase 3, 4, 5 |
| **Phase 6C** | Lisa's Dashboard | 1 week | ⏳ Pending | Phase 3, 4, 5 |
| **Phase 6D** | David's Dashboard | 1 week | ⏳ Pending | Phase 3, 4, 5 |
| **Phase 6E** | Kevin's Dashboard | 1 week | ⏳ Pending | Phase 3, 4, 5 |
| **Phase 7** | Integration & Polish | 2 weeks | ⏳ Pending | Phase 6A-E |
| **Phase 8** | Backend Setup | 2-3 weeks | 🔄 Can run in parallel | Phase 1, Access to Adobe Commerce |
| **Phase 9** | Production Deployment | 2-3 weeks | ⏳ Pending | Phase 8, Phase 3-7 |

**Legend:**
- ✅ Complete
- 🔜 Next
- 🔄 In Parallel
- ⏳ Pending
- ⏸️ Deferred

---

## Implementation Strategy

### Two-Track Approach

The implementation follows a **two-track parallel approach** to maximize efficiency:

#### **Frontend Track** (buildright-eds)
Phases 3-7 build the complete persona-driven UI using a **mock ACO service**. This allows frontend development to proceed independently without being blocked by backend setup.

```
Phase 3: Core Architecture
  ↓
Phase 4: Shared Components
  ↓
Phase 5: Existing Pages
  ↓
Phase 6A-E: Persona Dashboards (parallel)
  ↓
Phase 7: Integration & Polish
```

#### **Backend Track** (buildright-aco + Adobe Commerce)
Phase 8 sets up the real Adobe Commerce/ACO backend using data and scripts from Phase 1. This can run **in parallel** with frontend development.

```
Phase 1: ACO Data Foundation ✅
  ↓
Phase 8: Backend Setup (parallel with Phase 3-7)
  ↓
Phase 9: Frontend-Backend Integration
```

**Benefits:**
- ✅ Frontend not blocked by backend setup
- ✅ Both tracks validate independently
- ✅ Can demo with mock while backend is being set up
- ✅ Faster overall timeline (2-3 weeks saved)
- ✅ Clean integration point (just swap mock for real)

---

## Phase Summaries

### Phase 0: Research & Decisions ✅
**Duration**: 1 week  
**Status**: Complete  
**Branch**: `persona-implementation`

**Objectives:**
- Research Adobe Commerce Storefront SDK (Dropins)
- Research EDS DOM patterns and best practices
- Design mock ACO service architecture
- Define authentication strategy
- Create Architecture Decision Records (ADRs)

**Key Deliverables:**
- `DROPIN-ARCHITECTURE.md` - Dropin integration patterns
- `DROPIN-INTEGRATION-GUIDE.md` - Step-by-step integration guide
- `BLOCK-VS-DROPIN-MATRIX.md` - Component decision matrix
- `EDS-DOM-PATTERNS.md` - EDS best practices
- `MOCK-ACO-API-SPEC.md` - Mock service specification
- `AUTH-STRATEGY.md` - Authentication approach
- 6 ADRs documenting key decisions

**Key Decisions:**
- Use Dropins for: Auth, Account, Cart, PDP
- Use EDS Blocks for: Persona dashboards, project builder, filters
- Mock ACO service mirrors real CCDM architecture
- Customer attributes for persona determination
- Sign-up wizard for onboarding (Phase 5)

---

### Phase 1: ACO Data Foundation ✅
**Duration**: 2 weeks  
**Status**: Complete  
**Repository**: `buildright-aco`

**Objectives:**
- Generate persona-driven product catalog
- Create price books with 2-layer pricing (tier + volume)
- Define 28 triggered policies for CCDM
- Generate EDS-compatible data for frontend
- Validate data for ACO ingestion

**Key Deliverables:**
- 177 products (70 simple, 92 variants, 15 bundles)
- 5 price books (US-Retail, Production-Builder, Trade-Professional, Wholesale-Reseller, Retail-Registered)
- 885 price entries with volume tier pricing
- 28 policy definitions across 10 categories
- EDS data transformation scripts
- Schema validation scripts
- Comprehensive case study and setup guide

**Data Pipeline:**
```bash
npm run generate:all  # Generate all ACO data + EDS data
npm run validate:phase1  # Validate all deliverables
npm run ingest:products:dry-run  # Test ingestion
```

**Key Achievements:**
- ✅ Realistic B2B pricing model (customer tier + volume tier)
- ✅ Complete policy coverage for all 5 personas
- ✅ Production-ready data for ACO ingestion
- ✅ Frontend-friendly data for mock service
- ✅ Comprehensive documentation

---

### Phase 2: Design System & Icons ⏸️
**Status**: Deferred  
**Reason**: Icon design should follow UI design, not precede it

**Original Plan**: Design ~40 custom icons upfront  
**New Approach**: Design icons incrementally as persona UIs are built

**Icon Work Redistributed:**
- **Phase 5**: Replace emoji with existing Lucide icons
- **Phase 6A (Sarah)**: 1 custom template icon (if needed)
- **Phase 6B (Marcus)**: 4 custom construction phase icons
- **Phase 6D (David)**: 2-3 custom deck shape icons
- **Phase 6E (Kevin)**: Use existing Lucide icons
- **Phase 7**: Optional icon consolidation

**Estimated Custom Icons**: 6-8 (vs original 40)

**See**: `PHASE-2-DESIGN-SYSTEM-AND-ICONS-DEFERRED.md` for full explanation

---

### Phase 3: Core Architecture 🔜
**Duration**: 2 weeks  
**Status**: Next  
**Dependencies**: Phase 0

**Objectives:**
- Create persona configuration system
- Build mock ACO service
- Implement authentication system (demo mode)
- Create generic persona pages
- Implement routing patterns

**Key Deliverables:**
- `scripts/persona-config.js` - Persona definitions and mappings
- `scripts/aco-service.js` - Mock ACO service (CCDM-compliant)
- `scripts/auth.js` - Demo authentication system
- `pages/dashboard.html` - Generic persona dashboard
- `pages/builder.html` - Generic project builder
- `scripts/url-router.js` - Persona-aware routing

**Success Criteria:**
- ✅ Can select persona via simulated onboarding
- ✅ Mock ACO returns persona-filtered products
- ✅ Pricing reflects customer group
- ✅ Routing handles persona context
- ✅ Session persists across pages

---

### Phase 4: Shared Components
**Duration**: 2 weeks  
**Dependencies**: Phase 3

**Objectives:**
- Build reusable EDS blocks
- Create shared UI components
- Implement common patterns

**Key Components:**
- Pricing display with tier badges
- Product filters with policy support
- Wizard progress indicators
- Project builder framework
- Inventory status displays

---

### Phase 5: Existing Pages
**Duration**: 2 weeks  
**Dependencies**: Phase 3, 4

**Objectives:**
- Refactor catalog page for persona filtering
- Update PDP for persona pricing
- Enhance cart with savings display
- Create sign-up/onboarding wizard
- Integrate Dropins with mock ACO

**Key Pages:**
- `catalog.html` - Persona-filtered product listing
- `product-detail.html` - Tier + volume pricing
- `cart.html` - Savings and discounts
- `signup.html` - Onboarding wizard (NEW)
- `account.html` - Customer profile

---

### Phase 6A-E: Persona Dashboards
**Duration**: 5 weeks (1 week each, can be parallel)  
**Dependencies**: Phase 3, 4, 5

Each persona gets a custom dashboard tailored to their workflow:

#### **Phase 6A: Sarah Martinez - Production Builder**
- Template-based ordering
- Bulk quantity management
- Multi-project tracking
- Foundation & framing phase filtering

#### **Phase 6B: Marcus Johnson - General Contractor**
- Construction phase wizard
- Quality tier selection
- Project timeline view
- Custom home builder tools

#### **Phase 6C: Lisa Chen - Remodeling Contractor**
- Room-by-room packages
- Better/Best/Premium tiers
- Before/after visualization
- Remodeling project planner

#### **Phase 6D: David Thompson - Pro Homeowner**
- Deck builder wizard
- Shape/material selection
- DIY project guides
- Step-by-step instructions

#### **Phase 6E: Kevin Rodriguez - Store Manager**
- Inventory velocity dashboard
- Restock priority alerts
- Bulk ordering interface
- Store management tools

---

### Phase 7: Integration & Polish
**Duration**: 2 weeks  
**Dependencies**: Phase 6A-E

**Objectives:**
- Cross-persona testing
- Performance optimization
- Bug fixes and refinements
- Demo walkthrough preparation
- Documentation updates

**Deliverables:**
- End-to-end test suite
- Performance benchmarks
- Demo script
- User guide
- Final documentation

---

### Phase 8: Backend Setup 🔄
**Duration**: 2-3 weeks  
**Status**: Can run in parallel with Phase 3-7  
**Dependencies**: Phase 1, Access to Adobe Commerce/ACO  
**Repository**: `buildright-aco` + Adobe Commerce Admin

**Objectives:**
- Configure Adobe Commerce customer groups
- Register custom customer attributes
- Ingest products/prices/bundles to ACO
- Configure 28 triggered policies in ACO Admin UI
- Create 5 demo customer accounts
- End-to-end backend validation

**Key Tasks:**
1. Customer Group Configuration (5 groups)
2. Custom Attribute Registration (5 attributes)
3. ACO Price Book Setup (5 books, 885 prices)
4. ACO Product Ingestion (177 products)
5. ACO Policy Configuration (28 policies)
6. Demo Customer Accounts (5 accounts)
7. End-to-End Validation
8. Documentation

**Ingestion Commands:**
```bash
cd buildright-aco
npm run ingest:products  # Ingest 177 products
npm run ingest:prices    # Ingest 885 prices
# Policies configured manually in ACO Admin UI
```

**Success Criteria:**
- ✅ All customer groups and attributes configured
- ✅ All products/prices ingested to ACO
- ✅ All policies active and filtering correctly
- ✅ Demo accounts can log in and see persona pricing
- ✅ Volume tier pricing works
- ✅ Backend configuration documented

**See**: `PHASE-8-BACKEND-SETUP.md` for detailed instructions

---

### Phase 9: Production Deployment
**Duration**: 2-3 weeks  
**Dependencies**: Phase 8, Phase 3-7  
**Repositories**: `accs-citisignal` (EDS), `buildright-mesh` (API Mesh)

**Objectives:**
- Deploy Adobe API Mesh as GraphQL gateway
- Migrate BuildRight code to EDS repository
- Integrate Adobe Commerce Dropins with real backend
- Deploy to production EDS environment
- End-to-end testing and optimization

**Architecture:**
```
User → Edge Delivery Services (accs-citisignal)
       ├─ Adobe Commerce Dropins
       └─ API Mesh Client
           ↓
       Adobe API Mesh (buildright-mesh)
       ├─ GraphQL Gateway
       ├─ Custom Resolvers (persona/pricing/policy)
       └─ Authentication Middleware
           ↓
       Adobe Commerce + ACO
       ├─ Customer Groups & Attributes
       ├─ Price Books & Pricing
       ├─ Products & Variants
       └─ Triggered Policies
```

**Key Tasks:**
1. Adobe API Mesh Setup
   - Create mesh configuration
   - Define custom GraphQL schema
   - Implement persona/pricing/policy resolvers
   - Deploy to Adobe I/O

2. EDS Repository Setup
   - Clone `accs-citisignal`
   - Configure environment
   - Migrate BuildRight code

3. API Mesh Integration
   - Create `api-mesh-client.js` (replaces `aco-service.js`)
   - Update scripts to use GraphQL queries
   - Implement persona/product/pricing queries

4. Dropin Integration
   - Update auth to use `@dropins/storefront-auth`
   - Update PDP to use `@dropins/storefront-pdp`
   - Update cart to use `@dropins/storefront-cart`

5. EDS Deployment
   - Configure EDS project
   - Deploy to production
   - Live URL: `https://main--accs-citisignal--demo-system-stores.aem.live`

6. Testing & Optimization
   - End-to-end testing
   - Performance optimization
   - Production documentation

**See**: `PHASE-9-PRODUCTION-DEPLOYMENT.md` for detailed instructions

---

## Timeline

### Sequential Timeline (No Parallel Work)
```
Phase 0: 1 week
Phase 1: 2 weeks
Phase 3: 2 weeks
Phase 4: 2 weeks
Phase 5: 2 weeks
Phase 6A-E: 5 weeks (sequential)
Phase 7: 2 weeks
Phase 8: 3 weeks
Phase 9: 3 weeks
────────────────
Total: 22 weeks (~5.5 months)
```

### Optimized Timeline (Parallel Work)
```
Phase 0: 1 week
Phase 1: 2 weeks
Phase 3-7: 11 weeks (frontend)
Phase 8: 3 weeks (backend, parallel with Phase 3-5)
Phase 9: 3 weeks (integration)
────────────────
Total: 17 weeks (~4 months)
```

**Time Saved**: 5 weeks by running Phase 8 in parallel

---

## Repository Structure

### buildright-eds (Frontend)
```
buildright-eds/
├── blocks/              # Custom EDS blocks
│   ├── persona-dashboard/
│   ├── project-builder/
│   ├── pricing-display/
│   └── ...
├── scripts/             # Core JavaScript
│   ├── persona-config.js
│   ├── aco-service.js   # Mock ACO (Phase 3-7)
│   ├── auth.js
│   └── ...
├── pages/               # HTML pages
│   ├── dashboard.html
│   ├── builder.html
│   ├── signup.html
│   └── ...
├── data/                # Mock data (from Phase 1)
│   ├── mock-products.json
│   └── project-recommendations.json
└── docs/                # Implementation plans
    ├── PHASE-0-RESEARCH-AND-DECISIONS.md
    ├── PHASE-1-ACO-DATA-FOUNDATION.md
    ├── PHASE-3-CORE-ARCHITECTURE.md
    └── ...
```

### buildright-aco (Data & Backend)
```
buildright-aco/
├── scripts/             # Data generation & ingestion
│   ├── generate-products.js
│   ├── generate-prices.js
│   ├── generate-policy-guide.js
│   ├── generate-eds-data.js
│   ├── ingest-products.js
│   ├── ingest-prices.js
│   └── ...
├── data/buildright/     # Generated data
│   ├── products.json
│   ├── prices.json
│   ├── price-books.json
│   ├── POLICY-SETUP-GUIDE.md
│   └── ...
├── docs/                # Documentation
│   ├── BUILDRIGHT-CASE-STUDY.md
│   ├── SETUP-GUIDE.md
│   ├── PRICING-STRATEGY.md
│   └── ...
└── utils/               # Shared utilities
```

### accs-citisignal (Production EDS)
```
accs-citisignal/
├── blocks/              # EDS blocks (migrated from buildright-eds)
├── scripts/             # Production scripts
│   ├── api-mesh-client.js  # Replaces aco-service.js
│   ├── persona-config.js
│   └── ...
├── demo-config-buildright.json
└── ...
```

### buildright-mesh (API Mesh)
```
buildright-mesh/
├── mesh.json            # Mesh configuration
├── schema/              # GraphQL schema extensions
│   └── buildright-extensions.graphql
├── resolvers/           # Custom resolvers
│   ├── persona-resolver.js
│   ├── pricing-resolver.js
│   └── policy-resolver.js
└── config/              # Configuration
```

---

## Key Decisions (ADRs)

1. **ADR-001**: Dropin vs Block Architecture
   - Use Dropins for standard commerce features
   - Use Blocks for persona-specific experiences

2. **ADR-002**: Mock ACO Service Design
   - Mirror real CCDM architecture exactly
   - Support all policy headers and pricing tiers
   - Enable seamless transition to production

3. **ADR-003**: Authentication Strategy
   - Phase 3-7: Demo mode with simulated onboarding
   - Phase 9: Real Adobe Commerce Auth Dropin
   - Customer attributes for persona determination

4. **ADR-004**: Persona Data Model
   - Use realistic business attributes
   - Map to customer groups for pricing
   - Support rule-based persona assignment

5. **ADR-005**: Pricing Architecture
   - 2-layer pricing (customer tier + volume tier)
   - Stacking discounts for B2B realism
   - ACO price books with hierarchy

6. **ADR-006**: Policy Implementation
   - 28 triggered policies in ACO
   - Category-based filtering (10 categories)
   - Header-based policy activation

**See**: `docs/adr/` for complete ADR documentation

---

## Success Metrics

### Phase 0-1 (Foundation) ✅
- ✅ All research documents created
- ✅ All ADRs documented
- ✅ 177 products generated
- ✅ 885 prices generated
- ✅ 28 policies defined
- ✅ EDS data transformation working
- ✅ Schema validation passing

### Phase 3-7 (Frontend)
- [ ] All 5 personas have custom dashboards
- [ ] Mock ACO service working
- [ ] Persona filtering working
- [ ] Tier + volume pricing displaying
- [ ] Project builder functional
- [ ] Sign-up wizard complete
- [ ] All pages responsive

### Phase 8 (Backend)
- [ ] 5 customer groups configured
- [ ] 5 custom attributes registered
- [ ] 177 products in ACO
- [ ] 885 prices in ACO
- [ ] 28 policies active
- [ ] 5 demo accounts created
- [ ] End-to-end backend validated

### Phase 9 (Production)
- [ ] API Mesh deployed
- [ ] EDS site live
- [ ] Real authentication working
- [ ] Real pricing working
- [ ] Real policy filtering working
- [ ] Performance < 2s page load
- [ ] Production documentation complete

---

## Testing Strategy

### Unit Testing
- Component-level tests for blocks
- Function-level tests for utilities
- Mock service tests

### Integration Testing
- Persona flow tests
- Pricing calculation tests
- Policy filtering tests
- Cart and checkout tests

### End-to-End Testing
- Complete user journeys for each persona
- Cross-persona testing
- Performance testing
- Accessibility testing

### Production Testing
- Real backend integration tests
- API Mesh tests
- EDS deployment tests
- Load testing

---

## Documentation

### Technical Documentation
- `DROPIN-ARCHITECTURE.md` - Dropin integration patterns
- `EDS-DOM-PATTERNS.md` - EDS best practices
- `MOCK-ACO-API-SPEC.md` - Mock service specification
- `AUTH-STRATEGY.md` - Authentication approach
- `PRICING-STRATEGY.md` - Pricing model
- `PRODUCTION-ARCHITECTURE.md` - Production architecture

### Business Documentation
- `BUILDRIGHT-CASE-STUDY.md` - Complete case study
- `BUILDRIGHT-PERSONAS-AND-FLOWS.md` - Persona definitions
- `PERSONA-UX-MAP.md` - UX journeys

### Operational Documentation
- `SETUP-GUIDE.md` - Complete setup instructions
- `TESTING-GUIDE.md` - Testing procedures
- `PRODUCTION-RUNBOOK.md` - Production operations

### Implementation Plans
- `PHASE-0-RESEARCH-AND-DECISIONS.md`
- `PHASE-1-ACO-DATA-FOUNDATION.md`
- `PHASE-3-CORE-ARCHITECTURE.md`
- `PHASE-4-SHARED-COMPONENTS.md`
- `PHASE-5-EXISTING-PAGES.md`
- `PHASE-6A-SARAH-DASHBOARD.md`
- `PHASE-6B-MARCUS-DASHBOARD.md`
- `PHASE-6C-LISA-DASHBOARD.md`
- `PHASE-6D-DAVID-DASHBOARD.md`
- `PHASE-6E-KEVIN-DASHBOARD.md`
- `PHASE-7-INTEGRATION-AND-POLISH.md`
- `PHASE-8-BACKEND-SETUP.md`
- `PHASE-9-PRODUCTION-DEPLOYMENT.md`

---

## Next Steps

### Immediate (Now)
1. **Begin Phase 3: Core Architecture**
   - Task 1: Create persona configuration system
   - Task 2: Build mock ACO service
   - Task 3: Implement demo authentication
   - Task 4: Create generic pages
   - Task 5: Implement routing

### Short-Term (1-2 weeks)
2. **Consider starting Phase 8 in parallel**
   - If Adobe Commerce/ACO access is available
   - Can run independently of frontend work
   - Validates backend while frontend progresses

### Medium-Term (2-3 months)
3. **Complete Phase 3-7 (Frontend)**
   - Build all persona dashboards
   - Refactor existing pages
   - Integration and polish

### Long-Term (3-4 months)
4. **Complete Phase 8-9 (Production)**
   - Backend setup (if not done in parallel)
   - Production deployment
   - Final testing and launch

---

## Questions & Answers

### Q: Can I start Phase 8 before Phase 3?
**A**: Yes! Phase 8 can run in parallel with Phase 3-7. The mock ACO service ensures frontend work isn't blocked.

### Q: What if I don't have Adobe Commerce/ACO access yet?
**A**: Continue with Phase 3-7 using the mock service. You can demo the complete experience with mock data, then integrate the real backend later.

### Q: Why was Phase 2 deferred?
**A**: Icon design should follow UI design, not precede it. We can't know what icons we need until we design the actual persona screens.

### Q: How long will the complete implementation take?
**A**: 
- **Sequential**: ~22 weeks (5.5 months)
- **Parallel (recommended)**: ~17 weeks (4 months)

### Q: What's the difference between buildright-eds and accs-citisignal?
**A**: 
- `buildright-eds`: Local development with mock ACO (Phase 3-7)
- `accs-citisignal`: Production EDS deployment with real backend (Phase 9)

### Q: Do I need to complete all phases?
**A**: Depends on your goal:
- **Demo only**: Phase 0-7 (mock service)
- **Production-ready**: Phase 0-9 (full stack)

---

## Contact & Support

**Project Owner**: TBD  
**Technical Lead**: TBD  
**Last Updated**: November 16, 2024

---

**Ready to begin? Start with Phase 3: Core Architecture!**

