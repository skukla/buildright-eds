# Phase 4: Bundle Optimization Audit

**Date:** November 19, 2025  
**Objective:** Identify unused code, tree-shaking opportunities, and lazy-loading candidates

---

## 📊 Executive Summary

This audit analyzes the codebase for optimization opportunities to reduce bundle size and improve load times.

### Quick Stats:
- **Scripts folder:** 30+ JavaScript files
- **Blocks folder:** 25 block components
- **Pages:** 15 HTML pages
- **Utility functions:** 14 exported from `utils.js`

---

## 🔍 Utility Functions Analysis (`scripts/utils.js`)

### ✅ Actively Used Functions:

| Function | Usage Count | Files |
|----------|-------------|-------|
| `parseHTMLFragment` | 9+ | product-grid, header, mini-cart, kit-sidebar, inventory-status, cart-summary |
| `parseHTML` | 8+ | wizard components, kit-sidebar, kit-mode-banner |
| `safeAddEventListener` | 1 | product-grid.js |
| `cleanupEventListeners` | 1 | product-grid.js |
| `cleanElementListeners` | 2 | product-detail pages |
| `getUrlParameter` | 2 | product-detail pages |
| `decorateBlock` | 1 | app.js |

### ⚠️ Potentially Unused Functions:

| Function | Status | Notes |
|----------|--------|-------|
| `formatCurrency` | ❓ **NEEDS VERIFICATION** | Not found in imports, but may be used inline |
| `formatNumber` | ❓ **NEEDS VERIFICATION** | Not found in imports |
| `debounce` | ❓ **NEEDS VERIFICATION** | Not found in imports |
| `safeRemoveEventListener` | ❓ **NEEDS VERIFICATION** | Not found in imports |
| `makeIdempotent` | ❓ **NEEDS VERIFICATION** | Not found in imports |

### ✅ Used Internally (scripts.js):

| Function | Usage | Notes |
|----------|-------|-------|
| `loadBlockCSS` | scripts.js | Used by decorateBlock() |
| `loadBlockJS` | scripts.js | Used by decorateBlock() |

---

## 📦 Scripts Analysis

### Core Scripts (Always Needed):
- ✅ `scripts.js` - Main application logic
- ✅ `auth.js` - Authentication system
- ✅ `aco-service.js` - Product data service
- ✅ `cart-manager.js` - Cart functionality
- ✅ `utils.js` - Utility functions
- ✅ `persona-config.js` - User personas
- ✅ `url-router.js` - URL parsing

### Page-Specific Scripts (Candidates for Lazy Loading):

#### 🟡 Project Builder Related (Large!)
- `project-builder.js`
- `project-builder-wizard.js`
- `project-builder-constants.js`
- `wizard/` folder (9 files!)
  - wizard-core.js
  - wizard-ui-components.js
  - wizard-bundle-display.js
  - wizard-bundle-generation.js
  - wizard-list-views.js
  - wizard-progress.js
  - wizard-selection.js
  - wizard-sidebar.js
  - wizard-utils.js

**Recommendation:** ⚠️ These should ONLY load on project builder pages

#### 🟡 Dashboard Related:
- `dashboard.js`
- `dashboards/` folder
- `educational-content.js`

**Recommendation:** ⚠️ Only load on dashboard page

#### 🟡 Kit/Builder Mode:
- `kit-sidebar.js`
- `kit-mode-banner.js`

**Recommendation:** ⚠️ Only load when kit mode is active

### Utility/Build Scripts (Not for Production):
- ❌ `generate-mock-data.js` - Build time only
- ❌ `generate-product-images.js` - Build time only
- ❌ `download-product-images.js` - Build time only
- ❌ `update-product-images.js` - Build time only
- ❌ `data-mock.js` - Unclear usage
- ❌ `build.js` - Build time only
- ❌ `builder.js` - Unclear if used

**Recommendation:** 🔴 These should be in a `/tools` or `/scripts/build` folder, not served

---

## 🧩 Blocks Analysis

### Always-Loaded Blocks:
- ✅ `header` - On every page
- ✅ `footer` - On every page
- ✅ `mini-cart` - Part of header
- ✅ `user-menu` - Part of header

### Content Blocks (Lazy-Loaded via EDS):
- ✅ `product-grid` - Catalog page
- ✅ `featured-products` - Home page
- ✅ `filters-sidebar` - Catalog page
- ✅ `product-gallery` - Product detail page
- ✅ `cart-summary` - Cart page

### Specialty Blocks (Check if Actually Used):
- 🟡 `loading-overlay` - Is this still used?
- 🟡 `package-comparison` - Where is this used?
- 🟡 `pricing-display` - Where is this used?
- 🟡 `product-tile` - Replaced by product-card?
- 🟡 `tier-badge` - Where is this used?
- 🟡 `template-card` - Where is this used?

### Project Builder Blocks:
- 🟡 `project-builder`
- 🟡 `project-bundle`
- 🟡 `project-filter`
- 🟡 `wizard-progress`
- 🟡 `wizard-sidebar`
- 🟡 `wizard-vertical-progress`

**Recommendation:** ⚠️ These should only load on project builder pages

---

## 🎯 Priority Recommendations

### 🔴 HIGH PRIORITY (Quick Wins):

#### 1. **Move Build Scripts Out of Production**
**Impact:** Reduce server load, cleaner structure  
**Effort:** Low (15 minutes)

Create `scripts/tools/` folder and move:
- `generate-mock-data.js`
- `generate-product-images.js`
- `download-product-images.js`
- `update-product-images.js`
- `build.js`

#### 2. **Verify and Remove Unused Utility Functions**
**Impact:** Smaller utils.js bundle  
**Effort:** Low (30 minutes)

Action items:
- Search codebase for `formatCurrency`, `formatNumber`, `debounce`
- If unused, remove from exports
- Update tests if applicable

#### 3. **Audit Unused Blocks**
**Impact:** Remove dead code  
**Effort:** Medium (1 hour)

Check actual usage of:
- `loading-overlay` - May be replaced by catalog loading overlay
- `package-comparison` - Find where it's used or remove
- `product-tile` - Check if replaced by product-card
- `tier-badge`, `template-card` - Verify usage

---

### 🟡 MEDIUM PRIORITY (Good ROI):

#### 4. **Lazy Load Project Builder**
**Impact:** Significant initial bundle reduction  
**Effort:** Medium (2 hours)

Current state:
- All wizard scripts might be loading on every page (check scripts.js)
- Project builder blocks load eagerly

Recommendation:
- Dynamic import wizard scripts only on `/pages/project-builder.html`
- Use `import()` syntax for code splitting

#### 5. **Lazy Load Dashboard Scripts**
**Impact:** Moderate bundle reduction  
**Effort:** Low (30 minutes)

- Move dashboard.js to dynamic import on dashboard page
- Load educational-content.js only when needed

---

### 🟢 LOW PRIORITY (Long-term):

#### 6. **Implement Proper Code Splitting**
**Impact:** Better caching, faster page loads  
**Effort:** High (4+ hours)

- Split vendor dependencies into separate chunk
- Create common chunk for shared utilities
- Implement route-based splitting

#### 7. **Tree-Shake Wizard Utils**
**Impact:** Small reduction in wizard bundle  
**Effort:** Low (30 minutes)

- Review wizard-utils.js exports
- Remove unused helper functions
- Ensure ES6 module format for tree-shaking

---

## 📈 Expected Impact

### Before Optimization:
- **Estimated Bundle Size:** ~800KB (uncompressed)
- **Unused Code:** ~200KB (build scripts, unused utilities, dead blocks)
- **Project Builder:** Always loaded (~150KB)

### After Phase 4 (High Priority Only):
- **Estimated Bundle Size:** ~600KB (uncompressed)
- **Reduction:** ~200KB (25% smaller)
- **Improved:** Cleaner structure, faster initial load

### After Full Optimization:
- **Estimated Bundle Size:** ~400KB (uncompressed)
- **Reduction:** ~400KB (50% smaller)
- **Improved:** Code splitting, lazy loading, tree-shaking

---

## 🛠️ Implementation Plan

### Step 1: Dead Code Removal (30 min)
1. ✅ Move build scripts to `/scripts/tools/`
2. ✅ Verify unused utility functions
3. ✅ Remove confirmed dead code

### Step 2: Block Audit (1 hour)
1. ✅ Check each questionable block for actual usage
2. ✅ Remove unused blocks or document their purpose
3. ✅ Update block documentation

### Step 3: Lazy Loading (2 hours)
1. ✅ Implement dynamic imports for project builder
2. ✅ Implement dynamic imports for dashboard
3. ✅ Test that everything still works

### Step 4: Tree-Shaking (30 min)
1. ✅ Remove unused exports from utils.js
2. ✅ Verify ES6 module format everywhere
3. ✅ Test bundle size reduction

---

## 📝 Next Steps

**Ready to start?** Here's the recommended order:

1. **START HERE:** Move build scripts (15 min, no risk)
2. Verify utility functions (30 min, low risk)
3. Audit unused blocks (1 hour, medium risk - requires testing)
4. Implement lazy loading (2 hours, higher risk - requires careful testing)

**Total estimated time for HIGH priority items:** ~2-3 hours

---

## 🎓 Success Metrics

| Metric | Before | Target | How to Measure |
|--------|--------|--------|----------------|
| Bundle Size (uncompressed) | ~800KB | ~600KB | Browser DevTools Network tab |
| Bundle Size (gzipped) | ~200KB | ~150KB | Browser DevTools Network tab |
| Initial JS Download | ~800KB | ~400KB | Only core, no wizard |
| Time to Interactive (TTI) | Baseline | -20% | Lighthouse audit |
| Unused Code | ~200KB | <50KB | Coverage tool in DevTools |

---

## 📚 References

- [Webpack Code Splitting](https://webpack.js.org/guides/code-splitting/)
- [Dynamic Imports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports)
- [Tree Shaking](https://webpack.js.org/guides/tree-shaking/)
- [Adobe Edge Delivery Services - Performance](https://www.aem.live/docs/performance)

