# ADR-016: Navigation and Category Architecture

**Status**: Proposed

**Date**: January 2026

**Decision Makers**: BuildRight Implementation Team

---

## Context

We discovered that our current approach to category navigation differs significantly from EDS best practices:

| Aspect | Current (BuildRight) | EDS Best Practice |
|--------|---------------------|-------------------|
| Category source | API (Commerce/ACO) | Authored content (`/nav` fragment) |
| Cache location | sessionStorage (JS) | Edge CDN (HTML) |
| Load time | ~150-300ms (network) | ~10-50ms (edge) |
| Admin control | Real-time | Requires republish |

### Research Findings

**Production EDS Commerce Sites:**
- **bulk.com**: All categories hardcoded in `/nav.plain.html` fragment
- **aemshop.net**: Categories authored in nav document, not fetched from API
- **aem-boilerplate-commerce**: Uses `loadFragment('/nav')`, no commerce API for nav structure

**Adobe Documentation:**
- Navigation content lives in dedicated `/nav` document
- Loaded via XHR to `/nav.plain.html`
- Edge-cached independently from page content
- Categories should be authored, not dynamically fetched

### The Tension

Commerce platforms (Adobe Commerce, Shopify, etc.) allow administrators to:
1. Create/delete categories
2. Reorder categories within levels
3. Change category hierarchy
4. Control category visibility

**The question**: How do we reconcile edge-cached authored navigation with commerce admin control?

---

## Options Considered

### Option 1: Pure Content-First (Manual Sync)

**How it works:**
- Categories authored in `/nav` document by content team
- Admin changes require manual nav document update + republish
- Navigation is pure static HTML, edge-cached

**Pros:**
- Fastest possible load time (~10ms from edge)
- No JavaScript required for navigation
- Follows EDS philosophy completely
- Works offline/without commerce API

**Cons:**
- Manual sync required when categories change
- Potential for drift between commerce and nav
- Not suitable for frequently changing categories

**Best for:** Sites with stable category structure (changes monthly or less)

---

### Option 2: Spreadsheet-Based Categories

**How it works:**
- Categories maintained in Excel/Google Sheets spreadsheet
- EDS exposes as `/categories.json` automatically
- JavaScript builds nav from JSON at runtime
- Content team can update categories without code changes

**Pros:**
- Content-managed (no developer needed)
- JSON is edge-cached by EDS
- Easier to update than nav document
- Can include metadata (icons, badges, order)

**Cons:**
- Still requires manual sync with commerce
- Slight JS overhead to build nav
- Not as fast as pure HTML fragment

**Best for:** Marketing-controlled sites where content team owns navigation

---

### Option 3: Webhook-Triggered Regeneration

**How it works:**
1. Commerce admin updates category structure
2. Webhook fires to App Builder action
3. Action regenerates `/nav` document content
4. Triggers AEM publish of nav fragment
5. Edge cache invalidated, fresh nav served

**Pros:**
- Automatic sync with commerce admin
- Maintains edge-cached performance
- Admin retains full control
- Near-real-time updates (seconds, not minutes)

**Cons:**
- Requires webhook infrastructure
- More complex architecture
- Dependency on publish pipeline reliability

**Best for:** Enterprise sites requiring admin control + performance

---

### Option 4: Incremental Static Regeneration (ISR) Pattern

**How it works:**
- Nav cached at edge with time-based revalidation (e.g., 5 minutes)
- Background regeneration fetches fresh categories from API
- Users always get cached version (fast)
- Cache refreshes periodically

**Pros:**
- Automatic refresh without webhooks
- Bounded staleness (max 5 min out of date)
- Simple implementation
- Graceful degradation if API fails

**Cons:**
- Not truly real-time (5-minute window)
- Still makes API calls (just in background)
- Not pure EDS pattern

**Best for:** Sites with moderate update frequency, acceptable staleness

---

### Option 5: Tiered Hybrid Approach

**How it works:**
- **Top-level categories**: Authored in `/nav` document (rarely change)
- **Subcategories**: Fetched from API on category page load
- **Product data**: Always from API

**Pros:**
- Best of both worlds
- Top nav is instant (edge-cached)
- Subcategories can be dynamic
- Reduces API dependency for critical path

**Cons:**
- Two systems to maintain
- Potential inconsistency between levels
- More complex mental model

**Best for:** Large catalogs with stable top-level but dynamic subcategories

---

## Decision

**Recommended: Option 5 (Tiered Hybrid) with Option 3 (Webhooks) for top-level sync**

### Rationale

1. **Top-level categories rarely change** — BuildRight has ~10 main categories that change quarterly at most
2. **Subcategories are more dynamic** — Product organization within categories changes more frequently
3. **Page titles can remain API-driven** — Current sessionStorage caching works well for this
4. **Webhook infrastructure exists** — App Builder already supports webhooks from Commerce

### Implementation Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Edge CDN (Fastly)                        │
├─────────────────────────────────────────────────────────────────┤
│  /nav.plain.html          │  /categories.json (optional)        │
│  - Top-level categories   │  - Subcategory metadata              │
│  - Authored content       │  - Spreadsheet-driven                │
│  - ~10ms response         │  - ~20ms response                    │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                     App Builder Actions                          │
├─────────────────────────────────────────────────────────────────┤
│  Webhook Handler                                                 │
│  - Receives category.updated from Commerce                      │
│  - Regenerates /nav content                                     │
│  - Triggers AEM publish                                         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Adobe Commerce / ACO                          │
├─────────────────────────────────────────────────────────────────┤
│  - Source of truth for categories                               │
│  - Admin controls ordering                                      │
│  - Fires webhooks on changes                                    │
│  - Product Discovery queries for products                       │
└─────────────────────────────────────────────────────────────────┘
```

### What Changes for BuildRight

| Component | Current | Proposed |
|-----------|---------|----------|
| Main navigation | API fetch → sessionStorage | Authored `/nav` fragment (edge-cached) |
| Category page titles | API fetch → sessionStorage | Keep current (acceptable, non-blocking) |
| Subcategory menus | N/A (flat structure) | Future: API or spreadsheet |
| Product listing | Product Discovery dropin | No change |

---

## Implementation Plan

### Phase 1: Author Navigation Fragment (Immediate)

1. Create `/nav` document with BuildRight categories:
   ```markdown
   [BuildRight Logo]
   /

   ---

   - [Structural Materials](/catalog?category=structural-materials)
   - [Electrical](/catalog?category=electrical)
   - [Plumbing](/catalog?category=plumbing)
   - [HVAC](/catalog?category=hvac)
   - [Safety Equipment](/catalog?category=safety)
   - [Tools](/catalog?category=tools)
   - [Finishing Materials](/catalog?category=finishing)
   - [Hardware](/catalog?category=hardware)

   ---

   - Search
   - Cart
   - Account
   ```

2. Update `header.js` to load from fragment instead of building dynamically

3. Remove category API fetch from critical path

### Phase 2: Webhook Sync (Future)

1. Create App Builder action for `category.updated` webhook
2. Action queries Commerce for updated category structure
3. Action updates `/nav` document via AEM API
4. Triggers publish to refresh edge cache

### Phase 3: Spreadsheet Subcategories (Optional)

1. Create `categories.xlsx` with full hierarchy
2. Expose as `/categories.json`
3. Use for mega-menu subcategories if needed

---

## Consequences

### Positive

- **Performance**: Navigation loads in ~10ms from edge vs ~150-300ms from API
- **Reliability**: Navigation works even if commerce API is slow/down
- **SEO**: Navigation is in initial HTML, not JS-rendered
- **LCP/CLS**: No layout shift from async nav loading
- **EDS Alignment**: Follows Adobe's recommended patterns

### Negative

- **Sync overhead**: Category changes require nav republish
- **Two systems**: Commerce admin + content authoring
- **Potential drift**: If webhook fails, nav could be stale

### Mitigation

- Webhook infrastructure ensures automatic sync
- ISR-style background refresh as fallback
- Monitoring alerts if nav is stale beyond threshold
- Content freeze periods during major category restructuring

---

## Comparison with Production Sites

| Site | Top Nav | Subcategories | Sync Method |
|------|---------|---------------|-------------|
| bulk.com | Authored fragment | Authored fragment | Manual |
| aemshop.net | Authored fragment | N/A | Manual |
| BuildRight (proposed) | Authored fragment | API/Spreadsheet | Webhook |

---

## References

### Adobe Documentation
- [EDS Fragments](https://www.aem.live/docs/fragments)
- [EDS Spreadsheets and JSON](https://www.aem.live/developer/spreadsheets)
- [Header Block Collection](https://www.aem.live/developer/block-collection/header)

### Research Sources
- bulk.com navigation analysis (hardcoded fragment)
- aemshop.net navigation analysis (hardcoded fragment)
- aem-boilerplate-commerce header.js (fragment-based)

### Industry Patterns
- Shopify Hydrogen: CacheLong strategy with webhook invalidation
- Next.js Commerce: ISR with 5-minute revalidation
- Enterprise BFF pattern: Webhook-triggered cache invalidation

---

---

## Current State: Preparation for Transition

### What's Optimized Now (API-First)

| Optimization | Location | Status |
|--------------|----------|--------|
| Categories sessionStorage cache | `mesh-client.js:getCategories()` | Done |
| Persona sessionStorage cache | `mesh-client.js:initializePersona()` | Done |
| Parallel dropin imports | All dropin blocks | Done (ADR-015) |
| Parallel initializer imports | `initializers/index.js` | Done |

### Code Changes Needed for Content-First Transition

**1. Create `/nav` document** (content authoring)
```markdown
[BuildRight Logo](/)

---

- [All Products](/catalog)
- [Structural Materials](/catalog?category=structural-materials)
  - [Lumber](/catalog?category=lumber)
  - [Concrete](/catalog?category=concrete)
- [Electrical](/catalog?category=electrical)
- [Plumbing](/catalog?category=plumbing)
...

---

- Search
- Cart
- Account
```

**2. Update `header.js`** — Replace `loadDynamicCategories()` with fragment loading:

```javascript
// CURRENT (API-first):
async function loadDynamicCategories() {
  const { waitForDropins } = await import('../../scripts/initializers/index.js');
  await waitForDropins();
  const result = await getCategories();
  // ... build nav HTML from API data
}

// FUTURE (Content-first):
async function loadNavigationFragment() {
  const navPath = getMetadata('nav') || '/nav';
  const fragment = await loadFragment(navPath);

  // Fragment already contains nav HTML structure
  const mainNav = block.querySelector('.main-nav');
  mainNav.innerHTML = '';
  mainNav.appendChild(fragment);

  // Wire up event handlers for dropdowns
  wireUpCategoryDropdowns(mainNav);
}
```

**3. Key refactoring steps:**

| Step | Change | Risk |
|------|--------|------|
| 1 | Extract `wireUpCategoryDropdowns()` from `loadDynamicCategories()` | Low |
| 2 | Create `loadFragment()` utility if not exists | Low |
| 3 | Add metadata support for nav path | Low |
| 4 | Author `/nav` document with current categories | Medium (content) |
| 5 | Switch data source from API to fragment | Medium |
| 6 | Remove `loadDynamicCategories()` API code | Low (cleanup) |

**4. Backward compatibility:**
- Keep `getCategories()` for page titles (non-critical path)
- Keep sessionStorage caching for subcategory data if needed
- Fragment provides top-level nav; API can augment with dynamic data

### Files That Will Change

| File | Current Role | Future Role |
|------|--------------|-------------|
| `blocks/header/header.js` | Fetches categories from API, builds nav | Loads `/nav` fragment, wires handlers |
| `scripts/services/mesh-client.js` | Provides `getCategories()` | Still used for page titles, subcategories |
| `/nav` (new) | N/A | Authored navigation structure |
| `scripts/utils.js` or new | N/A | `loadFragment()` utility |

### Migration Checklist (Future)

- [ ] Create `/nav` document with current category structure
- [ ] Extract `wireUpCategoryDropdowns()` function
- [ ] Add `loadFragment()` utility
- [ ] Update `header.js` to use fragment
- [ ] Set up webhook for Commerce → nav sync
- [ ] Test with authored content
- [ ] Remove API-based navigation code

---

## Open Questions

1. **Webhook reliability**: What happens if Commerce → App Builder webhook fails?
   - *Proposed*: ISR-style background refresh every 4 hours as fallback

2. **Staging/Preview**: How do authors preview nav changes before publish?
   - *Proposed*: AEM preview environment shows draft nav

3. **Multi-language**: How do localized category names work?
   - *Proposed*: Separate `/nav` per locale, same webhook updates all

4. **A/B testing navigation**: Can we test different nav structures?
   - *Proposed*: Feature flags in nav document, not API-driven
