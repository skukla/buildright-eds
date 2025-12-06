# Catalog Search & Sort Feature

## Overview

Added in-category search and sort controls to the product catalog page, following best practices from major e-commerce sites (Amazon, Home Depot, etc.).

---

## Features Implemented

### 1. **In-Category Search**

**Location:** Between page title (H1) and catalog layout grid

**Functionality:**
- ✅ **Dynamic placeholder text** based on active category
  - Default: "Search products..."
  - Category filtered: "Search structural materials..."
  - Multiple categories: "Search selected categories..."
- ✅ **Debounced search** (300ms delay after user stops typing)
- ✅ **Clear button** appears when text is entered
- ✅ **Focus states** with brand color outline
- ✅ **Search icon** for visual clarity
- ✅ **Dispatches custom event** `catalogSearch` for integration with filter system

**Events Dispatched:**
```javascript
window.dispatchEvent(new CustomEvent('catalogSearch', {
  detail: { searchTerm: 'value' }
}));
```

---

### 2. **Sort Dropdown**

**Options:**
1. Best Match (relevance) - default
2. Price: Low to High
3. Price: High to Low
4. Name: A to Z
5. Name: Z to A

**Functionality:**
- ✅ **Dispatches custom event** `catalogSort` when changed
- ✅ **Consistent styling** with search input
- ✅ **Focus states** with brand color outline
- ✅ **Custom dropdown arrow** (SVG)

**Events Dispatched:**
```javascript
window.dispatchEvent(new CustomEvent('catalogSort', {
  detail: { sortBy: 'price-asc' }
}));
```

---

## Visual Design

### Desktop Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ Structural Materials                                        │  ← H1 (dynamic)
├─────────────────────────────────────────────────────────────┤
│ [🔍 Search structural materials...] [Clear]  Sort by: [▼]  │  ← Controls
└─────────────────────────────────────────────────────────────┘
│
├── Filters ──────┬── Products ───────────────────────────────┐
│  Categories     │  [Grid of product cards]                  │
│  Price          │                                            │
│  ...            │                                            │
└─────────────────┴────────────────────────────────────────────┘
```

### Mobile Layout:
```
┌──────────────────────────┐
│ Structural Materials     │  ← H1
├──────────────────────────┤
│ [🔍 Search...      [X]]  │  ← Search (full width)
├──────────────────────────┤
│ Sort by:    [Best Match] │  ← Sort (full width)
└──────────────────────────┘
│
│ [Products stacked]       │
└──────────────────────────┘
```

---

## Component Structure

### HTML Structure:
```html
<h1 id="catalog-title">All Products</h1>

<!-- Search and Sort Bar -->
<div class="catalog-controls">
  <div class="catalog-search">
    <svg class="search-icon">...</svg>
    <input 
      type="search" 
      id="catalog-search-input" 
      class="catalog-search-input" 
      placeholder="Search products..."
    />
    <button class="search-clear" id="search-clear">
      <svg>×</svg>
    </button>
  </div>
  
  <div class="catalog-sort">
    <label for="catalog-sort-select">Sort by:</label>
    <select id="catalog-sort-select">
      <option value="relevance">Best Match</option>
      <option value="price-asc">Price: Low to High</option>
      ...
    </select>
  </div>
</div>

<div class="catalog-layout">
  <!-- Filters sidebar and product grid -->
</div>
```

---

## CSS Classes

### Main Container:
- `.catalog-controls` - Flex container for search and sort

### Search Components:
- `.catalog-search` - Search input wrapper
- `.search-icon` - Magnifying glass icon (SVG)
- `.catalog-search-input` - Text input field
- `.search-clear` - Clear button (shows when text entered)

### Sort Components:
- `.catalog-sort` - Sort dropdown wrapper
- `.sort-label` - "Sort by:" label
- `.catalog-sort-select` - Dropdown select element

---

## Design Tokens Used

### Spacing:
- `--spacing-small` (8px) - Gap between label and select
- `--spacing-medium` (16px) - Gap between search and sort
- `--spacing-large` (24px) - Space below H1
- `--spacing-xlarge` (32px) - Space below controls

### Colors:
- `--color-background` (#FFFFFF) - Input backgrounds
- `--color-border` (#CBD5E1) - Input borders
- `--color-brand-500` (#0F5BA7) - Focus state
- `--color-text` (#1E293B) - Input text
- `--color-text-secondary` (#64748B) - Placeholders, icons

### Other:
- `--shape-border-radius-3` (8px) - Input/select border radius
- `--transition-fast` - Smooth transitions

---

## Integration Points

### Filter System Integration:
The search and sort controls dispatch custom events that should be listened to by the filter/product grid system:

```javascript
// Listen for search events
window.addEventListener('catalogSearch', (event) => {
  const searchTerm = event.detail.searchTerm;
  // Filter products by search term
});

// Listen for sort events
window.addEventListener('catalogSort', (event) => {
  const sortBy = event.detail.sortBy;
  // Sort products accordingly
});
```

### Dynamic Placeholder Updates:
The search placeholder automatically updates when:
1. Category filter is applied from sidebar
2. URL category changes (direct navigation)
3. "Clear All" filters is clicked

**Update Function:**
```javascript
const updateCatalogTitle = (selectedCategories = null) => {
  // Updates H1, breadcrumb, AND search placeholder
};
```

---

## User Experience Benefits

✅ **Scoped Search**: Search within current category context  
✅ **Progressive Refinement**: Category → Search → Filters  
✅ **Clear Feedback**: Visual indicators for active search  
✅ **Keyboard Friendly**: Clear button + focus states  
✅ **Mobile Optimized**: Stacked layout on small screens  
✅ **Consistent Patterns**: Matches e-commerce conventions  

---

## Files Modified

### HTML:
- `pages/catalog.html`
  - Added `.catalog-controls` section
  - Updated `updateCatalogTitle()` function
  - Added search and sort event handlers

### CSS:
- `styles/page-specific.css`
  - Added `.catalog-controls` styles
  - Added `.catalog-search` and `.catalog-sort` styles
  - Added responsive breakpoints for mobile

---

## Next Steps (Future Enhancement)

The following functionality should be implemented in the filter/product grid JavaScript:

1. **Search Logic**: Filter products by name, description, SKU
2. **Sort Logic**: Implement sorting algorithms for each sort option
3. **Combined Filtering**: Search + Filters + Sort working together
4. **Search Results Count**: Show "X results for 'query'" message
5. **No Results State**: Show helpful message when search returns no products
6. **Search History**: Optional - remember recent searches

---

## Accessibility

✅ `aria-label` on search input  
✅ `aria-label` on clear button  
✅ Proper label association for sort dropdown  
✅ Keyboard navigation support  
✅ Focus visible states  
✅ Semantic HTML (`<label>`, `<input type="search">`)  

---

## Browser Support

- ✅ Modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ CSS Grid and Flexbox
- ✅ SVG icons
- ✅ CSS custom properties
- ✅ `<input type="search">` with clear button

