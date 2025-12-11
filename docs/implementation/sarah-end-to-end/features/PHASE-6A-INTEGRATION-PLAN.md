# Phase 6A: Sarah Martinez - Complete Integration Plan

**Created**: December 7, 2025  
**Updated**: December 2024  
**Status**: Active  
**Goal**: Fully integrated, demo-ready Sarah persona with real ACO/Commerce catalog data

> **Master Plan**: [MASTER-IMPLEMENTATION-PLAN.md](../../MASTER-IMPLEMENTATION-PLAN.md)  
> **Dropins Integration**: See Phase 5.5 in master plan

---

## Overview

This plan prioritizes connecting the frontend to real Adobe Commerce (ACO) product data. 

**Key Update (December 2024):** Cart, checkout, and orders will now use Commerce Dropins instead of mocked localStorage. See [CODEBASE-AUDIT-DROPINS.md](../../CODEBASE-AUDIT-DROPINS.md) for details.

---

## Current State

### What's Built ✅
- Templates Dashboard (simplified, 4-column grid)
- Build Configurator (variants, packages, phases)
- BOM Review (phase accordions, product swaps)
- Cart Integration (bundle display, edit flow)
- Mini-cart (bundle editing)
- Price formatting, notifications, placeholders
- **Frontend Polish** (Phase 1 complete)
- **Catalog Service** with strategy pattern (Phase 2 complete)
- **API Mesh integration** for real ACO data (Phase 2 complete)
- **Product grid and featured products** using real mesh data (Phase 2 complete)

### What Needs Work 🔄
- PDP (Product Detail Page) integration with Commerce
- Search integration with Commerce
- Category navigation from Commerce
- EDS production deployment (Helix/aem.live)

---

## Phase Summary (Revised Priority Order)

| Phase | Description | Est. Time | Priority |
|-------|-------------|-----------|----------|
| **1. Frontend Polish** | Layout, loading, edge cases, a11y | 1-2 days | ✅ COMPLETE |
| **2. ACO Catalog Integration** | Real products, pricing, images | 3-5 days | ✅ COMPLETE |
| **3. Commerce Storefront** | Product display, search, categories | 2-3 days | 🔄 IN PROGRESS |
| **4. EDS Production Patterns** | 404 pages, blocks, Helix deploy | 2-3 days | 🟡 MEDIUM |
| **5. Production Readiness** | Performance, docs, QA | 3-5 days | 🟡 MEDIUM |
| **6. Cart & Orders** | Checkout, order history | 3-4 days | 🟢 LOW |
| **7. Commerce Backend** | Bundle pricing, customer data | 2-3 days | 🔵 FUTURE |

---

## ✅ Phase 1: Frontend Polish - COMPLETE

All sub-phases completed:
- [x] 1.1 Layout Consistency
- [x] 1.2 Loading States & Error Handling
- [x] 1.3 Edge Cases (validation, navigation guards)
- [x] 1.4 Mobile Responsive
- [x] 1.5 Accessibility

---

## ✅ Phase 2: ACO Catalog Integration - COMPLETE

**Estimated Time**: 3-5 days  
**Priority**: 🔴 HIGH  
**Status**: ✅ Implemented December 8, 2025

**📖 Architecture Documentation**: [CATALOG-SERVICE-ARCHITECTURE.md](./CATALOG-SERVICE-ARCHITECTURE.md)

### 2.1 ACO Service Layer ✅

- [x] **Create Catalog Service Module**
  - [x] `scripts/services/catalog-service.js` - Strategy pattern implementation
  - [x] `scripts/services/mesh-client.js` - GraphQL client for API Mesh
  - [x] `scripts/services/mesh-integration.js` - Auth/persona integration
  - [x] Automatic fallback to mock when mesh unavailable
  - [x] Header-based persona authentication

- [x] **Product Fetching**
  - [x] `catalogService.searchProducts(phrase, options)`
  - [x] `catalogService.getProduct(sku)`
  - [x] Pagination support (pageSize, currentPage)

### 2.2 Product Data Integration ✅

- [x] **Replace Mock Product Data**
  - [x] Product grid uses `catalogService.searchProducts()`
  - [x] Featured products uses `catalogService.searchProducts()`
  - [x] Graceful fallback to MockStrategy if mesh unavailable

- [x] **Product Response Mapping**
  - [x] Mesh response → standard product format
  - [x] SKU, name, description, price, inStock
  - [x] Image URLs from mesh response
  - [x] Attributes array transformation

### 2.3 Pricing Integration ✅

- [x] **ACO Price Books**
  - [x] Persona headers include `X-Price-Book-Id`
  - [x] Mesh returns tier-specific pricing
  - [x] Price included in product response (no separate call)

- [x] **BOM Pricing**
  - [x] `catalogService.generateBOM(config)` returns priced line items
  - [x] Falls back to pre-generated BOM files

### 2.4 Catalog Views & Filtering ✅

- [x] **Persona Catalog Views**
  - [x] Persona headers include `X-Catalog-View-Id`
  - [x] Mesh applies CCDM filtering server-side
  - [x] Sarah sees Production Builder catalog

### Key Files Created/Modified

| File | Purpose |
|------|---------|
| `scripts/services/catalog-service.js` | Strategy pattern, unified interface |
| `scripts/services/mesh-client.js` | GraphQL queries, header management |
| `scripts/services/mesh-integration.js` | Auth integration layer |
| `scripts/auth.js` | Initialize mesh on login |
| `blocks/product-grid/product-grid.js` | Uses catalogService |
| `blocks/featured-products/featured-products.js` | Uses catalogService |
| `scripts/bom-review.js` | Uses catalogService.generateBOM() |

---

## Phase 3: Commerce Storefront Integration
**Estimated Time**: 2-3 days  
**Priority**: 🔴 HIGH

### 3.1 Product Display Pages

- [ ] **PDP Integration** (3h)
  - [ ] Fetch product details from Commerce
  - [ ] Display real images, descriptions
  - [ ] Show real pricing
  - [ ] Related products from Commerce

- [ ] **Product Grid/Catalog** (2h)
  - [ ] Category pages use Commerce data
  - [ ] Search results from Commerce
  - [ ] Filtering and sorting

### 3.2 Search Integration

- [x] **Live Search Integration** ✅
  - [x] Faceted search via mesh
  - [x] Dynamic facets from ACO
  - [x] Filter application and loading states
  - [x] Sort functionality (relevance, price, name)

- [x] **Global Search** ✅
  - [x] Header search with typeahead
  - [x] Product suggestions dropdown
  - [x] Debounced queries

### 3.3 Category Navigation

- [ ] **Category Tree** (2h)
  - [ ] Fetch categories from Commerce
  - [ ] Navigation menu structure
  - [ ] Breadcrumb generation

### 3.4 Bundle Pricing (Current Workaround)

> ⚠️ **Migration Note**: See [BUNDLE-PRICING-ARCHITECTURE.md](../../../buildright-service/docs/BUNDLE-PRICING-ARCHITECTURE.md)

- [x] **Current Solution**: Mesh calculates bundle prices dynamically
  - [x] Detects `BUNDLE-*` SKUs
  - [x] Fetches component structure from ACO
  - [x] Calculates sum of (component_price × quantity)
  - [x] Works around ACO returning `priceRange: null` for bundles

- [ ] **Future Migration** (When Commerce backend added):
  - [ ] Add Commerce as mesh source
  - [ ] Query `BundleProduct.price_range` directly from Commerce
  - [ ] Remove mesh calculation logic (`bundle-pricing.js`)
  - [ ] Update frontend for min/max price display

---

## Phase 4: EDS Production Patterns
**Estimated Time**: 2-3 days  
**Priority**: 🟡 MEDIUM

### 4.1 Error Pages

- [ ] **404 Page** (2h)
  - [ ] Create author-editable `404.html`
  - [ ] Search and navigation helpers
  - [ ] Style with design system

- [ ] **500/System Error Page** (1h)
  - [ ] Minimal dependencies
  - [ ] Contact support messaging

### 4.2 State Components as Blocks

- [ ] **Empty State Block** (2h)
- [ ] **Error Message Block** (1h)
- [ ] **Loading State Block** (1h)

### 4.3 Helix/EDS Deployment

- [ ] **Configuration** (1h)
  - [ ] Verify `fstab.yaml`
  - [ ] Check `helix-query.yaml`

- [ ] **Deploy & Test** (2h)
  - [ ] Preview on `.hlx.page`
  - [ ] Production on `.hlx.live`
  - [ ] Lighthouse audit (target: >90 all categories)

---

## Phase 5: Production Readiness
**Estimated Time**: 3-5 days  
**Priority**: 🟡 MEDIUM

### 5.1 Performance

- [ ] Page load speed (<2s)
- [ ] Image optimization
- [ ] Code splitting if needed

### 5.2 Monitoring

- [ ] Error tracking (Sentry)
- [ ] Analytics (page views, events)

### 5.3 Documentation

- [ ] Demo script
- [ ] Technical architecture docs
- [ ] API documentation

### 5.4 QA & Testing

- [ ] End-to-end flow testing
- [ ] Cross-browser testing
- [ ] User acceptance testing

---

## Phase 6: Cart & Orders (Commerce Dropins)
**Estimated Time**: 3-4 days  
**Priority**: 🟡 MEDIUM (now part of Phase 5.5)

> **Update (December 2024):** Cart and Orders will use Commerce Dropins instead of mocked localStorage.  
> See [CODEBASE-AUDIT-DROPINS.md](../../CODEBASE-AUDIT-DROPINS.md) for implementation details.

### 6.1 Cart — Use Cart Dropin

- [ ] Initialize `@dropins/storefront-cart`
- [ ] Replace `cart-manager.js` with Dropin
- [ ] Wire add-to-cart buttons to `addProductsToCart(sku)`
- [ ] Update `pages/cart.html` with Cart container

### 6.2 Checkout — Use Checkout Dropin

- [ ] Initialize `@dropins/storefront-checkout`
- [ ] Create `pages/checkout.html` with Checkout container
- [ ] Configure Commerce payment/shipping methods

### 6.3 Order History — Use Order Dropin

- [ ] Initialize `@dropins/storefront-order`
- [ ] Create `pages/order-history.html` with Orders container
- [ ] Create `pages/order-detail.html` with OrderDetail container

---

## Phase 7: Commerce Backend Integration (Now Part of Phase 5.5)
**Estimated Time**: Included in Phase 5.5  
**Priority**: 🔴 HIGH (integrated with Dropins)

> **Update (December 2024):** Commerce backend integration is now handled via Commerce Dropins.  
> Auth, Cart, Checkout, and Orders all connect to Commerce backend automatically.  
> See [MASTER-IMPLEMENTATION-PLAN.md](../../MASTER-IMPLEMENTATION-PLAN.md) Phase 5.5.

### 7.1 Commerce Dropins Handle Backend

| Feature | Dropin | Status |
|---------|--------|--------|
| Authentication | `@dropins/storefront-auth` | Phase 5.5 |
| Cart | `@dropins/storefront-cart` | Phase 5.5 |
| Checkout | `@dropins/storefront-checkout` | Phase 5.5 |
| Orders | `@dropins/storefront-order` | Phase 5.5 |
| Account | `@dropins/storefront-account` | Phase 5.5 |

### 7.2 Bundle Pricing Migration (Future)

> 📖 **Documentation**: [BUNDLE-PRICING-ARCHITECTURE.md](../../../buildright-service/docs/BUNDLE-PRICING-ARCHITECTURE.md)

- [ ] **Switch to Commerce `BundleProduct`** (when needed)
  - [ ] Query `BundleProduct.price_range` for bundles
  - [ ] Remove mesh calculation workaround

### 7.3 Key Architecture Note

| Data Source | Method |
|-------------|--------|
| **Commerce data** (auth, cart, orders) | Commerce Dropins |
| **ACO data** (products, pricing, BOM) | Custom SDK Dropins (Phase 7) |

This hybrid approach ensures each data source uses the appropriate access method.

---

## Execution Timeline (Revised)

```
WEEK 1: Catalog Integration
├─ Phase 1: Frontend Polish ✅ COMPLETE
└─ Phase 2: ACO Catalog Integration ✅ COMPLETE

WEEK 2: Commerce Storefront
└─ Phase 3: Commerce Storefront Integration 🔄 IN PROGRESS
   ├─ Live Search ✅
   ├─ Faceted Search ✅
   └─ Bundle Pricing (mesh workaround) ✅

WEEK 3: Production Prep
├─ Phase 4: EDS Production Patterns
└─ Phase 5: Production Readiness

FUTURE: Cart & Orders (as needed)
└─ Phase 6: Cart & Orders

FUTURE: Commerce Backend (when added)
└─ Phase 7: Commerce Backend Integration
   └─ ⚠️  Migrate bundle pricing from mesh calculation
         to native Commerce BundleProduct.price_range
```

---

## Success Criteria (Revised)

### Primary Goal: Real Catalog Data
- [ ] Products display with real ACO data
- [ ] Images load from Commerce/DAM
- [ ] Prices reflect ACO price books
- [ ] Sarah sees her catalog view (CCDM filtered)
- [ ] BOM products are real ACO products
- [ ] Product swaps show real alternatives

### Secondary Goal: Demo Ready
- [ ] Smooth frontend experience
- [ ] Proper loading/error states
- [ ] Mobile responsive
- [ ] Accessible

### Deferred: Transaction Flow
- [ ] Cart can remain localStorage-based
- [ ] Checkout can remain mocked
- [ ] Order history can show sample data

---

## Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    EDS Frontend (BuildRight)                │
├─────────────────────────────────────────────────────────────┤
│  pages/           │  scripts/           │  styles/          │
│  ├─ account.html  │  ├─ services/       │  ├─ base.css      │
│  ├─ templates     │  │  ├─ catalog-svc  │  ├─ components    │
│  ├─ configurator  │  │  ├─ mesh-client  │  └─ dashboards    │
│  ├─ bom-review    │  │  └─ mesh-integ   │                   │
│  └─ cart          │  ├─ build-config    │                   │
│                   │  └─ bom-review      │                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Catalog Service Layer                    │
├─────────────────────────────────────────────────────────────┤
│  scripts/services/catalog-service.js (Strategy Pattern)    │
│  ├─ MeshStrategy: Real ACO data via API Mesh               │
│  └─ MockStrategy: Local JSON files for offline dev         │
│                                                             │
│  API Methods:                                               │
│  ├─ initialize(personaId, options)                          │
│  ├─ searchProducts(phrase, {pageSize, currentPage})         │
│  ├─ getProduct(sku)                                         │
│  └─ generateBOM(config)                                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      API Mesh                               │
│   https://edge-sandbox-graph.adobe.io/api/.../graphql       │
├─────────────────────────────────────────────────────────────┤
│  BuildRight_personaForCustomer(customerGroupId)             │
│  BuildRight_searchProducts(phrase, pageSize, currentPage)   │
│  BuildRight_getProductBySKU(sku)                            │
│  BuildRight_generateBOMFromTemplate(...)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Adobe Commerce Optimizer (ACO)                 │
├─────────────────────────────────────────────────────────────┤
│  GraphQL API        │  CCDM              │  Price Books    │
│  ├─ Products        │  ├─ Catalog Views  │  ├─ US-Retail   │
│  ├─ Categories      │  ├─ Policies       │  ├─ Prod-Build  │
│  ├─ Attributes      │  └─ Filtering      │  └─ Commercial  │
│  └─ Search          │                    │                 │
└─────────────────────────────────────────────────────────────┘
```

**📖 Full architecture details**: [CATALOG-SERVICE-ARCHITECTURE.md](./CATALOG-SERVICE-ARCHITECTURE.md)

---

## Change Log

| Date | Change |
|------|--------|
| Dec 7, 2025 | Initial plan created |
| Dec 8, 2025 | Restructured: ACO/Catalog integration as priority, Cart/Orders deferred |
| Dec 8, 2025 | Phase 2 (ACO Catalog Integration) completed - catalog service, mesh integration, product grids updated |
| Dec 9, 2025 | Phase 3 updates: Live Search, Faceted Search completed |
| Dec 9, 2025 | Added bundle pricing mesh workaround (ACO returns null priceRange for bundles) |
| Dec 9, 2025 | Added Phase 7: Commerce Backend Integration - documents bundle pricing migration path |
| Dec 2024 | **Major update**: Cart/Orders now use Commerce Dropins. Added references to MASTER-IMPLEMENTATION-PLAN.md |

