# Phase 6A: Sarah Martinez - Complete Integration Plan

**Created**: December 7, 2025  
**Status**: Active  
**Goal**: Fully integrated, demo-ready Sarah persona experience

---

## Overview

This plan restructures the remaining Phase 6A work to achieve complete end-to-end integration before moving to other personas. The focus is on making Sarah's production builder flow fully functional and polished.

---

## Current State

### What's Built ✅
- Templates Dashboard (simplified, 4-column grid)
- Build Configurator (variants, packages, phases)
- BOM Review (phase accordions, product swaps)
- Cart Integration (bundle display, edit flow)
- Mini-cart (bundle editing)
- Price formatting, notifications, placeholders

### What Needs Work 🔄
- Layout consistency (inline styles in account page)
- Data completeness (verify all BOMs)
- Checkout flow (currently stops at cart)
- Order history integration
- Backend connections (using mocks)

---

## Integration Phase 1: Frontend Polish
**Estimated Time**: 1-2 days  
**Priority**: HIGH

### 1.1 Layout Consistency
*Reference: `LAYOUT-CONSISTENCY-AUDIT.md`*

- [ ] **Account Dashboard Cleanup** (1.5h)
  - [ ] Remove `<style>` block from `pages/account.html`
  - [ ] Remove all inline `style="..."` attributes
  - [ ] Create `styles/dashboards/account-dashboard.css`
  - [ ] Use design system tokens for all values
  - [ ] Test responsive behavior

- [ ] **Container Standardization** (30m)
  - [ ] Audit max-width usage across Sarah's pages
  - [ ] Decide: 1280px standard or allow wider?
  - [ ] Apply consistent `.section` → `.container` pattern

- [ ] **Typography Audit** (30m)
  - [ ] Verify h1 exists on all pages (accessibility)
  - [ ] Consistent heading hierarchy (h1 → h2 → h3)
  - [ ] Page titles match design system

### 1.2 Loading States & Error Handling

- [ ] **Loading Overlays** (1h)
  - [ ] Templates Dashboard: Loading state while fetching
  - [ ] Build Configurator: Loading during BOM generation
  - [ ] BOM Review: Loading while fetching product data
  - [ ] Cart: Loading while updating quantities

- [ ] **Error States** (1h)
  - [ ] Failed to load templates
  - [ ] Failed to generate BOM
  - [ ] Failed to add to cart
  - [ ] Network error handling

- [ ] **Empty States** (30m)
  - [ ] No templates available
  - [ ] No active builds
  - [ ] Empty cart (already done)
  - [ ] No order history

### 1.3 Edge Cases

- [ ] **Form Validation** (30m)
  - [ ] Build Configurator: Require phase selection
  - [ ] Quantity inputs: Min/max validation
  - [ ] Prevent double-submit on buttons

- [ ] **Navigation Guards** (30m)
  - [ ] Warn before leaving unsaved configuration?
  - [ ] Handle browser back button gracefully
  - [ ] Deep linking to configurator with template

### 1.4 Mobile Responsive

- [ ] **Test All Sarah Pages on Mobile** (1h)
  - [ ] Templates Dashboard (grid collapses properly)
  - [ ] Build Configurator (sections stack)
  - [ ] BOM Review (accordions work on touch)
  - [ ] Cart (bundle display responsive)
  - [ ] Account Dashboard (sidebar behavior)

- [ ] **Fix Any Issues Found** (1-2h)
  - [ ] Touch targets (min 44px)
  - [ ] Text readability
  - [ ] Horizontal scroll prevention

### 1.5 Accessibility

- [ ] **WCAG 2.1 AA Compliance** (1h)
  - [ ] All pages have h1
  - [ ] Color contrast passes
  - [ ] Focus indicators visible
  - [ ] ARIA labels on interactive elements
  - [ ] Keyboard navigation works

---

## Integration Phase 2: Data Completeness
**Estimated Time**: 2-3 days  
**Priority**: HIGH

### 2.1 Template & BOM Data

- [ ] **Verify All 6 Templates** (2h)
  - [ ] Sedona - all variants, all packages
  - [ ] Prescott - all variants, all packages
  - [ ] Flagstaff - all variants, all packages
  - [ ] Tucson - all variants, all packages
  - [ ] Mesa - all variants, all packages
  - [ ] Phoenix - all variants, all packages

- [ ] **BOM Data Quality** (3h)
  - [ ] All 18 BOMs exist (6 templates × 3 packages)
  - [ ] Line items have valid SKUs
  - [ ] Quantities are realistic
  - [ ] Prices are populated
  - [ ] Categories are assigned
  - [ ] Phases are assigned

- [ ] **Variant Impact** (2h)
  - [ ] Bonus Room variants add correct items
  - [ ] Extended Garage variants work
  - [ ] Multi-variant combinations work

### 2.2 Product Data

- [ ] **Product Images** (2h)
  - [ ] Audit which BOM products have images
  - [ ] Add placeholder strategy for missing
  - [ ] Verify image paths are correct

- [ ] **Product Details** (1h)
  - [ ] All products have names
  - [ ] All products have SKUs
  - [ ] All products have prices
  - [ ] All products have categories

### 2.3 Swap Alternatives

- [ ] **Verify Swap Data** (2h)
  - [ ] Each product has alternatives
  - [ ] Alternatives are in same category
  - [ ] Price tiers make sense (Designer > Premium > Builder's)
  - [ ] Swap functionality works end-to-end

---

## Integration Phase 3: Cart & Checkout Flow
**Estimated Time**: 3-4 days  
**Priority**: HIGH

### 3.1 Cart Enhancements

- [ ] **Bundle Quantity Editing** (2h)
  - [ ] Can modify quantities in expanded bundle
  - [ ] Total recalculates correctly
  - [ ] Changes persist

- [ ] **Remove Individual Items** (1h)
  - [ ] Can remove single item from bundle
  - [ ] Bundle updates correctly
  - [ ] Edge case: removing last item

- [ ] **Cart Persistence** (1h)
  - [ ] Cart survives page refresh
  - [ ] Cart survives logout/login
  - [ ] Cart merging strategy (if needed)

### 3.2 Checkout Flow

- [ ] **Checkout Page** (4h)
  - [ ] Create `pages/checkout.html`
  - [ ] Shipping address form
  - [ ] Delivery options (job site, will call, etc.)
  - [ ] Payment method selection (mock)
  - [ ] Order review before submit

- [ ] **Order Submission** (2h)
  - [ ] Submit order (save to localStorage for now)
  - [ ] Generate order number
  - [ ] Clear cart after successful order
  - [ ] Handle submission errors

- [ ] **Order Confirmation** (2h)
  - [ ] Create `pages/order-confirmation.html`
  - [ ] Display order number
  - [ ] Show order summary
  - [ ] Next steps / what to expect
  - [ ] Link to order history

### 3.3 Order History Integration

- [ ] **Order History Page** (2h)
  - [ ] Display Sarah's past orders
  - [ ] Show BOM orders with bundle details
  - [ ] Order status indicators
  - [ ] Link to reorder

- [ ] **Reorder Flow** (2h)
  - [ ] "Reorder" button on past orders
  - [ ] Loads previous configuration
  - [ ] Goes to BOM review (edit mode)
  - [ ] User can modify before adding to cart

### 3.4 Account Integration

- [ ] **My Builds in Account** (2h)
  - [ ] Show active/saved builds
  - [ ] Resume incomplete builds
  - [ ] Delete saved builds
  - [ ] Build status indicators

---

## Integration Phase 4: Backend Connection
**Estimated Time**: 1-2 weeks  
**Priority**: MEDIUM (can demo without)

### 4.1 ACO Integration

- [ ] **Product Catalog** (3h)
  - [ ] Connect to real ACO endpoint
  - [ ] Fetch products by SKU
  - [ ] Fetch products by category
  - [ ] Handle ACO errors gracefully

- [ ] **Pricing** (2h)
  - [ ] Use ACO price books
  - [ ] Sarah's customer group pricing
  - [ ] Volume discounts (if applicable)

- [ ] **Catalog Views** (2h)
  - [ ] Apply Sarah's catalog view
  - [ ] CCDM filtering
  - [ ] Verify correct products visible

### 4.2 Commerce Integration

- [ ] **Cart API** (4h)
  - [ ] Replace localStorage with Commerce cart
  - [ ] Add to cart API calls
  - [ ] Update quantity API
  - [ ] Remove from cart API

- [ ] **Checkout API** (4h)
  - [ ] Shipping address submission
  - [ ] Shipping method selection
  - [ ] Payment method (mock or real)
  - [ ] Place order API

- [ ] **Order History API** (2h)
  - [ ] Fetch customer orders
  - [ ] Order details by ID
  - [ ] Order status updates

### 4.3 Authentication

- [ ] **Real Auth Integration** (4h)
  - [ ] Adobe IMS or Commerce auth
  - [ ] Login/logout flow
  - [ ] Session management
  - [ ] Protected routes

---

## Integration Phase 5: Production Readiness
**Estimated Time**: 3-5 days  
**Priority**: MEDIUM

### 5.1 Performance

- [ ] **Page Load Speed** (2h)
  - [ ] Audit with Lighthouse
  - [ ] Target: < 2s initial load
  - [ ] Lazy load images
  - [ ] Code splitting if needed

- [ ] **Runtime Performance** (1h)
  - [ ] Smooth scrolling
  - [ ] No jank on interactions
  - [ ] Efficient DOM updates

### 5.2 Monitoring

- [ ] **Error Tracking** (2h)
  - [ ] Sentry or similar integration
  - [ ] Capture JavaScript errors
  - [ ] Capture API errors
  - [ ] Error reporting dashboard

- [ ] **Analytics** (2h)
  - [ ] Page view tracking
  - [ ] Event tracking (add to cart, checkout, etc.)
  - [ ] Conversion funnel setup

### 5.3 Documentation

- [ ] **Demo Script** (2h)
  - [ ] Step-by-step walkthrough
  - [ ] Key talking points
  - [ ] Screenshots/video

- [ ] **Technical Docs** (2h)
  - [ ] Architecture overview
  - [ ] Data flow diagrams
  - [ ] API documentation
  - [ ] Troubleshooting guide

### 5.4 QA & Testing

- [ ] **End-to-End Testing** (4h)
  - [ ] Full flow: Login → Dashboard → Configure → BOM → Cart → Checkout
  - [ ] Edit flow: Cart → BOM Review → Configure → Back
  - [ ] Error scenarios
  - [ ] Cross-browser (Chrome, Safari, Firefox, Edge)

- [ ] **User Acceptance Testing** (2h)
  - [ ] Demo to stakeholders
  - [ ] Gather feedback
  - [ ] Prioritize fixes

---

## Task Summary

| Phase | Tasks | Est. Time | Priority |
|-------|-------|-----------|----------|
| **1. Frontend Polish** | 15 tasks | 1-2 days | HIGH |
| **2. Data Completeness** | 10 tasks | 2-3 days | HIGH |
| **3. Cart & Checkout** | 12 tasks | 3-4 days | HIGH |
| **4. Backend Connection** | 9 tasks | 1-2 weeks | MEDIUM |
| **5. Production Readiness** | 8 tasks | 3-5 days | MEDIUM |

**Total Estimated Time**: 3-4 weeks

---

## Suggested Order of Execution

### Week 1: Polish & Data
1. Frontend Polish (Phase 1)
2. Data Completeness (Phase 2)

### Week 2: Checkout Flow
3. Cart & Checkout (Phase 3)

### Week 3: Backend (if pursuing)
4. Backend Connection (Phase 4)

### Week 4: Ship It
5. Production Readiness (Phase 5)

---

## Success Criteria

### Minimum Viable Demo
- [ ] Sarah can log in and see her templates
- [ ] Sarah can configure a build (variants, package, phases)
- [ ] Sarah can review the generated BOM
- [ ] Sarah can add the BOM to cart
- [ ] Sarah can edit the BOM from cart
- [ ] Cart shows proper bundle display
- [ ] Checkout flow works (even if mocked)
- [ ] Order confirmation displays

### Full Integration
- [ ] All above, plus:
- [ ] Real product data from ACO
- [ ] Real pricing from ACO
- [ ] Real cart via Commerce
- [ ] Real checkout via Commerce
- [ ] Order history shows real orders

---

## Notes

- **Backend (Phase 4) is optional for demo** - The current mock implementation works well for demonstrations
- **Focus on the happy path first** - Get the main flow working perfectly before edge cases
- **Document as you go** - Update this plan as tasks complete

---

## Change Log

| Date | Change |
|------|--------|
| Dec 7, 2025 | Initial plan created |


