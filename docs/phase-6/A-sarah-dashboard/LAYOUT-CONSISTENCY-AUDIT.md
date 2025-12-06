# Layout Consistency Audit - Phase 6A Pages

**Status**: Audit Complete  
**Date**: December 4, 2025  
**Goal**: Identify and standardize layout patterns, typography, and spacing across all Sarah-related pages and compare with established patterns

---

## Executive Summary

After analyzing the codebase, I've identified several areas where layout patterns, typography, and spacing are inconsistent across pages. The **account dashboard** (`pages/account.html`) uses a good structural pattern but relies heavily on **inline styles**, while the **build configurator** and **BOM review** pages use well-structured CSS with design system tokens. The **template dashboard** and **catalog** pages each have their own approaches to containers and spacing.

### Key Findings:

1. ✅ **Good Standard**: Build configurator and BOM review pages
2. ⚠️ **Needs Standardization**: Account dashboard (inline styles), Template dashboard (custom patterns)
3. ⚠️ **Different Approach**: Catalog page (uses `.section` wrapper properly)

---

## 1. Container & Max-Width Patterns

### Current State

| Page | Container Pattern | Max-Width | Notes |
|------|------------------|-----------|-------|
| **Account Dashboard** | `.container` + inline style | `1400px` (inline) | ⚠️ Inline override of design system |
| **Catalog** | `.section` → `.container` | `var(--container-max-width)` | ✅ Follows design system |
| **Template Dashboard** | `.template-dashboard` | `1600px` (CSS) | ⚠️ Custom container, wider than standard |
| **Build Configurator** | `.configurator-container` | `var(--container-max-width)` | ✅ Uses design token |
| **BOM Review** | `.bom-container` | `var(--container-max-width)` | ✅ Uses design token |

### Design System Standard (from `base.css`)

```css
.container {
  max-width: var(--container-max-width);  /* 1280px */
  margin: 0 auto;
  padding: 0 var(--section-padding-horizontal);
}

.section {
  padding: 2.5rem 0 var(--section-padding-vertical);
}
```

### Issues

1. **Account Dashboard**: Uses inline `style="max-width: 1400px;"` which overrides the design system
   ```html
   <!-- Current (BAD) -->
   <div class="container" style="max-width: 1400px;">
   ```

2. **Template Dashboard**: Uses custom `.template-dashboard` class with `max-width: 1600px` instead of standard `.container`
   ```css
   /* Current (INCONSISTENT) */
   .template-dashboard {
     padding: var(--spacing-medium) var(--spacing-large) 8rem;
     max-width: 1600px;
     margin: 0 auto;
   }
   ```

3. **Build Configurator & BOM Review**: Create custom container classes (`.configurator-container`, `.bom-container`) instead of using `.container`
   - These DO use design tokens correctly
   - But they create unnecessary class proliferation

---

## 2. Page Title (H1) Styling

### Current State

| Page | H1 Styling | Font Token | Font-Weight | Margin-Bottom |
|------|-----------|------------|-------------|---------------|
| **Account Dashboard** | Inline styles | `2rem` (inline) | `700` (inline) | `3rem` (inline) |
| **Template Dashboard** | CSS class | `var(--type-headline-1-font)` | `700` (token) | `var(--spacing-small)` |
| **Build Configurator** | Default h1 | (inherited) | (inherited) | `var(--spacing-small)` |
| **BOM Review** | Default h1 | (inherited) | (inherited) | `var(--spacing-small)` |
| **Catalog** | No h1 | N/A | N/A | N/A |

### Design System Standard (from `base.css`)

```css
h1 {
  font: var(--type-headline-1-font);  /* 700 2rem/1.25 */
  color: var(--color-text);
  margin: 0 0 1.5rem;
}
```

### Issues

1. **Account Dashboard**: Uses inline styles instead of letting h1 defaults apply
   ```html
   <!-- Current (BAD) -->
   <h1 style="margin-bottom: 3rem; font-size: 2rem; font-weight: 700;">Account Dashboard</h1>
   ```
   
   Should be:
   ```html
   <!-- Better -->
   <h1>Account Dashboard</h1>
   ```

2. **Template Dashboard**: Overrides h1 margins in CSS (which is better than inline, but still custom)
   ```css
   /* Current */
   .dashboard-title h1 {
     font: var(--type-headline-1-font);
     color: var(--color-text);
     margin: 0 0 var(--spacing-small);  /* Custom margin */
   }
   ```

3. **Catalog Page**: Missing a main h1 entirely (accessibility issue)

---

## 3. Subtitle/Description Styling

### Current State

| Page | Subtitle Class | Styling Method | Font | Color |
|------|---------------|----------------|------|-------|
| **Account Dashboard** | None | Inline `<p>` styles | `0.9375rem` (inline) | `var(--color-text-secondary)` |
| **Template Dashboard** | `.subtitle` | CSS class | `var(--type-body-1-default-font)` | `var(--color-text-secondary)` |
| **Build Configurator** | `.subtitle` | CSS class | `var(--color-text-secondary)` | `var(--color-text-secondary)` |
| **BOM Review** | `.subtitle` | CSS class | `var(--color-text-secondary)` | `var(--color-text-secondary)` |

### Best Practice Pattern

✅ **Build Configurator & BOM Review** use the cleanest approach:

```html
<div class="configurator-header">
  <h1>Configure Build</h1>
  <p class="subtitle">Set up your build details and select options</p>
</div>
```

```css
.configurator-header .subtitle {
  color: var(--color-text-secondary);
  margin: 0;
}
```

### Issues

1. **Account Dashboard**: Uses inline styles for every subtitle
   ```html
   <!-- Current (BAD) -->
   <p style="margin: 0 0 1.5rem 0; font-size: 0.9375rem; color: var(--color-text-secondary);">
     View your company details and primary warehouse.
   </p>
   ```

2. **Template Dashboard**: Defines `.subtitle` locally but pattern is good
   ```css
   /* Current (OK but could be global) */
   .dashboard-title .subtitle {
     font: var(--type-body-1-default-font);
     color: var(--color-text-secondary);
     margin: 0;
   }
   ```

---

## 4. Section Headers (H2) Styling

### Current State

| Page | H2 Context | Styling Method | Font-Size | Font-Weight | Margin |
|------|-----------|----------------|-----------|-------------|--------|
| **Account Dashboard** | Section titles | Inline styles | `1.5rem` | `600` | `0 0 0.5rem 0` |
| **Template Dashboard** | Card titles | Default h2 | `var(--type-headline-2-font)` | `600` | (varies) |
| **Build Configurator** | `.section-title` | CSS class + gradient | `var(--type-headline-2-font)` | `600` | Custom |
| **BOM Review** | `.section-title` | CSS class + gradient | `var(--type-headline-2-font)` | `600` | Custom |

### Design System Standard (from `base.css`)

```css
h2 {
  font: var(--type-headline-2-font);  /* 600 1.5rem/1.25 */
  color: var(--color-text);
  margin: 0 0 1rem;
}
```

### Best Practice Pattern

✅ **Build Configurator & BOM Review** use a distinctive `.section-title` with gradient header:

```css
.section-title {
  font: var(--type-headline-2-font);
  color: var(--color-text);
  margin: 0 0 var(--spacing-medium) 0;
  padding: var(--spacing-small) var(--spacing-medium);
  background: linear-gradient(to bottom, #EBF4FB 0%, white 100%);
  border-bottom: 2px solid var(--color-brand-500);
  border-radius: var(--shape-border-radius-2) var(--shape-border-radius-2) 0 0;
  margin-left: calc(var(--spacing-large) * -1);
  margin-right: calc(var(--spacing-large) * -1);
  margin-top: calc(var(--spacing-large) * -1);
}
```

This creates a nice visual treatment but requires sections to have padding.

### Issues

1. **Account Dashboard**: Heavy use of inline styles
   ```html
   <!-- Current (BAD) -->
   <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text);">
     Company Information
   </h2>
   ```

2. **Inconsistency**: Some pages use fancy gradient headers, others don't
   - Build configurator/BOM: Gradient `.section-title`
   - Template dashboard: Plain h2
   - Account dashboard: Inline styled h2

---

## 5. Main Content Position Beneath Header

### Current State

| Page | Wrapper Element | Top Spacing | Pattern |
|------|----------------|-------------|---------|
| **Account Dashboard** | `<main>` | None explicit | Breadcrumbs → `.section` → `.container` |
| **Catalog** | `<main>` | None explicit | Breadcrumbs → `.section.section-compact` → `.container` |
| **Template Dashboard** | `<main class="dashboard-container">` | None explicit | Breadcrumbs → `.template-dashboard` |
| **Build Configurator** | `<main>` | None explicit | Breadcrumbs → `.configurator-container` |
| **BOM Review** | `<main>` | None explicit | Breadcrumbs → `.bom-container` |

### Header Height (from `base.css`)

```css
/* Header CLS Prevention */
header {
  min-height: 143px; /* Reserve space during load */
}
```

### Observations

✅ All pages use **breadcrumbs** consistently as the first element after header

⚠️ Different approaches to main content wrapper:
- Account & Catalog: Use `.section` wrapper
- Template Dashboard: Uses `<main class="dashboard-container">`
- Build Configurator & BOM: Use custom container classes directly

### Best Practice Pattern

✅ **Catalog Page** follows the cleanest EDS pattern:

```html
<main>
  <div class="breadcrumbs">...</div>
  
  <section class="section section-compact">
    <div class="container">
      <!-- Content -->
    </div>
  </section>
</main>
```

---

## 6. Breadcrumbs Consistency

### Current State

✅ **All pages use consistent breadcrumb markup** - Good!

```html
<div class="breadcrumbs">
  <div>
    <div><a href="../index.html">Home</a></div>
  </div>
  <div>
    <div>Page Name</div>
  </div>
</div>
```

No issues here - this is standardized across all pages.

---

## 7. Grid/Column Layouts

### Current State

| Page | Layout Pattern | Columns | Gap | Notes |
|------|---------------|---------|-----|-------|
| **Account Dashboard** | Inline grid | `250px 1fr` | `3rem` | Sidebar + content |
| **Template Dashboard** | `.templates-grid` | `repeat(3, 1fr)` | `var(--spacing-xxlarge)` | 3-column card grid |
| **Build Configurator** | `.configurator-layout` | `1fr 360px` | `var(--spacing-xlarge)` | Content + sticky sidebar |
| **BOM Review** | `.bom-layout` | `1fr 360px` | `var(--spacing-xlarge)` | Content + sticky sidebar |
| **Catalog** | `.catalog-layout` | `280px 1fr` | `2rem` | Filters + products |

### Issues

1. **Account Dashboard**: Uses inline styles for layout grid
   ```html
   <!-- Current (BAD) -->
   <div style="display: grid; grid-template-columns: 250px 1fr; gap: 3rem;">
   ```

2. **Sidebar Widths**: Different across pages
   - Account: `250px`
   - Build Configurator/BOM: `360px`
   - Catalog filters: `280px`

3. **Gap Sizes**: Inconsistent
   - Account: `3rem`
   - Template dashboard: `var(--spacing-xxlarge)` (same as 3rem)
   - Build configurator/BOM: `var(--spacing-xlarge)` (2rem)
   - Catalog: `2rem`

---

## 8. Sticky Sidebar Positioning

### Current State

| Page | Sticky Element | Top Position | Notes |
|------|---------------|--------------|-------|
| **Build Configurator** | `.configurator-sidebar` | `210px` | Matches header + spacing |
| **BOM Review** | `.bom-sidebar` | `210px` | Matches header + spacing |
| **Catalog** | (No sticky sidebar) | N/A | N/A |

### Best Practice

✅ **Build Configurator & BOM Review** calculated sticky top correctly:

```css
.configurator-sidebar {
  position: sticky;
  top: 210px; /* Header height (143px) + spacing (67px) */
}
```

This accounts for:
- Fixed header height: `143px`
- Additional spacing: `~67px`

---

## Recommendations

### Priority 1: Remove All Inline Styles from Account Dashboard

**Replace inline styles with proper CSS classes:**

1. **Container max-width:**
   ```html
   <!-- Before -->
   <div class="container" style="max-width: 1400px;">
   
   <!-- After -->
   <div class="container account-container">
   ```
   
   ```css
   /* Add to account dashboard CSS or utilities */
   .account-container {
     max-width: 1400px;
   }
   ```

2. **Page title:**
   ```html
   <!-- Before -->
   <h1 style="margin-bottom: 3rem; font-size: 2rem; font-weight: 700;">
   
   <!-- After -->
   <h1>Account Dashboard</h1>
   ```

3. **Section headers:**
   ```html
   <!-- Before -->
   <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text);">
   
   <!-- After -->
   <h2 class="section-header">Company Information</h2>
   ```
   
   ```css
   .section-header {
     margin: 0 0 0.5rem 0;
   }
   ```

4. **Grid layouts:**
   ```html
   <!-- Before -->
   <div style="display: grid; grid-template-columns: 250px 1fr; gap: 3rem;">
   
   <!-- After -->
   <div class="account-layout">
   ```
   
   ```css
   .account-layout {
     display: grid;
     grid-template-columns: 250px 1fr;
     gap: 3rem;
   }
   ```

### Priority 2: Standardize Container Patterns

**Goal**: All pages should use the same container approach

**Option A** (Recommended): Use standard `.section` → `.container` pattern everywhere

```html
<!-- Standard Pattern -->
<main>
  <div class="breadcrumbs">...</div>
  
  <section class="section">
    <div class="container">
      <!-- Page content -->
    </div>
  </section>
</main>
```

**Option B**: Allow custom containers but use consistent naming and tokens

```css
/* Custom containers should extend base pattern */
.template-dashboard,
.configurator-container,
.bom-container {
  max-width: var(--container-max-width);  /* Use token, not hardcoded */
  margin: 0 auto;
  padding: var(--spacing-large) var(--section-padding-horizontal);
}
```

### Priority 3: Standardize Section Headers

**Choose ONE pattern for section headers across all pages:**

**Option A**: Plain h2 (simplest)
```html
<h2>Section Title</h2>
```

**Option B**: Gradient header (fancier, used in configurator/BOM)
```html
<section class="config-section">
  <h2 class="section-title">Section Title</h2>
  <!-- Content -->
</section>
```

**Recommendation**: Use **Option A** for simpler pages (templates, account), **Option B** for complex forms (configurator, BOM)

### Priority 4: Standardize Subtitle Pattern

**Create a global `.page-subtitle` class:**

```css
/* Add to utilities.css or components.css */
.page-subtitle {
  font: var(--type-body-1-default-font);
  color: var(--color-text-secondary);
  margin: 0;
}
```

**Use consistently:**
```html
<div class="page-header">
  <h1>Page Title</h1>
  <p class="page-subtitle">Description of the page</p>
</div>
```

### Priority 5: Standardize Sidebar Widths

**Recommendation**: Use consistent sidebar width

```css
/* Add to base.css or utilities.css */
:root {
  --sidebar-width-narrow: 250px;   /* Account nav, simple lists */
  --sidebar-width-standard: 360px; /* Order summaries, detailed info */
}
```

**Usage:**
- Account dashboard sidebar: `var(--sidebar-width-narrow)`
- Build configurator/BOM sidebar: `var(--sidebar-width-standard)`

### Priority 6: Add H1 to Catalog Page

**Current**: Catalog page has no h1 (accessibility issue)

**Fix**:
```html
<!-- Add to catalog.html -->
<section class="section section-compact">
  <div class="container">
    <h1>Product Catalog</h1>
    
    <div class="catalog-layout" id="catalog-layout">
      <!-- Existing content -->
    </div>
  </div>
</section>
```

---

## Proposed Standard Page Structure

### Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!-- ... -->
</head>
<body class="page-{name}">
  
  <!-- Header (loaded dynamically) -->
  <header></header>
  
  <!-- Main Content -->
  <main>
    <!-- Breadcrumbs (consistent across all pages) -->
    <div class="breadcrumbs">
      <div><div><a href="../index.html">Home</a></div></div>
      <div><div>Page Name</div></div>
    </div>
    
    <!-- Page Content (use .section wrapper) -->
    <section class="section">
      <div class="container">
        
        <!-- Page Header -->
        <div class="page-header">
          <h1>Page Title</h1>
          <p class="page-subtitle">Optional description</p>
        </div>
        
        <!-- Main Content Area -->
        <div class="page-content">
          <!-- Content here -->
        </div>
        
      </div>
    </section>
  </main>
  
  <!-- Footer (loaded dynamically) -->
  <footer></footer>
  
</body>
</html>
```

### CSS Structure

```css
/* Page-Specific Styles */

/* Page header */
.page-header {
  margin-bottom: var(--spacing-xlarge);
}

.page-header h1 {
  /* Use default h1 styling from base.css */
}

.page-subtitle {
  font: var(--type-body-1-default-font);
  color: var(--color-text-secondary);
  margin: 0;
}

/* Page content area */
.page-content {
  /* Custom layout for page */
}
```

---

## Implementation Checklist

### Phase 1: Account Dashboard Cleanup (1-2 hours)

- [ ] Remove all inline styles from `pages/account.html`
- [ ] Create CSS classes for all custom styles
- [ ] Move styles to `styles/dashboards/account-dashboard.css` (new file)
- [ ] Use design system tokens for all spacing/sizing
- [ ] Test responsive behavior

### Phase 2: Template Dashboard Standardization (1 hour)

- [ ] Update `.template-dashboard` to use standard container max-width
- [ ] Consider renaming to use standard `.section` → `.container` pattern
- [ ] Ensure h1/h2 styling is consistent with other pages
- [ ] Add `.page-subtitle` class

### Phase 3: Create Global Utilities (30 minutes)

- [ ] Add `.page-subtitle` to `utilities.css`
- [ ] Add sidebar width variables to `base.css`
- [ ] Document standard page structure in CSS comments

### Phase 4: Catalog Page (30 minutes)

- [ ] Add h1 to catalog page
- [ ] Ensure container/section usage is correct

### Phase 5: Documentation (30 minutes)

- [ ] Update CSS-ARCHITECTURE.md with standard page structure
- [ ] Add examples of correct container/section usage
- [ ] Document when to use fancy vs plain section headers

---

## Summary of Standards

### ✅ DO

- Use `.section` → `.container` wrapper for main content
- Use design system tokens for all spacing (`var(--spacing-*)`)
- Use design system tokens for typography (`var(--type-*-font)`)
- Let h1/h2 defaults from `base.css` apply unless specific override needed
- Use `.page-subtitle` class for page descriptions
- Use breadcrumbs consistently as first element in `<main>`
- Define layout grids in CSS, not inline styles

### ❌ DON'T

- Use inline styles for layout, spacing, or typography
- Hardcode pixel values (use design tokens)
- Create multiple container classes with same purpose
- Override h1/h2 styling without good reason
- Forget to add h1 to pages (accessibility)

---

## Files to Update

### High Priority

1. `pages/account.html` - Remove all inline styles
2. `styles/dashboards/account-dashboard.css` - Create this file
3. `styles/dashboards/template-dashboard.css` - Update max-width
4. `pages/catalog.html` - Add h1
5. `styles/utilities.css` - Add `.page-subtitle`

### Medium Priority

6. `styles/base.css` - Add sidebar width variables
7. `docs/standards/CSS-ARCHITECTURE.md` - Add page structure standards

---

## Questions for Discussion

1. **Container max-width**: Should we allow wider containers (1400px+) for some pages, or enforce strict `1280px` everywhere?

2. **Section headers**: Should we use the fancy gradient `.section-title` pattern everywhere, or only for form-heavy pages?

3. **Page structure**: Should we enforce strict `.section` → `.container` pattern, or allow custom containers like `.template-dashboard`?

4. **Sidebar widths**: Should we standardize at one width (360px) or maintain two standards (250px for nav, 360px for summaries)?

---

## Next Steps

1. **Review this audit** with the team
2. **Answer questions** about preferred standards
3. **Begin Phase 1** implementation (account dashboard cleanup)
4. **Test changes** across browsers and devices
5. **Update documentation** with final standards

