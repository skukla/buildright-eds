# Visual Consistency Examples - Side-by-Side Comparisons

**Purpose**: Quick reference showing current inconsistencies and recommended fixes

---

## 1. Page Headers - Current vs. Recommended

### ❌ Current: Account Dashboard (Inline Styles)

```html
<h1 style="margin-bottom: 3rem; font-size: 2rem; font-weight: 700;">
  Account Dashboard
</h1>
<p style="margin: 0 0 1.5rem 0; font-size: 0.9375rem; color: var(--color-text-secondary);">
  View your company details and primary warehouse.
</p>
```

### ✅ Recommended: Clean Markup

```html
<div class="page-header">
  <h1>Account Dashboard</h1>
  <p class="page-subtitle">View your company details and primary warehouse.</p>
</div>
```

```css
/* In CSS file, not inline */
.page-header {
  margin-bottom: var(--spacing-xlarge);
}

.page-header h1 {
  /* Uses default from base.css: var(--type-headline-1-font) */
}

.page-subtitle {
  font: var(--type-body-1-default-font);
  color: var(--color-text-secondary);
  margin: 0;
}
```

**Benefits:**
- Cleaner HTML
- Easier to maintain
- Follows design system
- Better for accessibility

---

## 2. Container Patterns - Three Different Approaches

### ❌ Approach 1: Account Dashboard (Inline Override)

```html
<section class="section">
  <div class="container" style="max-width: 1400px;">
    <!-- Content -->
  </div>
</section>
```

### ⚠️ Approach 2: Template Dashboard (Custom Container)

```html
<main class="dashboard-container">
  <div class="template-dashboard">
    <!-- Content -->
  </div>
</main>
```

```css
.template-dashboard {
  padding: var(--spacing-medium) var(--spacing-large) 8rem;
  max-width: 1600px;  /* Hardcoded, not using design token */
  margin: 0 auto;
}
```

### ✅ Approach 3: Build Configurator (Proper Tokens)

```html
<main>
  <div class="configurator-container">
    <!-- Content -->
  </div>
</main>
```

```css
.configurator-container {
  max-width: var(--container-max-width);  /* Uses design token */
  margin: 0 auto;
  padding: var(--spacing-large) var(--section-padding-horizontal);
}
```

### ✅ Approach 4: Catalog (Best Practice - Standard Pattern)

```html
<main>
  <section class="section">
    <div class="container">
      <!-- Content -->
    </div>
  </section>
</main>
```

**Recommendation**: Use **Approach 4** (standard pattern) for most pages, or **Approach 3** (custom container with tokens) when you need custom wrapper logic.

---

## 3. Section Headers - Three Patterns

### Pattern A: Account Dashboard (Inline Styles) ❌

```html
<h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600; color: var(--color-text);">
  Company Information
</h2>
<p style="margin: 0 0 1.5rem 0; font-size: 0.9375rem; color: var(--color-text-secondary);">
  View your company details and primary warehouse.
</p>
```

### Pattern B: Template Dashboard (Plain Headers) ✅

```html
<h2>Floor Plan Templates</h2>
```

```css
/* Uses base.css defaults */
h2 {
  font: var(--type-headline-2-font);  /* 600 1.5rem/1.25 */
  color: var(--color-text);
  margin: 0 0 1rem;
}
```

### Pattern C: Build Configurator (Fancy Gradient Headers) ✅

```html
<section class="config-section">
  <h2 class="section-title">Build Details</h2>
  <!-- Section content -->
</section>
```

```css
.section-title {
  font: var(--type-headline-2-font);
  color: var(--color-text);
  margin: 0 0 var(--spacing-medium) 0;
  padding: var(--spacing-small) var(--spacing-medium);
  background: linear-gradient(to bottom, #EBF4FB 0%, white 100%);
  border-bottom: 2px solid var(--color-brand-500);
  border-radius: var(--shape-border-radius-2) var(--shape-border-radius-2) 0 0;
  /* Negative margins pull header to section edges */
  margin-left: calc(var(--spacing-large) * -1);
  margin-right: calc(var(--spacing-large) * -1);
  margin-top: calc(var(--spacing-large) * -1);
}
```

**When to Use Each:**

- **Pattern A**: ❌ Never (remove inline styles)
- **Pattern B**: ✅ Simple content pages, dashboards, lists
- **Pattern C**: ✅ Complex forms, multi-step workflows, configurators

---

## 4. Layout Grids - Current Inconsistencies

### ❌ Account Dashboard (Inline Grid)

```html
<div style="display: grid; grid-template-columns: 250px 1fr; gap: 3rem;">
  <nav><!-- Sidebar --></nav>
  <div><!-- Content --></div>
</div>
```

### ✅ Build Configurator (CSS Grid)

```html
<div class="configurator-layout">
  <div class="configurator-main"><!-- Content --></div>
  <aside class="configurator-sidebar"><!-- Sidebar --></aside>
</div>
```

```css
.configurator-layout {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: var(--spacing-xlarge);
  align-items: start;
}
```

### ✅ Recommended: Named Grid Areas (Most Flexible)

```html
<div class="page-layout">
  <nav class="page-sidebar"><!-- Sidebar --></nav>
  <div class="page-content"><!-- Content --></div>
</div>
```

```css
.page-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width-narrow) 1fr;
  gap: var(--spacing-xxlarge);
  align-items: start;
}

@media (max-width: 768px) {
  .page-layout {
    grid-template-columns: 1fr;
  }
}
```

---

## 5. Complete Page Comparison

### Account Dashboard (Current - Many Issues) ❌

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Account Dashboard - BuildRight Solutions</title>
  <link rel="stylesheet" href="../styles/styles.css">
  <style>
    /* Inline styles in <style> tag */
    .account-nav-item { ... }
  </style>
</head>
<body>
  <header></header>
  
  <main>
    <div class="breadcrumbs">...</div>
    
    <section class="section">
      <div class="container" style="max-width: 1400px;">
        <h1 style="margin-bottom: 3rem; font-size: 2rem; font-weight: 700;">
          Account Dashboard
        </h1>
        
        <div style="display: grid; grid-template-columns: 250px 1fr; gap: 3rem;">
          <nav style="display: flex; flex-direction: column; gap: 0.5rem;">
            <!-- Sidebar -->
          </nav>
          
          <div>
            <h2 style="margin: 0 0 0.5rem 0; font-size: 1.5rem; font-weight: 600;">
              Company Information
            </h2>
            <!-- Content -->
          </div>
        </div>
      </div>
    </section>
  </main>
  
  <footer></footer>
</body>
</html>
```

**Issues:**
- ❌ Inline `<style>` tag
- ❌ Inline `style="max-width: 1400px;"`
- ❌ Inline `style="..."` on h1, h2, divs
- ❌ Hardcoded spacing values
- ❌ Not using design tokens

---

### Build Configurator (Current - Good Pattern) ✅

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Configure Build - BuildRight</title>
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../styles/build-configurator.css">
</head>
<body class="page-build-configurator">
  <header></header>
  
  <main>
    <div class="breadcrumbs">...</div>
    
    <div class="configurator-container">
      <div class="configurator-header">
        <h1>Configure Build</h1>
        <p class="subtitle">Set up your build details and select options</p>
      </div>
      
      <div class="configurator-layout">
        <div class="configurator-main">
          <section class="config-section">
            <h2 class="section-title">Build Details</h2>
            <!-- Content -->
          </section>
        </div>
        
        <aside class="configurator-sidebar">
          <!-- Sidebar -->
        </aside>
      </div>
    </div>
  </main>
  
  <footer></footer>
</body>
</html>
```

**Good practices:**
- ✅ No inline styles
- ✅ Proper external CSS file
- ✅ Body class for page-specific styles
- ✅ Semantic HTML elements
- ✅ Clean, readable structure
- ✅ Uses design system classes

---

### Recommended Pattern (Best Practice) ✅

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <title>Page Title - BuildRight</title>
  <script src="../scripts/critical-init.js"></script>
  <script type="module" src="../scripts/scripts.js"></script>
  <link rel="stylesheet" href="../styles/styles.css">
  <link rel="stylesheet" href="../styles/page-name.css">
</head>
<body class="page-name">
  
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
        <div class="page-header">
          <h1>Page Title</h1>
          <p class="page-subtitle">Optional page description</p>
        </div>
        
        <!-- Page-specific content layout -->
        <div class="page-content">
          
          <!-- Option A: Simple content -->
          <div class="content-section">
            <h2>Section Title</h2>
            <p>Content here...</p>
          </div>
          
          <!-- Option B: Sidebar layout -->
          <div class="content-layout">
            <div class="content-main">
              <!-- Main content -->
            </div>
            <aside class="content-sidebar">
              <!-- Sidebar -->
            </aside>
          </div>
          
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

---

## 6. CSS Organization Comparison

### ❌ Current: Account Dashboard

```html
<!-- Inline styles in <head> -->
<style>
  .account-nav-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    /* ... */
  }
</style>

<!-- Inline styles on elements -->
<h1 style="margin-bottom: 3rem; font-size: 2rem; font-weight: 700;">
```

**Problems:**
- CSS scattered between `<style>` tag and inline attributes
- Hard to maintain
- Can't be cached
- Defeats purpose of design system

---

### ✅ Recommended: External CSS File

**File: `styles/dashboards/account-dashboard.css`**

```css
/* Account Dashboard Styles */

/* ============================================
   LAYOUT
   ============================================ */

.account-layout {
  display: grid;
  grid-template-columns: var(--sidebar-width-narrow) 1fr;
  gap: var(--spacing-xxlarge);
  align-items: start;
}

/* ============================================
   NAVIGATION SIDEBAR
   ============================================ */

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

/* ============================================
   SECTIONS
   ============================================ */

.section-header {
  margin: 0 0 var(--spacing-small) 0;
}

.section-description {
  font: var(--type-body-2-default-font);
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-large) 0;
}

/* ============================================
   RESPONSIVE
   ============================================ */

@media (max-width: 768px) {
  .account-layout {
    grid-template-columns: 1fr;
  }
}
```

**Benefits:**
- Well-organized with comments
- Easy to find and edit styles
- Uses design system tokens
- Can be cached by browser
- Follows CSS architecture standards

---

## 7. Typography Consistency

### Font Sizes - Current State

| Element | Account Dashboard | Template Dashboard | Build Configurator | Design System |
|---------|------------------|-------------------|-------------------|---------------|
| **H1** | `2rem` (inline) | `var(--type-headline-1-font)` | (default) | `2rem` ✅ |
| **H2** | `1.5rem` (inline) | `var(--type-headline-2-font)` | `var(--type-headline-2-font)` | `1.5rem` ✅ |
| **Body** | `1rem` (default) | `var(--type-body-1-default-font)` | `var(--type-body-1-default-font)` | `1rem` ✅ |
| **Subtitle** | `0.9375rem` (inline) | `var(--type-body-1-default-font)` | `var(--color-text-secondary)` | `1rem` ✅ |
| **Small** | N/A | `var(--type-body-2-default-font)` | `var(--type-body-2-default-font)` | `0.875rem` ✅ |

**Recommendation**: Always use design system font tokens, never hardcode sizes

---

## 8. Spacing Consistency

### Current Gaps in Grid Layouts

| Page | Gap Value | Design Token | Actual Size |
|------|-----------|--------------|-------------|
| **Account Dashboard** | `3rem` (inline) | `var(--spacing-xxlarge)` | `3rem` |
| **Template Dashboard** | `var(--spacing-xxlarge)` | ✅ | `3rem` |
| **Build Configurator** | `var(--spacing-xlarge)` | ✅ | `2rem` |
| **Catalog** | `2rem` | (hardcoded) | `2rem` |

### Design System Spacing Tokens (from `base.css`)

```css
:root {
  --spacing-xsmall: 0.25rem;  /* 4px */
  --spacing-small: 0.5rem;    /* 8px */
  --spacing-medium: 1rem;     /* 16px */
  --spacing-large: 1.5rem;    /* 24px */
  --spacing-xlarge: 2rem;     /* 32px */
  --spacing-xxlarge: 3rem;    /* 48px */
  --spacing-3: 0.75rem;       /* 12px */
}
```

**Recommendation**: 
- Use `var(--spacing-xxlarge)` for major layout gaps (3rem)
- Use `var(--spacing-xlarge)` for content section gaps (2rem)
- Use `var(--spacing-large)` for component spacing (1.5rem)

---

## 9. Color Consistency

### Current Usage

All pages ✅ correctly use design system color tokens:

- `var(--color-brand-500)` - Primary brand color
- `var(--color-text)` - Primary text
- `var(--color-text-secondary)` - Secondary text
- `var(--color-surface)` - Card backgrounds
- `var(--color-border)` - Borders and dividers

**No issues here** - colors are consistently using design tokens across all pages.

---

## Quick Fix Checklist

### Account Dashboard Fixes

1. **Remove inline `<style>` block** → Move to `styles/dashboards/account-dashboard.css`

2. **Remove inline `style="max-width: 1400px;"`** → Add `.account-container` class

3. **Remove inline h1 styles** → Let base.css defaults apply

4. **Remove inline h2 styles** → Add `.section-header` class

5. **Remove inline layout grid** → Add `.account-layout` class

6. **Remove inline paragraph styles** → Add `.page-subtitle` and `.section-description` classes

7. **Convert hardcoded values** → Use design system tokens

---

## Testing Checklist

After making consistency changes:

- [ ] Visual comparison: Do pages look similar in structure?
- [ ] Typography: Are all headings using design system fonts?
- [ ] Spacing: Are gaps and margins consistent?
- [ ] Responsive: Do layouts adapt properly on mobile?
- [ ] Accessibility: Do pages have proper heading hierarchy?
- [ ] Performance: Are inline styles removed?
- [ ] Maintainability: Can I find and edit styles easily?

---

## Resources

- **Design System Reference**: `styles/base.css` (lines 1-150)
- **Component Examples**: `styles/build-configurator.css`
- **Layout Patterns**: `styles/page-specific.css`
- **Architecture Guide**: `docs/standards/CSS-ARCHITECTURE.md`

