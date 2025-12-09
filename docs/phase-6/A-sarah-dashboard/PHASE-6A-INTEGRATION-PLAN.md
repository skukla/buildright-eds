# Phase 6A: Sarah Martinez - Complete Integration Plan

**Created**: December 7, 2025  
**Updated**: December 8, 2025  
**Status**: Active  
**Goal**: Fully integrated, demo-ready Sarah persona with real ACO/Commerce catalog data

---

## Overview

This plan prioritizes connecting the frontend to real Adobe Commerce (ACO) product data. The focus is on demonstrating real catalog integration — orders and cart can remain mocked for now.

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

## Phase 6: Cart & Orders (Lower Priority)
**Estimated Time**: 3-4 days  
**Priority**: 🟢 LOW (can remain mocked for demo)

> 📋 **Note**: When Commerce backend is added, see **Phase 7: Commerce Backend Integration** below for bundle pricing migration.

### 6.1 Cart Enhancements

- [ ] Bundle quantity editing
- [ ] Remove individual items
- [ ] Cart persistence

### 6.2 Checkout Flow

- [ ] Checkout page
- [ ] Order submission
- [ ] Order confirmation

### 6.3 Order History

- [ ] Order history page
- [ ] Reorder flow
- [ ] Account integration

---

## Phase 7: Commerce Backend Integration (Future)
**Estimated Time**: 2-3 days  
**Priority**: 🔵 FUTURE (when Commerce backend is added)

> 📖 **Documentation**: [BUNDLE-PRICING-ARCHITECTURE.md](../../../buildright-service/docs/BUNDLE-PRICING-ARCHITECTURE.md)

### 7.1 Add Commerce as Mesh Source

- [ ] **Mesh Configuration** (2h)
  - [ ] Add Commerce GraphQL source to `mesh.config.js`
  - [ ] Configure authentication (OAuth)
  - [ ] Map Commerce types with `Commerce_` prefix

### 7.2 Bundle Pricing Migration

- [ ] **Switch to Commerce `BundleProduct`** (3h)
  - [ ] Query `BundleProduct.price_range` for bundles
  - [ ] Get native `minimum_price` / `maximum_price`
  - [ ] Remove `enrichBundlePrices()` calls from resolvers
  - [ ] Deprecate `mesh/resolvers-src/utils/bundle-pricing.js`

- [ ] **Frontend Updates** (2h)
  - [ ] Display price range ("$X - $Y") for bundles
  - [ ] Handle `dynamic_price` flag
  - [ ] Update product cards for range vs. single price

### 7.3 Additional Commerce Features

- [ ] **Customer Data** (optional)
  - [ ] Customer groups from Commerce
  - [ ] Order history from Commerce
  - [ ] Wishlist integration

### Why This Matters

| Current (ACO-only) | Future (Commerce) |
|--------------------|-------------------|
| Bundle `priceRange: null` | Bundle `priceRange` computed |
| Mesh calculates price | Commerce calculates price |
| 2 extra ACO queries | No extra queries |
| Default selection only | Full min/max range |

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

