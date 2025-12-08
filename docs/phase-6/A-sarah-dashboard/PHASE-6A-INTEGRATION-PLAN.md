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

### What Needs Work 🔄
- Connect to real ACO product catalog
- Real product images from Commerce
- Real pricing from ACO price books
- Catalog views / CCDM filtering

---

## Phase Summary (Revised Priority Order)

| Phase | Description | Est. Time | Priority |
|-------|-------------|-----------|----------|
| **1. Frontend Polish** | Layout, loading, edge cases, a11y | 1-2 days | ✅ COMPLETE |
| **2. ACO Catalog Integration** | Real products, pricing, images | 3-5 days | 🔴 HIGH |
| **3. Commerce Storefront** | Product display, search, categories | 2-3 days | 🔴 HIGH |
| **4. EDS Production Patterns** | 404 pages, blocks, Helix deploy | 2-3 days | 🟡 MEDIUM |
| **5. Production Readiness** | Performance, docs, QA | 3-5 days | 🟡 MEDIUM |
| **6. Cart & Orders** | Checkout, order history | 3-4 days | 🟢 LOW |

---

## ✅ Phase 1: Frontend Polish - COMPLETE

All sub-phases completed:
- [x] 1.1 Layout Consistency
- [x] 1.2 Loading States & Error Handling
- [x] 1.3 Edge Cases (validation, navigation guards)
- [x] 1.4 Mobile Responsive
- [x] 1.5 Accessibility

---

## Phase 2: ACO Catalog Integration
**Estimated Time**: 3-5 days  
**Priority**: 🔴 HIGH

### 2.1 ACO Service Layer

- [ ] **Create ACO Service Module** (4h)
  - [ ] `scripts/services/aco-client.js` - API client
  - [ ] Environment configuration (dev/staging/prod endpoints)
  - [ ] Authentication handling (API keys, tokens)
  - [ ] Error handling and retry logic
  - [ ] Response caching strategy

- [ ] **Product Fetching** (3h)
  - [ ] Fetch product by SKU
  - [ ] Fetch products by category
  - [ ] Fetch products by attribute (e.g., phase)
  - [ ] Batch product fetching for BOM display

### 2.2 Product Data Integration

- [ ] **Replace Mock Product Data** (4h)
  - [ ] Update `data-mock.js` to call ACO service
  - [ ] Or create `data-aco.js` as replacement
  - [ ] Map ACO response to existing data structure
  - [ ] Graceful fallback if ACO unavailable

- [ ] **Product Images** (2h)
  - [ ] Use ACO image URLs
  - [ ] Implement CDN/DAM path resolution
  - [ ] Fallback placeholder strategy
  - [ ] Lazy loading for performance

- [ ] **Product Attributes** (2h)
  - [ ] Name, description, SKU
  - [ ] Category hierarchy
  - [ ] Custom attributes (phase, tier, etc.)
  - [ ] Inventory status (optional)

### 2.3 Pricing Integration

- [ ] **ACO Price Books** (3h)
  - [ ] Fetch base pricing
  - [ ] Customer group pricing (Sarah's tier)
  - [ ] Volume/quantity discounts
  - [ ] Price formatting with locale

- [ ] **BOM Pricing** (2h)
  - [ ] Calculate line item totals from ACO prices
  - [ ] Phase subtotals
  - [ ] Overall BOM total
  - [ ] Handle price changes between sessions

### 2.4 Catalog Views & Filtering

- [ ] **Sarah's Catalog View** (2h)
  - [ ] Apply CCDM filtering
  - [ ] Only show products in Sarah's catalog
  - [ ] Handle category restrictions

- [ ] **Product Alternatives** (2h)
  - [ ] Fetch swap alternatives from ACO
  - [ ] Tier-based alternatives (Designer > Premium > Builder's)
  - [ ] Same-category filtering

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

- [ ] **Commerce Search** (2h)
  - [ ] Connect header search to Commerce
  - [ ] Autocomplete suggestions
  - [ ] Search results page

### 3.3 Category Navigation

- [ ] **Category Tree** (2h)
  - [ ] Fetch categories from Commerce
  - [ ] Navigation menu structure
  - [ ] Breadcrumb generation

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

## Execution Timeline (Revised)

```
WEEK 1: Catalog Integration
├─ Phase 1: Frontend Polish ✅ COMPLETE
└─ Phase 2: ACO Catalog Integration ← CURRENT FOCUS

WEEK 2: Commerce Storefront
└─ Phase 3: Commerce Storefront Integration

WEEK 3: Production Prep
├─ Phase 4: EDS Production Patterns
└─ Phase 5: Production Readiness

FUTURE: Cart & Orders (as needed)
└─ Phase 6: Cart & Orders
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
│  ├─ templates     │  │  ├─ aco-client   │  ├─ components    │
│  ├─ configurator  │  │  └─ commerce     │  └─ dashboards    │
│  ├─ bom-review    │  ├─ build-config    │                   │
│  └─ cart          │  └─ bom-review      │                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     ACO Service Layer                       │
├─────────────────────────────────────────────────────────────┤
│  scripts/services/aco-client.js                             │
│  ├─ getProductBySKU(sku)                                    │
│  ├─ getProductsByCategory(categoryId)                       │
│  ├─ getPrice(sku, customerGroup)                            │
│  ├─ getProductAlternatives(sku, tier)                       │
│  └─ getProductImage(sku)                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              Adobe Commerce (ACO) Backend                   │
├─────────────────────────────────────────────────────────────┤
│  GraphQL API        │  REST API          │  Assets (DAM)   │
│  ├─ Products        │  ├─ Catalog        │  ├─ Images      │
│  ├─ Categories      │  ├─ Pricing        │  └─ Documents   │
│  ├─ Pricing         │  └─ Inventory      │                 │
│  └─ Search          │                    │                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Change Log

| Date | Change |
|------|--------|
| Dec 7, 2025 | Initial plan created |
| Dec 8, 2025 | Restructured: ACO/Catalog integration as priority, Cart/Orders deferred |

