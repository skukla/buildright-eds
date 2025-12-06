# CSS Architecture - EDS Best Practices

**📊 Document Type**: Standards & Patterns  
**📖 Reading Time**: 15-20 minutes  
**👥 Audience**: Developers writing CSS

**🔗 Related Docs**:
- **Coding Principles**: [CODING-PRINCIPLES.md](./CODING-PRINCIPLES.md)
- **Component Library**: [COMPONENT-DESIGN-LIBRARY.md](./COMPONENT-DESIGN-LIBRARY.md)
- **Implementation Files**: `styles/base.css`, `styles/components.css`

**📍 Use This Doc When**:
- Writing any CSS
- Creating new components
- Styling blocks or pages
- Understanding the design system

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

## Standard Page Structure

All pages should follow this consistent HTML structure:

### HTML Template

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Title - BuildRight Solutions</title>
  
  <!-- Critical initialization -->
  <script src="../scripts/critical-init.js"></script>
  <script type="module" src="../scripts/scripts.js"></script>
  
  <!-- Stylesheets -->
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../styles/page-specific.css">
</head>
<body class="page-{name}">
  
  <!-- Header (loaded dynamically) -->
  <header></header>
  
  <main>
    <!-- Breadcrumbs (consistent across all pages) -->
    <div class="breadcrumbs">
      <div><div><a href="../index.html">Home</a></div></div>
      <div><div>Page Name</div></div>
    </div>
    
    <!-- Main content in standard section/container wrapper -->
    <section class="section">
      <div class="container">
        
        <!-- Page header with consistent structure -->
        <h1>Page Title</h1>
        
        <!-- Page-specific content -->
        <div class="page-content">
          <!-- Content here -->
        </div>
        
      </div>
    </section>
  </main>
  
  <!-- Footer (loaded dynamically) -->
  <footer></footer>
  
  <script type="module" src="../scripts/page-name.js"></script>
</body>
</html>
```

### Key Elements

1. **Page Title (H1)**: Every page MUST have exactly one h1
   - Improves accessibility
   - Better SEO
   - Clear page hierarchy

2. **Breadcrumbs**: Consistent navigation path
   - Always first element in `<main>`
   - Uses standard `.breadcrumbs` class

3. **Section/Container**: Standard wrapper pattern
   - `.section` provides vertical padding
   - `.container` provides max-width and horizontal padding
   - Consistent across all pages

### Page Header Utilities

Use these standard classes (defined in `utilities.css`):

```css
.page-header {
  margin-bottom: var(--spacing-xlarge);
}

.page-subtitle {
  font: var(--type-body-1-default-font);
  color: var(--color-text-secondary);
  margin: 0;
}

.section-header {
  margin: 0 0 var(--spacing-small) 0;
}

.section-description {
  font: var(--type-body-2-default-font);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-large) 0;
}
```

**Example usage:**

```html
<div class="page-header">
  <h1>Account Dashboard</h1>
  <p class="page-subtitle">Manage your account and preferences</p>
</div>

<div class="section-block">
  <h2 class="section-header">Company Information</h2>
  <p class="section-description">View your company details and primary warehouse.</p>
  <!-- Section content -->
</div>
```

### Design System Tokens

**Always use design system tokens, never hardcode values:**

#### Spacing
```css
/* ❌ Bad */
margin: 24px;
gap: 3rem;

/* ✅ Good */
margin: var(--spacing-large);      /* 24px */
gap: var(--spacing-xxlarge);       /* 48px */
```

#### Typography
```css
/* ❌ Bad */
font-size: 1.5rem;
font-weight: 600;

/* ✅ Good */
font: var(--type-headline-2-font);  /* Includes size, weight, line-height */
```

#### Colors
```css
/* ❌ Bad */
color: #64748B;
background: #0f5ba7;

/* ✅ Good */
color: var(--color-text-secondary);
background: var(--color-brand-500);
```

#### Layout
```css
/* ❌ Bad */
max-width: 1280px;
grid-template-columns: 250px 1fr;

/* ✅ Good */
max-width: var(--container-max-width);
grid-template-columns: var(--sidebar-width-narrow) 1fr;
```

### Available Design Tokens

**Spacing** (`base.css`):
- `--spacing-xsmall`: 4px
- `--spacing-small`: 8px
- `--spacing-medium`: 16px
- `--spacing-large`: 24px
- `--spacing-xlarge`: 32px
- `--spacing-xxlarge`: 48px

**Sidebar Widths** (`base.css`):
- `--sidebar-width-narrow`: 250px (for navigation menus)
- `--sidebar-width-standard`: 360px (for order summaries, detailed panels)

**Typography** (`base.css`):
- `--type-headline-1-font`: Page titles (32px, weight 700)
- `--type-headline-2-font`: Section headers (24px, weight 600)
- `--type-body-1-default-font`: Normal text (16px, weight 400)
- `--type-body-2-default-font`: Small text (14px, weight 400)

**Colors** (`base.css`):
- `--color-brand-500`: Primary brand color
- `--color-text`: Primary text color
- `--color-text-secondary`: Secondary text color
- `--color-surface`: Card/panel backgrounds
- `--color-border`: Borders and dividers

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

