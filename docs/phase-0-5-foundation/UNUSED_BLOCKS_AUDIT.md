# Unused Blocks Audit - Ready for Removal

**Date:** November 19, 2025  
**Phase:** 4 - Bundle Optimization

---

## 🔴 Confirmed Unused Blocks

The following blocks are **NOT USED ANYWHERE** in the production code and can be safely removed:

### 1. `blocks/loading-overlay/`

**Status:** ❌ **UNUSED**

**Why it exists:**  
Created as a reusable block for showing loading states with spinner + message.

**Why it's unused:**  
All pages use CSS classes (`.loading-overlay`, `.catalog-loading-overlay`) for loading states instead of the block.

**Evidence:**
- `pages/dashboard.html` - Uses `<div class="loading-overlay">` (NOT the block)
- `pages/builder.html` - Uses `<div class="loading-overlay">` (NOT the block)
- `pages/catalog.html` - Uses `<div class="catalog-loading-overlay">` (NOT the block)
- No `data-block-name="loading-overlay"` found anywhere
- No imports of the block JavaScript

**Files to remove:**
- `blocks/loading-overlay/loading-overlay.js`
- `blocks/loading-overlay/loading-overlay.css`
- `blocks/loading-overlay/` directory

---

### 2. `blocks/package-comparison/`

**Status:** ❌ **UNUSED**

**Why it exists:**  
Created for comparing package/pricing options (likely for project builder feature).

**Why it's unused:**  
Feature was either not implemented or replaced with another approach.

**Evidence:**
- Only referenced in `docs/TESTING-GUIDE-PHASES-1-4.md` (test documentation)
- No `data-block-name="package-comparison"` found in any HTML page
- No imports of the block JavaScript
- No actual production usage

**Files to remove:**
- `blocks/package-comparison/package-comparison.js`
- `blocks/package-comparison/package-comparison.css`
- `blocks/package-comparison/` directory

---

### 3. `blocks/template-card/`

**Status:** ❌ **UNUSED**

**Why it exists:**  
Created for displaying template/preset options (likely for project builder).

**Why it's unused:**  
Feature was either not implemented or templates are displayed differently.

**Evidence:**
- Only referenced in `docs/TESTING-GUIDE-PHASES-1-4.md` (test documentation)
- No `data-block-name="template-card"` found in any HTML page
- No imports of the block JavaScript
- No actual production usage

**Files to remove:**
- `blocks/template-card/template-card.js`
- `blocks/template-card/template-card.css`
- `blocks/template-card/` directory

---

## ✅ Blocks Confirmed as USED

These blocks were audited and confirmed to be actively used:

| Block | Usage Location |
|-------|---------------|
| `product-tile` | `blocks/product-grid/product-grid.js` |
| `tier-badge` | `pages/account.html`, `scripts/scripts.js`, `scripts/app.js` |

---

## 📊 Impact

### Before Removal:
- **Total Blocks:** 28
- **Unused Blocks:** 3
- **Unused Code:** ~350-500 lines (JS + CSS)
- **Unused Files:** 6 files

### After Removal:
- **Total Blocks:** 25
- **Code Reduction:** ~350-500 lines
- **Files Removed:** 6
- **Bundle Size Reduction:** Estimated ~15-20KB (uncompressed)

---

## 🎯 Recommendation

**REMOVE ALL THREE UNUSED BLOCKS**

These blocks are:
1. Not referenced in any HTML pages
2. Not imported by any JavaScript
3. Only mentioned in documentation
4. Adding unnecessary weight to the codebase

**Risk:** ⚠️ **LOW**  
- No production code depends on these blocks
- Documentation references can be updated
- Easy to restore from git history if needed

---

## 🛠️ Removal Plan

```bash
# Remove unused block directories
rm -rf blocks/loading-overlay
rm -rf blocks/package-comparison
rm -rf blocks/template-card

# Update documentation if needed
# (Optional: Update testing docs to remove references)
```

---

## 📝 Notes

### Loading Overlay Pattern

Instead of using the `loading-overlay` block, the codebase uses a simpler CSS-only approach:

```html
<!-- Dashboard/Builder Pattern -->
<div class="loading-overlay">
  <div class="loading-spinner"></div>
  <p>Loading...</p>
</div>

<!-- Catalog Pattern -->
<div class="catalog-loading-overlay" id="catalog-loading">
  <div class="loading-spinner"></div>
  <p>Loading catalog...</p>
</div>
```

This is **BETTER** because:
- ✅ No JavaScript needed for simple loading states
- ✅ Faster render (no block decoration overhead)
- ✅ Easier to customize per-page
- ✅ Works with visibility toggling (no need for block APIs)

The `loading-overlay` block was over-engineered for simple use cases.

---

## 🎓 Learnings

**When to use a Block vs. CSS:**
- **Use Block:** Complex interactive components (filters, galleries, wizards)
- **Use CSS:** Simple presentational states (loading, empty, error)

**Dead Code Prevention:**
- Regular audits of `blocks/` directory
- Document which blocks are used where
- Remove blocks when features are deprecated
- Check for actual usage, not just file existence

---

## ✅ Sign-Off

**Audited by:** AI Assistant  
**Approved for Removal:** ✅ YES  
**Risk Level:** LOW  
**Estimated Time:** 5 minutes  
**Impact:** Positive (cleaner codebase, smaller bundle)

