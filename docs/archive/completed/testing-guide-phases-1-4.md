# Testing Guide: Phases 1-4

**Date**: November 17, 2025  
**Status**: 🟡 **PARTIAL TESTING READY**  
**Completed Phases**: Phase 0 ✅, Phase 1 ✅, Phase 3 ✅, Phase 4 ✅

---

## Executive Summary

**Question**: Is it time to manually test Phases 1-4? Do we have enough context for user journeys?

**Answer**: 🟡 **PARTIAL - We can test components in isolation, but NOT full user journeys yet**

**Why**:
- ✅ **Phase 3** (Core Architecture): Can test persona system, mock ACO, auth
- ✅ **Phase 4** (Shared Components): Can test blocks in isolation
- ❌ **Phase 5** (Existing Pages): NOT refactored yet - pages don't use new architecture
- ❌ **Phase 6** (Persona Dashboards): NOT built yet - no persona-specific UIs

**Recommendation**: 
- **Now**: Test Phase 3 & 4 components in isolation (unit/component testing)
- **After Phase 5**: Test refactored pages with persona system (integration testing)
- **After Phase 6**: Test full persona user journeys (end-to-end testing)

---

## What Can Be Tested Now

### ✅ Phase 1: ACO Data Foundation (Backend Testing)

**Repository**: `buildright-aco`

**What's Testable**:
1. ✅ Data generation scripts
2. ✅ Schema validation
3. ✅ EDS data transformation
4. ✅ Price calculations
5. ✅ Policy definitions

**How to Test**:
```bash
cd /path/to/buildright-aco

# Test data generation
npm run generate:all

# Validate all Phase 1 deliverables
npm run validate:phase1

# Dry-run ingestion (no actual upload)
npm run ingest:products:dry-run
npm run ingest:prices:dry-run
```

**Expected Results**:
- ✅ 177 products generated
- ✅ 885 prices generated
- ✅ 28 policies defined
- ✅ EDS data transformation successful
- ✅ All validation checks pass

**Test Checklist**:
- [ ] Products generated successfully
- [ ] Prices calculated correctly (tier + volume)
- [ ] Policy definitions complete
- [ ] EDS data has persona attributes
- [ ] Schema validation passes
- [ ] Dry-run ingestion passes

---

### ✅ Phase 3: Core Architecture (Component Testing)

**Repository**: `buildright-eds`

#### **Test 1: Persona Configuration System**

**File**: `scripts/persona-config.js`

**What to Test**:
- Persona definitions
- Customer group mappings
- ACO attribute mappings
- Feature flags
- Utility functions

**How to Test** (Browser Console):
```javascript
// Open browser console on any page
import { PERSONAS, getPersona, getAllPersonas } from './scripts/persona-config.js';

// Test 1: Get all personas
const personas = getAllPersonas();
console.log('All personas:', personas);
// Expected: Array of 5 personas

// Test 2: Get specific persona
const sarah = getPersona('sarah_martinez');
console.log('Sarah:', sarah);
// Expected: Sarah Martinez object with all properties

// Test 3: Check customer group
import { getCustomerGroup } from './scripts/persona-config.js';
const group = getCustomerGroup('sarah_martinez');
console.log('Sarah customer group:', group);
// Expected: 'Production-Builder'

// Test 4: Check feature access
import { hasFeature } from './scripts/persona-config.js';
const hasTemplates = hasFeature('sarah_martinez', 'templates');
console.log('Sarah has templates:', hasTemplates);
// Expected: true

// Test 5: Get ACO attributes
import { getPersonaAttributes } from './scripts/persona-config.js';
const attrs = getPersonaAttributes('sarah_martinez');
console.log('Sarah ACO attributes:', attrs);
// Expected: { construction_phase: 'foundation_framing', customer_tier: 'Production-Builder' }
```

**Test Checklist**:
- [ ] All 5 personas defined
- [ ] Customer groups mapped correctly
- [ ] ACO attributes present
- [ ] Feature flags work
- [ ] Utility functions return expected values

---

#### **Test 2: Mock ACO Service**

**File**: `scripts/aco-service.js`

**What to Test**:
- Product queries
- Policy-based filtering
- Customer group pricing
- Volume tier pricing
- Search functionality

**How to Test** (Browser Console):
```javascript
import { acoService } from './scripts/aco-service.js';

// Test 1: Get all products (no filters)
const allProducts = await acoService.getProducts({});
console.log('All products:', allProducts);
// Expected: { products: [...], total: 177, facets: {...} }

// Test 2: Filter by policy
const foundationProducts = await acoService.getProducts({
  userContext: {
    attributes: {
      construction_phase: 'foundation_framing'
    }
  }
});
console.log('Foundation products:', foundationProducts);
// Expected: Filtered products for foundation phase

// Test 3: Get pricing for Sarah (Production Builder)
const pricing = await acoService.getPricing({
  productIds: ['LBR-D0414F1E'],
  customerGroup: 'Production-Builder',
  quantity: 1
});
console.log('Sarah pricing (1 unit):', pricing);
// Expected: 15% discount from retail

// Test 4: Get volume pricing
const volumePricing = await acoService.getPricing({
  productIds: ['LBR-D0414F1E'],
  customerGroup: 'Production-Builder',
  quantity: 300
});
console.log('Sarah pricing (300 units):', volumePricing);
// Expected: 15% + 3% discount (stacked)

// Test 5: Search products
const searchResults = await acoService.searchProducts('lumber', {});
console.log('Search results:', searchResults);
// Expected: Products matching "lumber"
```

**Test Checklist**:
- [ ] Product queries return data
- [ ] Policy filtering works
- [ ] Customer group pricing correct (5 tiers)
- [ ] Volume tier pricing correct (3 tiers)
- [ ] Discounts stack correctly
- [ ] Search returns relevant results
- [ ] Facets generated correctly

---

#### **Test 3: Authentication System**

**File**: `scripts/auth.js`

**What to Test**:
- Demo mode persona selection
- Session management
- Authentication checks
- User context

**How to Test** (Browser Console):
```javascript
import { authService } from './scripts/auth.js';

// Test 1: Check if logged in
const isLoggedIn = authService.isAuthenticated();
console.log('Is logged in:', isLoggedIn);
// Expected: false (initially)

// Test 2: Login as Sarah (demo mode)
authService.loginDemo('sarah_martinez');
console.log('Logged in as:', authService.getCurrentUser());
// Expected: { personaId: 'sarah_martinez', ... }

// Test 3: Get customer group
const group = authService.getCustomerGroup();
console.log('Customer group:', group);
// Expected: 'Production-Builder'

// Test 4: Check feature access
const hasFeature = authService.hasFeature('templates');
console.log('Has templates feature:', hasFeature);
// Expected: true

// Test 5: Logout
authService.logout();
console.log('Is logged in after logout:', authService.isAuthenticated());
// Expected: false
```

**Test Checklist**:
- [ ] Login demo mode works
- [ ] Session persists across page loads
- [ ] Customer group retrieved correctly
- [ ] Feature access control works
- [ ] Logout clears session
- [ ] Authentication events fire

---

#### **Test 4: Generic Pages**

**Files**: `pages/dashboard.html`, `pages/builder.html`

**What to Test**:
- Page loads
- Routing works
- Authentication required
- Persona context passed

**How to Test** (Manual):
```bash
# Start local server
npm start  # or python -m http.server 8000

# Open browser to:
http://localhost:8000/pages/dashboard.html
```

**Test Steps**:
1. Open dashboard.html (should redirect to login if not authenticated)
2. Login as Sarah via console: `authService.loginDemo('sarah_martinez')`
3. Reload dashboard.html
4. Check if page loads with Sarah's context
5. Try URL parameter: `dashboard.html?view=templates`
6. Verify routing works

**Test Checklist**:
- [ ] Dashboard page loads
- [ ] Builder page loads
- [ ] Authentication redirect works
- [ ] Persona context available
- [ ] URL parameters work
- [ ] Default routes work

---

### ✅ Phase 4: Shared Components (Block Testing)

**Repository**: `buildright-eds`

**What's Testable**:
- 5 shared blocks in isolation
- Icon helper utility
- Block APIs
- Event emission

#### **Test 1: Loading Overlay Block**

**File**: `blocks/loading-overlay/loading-overlay.js`

**How to Test** (Create test HTML):
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/blocks/loading-overlay/loading-overlay.css">
</head>
<body>
  <div class="loading-overlay"></div>
  
  <button onclick="testShow()">Show Loading</button>
  <button onclick="testHide()">Hide Loading</button>
  
  <script type="module">
    import decorate, { showLoading, hideLoading } from '/blocks/loading-overlay/loading-overlay.js';
    
    const block = document.querySelector('.loading-overlay');
    decorate(block);
    
    window.testShow = () => showLoading('Testing...', 'This is a test');
    window.testHide = () => hideLoading();
  </script>
</body>
</html>
```

**Test Checklist**:
- [ ] Block renders
- [ ] show() displays overlay
- [ ] hide() hides overlay
- [ ] Message updates
- [ ] Details updates
- [ ] Events work (loading:start, loading:end)

---

#### **Test 2: Wizard Vertical Progress Block**

**File**: `blocks/wizard-vertical-progress/wizard-vertical-progress.js`

**How to Test**:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/blocks/wizard-vertical-progress/wizard-vertical-progress.css">
</head>
<body>
  <div class="wizard-vertical-progress"></div>
  
  <script type="module">
    import decorate from '/blocks/wizard-vertical-progress/wizard-vertical-progress.js';
    
    const block = document.querySelector('.wizard-vertical-progress');
    decorate(block);
    
    // Initialize with steps
    block.initialize([
      { title: 'Step 1', description: 'First step', completed: false },
      { title: 'Step 2', description: 'Second step', completed: false },
      { title: 'Step 3', description: 'Third step', completed: false }
    ]);
    
    // Test navigation
    setTimeout(() => block.setActiveStep(1), 2000);
    setTimeout(() => block.completeStep(0), 3000);
  </script>
</body>
</html>
```

**Test Checklist**:
- [ ] Block renders
- [ ] Steps display correctly
- [ ] Icons show correct state (pending/active/completed)
- [ ] Click navigation works
- [ ] setActiveStep() works
- [ ] completeStep() works
- [ ] Events fire (wizard:step-changed)

---

#### **Test 3: Template Card Block**

**File**: `blocks/template-card/template-card.js`

**How to Test**:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/blocks/template-card/template-card.css">
</head>
<body>
  <div class="template-card"></div>
  
  <script type="module">
    import decorate from '/blocks/template-card/template-card.js';
    
    const block = document.querySelector('.template-card');
    decorate(block);
    
    // Set data
    block.setData({
      name: 'The Madison',
      sqft: 2400,
      stories: 2,
      bedrooms: 4,
      bathrooms: 2.5,
      image: '/images/floor-plans/madison.jpg',
      variants: ['Standard', 'With Bonus Room']
    });
    
    // Listen for events
    window.addEventListener('template:view', (e) => {
      console.log('View clicked:', e.detail);
    });
  </script>
</body>
</html>
```

**Test Checklist**:
- [ ] Block renders
- [ ] Image displays
- [ ] Specs display correctly (sqft, stories, BR/BA)
- [ ] Variant badge shows
- [ ] Buttons work
- [ ] Events fire (template:view, template:order, template:select)

---

#### **Test 4: Product Tile Block**

**File**: `blocks/product-tile/product-tile.js`

**How to Test**:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/blocks/product-tile/product-tile.css">
</head>
<body>
  <div class="product-tile"></div>
  
  <script type="module">
    import decorate from '/blocks/product-tile/product-tile.js';
    
    const block = document.querySelector('.product-tile');
    decorate(block);
    
    // Set data
    await block.setData({
      sku: 'LBR-D0414F1E',
      name: '2x4x8 Douglas Fir Framing Lumber',
      image: '/images/products/lumber.png',
      inStock: 500,
      price: 10.00
    });
    
    // Test toggle
    setTimeout(() => block.toggle(), 2000);
  </script>
</body>
</html>
```

**Test Checklist**:
- [ ] Block renders
- [ ] Image displays
- [ ] Inventory status correct
- [ ] Pricing displays (with customer group discount)
- [ ] Selection toggle works
- [ ] CSS classes update
- [ ] Events fire (product:toggle)

---

#### **Test 5: Package Comparison Block**

**File**: `blocks/package-comparison/package-comparison.js`

**How to Test**:
```html
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="/blocks/package-comparison/package-comparison.css">
</head>
<body>
  <div class="package-comparison"></div>
  
  <script type="module">
    import decorate from '/blocks/package-comparison/package-comparison.js';
    
    const block = document.querySelector('.package-comparison');
    decorate(block);
    
    // Set packages
    block.setPackages([
      {
        tier: 'good',
        name: 'Good Package',
        price: 5000,
        image: '/images/packages/good.jpg',
        features: ['Standard fixtures', 'Basic tile'],
        recommended: false
      },
      {
        tier: 'better',
        name: 'Better Package',
        price: 8000,
        image: '/images/packages/better.jpg',
        features: ['Mid-range fixtures', 'Ceramic tile'],
        recommended: true
      }
    ]);
  </script>
</body>
</html>
```

**Test Checklist**:
- [ ] Block renders
- [ ] Packages display in grid
- [ ] Recommended badge shows
- [ ] Features list displays
- [ ] Selection works
- [ ] Events fire (package:select)

---

## What CANNOT Be Tested Yet

### ❌ Full User Journeys (Blocked Until Phase 5)

**Why**: Existing pages (`catalog.html`, `product-detail.html`, `cart.html`, etc.) have NOT been refactored to use the new Phase 3 architecture.

**Current State**:
- Pages use old mock data system
- Pages don't integrate with persona system
- Pages don't use mock ACO service
- Pages don't show persona-specific pricing

**Needed**: Phase 5 (Existing Page Refactor)

---

### ❌ Persona-Specific Dashboards (Blocked Until Phase 6)

**Why**: Persona dashboards haven't been built yet.

**Current State**:
- `dashboard.html` and `builder.html` are generic shells
- No persona-specific content
- No template dashboard (Sarah)
- No project wizard (Marcus)
- No package builder (Lisa)
- No deck builder (David)
- No restock dashboard (Kevin)

**Needed**: Phase 6A-E (Persona Dashboards)

---

## Testing Strategy by Phase

### ✅ Now (Phases 1-4)
**Type**: Unit & Component Testing  
**Scope**: Individual components in isolation  
**Tools**: Browser console, test HTML files  
**Duration**: 2-3 hours

**What to Test**:
- ✅ Data generation (Phase 1)
- ✅ Persona config (Phase 3)
- ✅ Mock ACO service (Phase 3)
- ✅ Auth system (Phase 3)
- ✅ Shared blocks (Phase 4)

---

### 🔜 After Phase 5
**Type**: Integration Testing  
**Scope**: Refactored pages with persona system  
**Tools**: Manual testing, browser  
**Duration**: 1 week

**What to Test**:
- Catalog page with persona filtering
- PDP with persona pricing
- Cart with savings display
- Sign-up/onboarding wizard
- Account page with persona context

**User Journeys**:
1. Select persona → Browse catalog → View pricing
2. Login → Add to cart → See discounts
3. Sign up → Onboarding → Persona assignment

---

### 🔜 After Phase 6
**Type**: End-to-End Testing  
**Scope**: Complete persona user journeys  
**Tools**: Manual testing, automated E2E tests  
**Duration**: 2 weeks

**What to Test**:
- **Sarah**: Template selection → BOM generation → Order
- **Marcus**: Project wizard → Phase selection → Materials list
- **Lisa**: Room selection → Package comparison → Order
- **David**: Deck builder → Shape/material → Kit order
- **Kevin**: Restock dashboard → Velocity view → Bulk order

---

## Recommended Testing Approach

### Option 1: Test Now (Component-Level)
**Pros**:
- ✅ Catch issues early
- ✅ Validate Phase 3 & 4 work
- ✅ Build confidence in architecture

**Cons**:
- ❌ Can't test full user journeys
- ❌ Limited real-world scenarios
- ❌ May need to retest after Phase 5

**Recommendation**: ✅ **Do this** - Validate foundation before building on it

---

### Option 2: Wait Until Phase 5 (Integration-Level)
**Pros**:
- ✅ Test with real pages
- ✅ More meaningful scenarios
- ✅ Less duplication of effort

**Cons**:
- ❌ Delayed feedback
- ❌ Harder to fix issues
- ❌ Risk of cascading problems

**Recommendation**: ⚠️ **Risky** - Could discover fundamental issues late

---

### Option 3: Wait Until Phase 6 (End-to-End)
**Pros**:
- ✅ Complete user journeys
- ✅ Most realistic testing

**Cons**:
- ❌ Very delayed feedback
- ❌ Expensive to fix issues
- ❌ High risk

**Recommendation**: ❌ **Don't do this** - Too risky

---

## My Recommendation

### 🎯 **Hybrid Approach: Test Now + Test After Each Phase**

**Phase 1-4 (Now)**:
- ✅ Component-level testing (2-3 hours)
- ✅ Validate core architecture
- ✅ Catch fundamental issues

**Phase 5 (Next)**:
- ✅ Integration testing (1 week)
- ✅ Test refactored pages
- ✅ Validate persona flows

**Phase 6 (Later)**:
- ✅ End-to-end testing (2 weeks)
- ✅ Complete user journeys
- ✅ Final validation

**Benefits**:
- ✅ Early feedback at each stage
- ✅ Incremental validation
- ✅ Lower risk
- ✅ Easier to fix issues

---

## How to Guide Me for Updates/Fixes

### Best Practices for Feedback

#### ✅ DO: Test Components in Isolation Now
```
"I tested the mock ACO service and pricing is wrong for Sarah.
Expected 15% discount, got 10%."
```

#### ✅ DO: Report Specific Issues
```
"The wizard-vertical-progress block doesn't emit the
wizard:step-changed event when I click a step."
```

#### ✅ DO: Provide Context
```
"When I call acoService.getProducts() with construction_phase
policy, I get 0 products. Expected ~50 products."
```

#### ❌ DON'T: Try to Test Full User Journeys Yet
```
"I tried to browse the catalog as Sarah but the pricing doesn't
show her discount."
```
**Why**: Catalog page not refactored yet (Phase 5)

#### ❌ DON'T: Expect Persona Dashboards to Work
```
"Sarah's template dashboard doesn't show templates."
```
**Why**: Dashboard not built yet (Phase 6A)

---

## Testing Checklist

### Phase 1: ACO Data Foundation
- [ ] Run `npm run generate:all` in buildright-aco
- [ ] Run `npm run validate:phase1` in buildright-aco
- [ ] Verify 177 products generated
- [ ] Verify 885 prices generated
- [ ] Verify 28 policies defined
- [ ] Run dry-run ingestion scripts

### Phase 3: Core Architecture
- [ ] Test persona config in browser console
- [ ] Test mock ACO service queries
- [ ] Test policy-based filtering
- [ ] Test customer group pricing
- [ ] Test volume tier pricing
- [ ] Test auth system login/logout
- [ ] Test session persistence

### Phase 4: Shared Components
- [ ] Test loading overlay block
- [ ] Test wizard progress block
- [ ] Test template card block
- [ ] Test product tile block
- [ ] Test package comparison block
- [ ] Test icon helper utility
- [ ] Verify all events fire

---

## Next Steps

1. **Now**: Test Phases 1-4 components (use this guide)
2. **Report Issues**: Use specific, actionable feedback
3. **After Phase 5**: Integration testing with refactored pages
4. **After Phase 6**: End-to-end persona journey testing

---

**Last Updated**: November 17, 2025  
**Status**: Ready for component-level testing  
**Next**: Phase 5 (Existing Page Refactor)

