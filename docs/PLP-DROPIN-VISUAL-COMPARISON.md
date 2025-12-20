# PLP Dropin: Visual Comparison of Approaches

## What Will BuildRight's Catalog Look Like?

This document provides **visual/code examples** showing what each approach would look like in practice.

---

## Current BuildRight Design (Baseline)

### Existing Product Grid
```
┌────────────────────────────────────────────────────────────────────┐
│ Home > Structural Materials > Lumber                  [Grid] [List] │
│                                                                       │
│ Lumber                                                   Sort: Price │
│ High-quality lumber for construction                         ↑↓      │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                       │
│ FILTERS                    PRODUCTS (24 items)                       │
│ ┌──────────┐  ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ Manufac. │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │       │
│ │ □ Pacific│  │  2x4 Stud│  2x6 Lum.│  4x4 Post│  Plywood │       │
│ │ □ Cascade│  │  $8.99   │  $12.50  │  $15.00  │  $45.00  │       │
│ │          │  │  Grade A │  Grade A │  Grade B │  CDX     │       │
│ │ Grade    │  │ [+ Cart] │ [+ Cart] │ [+ Cart] │ [+ Cart] │       │
│ │ □ A      │  ├──────────┼──────────┼──────────┼──────────┤       │
│ │ □ B      │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │       │
│ │          │  │  ...     │  ...     │  ...     │  ...     │       │
│ └──────────┘  └──────────┴──────────┴──────────┴──────────┘       │
│                                                                       │
│                [ 1 ] [ 2 ] [ 3 ] ... [ Next ]                       │
└────────────────────────────────────────────────────────────────────┘
```

### Current Implementation (Custom Blocks)
```javascript
// blocks/product-grid/product-grid.js (400 lines)
- Manual product rendering
- Custom grid layout
- Custom product cards with tier badges
- Manufacturer/grade display

// blocks/filters-sidebar/filters-sidebar.js (300 lines)
- Custom filter UI
- Checkbox rendering
- Count display
- Filter application logic

// scripts/catalog-service.js (200 lines)
- Custom GraphQL queries
- Manual facet parsing
- Manual category mapping
```

---

## Approach 1: API-Only Mode

### Architecture
```
┌──────────────────────────────────────┐
│  Product Discovery Dropin (Data)    │  ← Adobe maintains
│  - search() API                      │
│  - Category metadata from ACO        │
└──────────────┬───────────────────────┘
               │ Returns:
               │ { products, facets,
               │   categoryMetadata,
               │   pageInfo }
               ▼
┌──────────────────────────────────────┐
│  Your Existing Blocks (100% Same)   │  ← You maintain
│  - product-grid.js (same)            │
│  - filters-sidebar.js (same)         │
│  - Your CSS (same)                   │
└──────────────────────────────────────┘
```

### What Changes in Code
```javascript
// OLD: scripts/services/catalog-service.js
export async function getProducts(filters) {
  const query = `
    query getProducts($filter: [Filter!]) {
      products(filter: $filter) {
        items { sku name price ... }
      }
    }
  `;
  const result = await fetchGraphQL(query, { filter });
  return parseProducts(result); // Manual parsing
}

// NEW: scripts/services/product-discovery-service.js
import { search } from '@dropins/storefront-product-discovery/api';

export async function searchProducts(params) {
  return await search({
    variables: {
      filter: buildFilterArray(params),
      pageSize: 24,
      currentPage: params.page || 1
    }
  });
  // Returns pre-parsed data:
  // { products, facets, categoryMetadata, pageInfo }
}
```

### Category Headers (NEW CAPABILITY)
```javascript
// BEFORE: Hardcoded
<h1 class="category-title">All Products</h1>

// AFTER: Dynamic from ACO
<h1 class="category-title">${result.categoryMetadata.name}</h1>
// Automatically shows: "Lumber", "Structural Materials", etc.
```

### Breadcrumbs (NEW CAPABILITY)
```javascript
// BEFORE: Manual/missing
<div class="breadcrumbs">Home > Products</div>

// AFTER: From categoryMetadata
const breadcrumbs = result.categoryMetadata.breadcrumbs;
// [
//   { name: "Home", urlKey: "" },
//   { name: "Structural Materials", urlKey: "structural-materials" },
//   { name: "Lumber", urlKey: "structural-materials/lumber" }
// ]

renderBreadcrumbs(breadcrumbs);
// Output: Home > Structural Materials > Lumber
```

### Visual Result
**Looks:** Identical to current design (100% match)  
**Functionality:** Same + better category metadata  
**Code changes:** Replace data service, add breadcrumbs block

---

## Approach 2: Dropin UI + Customization

### Architecture
```
┌──────────────────────────────────────────────────┐
│     Product Discovery Dropin (Full Stack)        │
│  ┌────────────┐  ┌──────────────────────┐       │
│  │ search()   │  │  UI Containers       │       │
│  │ API        │  │  - ProductList       │       │
│  └────────────┘  │  - Facets            │       │
│                  │  - Pagination        │       │
│                  └──────┬───────────────┘       │
└─────────────────────────┼────────────────────────┘
                          │
                ┌─────────┴──────────┐
                │                    │
      ┌─────────▼────────┐  ┌───────▼────────┐
      │  Customization   │  │  Custom Blocks │
      │  via Slots       │  │  - breadcrumbs │
      └──────────────────┘  │  - header      │
                            └────────────────┘
```

### Default Dropin UI (Before Customization)

#### Level 0: Out-of-Box (No Customization)
```
┌────────────────────────────────────────────────────────────────────┐
│ Lumber                                           Sort: [Relevance ▼]│
│                                                                       │
│ FILTERS                    PRODUCTS                                  │
│ ┌──────────┐  ┌────────────────────────────────────────────┐       │
│ │ Manufac. │  │  ┌────────┐  ┌────────┐  ┌────────┐       │       │
│ │ ☑ Pacific│  │  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │       │       │
│ │   (15)   │  │  │  Name  │  │  Name  │  │  Name  │       │       │
│ │ ☐ Cascade│  │  │ $8.99  │  │ $12.50 │  │ $15.00 │       │       │
│ │   (12)   │  │  │ [Cart] │  │ [Cart] │  │ [Cart] │       │       │
│ │          │  │  └────────┘  └────────┘  └────────┘       │       │
│ │ Grade    │  │  ┌────────┐  ┌────────┐  ┌────────┐       │       │
│ │ ☐ A (20) │  │  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │       │       │
│ │ ☐ B (10) │  │  │  Name  │  │  Name  │  │  Name  │       │       │
│ │          │  │  │ $45.00 │  │ $22.00 │  │ $8.50  │       │       │
│ └──────────┘  │  │ [Cart] │  │ [Cart] │  │ [Cart] │       │       │
│               │  └────────┘  └────────┘  └────────┘       │       │
│               └────────────────────────────────────────────┘       │
│               ◀ 1  2  3  ... ▶                                      │
└────────────────────────────────────────────────────────────────────┘
```

**Differences from BuildRight:**
- ❌ Generic product card layout (not BuildRight's custom tiles)
- ❌ No manufacturer badges
- ❌ No grade indicators
- ❌ Basic styling (not BuildRight green/brown theme)
- ❌ Different grid spacing

#### Level 1: Design Tokens (30 mins customization)
```css
/* Override design tokens */
:root {
  --color-primary: #2C5530;
  --color-secondary: #8B4513;
  --font-family-primary: 'Inter', sans-serif;
  --product-card-border-radius: 8px;
  --spacing-grid: 32px;
}
```

**Result:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Lumber                                           Sort: [Relevance ▼]│
│                                                                       │
│ FILTERS                    PRODUCTS                                  │
│ ┌──────────┐  ┌────────────────────────────────────────────┐       │
│ │ Manufac. │  │  ┌────────┐  ┌────────┐  ┌────────┐       │       │
│ │ ☑ Pacific│  │  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │       │ 🎨 BuildRight
│ │   (15)   │  │  │  Name  │  │  Name  │  │  Name  │       │    colors
│ │ ☐ Cascade│  │  │ $8.99  │  │ $12.50 │  │ $15.00 │       │ 🎨 BuildRight
│ │   (12)   │  │  │ [Cart] │  │ [Cart] │  │ [Cart] │       │    fonts
│ │          │  │  └────────┘  └────────┘  └────────┘       │ 📐 BuildRight
│ │ Grade    │  │  ┌────────┐  ┌────────┐  ┌────────┐       │    spacing
│ │ ☐ A (20) │  │  │ [IMG]  │  │ [IMG]  │  │ [IMG]  │       │
│ │ ☐ B (10) │  │  │  Name  │  │  Name  │  │  Name  │       │
│ │          │  │  │ $45.00 │  │ $22.00 │  │ $8.50  │       │
│ └──────────┘  │  │ [Cart] │  │ [Cart] │  │ [Cart] │       │
│               │  └────────┘  └────────┘  └────────┘       │
│               └────────────────────────────────────────────┘
│               ◀ 1  2  3  ... ▶
└────────────────────────────────────────────────────────────────────┘
```

**Match: 70%** - Colors and fonts match, but layout is still generic

#### Level 2: Design Tokens + CSS (2-3 hours customization)
```css
/* Custom CSS overrides */
.product-list .product-grid {
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 32px;
}

.product-card {
  border: 1px solid #E5E5E5;
  border-radius: 12px;
  padding: 20px;
}

.product-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
  transform: translateY(-4px);
}
```

**Result:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Lumber                                           Sort: [Relevance ▼]│
│                                                                       │
│ FILTERS                    PRODUCTS                                  │
│ ┌──────────┐  ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ Manufac. │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │ 📐 BuildRight
│ │ ☑ Pacific│  │   Name   │   Name   │   Name   │   Name   │    grid
│ │   (15)   │  │  $8.99   │  $12.50  │  $15.00  │  $45.00  │ 🎨 BuildRight
│ │ ☐ Cascade│  │  [Cart]  │  [Cart]  │  [Cart]  │  [Cart]  │    cards
│ │   (12)   │  ├──────────┼──────────┼──────────┼──────────┤ ✨ Hover
│ │          │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │    effects
│ │ Grade    │  │   Name   │   Name   │   Name   │   Name   │
│ │ ☐ A (20) │  │  $22.00  │  $8.50   │  $18.00  │  $32.00  │
│ │ ☐ B (10) │  │  [Cart]  │  [Cart]  │  [Cart]  │  [Cart]  │
│ │          │  └──────────┴──────────┴──────────┴──────────┘
│ └──────────┘  ◀ 1  2  3  ... ▶
└────────────────────────────────────────────────────────────────────┘
```

**Match: 80%** - Layout and styling close, but content is generic

#### Level 3: Design Tokens + CSS + Slots (1 day customization)
```javascript
// Custom product card slot
slots: {
  ProductCard: (ctx) => {
    const { product } = ctx;
    return `
      <div class="buildright-product-tile">
        <div class="product-image-wrapper">
          <img src="${product.image}" alt="${product.name}" />
          ${product.badge ? `<span class="tier-badge">${product.badge}</span>` : ''}
        </div>
        <div class="product-info">
          <div class="product-sku">SKU: ${product.sku}</div>
          <h3 class="product-name">${product.name}</h3>
          <div class="product-manufacturer">
            ${product.manufacturer}
          </div>
          <div class="product-grade">
            Grade: ${product.grade}
          </div>
          <div class="product-price">
            ${renderPriceWithTier(product)}
          </div>
          <button class="btn-add-cart" data-sku="${product.sku}">
            Add to Cart
          </button>
        </div>
      </div>
    `;
  }
}
```

**Result:**
```
┌────────────────────────────────────────────────────────────────────┐
│ Lumber                                           Sort: [Relevance ▼]│
│                                                                       │
│ FILTERS                    PRODUCTS (24 items)                       │
│ ┌──────────┐  ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ Manufac. │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │       │
│ │ ☑ Pacific│  │ GOLD ★   │ SILVER★  │  BRONZE★ │          │ ⭐ Tier
│ │   (15)   │  │ SKU: STR-│ SKU: STR-│ SKU: STR-│ SKU: FRM-│    badges
│ │ ☐ Cascade│  │  2x4 Stud│  2x6 Lum.│  4x4 Post│  Plywood │ 📦 SKUs
│ │   (12)   │  │  Pacific │  Cascade │  Sierra  │  Weyerh. │ 🏭 Manufact.
│ │          │  │  Grade A │  Grade A │  Grade B │  CDX     │ 🎖️ Grade
│ │ Grade    │  │  $8.99   │  $12.50  │  $15.00  │  $45.00  │ 💰 Price
│ │ ☐ A (20) │  │ [+ Cart] │ [+ Cart] │ [+ Cart] │ [+ Cart] │ 🛒 Add btn
│ │ ☐ B (10) │  ├──────────┼──────────┼──────────┼──────────┤       │
│ │          │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │       │
│ └──────────┘  │  ...     │  ...     │  ...     │  ...     │       │
│               └──────────┴──────────┴──────────┴──────────┘       │
│               ◀ 1  2  3  ... ▶                                      │
└────────────────────────────────────────────────────────────────────┘
```

**Match: 90-95%** - Very close to BuildRight design, minor differences in structure

### Code Comparison

#### API-Only Code
```javascript
// blocks/product-grid/product-grid.js (400 lines - you maintain all)
function renderProductCard(product) {
  const card = document.createElement('div');
  card.className = 'product-tile';
  card.innerHTML = `
    <div class="product-image">
      <img src="${product.image}" alt="${product.name}" />
      ${product.badge ? `<span class="tier-badge">${product.badge}</span>` : ''}
    </div>
    <div class="product-info">
      <!-- Full custom rendering -->
    </div>
  `;
  return card;
}
```

#### Dropin UI + Slots Code
```javascript
// blocks/product-grid/product-grid.js (150 lines - dropin handles most)
import { ProductList } from '@dropins/storefront-product-discovery/containers';

provider.render(ProductList, {
  slots: {
    ProductCard: (ctx) => renderProductCard(ctx.product)
    // Dropin handles: grid layout, loading, error, empty states
  }
});

function renderProductCard(product) {
  // Same rendering logic as API-only
  return `<!-- HTML template -->`;
}
```

**Code savings: ~250 lines**
- ❌ No grid layout code
- ❌ No loading state handling
- ❌ No error handling UI
- ❌ No empty state UI
- ❌ No pagination logic

---

## Approach 3: Custom SDK Dropin

### What You Build
```javascript
// buildright-plp/api/search.js (200 lines)
export async function search(variables) {
  // You write GraphQL queries
}

// buildright-plp/api/get-facets.js (150 lines)
export async function getFacets(categoryId) {
  // You write facet queries
}

// buildright-plp/components/ProductCard.tsx (200 lines)
export class ProductCard extends Component {
  // You write all markup and logic
}

// buildright-plp/components/FilterGroup.tsx (150 lines)
export class FilterGroup extends Component {
  // You write filter UI
}

// buildright-plp/containers/ProductList.tsx (300 lines)
export class ProductList extends Container {
  // You write all business logic
}

// buildright-plp/containers/Facets.tsx (250 lines)
export class Facets extends Container {
  // You write filter management
}

// buildright-plp/state/search-context.ts (200 lines)
export class SearchContext {
  // You write state management
}

// buildright-plp/utils/url-manager.ts (150 lines)
export class URLManager {
  // You write URL sync
}

// + Testing, documentation, package config...
```

**Total: ~2,000-3,000 lines of code to maintain**

### Visual Result
```
┌────────────────────────────────────────────────────────────────────┐
│ Home > Structural Materials > Lumber                  [Grid] [List] │
│                                                                       │
│ Lumber                                                   Sort: Price │
│ High-quality lumber for construction                         ↑↓      │
│ ─────────────────────────────────────────────────────────────────── │
│                                                                       │
│ FILTERS                    PRODUCTS (24 items)                       │
│ ┌──────────┐  ┌──────────┬──────────┬──────────┬──────────┐       │
│ │ Manufac. │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │       │
│ │ □ Pacific│  │  2x4 Stud│  2x6 Lum.│  4x4 Post│  Plywood │       │
│ │ □ Cascade│  │  $8.99   │  $12.50  │  $15.00  │  $45.00  │       │
│ │          │  │  Grade A │  Grade A │  Grade B │  CDX     │       │
│ │ Grade    │  │ [+ Cart] │ [+ Cart] │ [+ Cart] │ [+ Cart] │       │
│ │ □ A      │  ├──────────┼──────────┼──────────┼──────────┤       │
│ │ □ B      │  │  [IMG]   │  [IMG]   │  [IMG]   │  [IMG]   │       │
│ │          │  │  ...     │  ...     │  ...     │  ...     │       │
│ └──────────┘  └──────────┴──────────┴──────────┴──────────┘       │
│                                                                       │
│                [ 1 ] [ 2 ] [ 3 ] ... [ Next ]                       │
└────────────────────────────────────────────────────────────────────┘
```

**Match: 100%** - But same as API-only, with 10x more work

---

## Feature Comparison Table

| Feature | Current | API-Only | Dropin UI + Slots | Custom SDK |
|---------|---------|----------|-------------------|------------|
| **Product Grid** | Custom | Custom | Dropin + Custom Slots | Custom |
| **Product Cards** | Custom HTML | Custom HTML | Custom HTML (slots) | Custom HTML |
| **Filters** | Custom | Custom | Dropin + Custom Slots | Custom |
| **Pagination** | Custom | Custom | Dropin (styled) | Custom |
| **Sort** | Custom | Custom | Dropin (styled) | Custom |
| **Loading State** | Custom | Custom | Dropin (auto) | Custom |
| **Empty State** | Custom | Custom | Dropin (auto) | Custom |
| **Error Handling** | Custom | Custom | Dropin (auto) | Custom |
| **Breadcrumbs** | Missing | Custom NEW | Custom NEW | Custom NEW |
| **Category Header** | Hardcoded | Dynamic NEW | Dynamic NEW | Dynamic NEW |
| **URL Sync** | Custom | Custom | Dropin (auto) | Custom |
| **Responsive** | Custom CSS | Custom CSS | Dropin + CSS | Custom CSS |
| **Accessibility** | Manual | Manual | Dropin (auto) | Manual |

**Legend:**
- 🟢 **Dropin (auto)**: Adobe provides and maintains
- 🟡 **Custom**: You build and maintain
- 🔵 **Custom NEW**: New capability added

---

## Effort Comparison (Concrete)

### API-Only Mode
```
Day 1 (Morning):
- Install dropin packages
- Create product-discovery-service.js
- Update product-grid.js to use new service

Day 1 (Afternoon):
- Test product loading
- Test filter functionality
- Fix any issues

Day 2 (Morning):
- Create breadcrumbs block
- Update category headers to be dynamic
- Test category navigation

Day 2 (Afternoon):
- Full testing
- Bug fixes
- Documentation

Total: 2 days, ~400 lines of code changed
```

### Dropin UI + Slots
```
Day 1 (Morning):
- Install dropin packages
- Initialize dropins
- Render default containers

Day 1 (Afternoon):
- Add design tokens
- Add CSS overrides
- Test default UI

Day 2 (Morning):
- Create custom slots for product cards
- Create custom slots for filters
- Test customized UI

Day 2 (Afternoon):  
- Create breadcrumbs block
- Update category headers
- Final testing

Total: 1.5-2 days, ~250 lines of code added
```

### Custom SDK Dropin
```
Week 1:
- Set up dropin project structure
- Create API layer (search, facets, category)
- Write GraphQL queries
- Implement caching

Week 2:
- Build UI components (ProductCard, FilterGroup, etc.)
- Build containers (ProductList, Facets, Pagination)
- Implement state management

Week 3:
- Implement URL management
- Add loading/error/empty states
- Responsive design
- Accessibility

Week 4:
- Testing (unit, integration, e2e)
- Documentation
- Bug fixes
- Performance optimization

Week 5-6:
- Edge cases
- Browser compatibility
- Final polish

Total: 4-6 weeks, ~2,500+ lines of code
```

---

## Decision Framework

### Choose API-Only If You Answer:
- ✅ "We need 100% design fidelity"
- ✅ "We're comfortable maintaining UI code"
- ✅ "We have 2-3 days available"
- ✅ "Our current design is perfect"

### Choose Dropin UI + Slots If You Answer:
- ✅ "We need this done in 1-2 days"
- ✅ "90-95% design match is acceptable"
- ✅ "We want less code to maintain"
- ✅ "We want automatic accessibility"
- ✅ "We want Adobe's future improvements"

### Choose Custom SDK If You Answer:
- ❌ "We're building for 10+ storefronts"
- ❌ "We have 4-6 weeks to invest"
- ❌ "We plan to sell this dropin"
- ❌ None of the above? → Don't do this!

---

## Recommendation Reaffirmed

**For BuildRight: API-Only Mode**

**Why:**
1. Your design is already great → keep it 100%
2. 2-3 days is reasonable → faster than custom SDK
3. You get category metadata → solves immediate problems
4. You maintain UI → but you're already doing that
5. Progressive path → can adopt dropin UI later if desired

**Visual outcome:** Identical to current design + better breadcrumbs/headers

---

**Document Version**: 1.0  
**Date**: December 19, 2024  
**Author**: AI Agent  
**Status**: Visual Comparison Guide

