# BuildRight Master Implementation Plan

**Created:** December 2025  
**Status:** Active  
**Supersedes:** `IMPLEMENTATION-PLAN-V2.md`, `PERSONA-META-PLAN.md`, `PERSONA-IMPLEMENTATION-PLAN.md`

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Architecture Overview](#architecture-overview)
3. [Key Decisions](#key-decisions)
4. [Prerequisites (Complete)](#prerequisites)
5. [Phase 5.5: Commerce Dropins Integration](#phase-55-commerce-dropins)
6. [Phase 6: Persona Implementations](#phase-6-personas)
7. [Phase 7: Custom SDK Dropins for ACO](#phase-7-custom-sdk-dropins)
8. [Phase 8: Extended Features & Polish](#phase-8-extended-features)
9. [Progress Tracking](#progress-tracking)
10. [Related Documents](#related-documents)

---

## Executive Summary {#executive-summary}

BuildRight is a B2B construction supply demo system showcasing Adobe's commerce ecosystem:

- **Adobe Commerce Optimizer (ACO)** — Product catalog and search
- **Adobe Commerce PaaS** — Customer management, orders, and cart
- **Adobe API Mesh** — Unified GraphQL gateway
- **Adobe I/O Runtime Actions** — Custom business logic (BOM, Persona)
- **Edge Delivery Services (EDS)** — Frontend patterns

### Current State

| Component | Status |
|-----------|--------|
| ACO Product Catalog | ✅ Working via API Mesh |
| Persona-based Pricing | ✅ Working (Persona Action) |
| BOM Builder | ✅ Working end-to-end |
| Product Grid/Search | ✅ Working with ACO data |
| Commerce Dropins | 🔲 Planned (Phase 5.5) |
| Custom SDK Dropins | 🔲 Planned (Phase 7) |

### Implementation Strategy

**Sarah Martinez end-to-end first**, then other personas at the end.

```
┌─────────────────────────────────────────────────────────────┐
│  SARAH END-TO-END (Current Focus)                           │
│  ┌─────────┐   ┌─────────┐   ┌─────────┐   ┌─────────┐     │
│  │Phase5.5 │ → │Phase 6A │ → │Phase 7  │ → │Phase 8  │     │
│  │Dropins  │   │Sarah    │   │SDK      │   │Polish   │     │
│  └─────────┘   └─────────┘   └─────────┘   └─────────┘     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  OTHER PERSONAS (End of Project)                            │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐               │
│  │Marcus  │ │Lisa    │ │David   │ │Kevin   │               │
│  │(6B)    │ │(6C)    │ │(6D)    │ │(6E)    │               │
│  └────────┘ └────────┘ └────────┘ └────────┘               │
└─────────────────────────────────────────────────────────────┘
```

This approach ensures all infrastructure is proven with Sarah before replicating to other personas.

### The Hybrid Architecture

BuildRight uses **two types of dropins**:

| Data Source | Dropin Type | Examples |
|-------------|-------------|----------|
| **Commerce** | Standard Commerce Dropins | Auth, Cart, Checkout, Orders |
| **ACO** | Custom SDK Dropins | Product Grid, PDP, Project Builder |

**Why two types?** Commerce's native product dropins (`@dropins/storefront-product-discovery`, `@dropins/storefront-pdp`) are hardcoded to Commerce Catalog/Live Search. They cannot query ACO. BuildRight products live in ACO, so we create custom SDK dropins for those components.

---

## Architecture Overview {#architecture-overview}

```
┌─────────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Commerce Dropins              Custom SDK Dropins                   │
│  ┌─────────────────┐          ┌─────────────────┐                  │
│  │ Auth            │──────────│ Product         │                  │
│  │ Cart            │  events  │ Discovery       │                  │
│  │ Checkout        │◄────────►│ Product Detail  │                  │
│  │ Orders          │          │ Project Builder │                  │
│  │ Account         │          │ Pricing Display │                  │
│  └────────┬────────┘          └────────┬────────┘                  │
│           │                            │                            │
│           │ Commerce API               │ ACO API (via Mesh)        │
│           ▼                            ▼                            │
├─────────────────────────────────────────────────────────────────────┤
│                         BACKEND                                      │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  Adobe Commerce              API Mesh              ACO              │
│  ┌─────────────────┐        ┌──────────┐        ┌─────────────┐    │
│  │ Customers       │        │ Persona  │        │ Products    │    │
│  │ Cart/Checkout   │◄──────►│ Action   │◄──────►│ Pricing     │    │
│  │ Orders          │        │ BOM      │        │ Catalog     │    │
│  │ Addresses       │        │ Action   │        │ Views       │    │
│  └─────────────────┘        └──────────┘        └─────────────┘    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### Auth + Persona Flow

```
┌──────────────────┐     authenticated     ┌────────────────────┐
│  Auth Dropin     │────────event─────────►│  Persona Service   │
│  (Commerce)      │                       │  (I/O Action)      │
├──────────────────┤                       ├────────────────────┤
│ • Login UI       │                       │ • Look up customer │
│ • Session tokens │                       │ • Get ACO context: │
│ • Password reset │                       │   - catalogViewId  │
└──────────────────┘                       │   - priceBookId    │
                                           └─────────┬──────────┘
                                                     │
                                                     ▼
                                           ┌────────────────────┐
                                           │  Catalog Service   │
                                           │  (mesh-client.js)  │
                                           ├────────────────────┤
                                           │ Sets headers for   │
                                           │ all ACO queries    │
                                           └────────────────────┘
```

**Key insight:** Auth Dropin handles Commerce authentication. Persona Service provides ACO context. They work together — neither replaces the other.

---

## Key Decisions {#key-decisions}

| # | Decision | Rationale | Status |
|---|----------|-----------|--------|
| 1 | Use Commerce Dropins for Commerce data | Auth, Cart, Checkout, Orders live in Commerce — use standard dropins | ✅ Decided |
| 2 | Create Custom SDK Dropins for ACO data | Native dropins can't query ACO — they're hardcoded to Commerce Catalog/Live Search | ✅ Decided |
| 3 | Keep Persona Service | Works WITH Auth Dropin — maps customer → ACO catalog view + price book | ✅ Decided |
| 4 | Keep `catalog-service.js` and `mesh-client.js` | Core infrastructure for ACO access — used by custom SDK dropins | ✅ Decided |
| 5 | SDK dropins over plain EDS blocks | Shared design tokens, event bus, slots — ensures consistency with Commerce dropins | ✅ Decided |
| 6 | No dual-mode auth | Dropins are primary; demo mode removed | ✅ Decided |
| 7 | **Sarah end-to-end first** | Complete ALL infrastructure (Dropins + SDK) with Sarah before other personas | ✅ Decided |
| 8 | Other personas at end | Apply proven patterns from Sarah; reduces rework if architecture changes | ✅ Decided |

### Related ADRs

- [ADR-001: Use Dropins for Commerce](./adr/ADR-001-use-dropins-for-commerce.md)
- [ADR-007: Custom SDK Dropins for ACO](./adr/ADR-007-custom-sdk-dropins-for-aco.md)

---

## Prerequisites (Complete) {#prerequisites}

### Foundation (Phases 0-5)

📁 **Documentation:** [implementation/completed/](./implementation/completed/)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 0 | ✅ Complete | Research, ADRs documented |
| Phase 1 | ✅ Complete | ACO data generation (buildright-aco) |
| Phase 2 | ⏸️ Deferred | Custom icons (using emojis for now) |
| Phase 3 | ✅ Complete | Core architecture, persona config, auth |
| Phase 4 | ✅ Complete | Shared components |
| Phase 5 | ✅ Complete | Existing page refactors |

### Commerce Backend Data

| Component | Status | Details |
|-----------|--------|---------|
| Simple Products | ✅ | 146 products |
| Bundle Products | ✅ | 12 bundles |
| Categories | ✅ | 37 categories |
| Customer Groups | ✅ | 5 groups |
| Demo Customers | ✅ | 5 accounts with ACO attributes |
| Product Images | ✅ | 35 images |
| Website/Store/View | ✅ | BuildRight dedicated |

### Backend Services (buildright-service)

| Component | Status |
|-----------|--------|
| GraphQL Mesh | ✅ Deployed |
| BOM Generation Action | ✅ Working |
| Persona Action | ✅ Working |
| ACO Integration | ✅ Connected |

---

## Phase 5.5: Commerce Dropins Integration {#phase-55-commerce-dropins}

**Goal:** Replace all mocks with real Commerce functionality  
**Duration:** 2 weeks  
**Status:** 🔲 Not Started

### 📁 Related Documentation

| Document | Purpose |
|----------|---------|
| [codebase-audit-dropins.md](./implementation/sarah-end-to-end/dropins/codebase-audit-dropins.md) | Detailed file-by-file migration plan |
| [commerce-dropins-integration.md](./implementation/sarah-end-to-end/dropins/commerce-dropins-integration.md) | Technical implementation guide |
| [ADR-001](./adr/ADR-001-use-dropins-for-commerce.md) | Architecture decision |
| [dropin-architecture.md](../reference/dropin-architecture.md) | Dropin patterns |
| [auth-strategy.md](./archive/reference-old/AUTH-STRATEGY.md) | Authentication approach |

### Dropins to Integrate

| Dropin | Package | Purpose |
|--------|---------|---------|
| Auth | `@dropins/storefront-auth` | Login, registration, password reset |
| Cart | `@dropins/storefront-cart` | Shopping cart, mini-cart |
| Checkout | `@dropins/storefront-checkout` | Checkout flow |
| Order | `@dropins/storefront-order` | Order history, tracking |
| Account | `@dropins/storefront-account` | Profile, addresses |

### Week 1: Auth & Cart

- [ ] Finalize `scripts/initializers/` structure
- [ ] Complete `auth-dropin` block with all containers
- [ ] Wire `authenticated` event to `initializeMeshForEmail()`
- [ ] Test login → persona → catalog flow end-to-end
- [ ] Complete `commerce-mini-cart` block
- [ ] Update all add-to-cart buttons to use `addProductsToCart()`

### Week 2: Cart, Checkout & Orders

- [ ] Update `pages/cart.html` with Cart container
- [ ] Remove `cart-manager.js`
- [ ] Create `pages/checkout.html` with Checkout dropin
- [ ] Configure Commerce payment/shipping methods
- [ ] Test order placement end-to-end
- [ ] Implement order history with Order dropin

### Files to Create

| File | Purpose |
|------|---------|
| `scripts/initializers/index.js` | Dropin initialization hub |
| `scripts/initializers/auth.js` | Auth dropin setup |
| `scripts/initializers/cart.js` | Cart dropin setup |
| `scripts/initializers/checkout.js` | Checkout dropin setup |
| `scripts/commerce-helpers.js` | Helper functions for dropins |
| `pages/checkout.html` | Checkout page |
| `pages/order-detail.html` | Order detail page |

### Files to Remove

| File | Reason |
|------|--------|
| `scripts/aco-service.js` | Mock service — use mesh-client |
| `scripts/data-mock.js` | Mock data loader |
| `data/mock-products.json` | Mock product data |
| `blocks/user-menu/` | Replace with auth dropin |
| `blocks/mini-cart/` | Replace with commerce-mini-cart |

---

## Phase 6A: Sarah Martinez — Complete End-to-End {#phase-6-personas}

**Goal:** Complete Sarah's entire use case including all infrastructure  
**Approach:** Build everything needed for Sarah first, then apply patterns to other personas at the end

### Why Sarah First?

Sarah's use case exercises the full stack:
- Commerce Dropins (auth, cart, checkout, orders)
- Custom SDK Dropins (product grid, PDP, project builder)
- BOM generation and persona-based pricing
- Complete purchase flow

By completing Sarah end-to-end, we prove all infrastructure before replicating for other personas.

### Implementation Order (Revised)

| Order | Phase | Description | Status |
|-------|-------|-------------|--------|
| 1 | **5.5** | Commerce Dropins (for Sarah) | 🔲 Next |
| 2 | **6A** | Sarah's features (configurator, BOM, dashboard) | 🔄 In Progress |
| 3 | **7** | Custom SDK Dropins (for Sarah's product views) | 🔲 Planned |
| 4 | **8** | Polish Sarah's complete experience | 🔲 Planned |
| 5 | **6B-6E** | Apply patterns to other personas | 🔲 End of Project |

### Sarah's Complete Experience Includes

| Component | Phase | Status |
|-----------|-------|--------|
| Auth Dropin | 5.5 | 🔲 |
| Cart Dropin | 5.5 | 🔲 |
| Checkout Dropin | 5.5 | 🔲 |
| Order Dropin | 5.5 | 🔲 |
| Build Configurator | 6A | 🔲 |
| BOM Review | 6A | 🔲 |
| My Builds Dashboard | 6A | 🔲 |
| Product Discovery Dropin | 7 | 🔲 |
| Product Detail Dropin | 7 | 🔲 |
| Project Builder Dropin | 7 | 🔲 |

### Sarah's Feature Work (Phase 6A)

**Customer Group:** Commercial-Tier2  
**Key Features:**
- Template dashboard with 6 floor plans
- Build configurator (template → variant → package → phases)
- BOM generation via GraphQL
- BOM review with phase grouping
- Add to cart → checkout → order flow

### 📁 Related Documentation

| Document | Purpose |
|----------|---------|
| [sarah-integration-plan.md](./implementation/sarah-end-to-end/features/sarah-integration-plan.md) | Detailed integration plan |
| [catalog-service-design.md](./implementation/sarah-end-to-end/features/catalog-service-design.md) | ACO catalog integration |
| [sarah-wireframes.md](./implementation/sarah-end-to-end/features/sarah-wireframes.md) | UI wireframes |
| [data-source-matrix.md](./reference/backend/data-source-matrix.md) | Commerce vs ACO data |
| [personas-overview.md](./explanations/personas/personas-overview.md) | Sarah's profile |

**Completed:**
- [x] Dashboard Simplification
- [x] Persona Integration
- [x] ACO Catalog Integration
- [x] Live Search & Faceted Search

**Remaining:**
- [ ] Build Configurator (Sub-Phase 5)
- [ ] My Builds Dashboard (Sub-Phase 6)
- [ ] BOM Review Page (Sub-Phase 7)
- [ ] Integration & Polish (Sub-Phase 8)

---

## Phases 6B-6E: Other Personas (End of Project) {#other-personas}

> **Note:** These phases happen AFTER Sarah's complete experience is working, including Commerce Dropins and Custom SDK Dropins.

**Goal:** Apply proven patterns from Sarah to remaining personas  
**Duration:** 7-10 weeks  
**Status:** 🔲 Deferred until Sarah complete

### 📁 Related Documentation

| Document | Purpose |
|----------|---------|
| [phases-6b-to-7-consolidated.md](./implementation/other-personas/phases-6b-to-7-consolidated.md) | Detailed implementation plan |
| [personas-overview.md](./explanations/personas/personas-overview.md) | All persona profiles |
| [personas-ux-patterns.md](./explanations/personas/personas-ux-patterns.md) | UX patterns per persona |

| Phase | Persona | Key Feature | Demo Value |
|-------|---------|-------------|------------|
| 6B | Marcus Johnson (GC) | Project wizard with phases | CCDM filtering demo |
| 6C | Lisa Chen (Remodeler) | Good/Better/Best packages | Visual comparison |
| 6D | David Thompson (DIY) | Deck builder wizard | Primary CCDM demo |
| 6E | Kevin Rodriguez (Store Mgr) | Velocity-based restock | Multi-location |

---

## Phase 7: Custom SDK Dropins for ACO {#phase-7-custom-sdk-dropins}

**Goal:** Replace plain EDS blocks with SDK-based dropins for visual/behavioral consistency  
**Duration:** 2-3 weeks  
**Status:** 🔲 Not Started

### 📁 Related Documentation

| Document | Purpose |
|----------|---------|
| [ADR-007](./adr/ADR-007-custom-sdk-dropins-for-aco.md) | Architecture decision and rationale |
| [codebase-audit-dropins.md](./implementation/sarah-end-to-end/dropins/codebase-audit-dropins.md) | SDK dropin details (Phase 2 section) |
| [eds-block-patterns.md](./reference/backend/eds-block-patterns.md) | Current block patterns |
| [planning/component-extraction/](./planning/component-extraction/) | Component extraction guides |

### Why Custom SDK Dropins?

| Issue | Plain EDS Blocks | SDK Dropins |
|-------|------------------|-------------|
| Styling | Manual CSS, inconsistent | Shared design tokens |
| Events | Custom events | Standard event bus |
| Extensibility | Fork to customize | Slots system |
| Maintenance | Custom patterns | SDK updates |

### Dropins to Create

| Dropin | Replaces | Purpose |
|--------|----------|---------|
| `@buildright/product-discovery` | `product-grid/`, `filters-sidebar/` | Product listing with ACO data |
| `@buildright/product-detail` | `product-detail.html` | PDP with persona pricing |
| `@buildright/project-builder` | `project-builder/` | BOM wizard |
| `@buildright/pricing-display` | `pricing-display/` | Tiered pricing |
| `@buildright/tier-badge` | `tier-badge/` | Customer tier indicator |

### Week 3: Product Discovery Dropin

- [ ] Install SDK: `npm install @adobe-commerce/elsie`
- [ ] Scaffold `@buildright/product-discovery` structure
- [ ] Create `ProductList` container using SDK components
- [ ] Create `Facets` container for ACO facets
- [ ] Create `SearchBar` container
- [ ] Wire to `catalog-service.js` for data
- [ ] Test search and filter flows

### Week 4: Product Detail Dropin

- [ ] Scaffold `@buildright/product-detail` structure
- [ ] Create `ProductDetail` container with SDK components
- [ ] Create `PersonaPricing` container for tiered pricing
- [ ] Create `ProductGallery` using SDK patterns
- [ ] Integrate with Commerce Cart dropin for add-to-cart
- [ ] Test PDP flows with persona pricing

### File Structure

```
scripts/dropins/
├── product-discovery/
│   ├── api.js
│   ├── render.js
│   ├── index.js
│   ├── containers/
│   │   ├── ProductList.js
│   │   ├── Facets.js
│   │   └── SearchBar.js
│   └── styles/
│       └── product-discovery.css
├── product-detail/
│   ├── api.js
│   ├── render.js
│   ├── containers/
│   │   ├── ProductDetail.js
│   │   ├── ProductGallery.js
│   │   └── PersonaPricing.js
│   └── styles/
└── project-builder/
    ├── api.js
    ├── render.js
    ├── containers/
    │   ├── ProjectWizard.js
    │   ├── BOMPreview.js
    │   └── PhaseSelector.js
    └── styles/
```

---

## Phase 8: Extended Features & Polish {#phase-8-extended-features}

**Goal:** Complete feature parity and final polish  
**Duration:** 2 weeks  
**Status:** 🔲 Not Started

### Week 5: Account & Additional Dropins

- [ ] Implement Account dropin integration
- [ ] Create `@buildright/project-builder` dropin
- [ ] Add Wishlist dropin integration
- [ ] Evaluate Recommendations dropin compatibility

### Week 6: Polish & Cleanup

- [ ] Create utility dropins (pricing-display, tier-badge)
- [ ] Delete deprecated files (mocks, old blocks)
- [ ] Cross-persona integration testing
- [ ] Performance optimization
- [ ] Final documentation update
- [ ] Demo walkthrough guide

### Success Criteria

- [ ] All 5 personas work end-to-end
- [ ] No cross-persona state contamination
- [ ] Commerce Dropins handle auth/cart/checkout/orders
- [ ] Custom SDK Dropins handle ACO products
- [ ] Persona pricing displays correctly
- [ ] CCDM filtering demonstrated (David's deck builder)
- [ ] Mobile responsive
- [ ] Performance targets met (LCP < 2s)

---

## Progress Tracking {#progress-tracking}

### Sarah End-to-End (Current Focus)

| Order | Phase | Status | Description |
|-------|-------|--------|-------------|
| 1 | Phase 0-5 | ✅ Complete | Foundation work |
| 2 | Phase 5.5 | 🔲 Next | Commerce Dropins (for Sarah) |
| 3 | Phase 6A | 🔄 In Progress | Sarah's features |
| 4 | Phase 7 | 🔲 Planned | Custom SDK Dropins (for Sarah) |
| 5 | Phase 8 | 🔲 Planned | Polish Sarah's experience |

### Other Personas (End of Project)

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 6B | 🔲 Deferred | Marcus persona |
| Phase 6C | 🔲 Deferred | Lisa persona |
| Phase 6D | 🔲 Deferred | David persona |
| Phase 6E | 🔲 Deferred | Kevin persona |

### Estimated Timeline

```
SARAH END-TO-END (Weeks 1-8)
├─ Week 1-2:  Phase 5.5 (Commerce Dropins)
├─ Week 3-5:  Phase 6A (Sarah's features)
├─ Week 6-7:  Phase 7 (Custom SDK Dropins)
└─ Week 8:    Phase 8 (Polish)

OTHER PERSONAS (Weeks 9-16)
├─ Week 9-10:  Phase 6B (Marcus)
├─ Week 11-12: Phase 6C (Lisa)
├─ Week 13-14: Phase 6D (David)
└─ Week 15-16: Phase 6E (Kevin) + Final polish
```

**Sarah complete:** 8 weeks (2 months)  
**All personas complete:** 16 weeks (4 months)

---

## Related Documents {#related-documents}

### Documentation Structure

```
docs/
├── master-implementation-plan.md    ← You are here
├── AGENT-HANDOFF.md                 # Context for developers
├── PHASE-PLANS-INDEX.md             # Quick index
│
├── implementation/                  # Active work
│   ├── completed/                   # Phases 0-5 (done)
│   ├── sarah-end-to-end/            # Current focus
│   │   ├── dropins/                 # Phase 5.5 docs
│   │   ├── features/                # Phase 6A docs
│   │   └── sdk-dropins/             # Phase 7 docs
│   └── other-personas/              # Phases 6B-6E (deferred)
│
├── reference/                       # Technical references
│   ├── backend/                     # Backend/ACO/Mesh docs
│   ├── deployment/                  # Deployment guides
│   ├── authoring/                   # Content authoring
│   └── research/                    # Industry research
│
├── adr/                             # Architecture decisions
├── personas/                        # Persona profiles
├── standards/                       # Coding standards
├── testing/                         # Testing guides
├── planning/quick-start/                 # Quick lookup guides
└── archive/                         # Historical docs
```

### Key Documents by Topic

| Topic | Document |
|-------|----------|
| **Getting Started** | [AGENT-HANDOFF.md](./archive/session-logs/AGENT-HANDOFF.md) |
| **Dropins Integration** | [implementation/sarah-end-to-end/dropins/](./implementation/sarah-end-to-end/dropins/) |
| **Dropin CSS Refactoring** | [dropin-css-refactor-plan.md](./implementation/dropin-css-refactor-plan.md) |
| **Sarah Implementation** | [implementation/sarah-end-to-end/features/](./implementation/sarah-end-to-end/features/) |
| **Backend Reference** | [reference/backend/](./reference/backend/) |
| **Personas** | [personas-overview.md](./explanations/personas/personas-overview.md) |
| **Architecture Decisions** | [adr/](./adr/) |
| **Completed Work** | [implementation/completed/](./implementation/completed/) |
| **Research** | [../.rptc/research/](../../.rptc/research/) |

### Backend Services (External)

| Document | Location |
|----------|----------|
| Persona Service | `buildright-service/docs/services/PERSONA-SERVICE.md` |
| BOM Service | `buildright-service/docs/services/BOM-SERVICE.md` |

---

**Document Version:** 1.0  
**Last Updated:** December 2025

