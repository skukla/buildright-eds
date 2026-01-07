# ADR-021: Inline Header HTML for Instant Visibility

**Status**: Accepted

**Date**: January 2026

**Decision Makers**: BuildRight Implementation Team

---

## Context

The header block was causing a poor user experience during page loads:

### The Problem

**Localhost Development Pattern:**
```html
<!-- Page HTML -->
<header></header>  <!-- Empty placeholder -->
```

```javascript
// scripts/scripts.js
loadLazy() {
  await loadHeader(header);  // Fetches blocks/header/header.html
}
```

**Issues Observed:**
1. **Blank white box** at top of page for 300-600ms during page load
2. **Flash of Unstyled Content (FOUC)** when CSS loads after HTML
3. **Slower perceived performance** due to JavaScript fetch waterfall
4. **Poor First Contentful Paint (FCP)** metrics

**Timeline of Events:**
```
0ms:    Page HTML loads → blank <header>
100ms:  JavaScript executes
200ms:  fetch('header.html') starts
400ms:  Header HTML injected (blank/unstyled)
500ms:  decorateBlock() loads header.css
600ms:  Header fully styled ✅
```

**User Experience:** 600ms of blank space or unstyled header

---

## Decision

**We will inline the header HTML directly in page templates and preload its CSS in the `<head>`.**

### Implementation Pattern

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Page Title</title>
  
  <!-- Preload header CSS for instant styling -->
  <link rel="stylesheet" href="../blocks/header/header.css">
  
  <script src="../scripts/scripts.js" type="module"></script>
  <link rel="stylesheet" href="../styles/styles.css">
</head>
<body>
  <!-- Header HTML inlined (not empty) -->
  <header>
    <div class="header" data-block-name="header" data-block-status="loading">
      <!-- Full header structure with logo, search, nav, dropdowns -->
      <div class="header-top">...</div>
      <div class="header-main">...</div>
      <div class="header-nav-bar">...</div>
    </div>
  </header>
  
  <main>...</main>
  <footer></footer>
</body>
</html>
```

### JavaScript Adjustment

```javascript
// scripts/scripts.js - loadHeader() now handles both patterns
export async function loadHeader(header) {
  const existingHeader = header.querySelector('.header');
  
  if (existingHeader) {
    // Inlined header pattern - just decorate it
    await decorateBlock(existingHeader);
    return;
  }
  
  // Fallback: dynamic loading for pages without inlined header
  // (fetch header.html and inject)
}
```

**Key Change:** Removed the condition `if (header && !header.querySelector('.header'))` that was preventing `loadHeader()` from being called when header HTML was already present.

---

## Rationale

### 1. **Aligns with EDS Production Architecture**

**How EDS Actually Works in Production:**

```
Author creates in Google Docs:
┌─────────────────┐
│  Header         │
│  Logo | Search  │
└─────────────────┘
        ↓
EDS Publishing Pipeline
        ↓
CDN serves HTML with blocks INLINE:
<header>
  <div class="header">
    <div>Logo | Search</div>
  </div>
</header>
        ↓
JavaScript decorates existing DOM
```

**EDS does NOT fetch blocks dynamically in production.** The HTML is pre-rendered and cached at the edge. Our inlined header pattern **matches this production behavior**.

**Dynamic loading in localhost is a DEV CONVENIENCE**, not the production architecture.

---

### 2. **Dramatic Performance Improvement**

**New Timeline:**
```
0ms:    Page HTML loads → header structure visible (styled) ✅
100ms:  JavaScript executes
150ms:  decorateBlock() adds interactivity (categories, auth, cart)
```

**User Experience:** Header appears **instantly** with full styling

**Metrics:**
- First Contentful Paint (FCP): Improved by ~500ms
- Cumulative Layout Shift (CLS): Eliminated (no blank → content jump)
- Time to Interactive (TTI): Unchanged (JavaScript still needed for interactivity)

---

### 3. **Progressive Enhancement**

```
Without JavaScript:  Header visible but static (logo, search bar, nav visible)
With JavaScript:     Header fully interactive (dropdowns, search, auth, cart)
```

This is **best practice** for critical above-the-fold content.

---

### 4. **Prevents FOUC**

By preloading `header.css` in the `<head>`, the browser:
1. Downloads CSS **before** parsing `<body>`
2. Has styles ready **when** header HTML is parsed
3. Never shows unstyled header

**CSS Preload:**
```html
<head>
  <link rel="stylesheet" href="../blocks/header/header.css">
  <!-- CSS loads BEFORE body renders -->
</head>
```

---

## Alternatives Considered

### Alternative 1: Keep Dynamic Loading

**Approach:** Continue fetching `header.html` with JavaScript

**Pros:**
- Single source of truth (`blocks/header/header.html`)
- No duplication across page templates

**Cons:**
- ❌ Blank header for 500ms+ on every page load
- ❌ FOUC when CSS loads late
- ❌ Doesn't match EDS production behavior
- ❌ Poor perceived performance

**Why Rejected:** User experience is significantly worse. Single source of truth can be maintained via build tooling if needed.

---

### Alternative 2: Server-Side Rendering (SSR)

**Approach:** Pre-render header on server before serving HTML

**Pros:**
- Header in HTML but maintained separately
- No duplication in source files

**Cons:**
- ❌ Requires server infrastructure (goes against EDS edge-first architecture)
- ❌ Adds complexity (build step, deployment pipeline)
- ❌ Not standard for EDS projects

**Why Rejected:** Over-engineering for this use case. EDS is designed for edge delivery, not server rendering.

---

### Alternative 3: Use EDS Fragments

**Approach:** Use `<div class="fragment">/fragments/header</div>` pattern

**Pros:**
- EDS-standard pattern for reusable content
- Single source of truth

**Cons:**
- ❌ Fragments are for **author-edited content** (Google Docs)
- ❌ Still fetched dynamically (doesn't solve FOUC)
- ❌ Not appropriate for code-driven components

**Why Rejected:** Fragments are for content authoring, not for interactive components like the header.

---

## Tradeoffs

### ✅ Benefits

1. **Instant Visibility:** Header appears immediately with no blank space
2. **No FOUC:** CSS preloaded before HTML renders
3. **Better Metrics:** Improved FCP, CLS, perceived performance
4. **Production-Aligned:** Matches how EDS serves content on aem.live
5. **Progressive Enhancement:** Works without JavaScript (logo, search visible)

### ⚠️ Costs

1. **Duplication:** Header HTML repeated in each page template
2. **Maintenance:** Changes to header require updating multiple files
3. **File Size:** Each HTML file is ~5KB larger (negligible for modern web)

### 🔄 Mitigation Strategies

**For Duplication/Maintenance:**

**Option A: Build Tooling (Future)**
```javascript
// scripts/build/inject-header.js
// Reads blocks/header/header.html and injects into page templates
```

**Option B: Documentation (Current)**
- Document header as "critical inline block" in ADR
- Use linting/tests to ensure consistency
- Accept manual updates as acceptable tradeoff for performance

**Chosen:** Option B for now (simplicity), Option A if header changes frequently

---

## When to Use This Pattern

### ✅ Inline the Block When:

1. **Critical Above-the-Fold:** Header, hero section, critical navigation
2. **Code-Driven:** Block structure is JavaScript-controlled, not author-edited
3. **Static Structure:** HTML structure doesn't change per page (content may vary)
4. **Performance Critical:** FCP and perceived load time matter

### ❌ Don't Inline When:

1. **Author-Edited:** Content managed in Google Docs/SharePoint
2. **Large/Complex:** Block HTML is > 10KB or has many variants
3. **Page-Specific:** Different structure needed per page
4. **Below the Fold:** Content not visible on initial load

---

## Examples

### Inline These:
- ✅ **Header** (critical, code-driven, static structure)
- ✅ **Hero Section** (above-fold, performance critical)
- ✅ **Critical CTAs** (first-paint important)

### Don't Inline These:
- ❌ **Footer** (below fold, less critical)
- ❌ **Product Grid** (dynamic, data-driven, varies per page)
- ❌ **Content Blocks** (author-managed via Google Docs)

---

## Implementation Checklist

When inlining a block:

- [ ] Copy block HTML structure into page template
- [ ] Add `data-block-name` and `data-block-status="loading"` attributes
- [ ] Preload block CSS in `<head>`: `<link rel="stylesheet" href="../blocks/[name]/[name].css">`
- [ ] Ensure `loadHeader()`/`loadBlock()` handles existing DOM (check for `.block-name` before fetching)
- [ ] Test with JavaScript disabled (progressive enhancement)
- [ ] Verify no FOUC on hard refresh
- [ ] Document in page template with comment explaining why inlined

---

## Decision Drivers

1. **User Experience:** Eliminating blank header during page load
2. **Performance Metrics:** Improving FCP and CLS
3. **EDS Alignment:** Matching production architecture
4. **Progressive Enhancement:** Header visible without JavaScript
5. **Simplicity:** No build tools or server infrastructure required

---

## Consequences

### Positive

- ✅ Header appears instantly on all pages
- ✅ Better perceived performance (no blank space)
- ✅ Improved Core Web Vitals (FCP, CLS)
- ✅ Production-ready pattern (matches EDS aem.live behavior)
- ✅ Progressive enhancement (works without JS)

### Negative

- ⚠️ Header HTML duplicated in page templates (~5KB per page)
- ⚠️ Manual updates needed if header structure changes
- ⚠️ Slight deviation from localhost development pattern

### Neutral

- 🔄 Pattern can be extended to other critical blocks (hero, CTAs)
- 🔄 Build tooling can automate injection if duplication becomes problematic
- 🔄 Standard EDS pattern for content authoring still applies to other blocks

---

## Related ADRs

- **ADR-002**: Use EDS Blocks for Content-Driven Components
- **ADR-014**: EDS Blocks vs. Commerce Dropins
- **ADR-020**: User Context Initialization Pattern

---

## References

- [Adobe EDS Block Pattern](https://www.aem.live/developer/block-collection)
- [EDS Production Architecture](https://www.aem.live/docs/setup-byo-cdn-cloudflare-workers)
- [Web Performance: First Contentful Paint](https://web.dev/fcp/)
- BuildRight Implementation: `buildright-eds/pages/catalog.html` (inline header example)

---

## Revision History

| Date | Change | Author |
|------|--------|--------|
| Jan 2026 | Initial decision | BuildRight Team |
| Jan 2026 | Implemented for catalog pages | BuildRight Team |
