# ADR-017: Dropin Loading Performance and Lazy Initialization

**Status**: Analysis Complete, Decision Pending

**Date**: January 2026

**Decision Makers**: BuildRight Implementation Team

---

## Context

Category pages on BuildRight are experiencing slow First Contentful Paint (FCP) times of ~5 seconds on hard refresh. Analysis identified the root cause: **eager loading of 83 dropin ES modules** during initialization blocks the main thread for ~2.6 seconds.

### Performance Breakdown (Hard Refresh)

| Phase | Time | Notes |
|-------|------|-------|
| HTML + Initial JS | ~35ms | Fast |
| Persona fetch | ~1268ms | Network - Adobe mesh |
| Categories fetch | ~358ms | Network - Adobe mesh |
| **Dropin JS execution** | ~2600ms | **Main thread blocked - 83 modules parsed/executed** |
| Product search | ~200ms | Network |
| Container renders | ~100ms | Parallelized (ADR-015) |
| Product slots render | ~200ms | Parallel with network |

**Total FCP**: ~5000ms

### Reference Implementation: Bulk.com

We analyzed [bulk.com](https://www.bulk.com/uk/), an Adobe Commerce storefront using EDS:

| Metric | Bulk.com (Category) | BuildRight (Category) |
|--------|---------------------|----------------------|
| **FCP** | 692ms | ~5000ms |
| **Dropin modules loaded** | 5 | 83 |
| **Uses Product Discovery dropin** | No | Yes |
| **GraphQL calls** | 1 | 5+ |

**Key finding**: Bulk.com does NOT use Adobe's Product Discovery dropin for their PLP. They load only minimal dropin tools:
- `tools/event-bus.js`
- `tools/fetch-graphql.js`
- `tools/initializer.js`
- `chunks/initializer.js`
- `chunks/image-params-keymap.js`

Their product grid appears to be a custom EDS block with direct GraphQL queries.

### What BuildRight Loads Eagerly

On every page load, `scripts/initializers/index.js` initializes:
1. **Auth dropin** (~30 modules) - SignIn, SignUp, ResetPassword components
2. **Cart dropin** (~20 modules) - Cart management, MiniCart
3. **Search/Product Discovery dropin** (~25 modules) - SearchResults, Facets, SortBy, Pagination
4. Core tools (~8 modules) - fetch-graphql, event-bus, initializer

Even on pages that don't need all dropins (e.g., a user browsing the catalog doesn't need Auth forms), all 83 modules are loaded and executed.

---

## Options

### Option 1: Lazy-Load Non-Critical Dropins (Recommended)

Only initialize dropins when their blocks are actually present on the page.

```javascript
// scripts/initializers/index.js - CURRENT (eager)
await initializeAuthDropin();      // Always loads Auth modules
await initializeCartDropin();      // Always loads Cart modules
await initializeSearchDropin();    // Always loads Search modules

// scripts/initializers/index.js - PROPOSED (lazy)
// Only load core tools eagerly
await initializeCoreTools();

// Dropins initialized on-demand when blocks decorate
// Each block imports its own dropin as needed
```

**Pros:**
- Dramatic reduction in initial JS parse time
- Pages only pay for what they use
- Follows Bulk.com's production pattern

**Cons:**
- Requires refactoring all dropin blocks
- First use of a dropin has cold-start penalty
- More complex initialization flow

### Option 2: Pre-Import with requestIdleCallback

Start loading dropin modules during idle time before they're needed.

```javascript
// In scripts.js, after critical path
requestIdleCallback(() => {
  // Pre-import dropins in background
  import('@dropins/storefront-auth/api.js');
  import('@dropins/storefront-cart/api.js');
}, { timeout: 5000 });
```

**Pros:**
- No architectural changes
- Modules cached for when needed

**Cons:**
- Still blocks main thread when modules execute
- Doesn't solve hard-refresh performance
- Band-aid, not a fix

### Option 3: Replace Product Discovery Dropin with Custom Block

Build a custom product-list block that makes direct GraphQL queries (like Bulk.com).

**Pros:**
- Maximum performance control
- Only load what's needed
- Matches Bulk.com's approach

**Cons:**
- Significant development effort
- Lose Adobe's built-in facet/filter state management
- Must maintain custom code

### Option 4: Module Federation / Bundling

Bundle dropin modules instead of loading as ES modules.

**Pros:**
- Single bundle = single parse
- Modern build tooling optimizations

**Cons:**
- Against EDS philosophy
- Loses CDN caching benefits
- Requires build pipeline changes

---

## Current Implementation (Partial)

We've implemented performance optimizations that help but don't solve the core problem:

1. **ADR-015**: Parallel dynamic imports (reduces waterfall by ~65%)
2. **Container render parallelization**: Facets, SortBy, Pagination render in parallel
3. **sessionStorage caching**: Categories and persona cached across page loads
4. **Pre-import containers**: Search dropin pre-imports containers on catalog pages

These reduce FCP from ~6s to ~5s, but the ~2.6s dropin initialization remains.

---

## Recommendations

### Short-term (Current Sprint)
1. Document the performance baseline in this ADR ✅
2. Consider the trade-offs before proceeding

### Medium-term (If Performance Critical)
1. Implement **Option 1** (Lazy-Load Dropins) for Auth and Cart
   - Auth blocks only appear on login/account pages
   - Cart can be loaded when user clicks cart icon
2. Keep Product Discovery dropin but lazy-load it only on catalog pages

### Long-term (If Maximum Performance Required)
1. Evaluate **Option 3** (Custom PLP Block)
   - Study Bulk.com's implementation more closely
   - Consider for next major version

---

## Validation Metrics

Before any changes, baseline metrics to track:

| Metric | Current | Target |
|--------|---------|--------|
| FCP (hard refresh, category) | ~5000ms | <2000ms |
| Dropin modules (category page) | 83 | <20 |
| Time to Interactive | ~5500ms | <2500ms |
| Lighthouse Performance Score | ~50 | >75 |

---

## References

- [Bulk.com](https://www.bulk.com/uk/) - Reference EDS + Commerce implementation
- ADR-015: Parallel Dynamic Imports
- ADR-008: Dropin CSS Refactoring Strategy
- [web.dev: Reduce JavaScript execution time](https://web.dev/articles/bootup-time)
- [Chrome DevTools: Analyze runtime performance](https://developer.chrome.com/docs/devtools/performance/)
