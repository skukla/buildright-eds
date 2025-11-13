# CSS Architecture - EDS Best Practices

## Overview
This document outlines the CSS organization following Adobe Edge Delivery Services (EDS) best practices.

## Principles

### 1. Block-First Architecture
Each block is self-contained with its own CSS, HTML, and JS:
```
blocks/
  header/
    header.css    ← Header-specific styles including sticky positioning
    header.html
    header.js
  filters-sidebar/
    filters-sidebar.css  ← Sidebar styles including sticky positioning
    filters-sidebar.html
    filters-sidebar.js
```

### 2. No Inline Styles
❌ **Before (Bad):**
```html
<div style="display: grid; grid-template-columns: 280px 1fr; gap: 2rem;">
```

✅ **After (Good):**
```html
<div class="catalog-layout">
```

### 3. Semantic Class Names
Use descriptive, reusable class names:
- `.breadcrumbs` - Breadcrumb navigation component
- `.catalog-layout` - Catalog grid layout
- `.section-compact` - Section with reduced padding

## CSS File Structure

### Core Styles (Load Order)
1. **`styles/base.css`** - Variables, resets, typography, global utilities
2. **`styles/components.css`** - Reusable component styles (buttons, cards, etc.)
3. **`styles/utilities.css`** - Utility classes (margins, padding, flex, grid)
4. **`styles/page-specific.css`** - Page layouts (breadcrumbs, catalog-layout)

### Block Styles (Loaded per block)
- **`blocks/header/header.css`** - Header + sticky positioning
- **`blocks/filters-sidebar/filters-sidebar.css`** - Sidebar + sticky positioning
- **`blocks/product-grid/product-grid.css`** - Product grid + CLS prevention

### Main Entry Point
**`styles/styles.css`** imports everything in order:
```css
@import url('base.css');
@import url('components.css');
@import url('utilities.css');
@import url('../blocks/product-grid/product-grid.css');
@import url('../blocks/filters-sidebar/filters-sidebar.css');
@import url('page-specific.css');
```

## Sticky Positioning Implementation

### Header (Always sticky at top)
**File:** `blocks/header/header.css`
```css
/* EDS Block: Header - Sticky at top of viewport */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
}

/* Ensure header container is also sticky */
header,
header .header {
  position: sticky;
  top: 0;
  z-index: 100;
}
```

### Filters Sidebar (Sticky below header)
**File:** `blocks/filters-sidebar/filters-sidebar.css`
```css
/* EDS Block: Filters Sidebar - Sticky below header */
#filters-aside {
  position: -webkit-sticky;
  position: sticky;
  top: 210px; /* Header height (143px) + spacing (67px) */
  z-index: 10;
  align-self: flex-start;
}
```

### Critical: Prevent Parent Overflow
**File:** `styles/page-specific.css`
```css
/* Prevent parent overflow from breaking sticky */
main {
  overflow: visible;
}
```

**Why this matters:** `position: sticky` fails if any parent element has `overflow: hidden`, `overflow: auto`, or `overflow: scroll`.

## Cumulative Layout Shift (CLS) Prevention

### Block-Level CLS Prevention
Each block includes min-heights to prevent layout shift during content loading:

**`blocks/product-grid/product-grid.css`:**
```css
.products-container {
  min-height: 400px; /* Reserve space for products */
}

.product-count {
  min-height: 24px; /* Reserve space for count text */
}
```

**`blocks/filters-sidebar/filters-sidebar.css`:**
```css
.filters-sidebar {
  min-height: 300px; /* Reserve space for filters */
}
```

**`blocks/header/header.css`:**
```css
.location-selector {
  min-height: 40px;
  min-width: 280px; /* Reserve space for location dropdown */
}

.location-menu {
  position: fixed; /* Positioned absolutely - doesn't affect layout */
  opacity: 0;
  visibility: hidden;
}
```

### Global Loading State
**File:** `styles/base.css`
```css
[data-loading="true"] {
  opacity: 0.6;
  pointer-events: none;
}
```

## Why This Approach is Best

### ✅ EDS Compliance
- **Block-first:** Each block owns its styles
- **No inline CSS:** All styles in proper files
- **Semantic HTML:** Meaningful class names

### ✅ Maintainability
- **Single source of truth:** Sticky rules in one place per block
- **No duplication:** Each style defined once
- **Clear organization:** Easy to find and update styles

### ✅ Performance
- **CSS cascade respected:** Proper load order
- **CLS prevention:** Reserve space to prevent layout shift
- **Minimal reflows:** Sticky positioning optimized

### ✅ Scalability
- **Reusable classes:** `.breadcrumbs`, `.catalog-layout`
- **Block independence:** Easy to add/remove blocks
- **Clear patterns:** New developers can follow examples

## Common Pitfalls to Avoid

### ❌ Don't Duplicate Sticky Rules
```css
/* BAD - sticky defined in multiple places */
/* header.css */
.header { position: sticky; }

/* page-specific.css */
header { position: sticky; } /* DUPLICATE! */
```

### ❌ Don't Use Inline Styles
```html
<!-- BAD -->
<div style="display: grid; grid-template-columns: 280px 1fr;">

<!-- GOOD -->
<div class="catalog-layout">
```

### ❌ Don't Add `!important` Unless Absolutely Necessary
```css
/* BAD - using !important to override */
#filters-aside {
  position: sticky !important;
}

/* GOOD - proper CSS cascade */
#filters-aside {
  position: sticky;
}
```

### ❌ Don't Put Block Styles in Global CSS
```css
/* BAD - in styles/base.css */
.filters-sidebar { /* Block-specific style in global file */ }

/* GOOD - in blocks/filters-sidebar/filters-sidebar.css */
.filters-sidebar { /* Block style in block file */ }
```

## Testing Checklist

- [ ] No inline `style=` attributes in HTML
- [ ] No `<style>` tags in HTML pages
- [ ] Header sticks at `top: 0`
- [ ] Breadcrumbs scroll under header
- [ ] Sidebar sticks at `top: 210px`
- [ ] Product grid scrolls normally
- [ ] No layout shift when content loads (good CLS score)
- [ ] Mobile responsive (sidebar and layout adapt)

## Migration Complete ✅

The catalog page now follows all EDS best practices:
- ✅ No inline CSS
- ✅ Block-first architecture
- ✅ Proper CSS cascade
- ✅ Sticky positioning works correctly
- ✅ CLS prevention in place
- ✅ Semantic, maintainable code

