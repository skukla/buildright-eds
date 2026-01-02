# BuildRight Dropin Architecture

**Status**: Canonical Reference
**Last Updated**: December 31, 2025 (categoryPath fix for facet category scoping)

---

## What Are Dropins?

Adobe Commerce **Dropins** are pre-built npm packages that provide commerce UI functionality. Each dropin contains multiple **containers** (renderable components), and containers expose **slots** (customization points).

```
HIERARCHY
═════════

@dropins/storefront-[name]                ◄── DROPIN (npm package)
│
├── containers/                           ◄── CONTAINERS (renderable components)
│   ├── ComponentA
│   └── ComponentB
│
└── slots (within containers)             ◄── SLOTS (customization points)
    ├── SlotName1
    └── SlotName2
```

**Key Distinction:**
- **Dropins** are npm packages you install
- **Containers** are components you render into DOM elements
- **Slots** are hooks where you inject custom HTML/styling

---

## Dropins Used in BuildRight

| Dropin Package | Purpose | Status |
|----------------|---------|--------|
| `@dropins/storefront-product-discovery` | Product search, filters, sorting | **Production** |
| `@dropins/storefront-auth` | Authentication UI | Planned (Phase 5.5) |
| `@dropins/storefront-cart` | Cart functionality | Planned (Phase 5.5) |
| `@dropins/storefront-checkout` | Checkout flow | Planned (Phase 5.5) |
| `@dropins/storefront-order` | Order confirmation | Planned (Phase 5.5) |

---

## Product Discovery Dropin

The Product Discovery dropin powers the `/catalog` page via the `product-list` EDS block.

### Critical: Separate Endpoint Configuration

> **The Product Discovery dropin has its OWN `setEndpoint` and `setFetchGraphQlHeaders` functions**, located in `@dropins/storefront-product-discovery/api.js`. These are **SEPARATE** from `@dropins/tools/fetch-graphql.js` used by other dropins (Auth, Cart, etc.).

```javascript
// WRONG - This only configures Auth, Cart, Checkout dropins
import { setEndpoint, setFetchGraphQlHeaders } from '@dropins/tools/fetch-graphql.js';
setEndpoint(meshEndpoint);  // Product Discovery dropin ignores this!

// CORRECT - Must configure Product Discovery dropin separately
import { setEndpoint, setFetchGraphQlHeaders } from '@dropins/storefront-product-discovery/api.js';
setEndpoint(meshEndpoint);  // Product Discovery dropin now uses mesh
setFetchGraphQlHeaders({
  'AC-View-Id': catalogViewUUID,
  'AC-Price-Book-Id': priceBookId
});
```

If facets or pricing are missing, verify `scripts/initializers/search.js` configures the dropin's own endpoint/headers.

### Containers

| Container | Purpose | Renders Into | Status |
|-----------|---------|--------------|--------|
| `SearchResults` | Product grid with cards | `.dropin-search-results-container` | Active |
| `Facets` | Filter sidebar | `.dropin-facets-container` | Active |
| `SortBy` | Sort dropdown | `.dropin-sort-container` | Active (mesh-controlled) |
| `Pagination` | Page navigation | `.dropin-pagination-container` | Active (BuildRight branded) |
| `SearchBarInput` | Search input field with form submission | `#header-search-input` | Active |
| `SearchBarResults` | Autocomplete dropdown results | `#search-suggestions` | Active |

### Slots (within SearchResults)

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `ProductCardImage` | Product image | Custom aspect ratio, background-image rendering |
| `ProductCardName` | Product title | BuildRight typography |
| `ProductCardPrice` | Price display | Tier pricing badges |
| `ProductCardActions` | Add to cart button | BuildRight button styles |
| `NoResults` | Empty state | Custom messaging |

### Slots (within Facets)

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `SelectedFacets` | Active filter chips + Clear All | Custom Clear All button only (no chips) |
| `FacetBucket` | Individual filter option | RangeBucket → custom checkbox, ScalarBucket → native dropin |

### Slots (within SearchBarInput)

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `Input` | Search input field | BuildRight styling, mobile toggle |

### Slots (within SearchBarResults)

| Slot | Purpose | BuildRight Customization |
|------|---------|--------------------------|
| `ProductItem` | Individual product result row | BuildRight typography, image, SKU display |
| `NoResults` | Empty results state | Custom messaging |

#### FacetBucket Types

The `FacetBucket` slot receives different data types:

| Type | Usage | BuildRight Handling |
|------|-------|---------------------|
| `RangeBucket` | Price ranges ($0-$10, $10-$50, etc.) | Custom checkbox with direct search API call |
| `ScalarBucket` | Brands, colors, quality tier | Native dropin (categoryPath preserves category context) |

### SortBy Customization

The SortBy dropdown options are controlled at the **mesh layer** via `dropin-metadata.js`, with minimal frontend enhancement.

#### Mesh Adapter (dropin-metadata.js)

The mesh intercepts `attributeMetadata` queries and:
- **Filters out** `position` (not useful for storefront)
- **Relabels** `relevance` → "Best Match"
- **Forces** `numeric: true` for `name` (enables bidirectional sort)

```javascript
// Configuration in dropin-metadata.js
const LABEL_OVERRIDES = { relevance: 'Best Match' };
const HIDDEN_ATTRIBUTES = ['position'];
const FORCE_NUMERIC = ['name'];
```

#### Frontend Enhancement (product-list.js)

The dropin ignores `numeric: true` for text fields, so minimal frontend code injects the second Name option:

```javascript
// Inject bidirectional Name sort (dropin only generates name_DESC)
const nameDesc = [...select.options].find(opt => opt.value === 'name_DESC');
if (nameDesc) {
  const aToZ = document.createElement('option');
  aToZ.value = 'name_ASC';
  aToZ.textContent = 'Name: A to Z';
  nameDesc.insertAdjacentElement('beforebegin', aToZ);
  nameDesc.textContent = 'Name: Z to A';
}
```

#### Final SortBy Options

| Option | Value | Source |
|--------|-------|--------|
| Name: A to Z | `name_ASC` | Frontend injection |
| Name: Z to A | `name_DESC` | Mesh (relabeled from "Name") |
| Best Match | `relevance_DESC` | Mesh (relabeled from "Relevance") |
| Price: Low to High | `price_ASC` | Native dropin |
| Price: High to Low | `price_DESC` | Native dropin |

See `buildright-service/mesh/README.md` for mesh adapter details.

---

## Visual: /catalog Page Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           /catalog (catalog.html)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ header (EDS Block)                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ breadcrumbs (EDS Block)                                             │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ╔═════════════════════════════════════════════════════════════════════╗    │
│  ║ product-list (EDS Block)                                            ║    │
│  ║ Uses: @dropins/storefront-product-discovery (DROPIN)                ║    │
│  ╠═════════════════════════════════════════════════════════════════════╣    │
│  ║                                                                     ║    │
│  ║  ┌─────────────────────────────┐  ┌─────────────────────────────┐   ║    │
│  ║  │ SearchBarInput (CONTAINER)  │  │ SortBy (CONTAINER)          │   ║    │
│  ║  │ #header-search-input        │  │ .dropin-sort-container      │   ║    │
│  ║  └─────────────────────────────┘  └─────────────────────────────┘   ║    │
│  ║                                                                     ║    │
│  ║  ┌────────────────────────┬──────────────────────────────────────┐  ║    │
│  ║  │                        │                                      │  ║    │
│  ║  │  Facets (CONTAINER)    │  SearchResults (CONTAINER)           │  ║    │
│  ║  │  .dropin-facets-       │  .dropin-search-results-container    │  ║    │
│  ║  │   container            │                                      │  ║    │
│  ║  │                        │  ┌──────────────────────────────────┐│  ║    │
│  ║  │  ┌──────────────────┐  │  │ ProductCard (repeats in grid)    ││  ║    │
│  ║  │  │SelectedFacets    │  │  │ ┌────────────────────────────┐   ││  ║    │
│  ║  │  │ SLOT             │  │  │ │ ProductCardImage SLOT      │   ││  ║    │
│  ║  │  └──────────────────┘  │  │ │ ProductCardName SLOT       │   ││  ║    │
│  ║  │                        │  │ │ ProductCardPrice SLOT      │   ││  ║    │
│  ║  │  ┌──────────────────┐  │  │ │ ProductCardActions SLOT    │   ││  ║    │
│  ║  │  │.product-discovery│  │  │ └────────────────────────────┘   ││  ║    │
│  ║  │  │ -facet (section) │  │  └──────────────────────────────────┘│  ║    │
│  ║  │  │                  │  │                                      │  ║    │
│  ║  │  │ FacetBucket SLOT │  │  During validation:                  │  ║    │
│  ║  │  │ ☐ Option 1 (12)  │  │  - Grid fades to 35% opacity         │  ║    │
│  ║  │  │ ☐ Option 2 (8)   │  │  - Centered spinner overlay          │  ║    │
│  ║  │  │ ◌ (spinner)      │  │                                      │  ║    │
│  ║  │  └──────────────────┘  │                                      │  ║    │
│  ║  │                        │                                      │  ║    │
│  ║  │  During validation:    │                                      │  ║    │
│  ║  │  - Sections fade 50%   │                                      │  ║    │
│  ║  │  - Per-section spinner │                                      │  ║    │
│  ║  │                        │                                      │  ║    │
│  ║  └────────────────────────┴──────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ║  ┌───────────────────────────────────────────────────────────────┐  ║    │
│  ║  │ Pagination (CONTAINER)                                        │  ║    │
│  ║  │  ◄ Prev   1   [2]   3   4   ...   10   Next ►                 │  ║    │
│  ║  └───────────────────────────────────────────────────────────────┘  ║    │
│  ║                                                                     ║    │
│  ╚═════════════════════════════════════════════════════════════════════╝    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ footer (EDS Block)                                                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

> **Note**: All SLOTs shown are native Adobe extension points. BuildRight provides custom rendering callbacks via `ctx.replaceWith()` - we don't create new slots, we customize existing ones.

---

## Integration Pattern

### Block → Dropin → Containers → Slots

```javascript
// blocks/product-list/product-list.js

import {
  SearchResults,
  Facets,
  SortBy,
  Pagination
} from '@dropins/storefront-product-discovery/containers';

export default async function decorate(block) {
  // Wait for dropin initialization
  await waitForDropins();

  // Render each CONTAINER to a different DOM element
  SortBy.render(document.querySelector('.dropin-sort-container'));

  Facets.render(document.querySelector('.dropin-facets-container'));

  SearchResults.render(document.querySelector('.dropin-search-results-container'), {
    // SLOTS customize what renders inside the container
    slots: {
      ProductCardImage: (ctx) => {
        const el = document.createElement('div');
        el.className = 'buildright-product-image';
        el.style.backgroundImage = `url(${ctx.product.image.url})`;
        ctx.replaceWith(el);
      },
      ProductCardPrice: (ctx) => {
        const el = document.createElement('div');
        el.className = 'buildright-price';
        el.textContent = formatPrice(ctx.product.price);
        ctx.replaceWith(el);
      }
    }
  });

  Pagination.render(document.querySelector('.dropin-pagination-container'));
}
```

### Slot API

| Method | Purpose |
|--------|---------|
| `ctx.replaceWith(element)` | Replace default content with custom element |
| `ctx.prependChild(element)` | Add before default content |
| `ctx.appendChild(element)` | Add after default content |
| `ctx.product` / `ctx.data` | Access data for current item |

---

## Query Flow: Mesh Adapter Pattern

Dropin queries are intercepted by mesh adapters for extensibility control:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  SearchResults Container                                                    │
│       │                                                                     │
│       │ calls productSearch(phrase, filter, ...)                           │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ dropin-search.js (Adapter Resolver)                                  │   │
│  │ INTERCEPTS unprefixed query for extensibility control                │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │ Routes to BuildRight_ prefixed source                              │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ACO_BuildRight Source                                                │   │
│  │ Executes BuildRight_productSearch with extensibility hooks           │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │ ACO API with AC-View-Id (UUID) + AC-Price-Book-Id headers          │
│       ▼                                                                     │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Adobe Commerce Optimizer (ACO)                                       │   │
│  │ Returns products with pricing                                        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│       │                                                                     │
│       │ Response transforms __typename                                     │
│       │ BuildRight_SimpleProductView → SimpleProductView                   │
│       ▼                                                                     │
│  SearchResults Container (displays products)                               │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

**Why the adapter?**
- Provides programmatic control over dropin queries
- Enables adding custom BuildRight fields
- Centralizes business logic and logging
- ACO returns pricing natively - adapter is for CONTROL, not required for basic pricing

See `buildright-service/mesh/README.md` for mesh architecture details.

---

## Pagination Styling

The catalog uses the dropin's native Pagination container with BuildRight brand styling.

### Why Native Pagination?

Using the dropin's built-in Pagination container provides:
- **Simplicity**: No custom state management required
- **Maintainability**: Fewer lines of custom code
- **Consistency**: Dropin handles all page navigation logic
- **Accessibility**: Built-in ARIA attributes and keyboard navigation

### Styling Architecture

The Pagination container is styled via `pagination.css` using BuildRight design tokens:

```css
/* Active page uses brand color */
.product-list .dropin-pagination-container button[aria-current="page"] {
  color: var(--color-text-inverse);
  background-color: var(--color-brand-500);
  border-color: var(--color-brand-500);
}

/* Hover state uses brand color accent */
.product-list .dropin-pagination-container button:hover:not(:disabled) {
  color: var(--color-brand-500);
  border-color: var(--color-brand-500);
}
```

### Key Styling Features

| Feature | Implementation |
|---------|----------------|
| Active page | Solid brand-500 background (#0f5ba7) |
| Hover state | Brand-500 border + text color |
| Disabled state | Muted with 60% opacity |
| Focus state | 2px brand-500 outline |
| Responsive | Compact buttons on mobile |

### Visibility During State Transitions

Pagination is hidden during loading states to prevent visual flicker:

```css
.product-list .dropin-search-results-container.validating ~ .dropin-pagination-container {
  visibility: hidden !important;
}
```

---

## Loading States

Loading states are coordinated across all containers during filter changes and searches.

### Product Grid

| State | Visual Treatment |
|-------|------------------|
| Validating | Grid fades to 35% opacity, centered 48px spinner overlay |
| Clearing | Same as validating (triggered by Clear All) |

### Facets Sidebar

| State | Visual Treatment |
|-------|------------------|
| Validating | Each facet section fades to 50% opacity, per-section 20px spinner centered |
| Clearing | Same as validating |

The per-section spinners ensure at least one spinner is always visible regardless of scroll position (following citisignal pattern).

### CSS Classes

| Class | Applied To | Purpose |
|-------|------------|---------|
| `.validating` | Container elements | Triggers fade + spinner |
| `.clearing` | Container elements | Same as validating, used for Clear All |

States are managed via JavaScript:
- `search/loading` event → adds `.validating` class
- `onRenderComplete()` callback → removes classes after products finish rendering

---

## Known Issues & Workarounds

### Clear All Visual Blip

**Issue**: When clicking "Clear All", the dropin briefly re-renders facets with stale `selected: true` state before updating to the correct unchecked state. This causes checkboxes to visually "blip" (appear checked, then uncheck).

**Root Cause**: The Product Discovery dropin does not expose a `clearFilters()` API. Clearing filters requires calling `search()` with empty filters, but the dropin's internal state management causes a brief stale render during the transition.

**Workaround**: A `requestAnimationFrame` loop continuously unchecks any checked checkboxes while the `isClearingFilters` flag is true:

```javascript
// Set flag before search
isClearingFilters = true;

// RAF loop unchecks any boxes that get re-checked during dropin re-render
function uncheckLoop() {
  if (!isClearingFilters) return;
  const checked = container.querySelectorAll('input[type="checkbox"]:checked');
  checked.forEach(cb => { cb.checked = false; });
  requestAnimationFrame(uncheckLoop);
}
requestAnimationFrame(uncheckLoop);

// Flag reset in onRenderComplete() after products finish loading
```

### Price Range Checkboxes

**Issue**: The dropin renders price ranges as radio buttons by default, but BuildRight design requires checkboxes.

**Workaround**: The `FacetBucket` slot intercepts `RangeBucket` type and renders custom checkboxes that call `search()` directly with the price filter.

### Category Context Preservation (CRITICAL)

**The Problem**: When a user is viewing a category (e.g., "Structural Materials") and clicks a facet (e.g., "Brand: Cascade Timber"), the results should stay within that category. However, using the wrong filter attribute causes the category filter to be lost.

**The Solution**: Use `categoryPath`, NOT `categoryUrlKey`.

> **Critical Distinction**: The Adobe Product Discovery dropin specifically looks for `categoryPath` in the filter array. When it finds `categoryPath`, it **automatically preserves** this filter when users click on facets. The dropin does NOT recognize `categoryUrlKey` - it will be ignored during facet clicks.

**Why This Works**:

From Adobe's Facets container documentation:
> "If a `categoryPath` is provided in the search, facet selections will automatically include the categoryPath to ensure filters are relative to the current category."

**Implementation**:

```javascript
// CORRECT - Dropin preserves this when facets are clicked
const initialFilter = [{
  attribute: 'categoryPath',
  in: [categorySlug]
}];

// WRONG - Dropin ignores this, category lost on facet click
const initialFilter = [{
  attribute: 'categoryUrlKey',
  in: [categorySlug]
}];
```

**Mesh Transformation**: The mesh adapter (`dropin-search.js`) transforms `categoryPath` to ACO-native attributes:
- `categoryPath: "structural-materials"` → `category: "structural-materials"` (top-level)
- `categoryPath: "structural-materials/lumber"` → `subcategory: "lumber"` (nested path)

See `buildright-service/mesh/README.md` for mesh transformation details.

**Custom Filter Handlers**: When building custom facet handlers (e.g., for RangeBucket/price), you must **merge** user-selected filters with categoryPath, not replace:

```javascript
// CORRECT - Merge category with user filters
const categoryFilter = (baseParams.filter || []).filter(
  (f) => f.attribute === 'categoryPath',
);
const mergedFilters = [...categoryFilter, ...userSelectedFilters];
search({ filter: mergedFilters });

// WRONG - Overwrites category, losing context
search({ filter: userSelectedFilters });
```

ScalarBucket facets (brand, color) use native dropin behavior which handles this automatically. Custom handlers (like price checkboxes) must merge explicitly.

---

## CSS Strategy

### Namespacing

All custom slot content uses `.buildright-*` class prefix:

```css
/* Custom slot content - no !important needed */
.buildright-product-image { ... }
.buildright-price { ... }
.buildright-add-to-cart { ... }
```

### Overriding Dropin Containers

Adobe container styles require `!important` for overrides:

```css
/* Grid layout override */
.dropin-search-results-container [class*="productList"] {
  display: grid !important;
  grid-template-columns: repeat(4, 240px) !important;
  gap: 24px !important;
}
```

### CSS File Structure

```
blocks/product-list/
├── product-list.css          # Imports component files
└── css/
    ├── grid.css              # Grid layout overrides
    ├── product-card.css      # Card slot styling
    ├── facets.css            # Facets container styling
    ├── pagination.css        # Pagination styling
    └── loading-states.css    # Loading/error states
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `blocks/header/header.js` | Header block with SearchBarInput/SearchBarResults containers |
| `blocks/product-list/product-list.js` | Block logic, container rendering, slot config |
| `blocks/product-list/product-list.css` | CSS imports |
| `blocks/product-list/css/*.css` | Modular component CSS |
| `pages/catalog.html` | Catalog page using product-list block |
| `scripts/initializers/index.js` | Dropin initialization |
| `buildright-service/mesh/resolvers-src/dropin-search.js` | Query adapter |
| `buildright-service/mesh/resolvers-src/dropin-pdp.js` | PDP query adapter |

---

## Deprecated

The following have been superseded by the dropin approach:

| Location | What | Superseded By |
|----------|------|---------------|
| `blocks/_deprecated/product-grid/` | Custom PLP with direct ACO queries | `product-list` block |
| `blocks/_deprecated/filters-sidebar/` | Custom filter sidebar | Facets container |
| `pages/_deprecated/catalog-custom.html` | Custom catalog page | `catalog.html` |

---

## Related Documentation

- `buildright-service/mesh/README.md` - Mesh architecture and adapter pattern
- `blocks/CLAUDE.md` - Block inventory
- `docs/adr/ADR-008-*.md` - CSS refactoring decisions
