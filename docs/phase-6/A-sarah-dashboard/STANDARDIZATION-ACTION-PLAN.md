# Layout Standardization Action Plan

**Status**: Ready for Review  
**Estimated Time**: 4-6 hours total  
**Priority**: High (Technical Debt & Maintainability)

---

## Executive Summary

The account dashboard page uses heavy inline styling while other pages (build configurator, BOM review) follow better patterns. This creates:
- **Maintenance burden** (styles scattered across HTML)
- **Inconsistent visual hierarchy** (different heading sizes, spacing)
- **Performance impact** (inline styles can't be cached)
- **Scalability issues** (hard to make global changes)

**Recommendation**: Standardize on the patterns used in build-configurator.css and bom-review.css, which properly leverage the design system.

---

## Critical Decisions Needed

Before implementation, please decide:

### Decision 1: Container Max-Width Standard

**Current State:**
- Account dashboard: `1400px` (inline override)
- Template dashboard: `1600px` (hardcoded)
- Build configurator/BOM: `1280px` (uses design token)
- Catalog: `1280px` (uses design token)

**Options:**

**Option A** (Recommended): Enforce standard `1280px` everywhere
```css
/* All pages use same max-width */
max-width: var(--container-max-width); /* 1280px */
```
- ✅ Consistency
- ✅ Simpler to maintain
- ❌ Less flexibility for special cases

**Option B**: Allow wider containers via modifier classes
```css
/* Standard */
.container {
  max-width: var(--container-max-width); /* 1280px */
}

/* Modifier for wider layouts */
.container-wide {
  max-width: 1400px;
}

.container-extra-wide {
  max-width: 1600px;
}
```
- ✅ Flexibility
- ✅ Explicit intent via class names
- ❌ More classes to maintain

**Your Choice:** _____________

---

### Decision 2: Section Header Style

**Current State:**
- Account: Plain h2 (with inline styles)
- Template dashboard: Plain h2
- Build configurator/BOM: Fancy gradient headers with `.section-title`

**Options:**

**Option A**: Plain h2 everywhere (simplest)
```html
<h2>Section Title</h2>
```
- ✅ Clean, simple
- ✅ Fast to implement
- ❌ Less visual hierarchy

**Option B**: Gradient headers for complex pages only
```html
<!-- Simple pages (templates, account) -->
<h2>Section Title</h2>

<!-- Complex pages (configurator, BOM) -->
<h2 class="section-title">Section Title</h2>
```
- ✅ Visual distinction for complex forms
- ✅ Flexibility
- ⚠️ Requires judgment call per page

**Option C**: Gradient headers everywhere
```html
<section class="content-section">
  <h2 class="section-title">Section Title</h2>
  <!-- Content -->
</section>
```
- ✅ Consistent visual style
- ✅ Strong visual hierarchy
- ❌ Requires wrapping sections
- ❌ More CSS complexity

**Your Choice:** _____________

---

### Decision 3: Standard Page Structure

**Current State:** Three different approaches

**Options:**

**Option A** (Recommended): Standard EDS pattern
```html
<main>
  <div class="breadcrumbs">...</div>
  
  <section class="section">
    <div class="container">
      <!-- All content here -->
    </div>
  </section>
</main>
```
- ✅ Follows EDS best practices
- ✅ Simplest
- ✅ Most flexible

**Option B**: Custom container per page
```html
<main>
  <div class="breadcrumbs">...</div>
  
  <div class="page-specific-container">
    <!-- All content here -->
  </div>
</main>
```
- ✅ Maximum flexibility
- ❌ More classes to maintain
- ❌ Less consistent

**Your Choice:** _____________

---

### Decision 4: Sidebar Width Standards

**Current State:**
- Account nav sidebar: `250px`
- Build configurator sidebar: `360px`
- Catalog filters: `280px`

**Options:**

**Option A**: Single standard width
```css
:root {
  --sidebar-width: 360px;
}
```
- ✅ Simplest
- ❌ May be too wide for simple nav

**Option B** (Recommended): Two standards
```css
:root {
  --sidebar-width-narrow: 250px;   /* Navigation, simple lists */
  --sidebar-width-standard: 360px; /* Summaries, detailed info */
}
```
- ✅ Flexibility for different uses
- ✅ Still standardized
- ✅ Clear semantic naming

**Your Choice:** _____________

---

## Implementation Plan

### Phase 1: Create New CSS File (30 min)

**File:** `styles/dashboards/account-dashboard.css`

Move all account page styles from inline to this file:

```css
/* Account Dashboard Styles
 * Uses design system tokens from base.css
 */

/* Layout */
.account-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width-narrow) 1fr;
  gap: var(--spacing-xxlarge);
  align-items: start;
}

/* Navigation */
.account-nav {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-small);
}

.account-nav-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  color: var(--color-text);
  text-decoration: none;
  border-radius: var(--shape-border-radius-3);
  transition: all 0.2s ease;
  font-weight: 500;
}

.account-nav-item:hover {
  background: var(--color-surface);
  color: var(--color-brand-500);
}

.account-nav-item.active {
  background: var(--color-brand-500);
  color: white;
}

/* Sections */
.section-header {
  margin: 0 0 var(--spacing-small) 0;
}

.section-description {
  font: var(--type-body-2-default-font);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-large) 0;
}

/* Responsive */
@media (max-width: 768px) {
  .account-layout {
    grid-template-columns: 1fr;
  }
}
```

**Checklist:**
- [ ] Create file `styles/dashboards/account-dashboard.css`
- [ ] Copy inline styles from `<style>` tag
- [ ] Convert hardcoded values to design tokens
- [ ] Add responsive breakpoints
- [ ] Add comments for organization

---

### Phase 2: Update Account Page HTML (1 hour)

**File:** `pages/account.html`

**Changes:**

1. **Add CSS link:**
```html
<link rel="stylesheet" href="../styles/dashboards/account-dashboard.css">
```

2. **Remove inline `<style>` block:**
```html
<!-- DELETE THIS -->
<style>
  .account-nav-item { ... }
</style>
```

3. **Remove max-width override:**
```html
<!-- Before -->
<div class="container" style="max-width: 1400px;">

<!-- After -->
<div class="container">
<!-- OR if you chose Option B for Decision 1: -->
<div class="container container-wide">
```

4. **Remove h1 inline styles:**
```html
<!-- Before -->
<h1 style="margin-bottom: 3rem; font-size: 2rem; font-weight: 700;">
  Account Dashboard
</h1>

<!-- After -->
<h1>Account Dashboard</h1>
```

5. **Remove h2 inline styles:**
```html
<!-- Before -->
<h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text);">
  Company Information
</h2>

<!-- After -->
<h2 class="section-header">Company Information</h2>
```

6. **Remove paragraph inline styles:**
```html
<!-- Before -->
<p style="margin: 0 0 1.5rem 0; font-size: 0.9375rem; color: var(--color-text-secondary);">
  View your company details and primary warehouse.
</p>

<!-- After -->
<p class="section-description">View your company details and primary warehouse.</p>
```

7. **Remove grid inline styles:**
```html
<!-- Before -->
<div style="display: grid; grid-template-columns: 250px 1fr; gap: 3rem;">
  <nav style="display: flex; flex-direction: column; gap: 0.5rem;">

<!-- After -->
<div class="account-layout">
  <nav class="account-nav">
```

**Checklist:**
- [ ] Add CSS file link in `<head>`
- [ ] Remove `<style>` block
- [ ] Remove all `style="..."` attributes
- [ ] Add semantic class names
- [ ] Update nav structure
- [ ] Update grid structure

---

### Phase 3: Update Template Dashboard (30 min)

**File:** `styles/dashboards/template-dashboard.css`

**Changes:**

1. **Update max-width to use design token:**
```css
/* Before */
.template-dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: var(--spacing-medium) var(--spacing-large) 8rem;
}

/* After (Option A - enforce standard) */
.template-dashboard {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: var(--spacing-medium) var(--spacing-large) 8rem;
}

/* OR After (Option B - explicit wide modifier) */
.template-dashboard {
  max-width: 1600px; /* Keep wider layout */
  margin: 0 auto;
  padding: var(--spacing-medium) var(--spacing-large) 8rem;
}
/* Add comment explaining why wider */
```

**Checklist:**
- [ ] Decide on max-width approach
- [ ] Update `.template-dashboard` max-width
- [ ] Add comment if using non-standard width
- [ ] Test responsive layout

---

### Phase 4: Add Global Utilities (30 min)

**File:** `styles/utilities.css`

**Add:**

```css
/* ===================================
   Page Header Utilities
   =================================== */

.page-header {
  margin-bottom: var(--spacing-xlarge);
}

.page-subtitle {
  font: var(--type-body-1-default-font);
  color: var(--color-text-secondary);
  margin: 0;
}

.section-description {
  font: var(--type-body-2-default-font);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-large) 0;
}
```

**File:** `styles/base.css`

**Add (if Decision 4 = Option B):**

```css
:root {
  /* Sidebar width standards */
  --sidebar-width-narrow: 250px;   /* Navigation, simple lists */
  --sidebar-width-standard: 360px; /* Order summaries, detailed info */
}
```

**Checklist:**
- [ ] Add page header utilities to `utilities.css`
- [ ] Add sidebar width tokens to `base.css` (if chosen)
- [ ] Test that utilities work across pages

---

### Phase 5: Fix Catalog Page (15 min)

**File:** `pages/catalog.html`

**Add h1 for accessibility:**

```html
<!-- Current -->
<section class="section section-compact">
  <div class="container">
    <div class="catalog-layout" id="catalog-layout">

<!-- Updated -->
<section class="section section-compact">
  <div class="container">
    <h1>Product Catalog</h1>
    
    <div class="catalog-layout" id="catalog-layout">
```

**Option**: If you don't want h1 visible, use `.visually-hidden`:

```html
<h1 class="visually-hidden">Product Catalog</h1>
```

```css
/* Add to utilities.css if not already present */
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

**Checklist:**
- [ ] Add h1 to catalog page
- [ ] Choose visible or visually-hidden approach
- [ ] Test screen reader accessibility

---

### Phase 6: Testing (1 hour)

**Visual Testing:**
- [ ] Account dashboard matches other page styles
- [ ] Headings are consistent size/weight
- [ ] Spacing is consistent
- [ ] Layouts align properly

**Responsive Testing:**
- [ ] Mobile (< 768px): Sidebars stack properly
- [ ] Tablet (768px - 1024px): Layouts adapt
- [ ] Desktop (> 1024px): Full layouts display

**Browser Testing:**
- [ ] Chrome: All styles render correctly
- [ ] Safari: All styles render correctly
- [ ] Firefox: All styles render correctly

**Accessibility Testing:**
- [ ] All pages have h1
- [ ] Heading hierarchy is logical (h1 → h2 → h3)
- [ ] Screen reader navigation works
- [ ] Keyboard navigation works

**Performance Testing:**
- [ ] No inline styles remain
- [ ] CSS files load properly
- [ ] Page load time unchanged or improved

---

### Phase 7: Documentation (30 min)

**File:** `docs/standards/CSS-ARCHITECTURE.md`

**Add section:**

```markdown
## Standard Page Structure

All pages should follow this structure:

### HTML Template

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Page Title - BuildRight</title>
  <script src="../scripts/critical-init.js"></script>
  <script type="module" src="../scripts/scripts.js"></script>
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../styles/page-specific.css">
</head>
<body class="page-{name}">
  
  <header></header>
  
  <main>
    <div class="breadcrumbs">...</div>
    
    <section class="section">
      <div class="container">
        <div class="page-header">
          <h1>Page Title</h1>
          <p class="page-subtitle">Description</p>
        </div>
        
        <div class="page-content">
          <!-- Page-specific layout -->
        </div>
      </div>
    </section>
  </main>
  
  <footer></footer>
  
  <script type="module" src="../scripts/page-name.js"></script>
</body>
</html>
\`\`\`

### CSS Guidelines

1. **Never use inline styles** - Always use CSS files
2. **Use design system tokens** - No hardcoded values
3. **Follow naming conventions** - BEM or semantic names
4. **Add comments** - Organize CSS with section headers
5. **Be responsive** - Mobile-first approach

### Design System Tokens

- Spacing: `var(--spacing-small)` through `var(--spacing-xxlarge)`
- Typography: `var(--type-headline-1-font)`, `var(--type-body-1-default-font)`, etc.
- Colors: `var(--color-brand-500)`, `var(--color-text)`, etc.
- Borders: `var(--shape-border-radius-2)` through `var(--shape-border-radius-4)`
- Shadows: `var(--shape-shadow-2)`, `var(--shape-shadow-3)`
```

**Checklist:**
- [ ] Update CSS-ARCHITECTURE.md
- [ ] Add page structure template
- [ ] Document CSS guidelines
- [ ] List design system tokens

---

## Summary of Files to Modify

### New Files (2)
1. ✨ `styles/dashboards/account-dashboard.css` - New CSS file for account page

### Modified Files (5)
2. 📝 `pages/account.html` - Remove inline styles
3. 📝 `pages/catalog.html` - Add h1
4. 📝 `styles/dashboards/template-dashboard.css` - Update max-width
5. 📝 `styles/utilities.css` - Add page header utilities
6. 📝 `styles/base.css` - Add sidebar width tokens (optional)

### Documentation (2)
7. 📚 `docs/standards/CSS-ARCHITECTURE.md` - Add standards
8. 📚 `docs/phase-6/A-sarah-dashboard/LAYOUT-CONSISTENCY-AUDIT.md` - Reference doc

---

## Time Estimates

| Phase | Task | Time | Difficulty |
|-------|------|------|-----------|
| 1 | Create account CSS file | 30 min | Easy |
| 2 | Update account HTML | 1 hour | Medium |
| 3 | Update template dashboard | 30 min | Easy |
| 4 | Add global utilities | 30 min | Easy |
| 5 | Fix catalog page | 15 min | Easy |
| 6 | Testing | 1 hour | Medium |
| 7 | Documentation | 30 min | Easy |
| **TOTAL** | | **4-5 hours** | |

---

## Risk Assessment

### Low Risk ✅
- Creating new CSS file (doesn't affect existing code)
- Adding h1 to catalog (improvement only)
- Adding utilities (optional to use)

### Medium Risk ⚠️
- Removing inline styles from account page (visual changes)
- Changing template dashboard max-width (layout change)

### Mitigation
- Test thoroughly before committing
- Keep git history for easy rollback
- Review in multiple browsers
- Get stakeholder approval on visual changes

---

## Success Criteria

After implementation:

- [ ] ✅ Zero inline `style="..."` attributes in HTML
- [ ] ✅ Zero `<style>` blocks in HTML files
- [ ] ✅ All pages use design system tokens
- [ ] ✅ Consistent heading sizes across pages
- [ ] ✅ Consistent spacing/gaps across pages
- [ ] ✅ All pages have h1 for accessibility
- [ ] ✅ Mobile responsive layouts work
- [ ] ✅ CSS is organized and commented
- [ ] ✅ Documentation is updated

---

## Next Steps

1. **Review this plan** and make decisions for the 4 critical choices
2. **Schedule implementation** time (4-5 hours)
3. **Create git branch** for changes
4. **Follow phases** 1-7 in order
5. **Test thoroughly** before merging
6. **Get approval** from stakeholders
7. **Merge to main** and deploy

---

## Questions?

Contact the dev team or reference:
- `LAYOUT-CONSISTENCY-AUDIT.md` - Full analysis
- `VISUAL-CONSISTENCY-EXAMPLES.md` - Before/after examples
- `docs/standards/CSS-ARCHITECTURE.md` - CSS guidelines

