# Category Landing Page (CLP): Component Architecture Breakdown

## The Big Misconception

**You thought:** The entire CLP is one dropin  
**Reality:** The CLP is composed of **multiple independent dropin containers** + custom blocks

---

## What Adobe Provides: Product Discovery Dropin Package

The `@dropins/storefront-product-discovery` package contains **multiple separate containers**:

```javascript
import { 
  ProductList,      // ← Separate container for product grid
  Facets,           // ← Separate container for filters
  SearchBar,        // ← Separate container for search
  SortBy,           // ← Separate container for sort dropdown
  Pagination,       // ← Separate container for pagination
  search            // ← API function (not a UI component)
} from '@dropins/storefront-product-discovery';
```

**These are NOT a single CLP dropin** - they're **independent containers** that you compose together.

---

## Visual Breakdown: What's What

```
┌─────────────────────────────────────────────────────────────────────┐
│ 🔵 CUSTOM BLOCK: Header                                             │
│ (blocks/header/header.js)                                           │
│ • Your EDS block                                                    │
│ • Not a dropin                                                      │
└─────────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 🔵 CUSTOM BLOCK: Breadcrumbs                                        │
│ (blocks/breadcrumbs/breadcrumbs.js)                                 │
│ • Your custom HTML                                                  │
│ • Uses data from: search() API result.categoryMetadata.breadcrumbs │
│ • Not a dropin container                                            │
└─────────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 🔵 CUSTOM HTML: Category Header                                     │
│ <h1 id="catalog-title">                                             │
│ • Plain HTML element                                                │
│ • Uses data from: search() API result.categoryMetadata.name        │
│ • Not a dropin                                                      │
└─────────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 🟡 OPTIONAL: Search & Sort Bar                                      │
│ ┌─────────────────────────────┬─────────────────────────────────┐ │
│ │ OPTION A: Custom HTML       │ OPTION A: Custom HTML           │ │
│ │ <input type="search">       │ <select>                        │ │
│ │ • Your own HTML + JS        │ • Your own HTML + JS            │ │
│ ├─────────────────────────────┼─────────────────────────────────┤ │
│ │ OPTION B: 🟢 NATIVE DROPIN  │ OPTION B: 🟢 NATIVE DROPIN      │ │
│ │ SearchBar.render()          │ SortBy.render()                 │ │
│ │ • Adobe dropin container    │ • Adobe dropin container        │ │
│ │ • Customizable via slots    │ • Customizable via slots        │ │
│ └─────────────────────────────┴─────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────┬───────────────────────────────────────┐
│ SIDEBAR (280px)             │ MAIN CONTENT (1fr)                    │
│                             │                                       │
│ ┌─────────────────────────┐ │ ┌───────────────────────────────────┐│
│ │ 🔵 CUSTOM: Filter Header│ │ │ 🔵 CUSTOM: Grid Header            ││
│ │ <div class="filters-    │ │ │ <div class="grid-header">         ││
│ │       header">          │ │ │   <button>Filters</button>        ││
│ │   <h3>Refine Results</h3│ │ │   <div class="product-count">     ││
│ │   <button>Clear All     │ │ │     48 products                   ││
│ │   </button>             │ │ │   </div>                          ││
│ │ </div>                  │ │ │ </div>                            ││
│ │                         │ │ │                                   ││
│ │ • Your custom HTML      │ │ │ • Your custom HTML                ││
│ │ • Not a dropin          │ │ │ • Not a dropin                    ││
│ └─────────────────────────┘ │ └───────────────────────────────────┘│
│                             │                                       │
│ ┌─────────────────────────┐ │ ┌───────────────────────────────────┐│
│ │ 🟢 NATIVE DROPIN        │ │ │ 🟢 NATIVE DROPIN                  ││
│ │ Facets Container        │ │ │ ProductList Container             ││
│ │                         │ │ │                                   ││
│ │ Facets.render({         │ │ │ ProductList.render({              ││
│ │   selector:             │ │ │   selector:                       ││
│ │     '.dynamic-facets-   │ │ │     '.products-container',        ││
│ │      container',        │ │ │   slots: {                        ││
│ │   slots: {              │ │ │     ProductCard: (ctx) => {       ││
│ │     FacetGroup,         │ │ │       // Your HTML template       ││
│ │     FacetOption         │ │ │     }                             ││
│ │   }                     │ │ │   }                               ││
│ │ })                      │ │ │ })                                ││
│ │                         │ │ │                                   ││
│ │ Adobe provides:         │ │ │ Adobe provides:                   ││
│ │ ✅ Facet data from ACO  │ │ │ ✅ Product data from ACO          ││
│ │ ✅ State management     │ │ │ ✅ Grid layout logic              ││
│ │ ✅ URL sync             │ │ │ ✅ Infinite scroll                ││
│ │ ✅ Checkbox logic       │ │ │ ✅ Loading states                 ││
│ │ ✅ Filter counts        │ │ │ ✅ Empty states                   ││
│ │                         │ │ │ ✅ Error handling                 ││
│ │ You provide (slots):    │ │ │                                   ││
│ │ 🎨 HTML structure       │ │ │ You provide (slots):              ││
│ │ 🎨 CSS classes          │ │ │ 🎨 Product card HTML              ││
│ │                         │ │ │ 🎨 Custom attributes              ││
│ │ ▼ Manufacturer          │ │ │   (tier, manufacturer, grade)     ││
│ │   □ Pacific NW (15)     │ │ │ 🎨 CSS classes                    ││
│ │   □ Cascade (12)        │ │ │                                   ││
│ │                         │ │ │ ┌────┬────┬────┬────┐            ││
│ │ ▼ Grade                 │ │ │ │Tile│Tile│Tile│Tile│            ││
│ │   □ A (20)              │ │ │ │[I] │[I] │[I] │[I] │            ││
│ │   □ B (10)              │ │ │ │GLD★│SLV★│    │    │            ││
│ │                         │ │ │ │SKU │SKU │SKU │SKU │            ││
│ │ ▼ Price                 │ │ │ │$9  │$12 │$15 │$45 │            ││
│ │   [====|====]           │ │ │ └────┴────┴────┴────┘            ││
│ │   $0      $100          │ │ │                                   ││
│ └─────────────────────────┘ │ └───────────────────────────────────┘│
└─────────────────────────────┴───────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 🟡 OPTIONAL: Pagination                                              │
│ ┌─────────────────────────────────────────────────────────────────┐ │
│ │ OPTION A: Custom HTML                                           │ │
│ │ <div class="pagination">                                        │ │
│ │   <button>Previous</button>                                     │ │
│ │   <button>1</button> <button>2</button>                         │ │
│ │   <button>Next</button>                                         │ │
│ │ </div>                                                          │ │
│ ├─────────────────────────────────────────────────────────────────┤ │
│ │ OPTION B: 🟢 NATIVE DROPIN                                      │ │
│ │ Pagination.render({ selector, slots })                          │ │
│ │ • Adobe dropin container                                        │ │
│ │ • Customizable via slots                                        │ │
│ └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
     ↓
┌─────────────────────────────────────────────────────────────────────┐
│ 🔵 CUSTOM BLOCK: Footer                                             │
│ (blocks/footer/footer.js)                                           │
│ • Your EDS block                                                    │
│ • Not a dropin                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Legend

### 🟢 **NATIVE ADOBE DROPIN CONTAINERS**
Individual UI components provided by Adobe in `@dropins/storefront-product-discovery`:
- **ProductList** - Renders product grid
- **Facets** - Renders filter sidebar
- **SearchBar** - Renders search input (optional)
- **SortBy** - Renders sort dropdown (optional)
- **Pagination** - Renders page controls (optional)

**Key Point:** These are **separate, independent containers** - not one monolithic CLP dropin.

### 🔵 **CUSTOM EDS BLOCKS**
Your own BuildRight components:
- **Header** (navigation)
- **Footer** (site footer)
- **Breadcrumbs** (navigation trail)
- Custom HTML wrappers (category title, filter header, grid header)

### 🟡 **OPTIONAL/FLEXIBLE**
Components where you can choose:
- Custom HTML + JS, OR
- Adobe dropin container with slots

### 🟠 **CUSTOM DROPIN (Not Recommended for BuildRight)**
If you built `@buildright/plp-dropin` using the SDK - a completely custom dropin package

---

## Detailed Component Analysis

### 1. Header
```
Component Type: 🔵 CUSTOM BLOCK
Location: blocks/header/header.js
Dropin?: NO
Why keep custom: Has BuildRight-specific navigation, branding
```

### 2. Breadcrumbs
```
Component Type: 🔵 CUSTOM BLOCK (Enhanced)
Location: blocks/breadcrumbs/breadcrumbs.js
Dropin?: NO (but uses dropin data)
Data source: search() API → result.categoryMetadata.breadcrumbs
Why custom: Simple HTML, just needs data
```

### 3. Category Title
```
Component Type: 🔵 CUSTOM HTML
Location: <h1 id="catalog-title">
Dropin?: NO (but uses dropin data)
Data source: search() API → result.categoryMetadata.name
Why custom: Just an <h1> element
```

### 4. Search Input
```
Component Type: 🟡 FLEXIBLE

OPTION A (Recommended): 🔵 CUSTOM HTML
<div class="catalog-search">
  <input type="search" />
</div>
// Call search() API when value changes

OPTION B: 🟢 NATIVE DROPIN
SearchBar.render({
  selector: '.catalog-search',
  slots: { SearchInput: (ctx) => `...` }
})

Choice: Keep custom for demo simplicity
```

### 5. Sort Dropdown
```
Component Type: 🟡 FLEXIBLE

OPTION A (Recommended): 🔵 CUSTOM HTML
<div class="catalog-sort">
  <select>...</select>
</div>
// Call search() API when value changes

OPTION B: 🟢 NATIVE DROPIN
SortBy.render({
  selector: '.catalog-sort',
  slots: { SortDropdown: (ctx) => `...` }
})

Choice: Keep custom for demo simplicity
```

### 6. Filter Sidebar Header
```
Component Type: 🔵 CUSTOM HTML
Location: <div class="filters-header">
Dropin?: NO
Why custom: Static header with "Clear All" button
```

### 7. Dynamic Facets Container
```
Component Type: 🟢 NATIVE ADOBE DROPIN
Dropin: Facets
Package: @dropins/storefront-product-discovery

Facets.render({
  selector: '.dynamic-facets-container',
  slots: {
    FacetGroup: (ctx) => {
      // Your HTML for filter section
    },
    FacetOption: (ctx) => {
      // Your HTML for checkbox option
    }
  }
})

What Adobe provides:
✅ Facet data from ACO
✅ Option counts
✅ State management (checked/unchecked)
✅ URL synchronization
✅ Filter change events

What you provide (via slots):
🎨 HTML structure (.filter-section, .filter-option)
🎨 CSS classes for styling
🎨 Expand/collapse button markup
```

### 8. Product Grid Header
```
Component Type: 🔵 CUSTOM HTML
Location: <div class="grid-header">
Dropin?: NO
Why custom: Static header with mobile toggle + product count
```

### 9. Products Container
```
Component Type: 🟢 NATIVE ADOBE DROPIN
Dropin: ProductList
Package: @dropins/storefront-product-discovery

ProductList.render({
  selector: '.products-container',
  slots: {
    ProductCard: (ctx) => {
      // Your HTML for product tile
      // Including: tier badge, SKU, manufacturer, grade
    },
    EmptyState: (ctx) => {
      // Your HTML for "no products found"
    },
    LoadingState: (ctx) => {
      // Your HTML for loading spinner
    }
  }
})

What Adobe provides:
✅ Product data from ACO
✅ Grid layout management
✅ Infinite scroll logic
✅ Loading state triggers
✅ Empty state detection
✅ Error handling
✅ Responsive grid

What you provide (via slots):
🎨 Product card HTML (entire structure)
🎨 BuildRight-specific elements
🎨 CSS classes for styling
```

### 10. Pagination (Optional)
```
Component Type: 🟡 FLEXIBLE

NOTE: BuildRight uses infinite scroll (no pagination UI)

If you wanted pagination:

OPTION A: 🔵 CUSTOM HTML
<div class="pagination">
  <button>Previous</button>
  <button>1</button>
  ...
</div>

OPTION B: 🟢 NATIVE DROPIN
Pagination.render({
  selector: '.pagination',
  slots: { PageButton: (ctx) => `...` }
})

Choice: Not needed (using infinite scroll)
```

### 11. Footer
```
Component Type: 🔵 CUSTOM BLOCK
Location: blocks/footer/footer.js
Dropin?: NO
Why custom: BuildRight-specific footer content
```

---

## What If You Built a Custom Dropin?

### Scenario: `@buildright/plp-dropin` (Custom Dropin via SDK)

```
┌─────────────────────────────────────────────────────────────┐
│ 🟠 CUSTOM DROPIN: @buildright/plp-dropin                    │
│ (Built by you using @adobe-commerce/elsie SDK)             │
│                                                             │
│ BuildRightPLP.render({                                      │
│   selector: '#catalog-layout',                             │
│   slots: {                                                  │
│     TierBadge: (ctx) => { ... },                           │
│     ManufacturerBadge: (ctx) => { ... },                   │
│     GradeIndicator: (ctx) => { ... },                      │
│     CategoryHeader: (ctx) => { ... },                      │
│     FilterGroup: (ctx) => { ... }                          │
│   }                                                         │
│ })                                                          │
│                                                             │
│ Would include:                                              │
│ • Your own API layer (search, facets, etc.)                │
│ • Your own UI containers (ProductList, Facets, etc.)       │
│ • Your own state management                                │
│ • BuildRight-specific slots (tier, manufacturer, grade)    │
│ • Everything you maintain                                  │
└─────────────────────────────────────────────────────────────┘

Effort: 4-6 weeks
Maintenance: High (you maintain all)
Use case: Multiple BuildRight storefronts, or platform business
Recommendation for demo: NO (overkill)
```

---

## Summary Table: Component Breakdown

| Component | Type | Dropin? | Package | Custom HTML? | Slots? |
|-----------|------|---------|---------|--------------|--------|
| **Header** | Block | ❌ No | N/A | ✅ Yes | N/A |
| **Breadcrumbs** | Block | ❌ No | N/A | ✅ Yes (uses dropin data) | N/A |
| **Category Title** | HTML | ❌ No | N/A | ✅ Yes (uses dropin data) | N/A |
| **Search Input** | Flexible | 🟡 Optional | `@dropins/.../SearchBar` | ✅ Recommended | Yes (if dropin) |
| **Sort Dropdown** | Flexible | 🟡 Optional | `@dropins/.../SortBy` | ✅ Recommended | Yes (if dropin) |
| **Filter Header** | HTML | ❌ No | N/A | ✅ Yes | N/A |
| **Facets** | Dropin | ✅ YES | `@dropins/.../Facets` | Via slots | ✅ Yes |
| **Grid Header** | HTML | ❌ No | N/A | ✅ Yes | N/A |
| **Product List** | Dropin | ✅ YES | `@dropins/.../ProductList` | Via slots | ✅ Yes |
| **Pagination** | Flexible | 🟡 Optional | `@dropins/.../Pagination` | N/A (infinite scroll) | N/A |
| **Footer** | Block | ❌ No | N/A | ✅ Yes | N/A |

---

## Code Structure Comparison

### OPTION 1: API-Only (No UI Dropins)
```javascript
import { search } from '@dropins/storefront-product-discovery/api';

// Your custom code renders everything
const result = await search({ variables: {...} });
renderProducts(result.products);       // Your function
renderFacets(result.facets);           // Your function
renderBreadcrumbs(result.categoryMetadata.breadcrumbs);  // Your function
```

**Components:** 100% custom blocks + search() API

---

### OPTION 2: Native Dropin Containers (Recommended for Demo)
```javascript
import { 
  ProductList,    // ← Adobe dropin container
  Facets,         // ← Adobe dropin container
  search          // ← API function
} from '@dropins/storefront-product-discovery';

// Dropin containers render with your slots
ProductList.render({
  selector: '.products-container',
  slots: {
    ProductCard: (ctx) => {
      // Your BuildRight product HTML
    }
  }
});

Facets.render({
  selector: '.dynamic-facets-container',
  slots: {
    FacetGroup: (ctx) => {
      // Your BuildRight filter HTML
    }
  }
});

// Custom blocks for everything else
updateBreadcrumbs(result.categoryMetadata.breadcrumbs);
updateTitle(result.categoryMetadata.name);
```

**Components:**
- 🟢 2 Native dropin containers (ProductList, Facets)
- 🔵 Custom blocks for rest (header, footer, breadcrumbs)
- 🔵 Custom HTML wrappers (filter header, grid header)

---

### OPTION 3: Custom Dropin (Not Recommended)
```javascript
import { BuildRightPLP } from '@buildright/plp-dropin';

// One custom dropin renders entire CLP
BuildRightPLP.render({
  selector: '#catalog-layout',
  slots: {
    TierBadge: (ctx) => { ... },
    ManufacturerBadge: (ctx) => { ... },
    // ... dozens of custom slots
  }
});
```

**Components:**
- 🟠 1 Custom dropin (you built everything)
- 🔵 Custom blocks for header/footer

---

## Key Takeaways

### ❌ **Misconception**
"The Product Discovery dropin is one monolithic CLP component"

### ✅ **Reality**
"Product Discovery is a **package of independent containers** (ProductList, Facets, SearchBar, SortBy, Pagination) that you compose together with your custom blocks"

### 🎯 **For Your Demo (Recommended)**
```
CLP = 
  🔵 Custom Header Block
  + 🔵 Custom Breadcrumbs (using dropin data)
  + 🔵 Custom Category Title (using dropin data)
  + 🔵 Custom Search/Sort HTML
  + 🔵 Custom Filter Header
  + 🟢 Native Facets Dropin (with custom slots)
  + 🔵 Custom Grid Header
  + 🟢 Native ProductList Dropin (with custom slots)
  + 🔵 Custom Footer Block
```

**Total native dropins used: 2**
- ProductList container
- Facets container

**Everything else: Custom BuildRight blocks/HTML**

---

## Final Recommendation

### ✅ **Use Native Dropin Containers (Option 2)**

**Why:**
1. **Composability** - Use just what you need (ProductList + Facets)
2. **Flexibility** - Keep everything else custom (header, footer, breadcrumbs)
3. **Demo value** - Shows how to integrate dropins with existing custom code
4. **Realistic** - This is how most implementations would work
5. **Maintainable** - Adobe maintains 2 containers, you maintain custom blocks

**Don't build:**
- ❌ Custom dropin (overkill for single storefront)
- ❌ Don't try to replace header/footer with dropins (no benefit)
- ❌ Don't try to make everything a dropin (reduces flexibility)

**The CLP is a composition of:**
- 🟢 2 Native Adobe dropin containers (where complex logic is needed)
- 🔵 Multiple custom blocks/HTML (for BuildRight-specific UI)
- 🎨 Slots to bridge the two (your HTML in Adobe's containers)

---

**Document Version**: 1.0  
**Date**: December 19, 2025  
**Author**: AI Agent  
**Status**: Component Architecture Breakdown

