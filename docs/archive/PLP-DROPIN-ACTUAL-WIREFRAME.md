# Actual BuildRight CLP: Dropin Integration Wireframe

## Based on Real Implementation Analysis

This wireframe is based on the **actual** BuildRight catalog page structure found in:
- `pages/catalog.html`
- `blocks/product-grid/product-grid.js`
- `blocks/filters-sidebar/filters-sidebar.js`
- `blocks/product-tile/product-tile.js`
- `styles/page-specific.css`

---

## Current BuildRight CLP Structure (As-Built)

### HTML Structure (catalog.html)
```html
<!DOCTYPE html>
<html>
<head>
  <!-- Import maps for dropins -->
  <script type="importmap">
    "@dropins/storefront-product-discovery": "..."
  </script>
</head>
<body class="page-catalog">
  
  <!-- 🔵 HEADER BLOCK (Custom - Unchanged) -->
  <header></header>
  
  <main>
    <!-- 🔵 BREADCRUMBS (Custom - Enhanced with dropin data) -->
    <div class="breadcrumbs">
      <div><a href="../index.html">Home</a></div>
      <div id="breadcrumb-category">All Products</div>
    </div>
    
    <section class="section section-compact">
      <div class="container">
        
        <!-- 🔵 CATEGORY TITLE (Custom - Enhanced with dropin data) -->
        <h1 id="catalog-title">All Products</h1>
        
        <!-- CATALOG LAYOUT GRID (280px sidebar + 1fr content) -->
        <div class="catalog-layout" id="catalog-layout">
          
          <!-- 🟠 LOADING OVERLAY (Custom - Could use dropin LoadingState) -->
          <div class="catalog-loading-overlay" id="catalog-loading">
            <div class="loading-spinner"></div>
            <p>Loading catalog...</p>
          </div>
          
          <!-- 🟡 SEARCH & SORT CONTROLS (grid-column: 1 / -1; spans full width) -->
          <div class="catalog-controls-wrapper">
            <div class="catalog-controls">
              <!-- 🟡 SEARCH (Custom OR dropin SearchBar container) -->
              <div class="catalog-search">
                <svg class="search-icon">...</svg>
                <input type="search" id="catalog-search-input" 
                       placeholder="Search products...">
                <button class="search-clear">×</button>
              </div>
              
              <!-- 🟡 SORT (Custom OR dropin SortBy container) -->
              <div class="catalog-sort">
                <label>Sort by:</label>
                <select id="catalog-sort-select">
                  <option value="relevance">Best Match</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
          
          <!-- 🟢 FILTERS SIDEBAR (Dropin Facets container) -->
          <aside id="filters-aside">
            <div class="filters-sidebar" 
                 data-block-name="filters-sidebar">
              <div><div>
                
                <!-- STATIC HEADER (Keep custom) -->
                <div class="filters-header">
                  <h3>Refine Results</h3>
                  <button class="clear-filters">Clear All</button>
                </div>
                
                <!-- 🟢 DYNAMIC FACETS (Dropin renders here) -->
                <div class="dynamic-facets-container">
                  <!-- Current: Custom JS renders facets -->
                  <!-- Future: Dropin Facets.render() with slots -->
                </div>
                
              </div></div>
            </div>
          </aside>
          
          <!-- 🟢 PRODUCT GRID (Dropin ProductList container) -->
          <div id="product-grid-wrapper">
            <div class="product-grid" 
                 data-block-name="product-grid">
              <div><div>
                
                <!-- GRID HEADER (Keep custom) -->
                <div class="grid-header">
                  <div class="grid-header-controls">
                    <button id="mobile-filter-toggle">Filters</button>
                  </div>
                  <div class="product-count">0 products</div>
                </div>
                
                <!-- 🟢 PRODUCTS CONTAINER (Dropin renders here) -->
                <div class="products-container">
                  <!-- Current: Custom JS renders product tiles -->
                  <!-- Future: Dropin ProductList.render() with ProductCard slot -->
                </div>
                
              </div></div>
            </div>
          </div>
          
        </div><!-- /.catalog-layout -->
      </div><!-- /.container -->
    </section>
  </main>
  
  <!-- 🔵 FOOTER BLOCK (Custom - Unchanged) -->
  <footer></footer>
  
</body>
</html>
```

---

## Visual Wireframe with Annotations

```
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔵 HEADER BLOCK                                                          │
│ blocks/header/header.js (CUSTOM - UNCHANGED)                             │
│ • Logo, navigation, cart, account                                        │
│ • BuildRight branding                                                    │
└──────────────────────────────────────────────────────────────────────────┘
     ↓ body.page-catalog
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔵 BREADCRUMBS                                                           │
│ <div class="breadcrumbs"> (CUSTOM - ENHANCED)                           │
│ • Home > [Category Name]                                                 │
│ • Gets category name from: result.categoryMetadata.name                 │
│ • ✨ NEW: Use categoryMetadata.breadcrumbs for hierarchy                │
└──────────────────────────────────────────────────────────────────────────┘
     ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔵 CATEGORY TITLE                                                        │
│ <h1 id="catalog-title"> (CUSTOM - ENHANCED)                             │
│ • Currently: "All Products" or hardcoded category names                 │
│ • ✨ NEW: Dynamic from result.categoryMetadata.name                     │
└──────────────────────────────────────────────────────────────────────────┘
     ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 🟠 LOADING OVERLAY (position: absolute over catalog-layout)             │
│ <div class="catalog-loading-overlay"> (CUSTOM - Could use dropin)       │
│ • Shows during initial load                                             │
│ • Option: Use dropin's built-in loading state instead                   │
└──────────────────────────────────────────────────────────────────────────┘
     ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ .catalog-layout { display: grid; grid-template-columns: 280px 1fr; }    │
│ ┌────────────────────────────────────────────────────────────────────┐ │
│ │ 🟡 SEARCH & SORT BAR (grid-column: 1 / -1; spans both columns)    │ │
│ │ .catalog-controls-wrapper > .catalog-controls                      │ │
│ │ ┌────────────────────────────┬──────────────────────────────────┐ │ │
│ │ │ 🟡 SEARCH INPUT            │ 🟡 SORT DROPDOWN                 │ │ │
│ │ │ OPTION A: Keep custom      │ OPTION A: Keep custom            │ │ │
│ │ │ OPTION B: SearchBar dropin │ OPTION B: SortBy dropin          │ │ │
│ │ │ + Custom slot              │ + Custom slot                    │ │ │
│ │ └────────────────────────────┴──────────────────────────────────┘ │ │
│ └────────────────────────────────────────────────────────────────────┘ │
│                                                                          │
│ ┌──────────────────────┬───────────────────────────────────────────────┐│
│ │ 🟢 FILTERS SIDEBAR   │ 🟢 PRODUCT GRID                              ││
│ │ (280px wide)         │ (1fr - fills remaining space)                ││
│ │                      │                                              ││
│ │ #filters-aside       │ #product-grid-wrapper                        ││
│ │                      │                                              ││
│ │ ┌──────────────────┐ │ ┌──────────────────────────────────────────┐││
│ │ │ 🔵 CUSTOM HEADER │ │ │ 🔵 CUSTOM HEADER                         │││
│ │ │ .filters-header  │ │ │ .grid-header                             │││
│ │ │ ┌──────────────┐ │ │ │ ┌──────────────┬─────────────────────┐ │││
│ │ │ │ Refine       │ │ │ │ │ [Filters]    │ 48 products         │ │││
│ │ │ │ Results      │ │ │ │ │ mobile btn   │ .product-count      │ │││
│ │ │ └──────────────┘ │ │ │ └──────────────┴─────────────────────┘ │││
│ │ │ [Clear All]      │ │ └──────────────────────────────────────────┘││
│ │ └──────────────────┘ │                                              ││
│ │                      │ ┌──────────────────────────────────────────┐││
│ │ ┌──────────────────┐ │ │ 🟢 PRODUCTS CONTAINER                    │││
│ │ │ 🟢 DYNAMIC       │ │ │ .products-container                      │││
│ │ │    FACETS        │ │ │ { display: grid;                         │││
│ │ │                  │ │ │   grid-template-columns:                 │││
│ │ │ .dynamic-facets- │ │ │   repeat(auto-fill, minmax(240px, 1fr)); │││
│ │ │  container       │ │ │   gap: var(--spacing-large); }           │││
│ │ │                  │ │ │                                          │││
│ │ │ 🟢 Facets.render │ │ │ 🟢 ProductList.render({ selector })      │││
│ │ │  ({ selector,   │ │ │    with ProductCard slot:                │││
│ │ │     slots: {    │ │ │                                          │││
│ │ │       FacetGrp, │ │ │ ┌───────┬───────┬───────┬───────┐       │││
│ │ │       FacetOpt  │ │ │ │ TILE  │ TILE  │ TILE  │ TILE  │       │││
│ │ │     }           │ │ │ │ [IMG] │ [IMG] │ [IMG] │ [IMG] │       │││
│ │ │  })             │ │ │ │ GOLD★ │ SILV★ │       │       │       │││
│ │ │                  │ │ │ │ SKU   │ SKU   │ SKU   │ SKU   │       │││
│ │ │ ▼ Manufacturer  │ │ │ │ Name  │ Name  │ Name  │ Name  │       │││
│ │ │   □ Pacific(15) │ │ │ │ Mfg   │ Mfg   │ Mfg   │ Mfg   │       │││
│ │ │   □ Cascade(12) │ │ │ │ Grade │ Grade │ Grade │ Grade │       │││
│ │ │                  │ │ │ │ $8.99 │ $12   │ $15   │ $45   │       │││
│ │ │ ▼ Grade         │ │ │ │ [Cart]│ [Cart]│ [Cart]│ [Cart]│       │││
│ │ │   □ A (20)      │ │ │ ├───────┼───────┼───────┼───────┤       │││
│ │ │   □ B (10)      │ │ │ │ TILE  │ TILE  │ TILE  │ TILE  │       │││
│ │ │                  │ │ │ │ ...   │ ...   │ ...   │ ...   │       │││
│ │ │ ▼ Price Range   │ │ │ └───────┴───────┴───────┴───────┘       │││
│ │ │   [====|====]   │ │ │                                          │││
│ │ │   $0      $100  │ │ │ [🔄 Infinite Scroll - Loads More]        │││
│ │ │                  │ │ │                                          │││
│ │ └──────────────────┘ │ └──────────────────────────────────────────┘││
│ └──────────────────────┴───────────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────────────────────┘
     ↓
┌──────────────────────────────────────────────────────────────────────────┐
│ 🔵 FOOTER BLOCK                                                          │
│ blocks/footer/footer.js (CUSTOM - UNCHANGED)                             │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## Component-by-Component Breakdown

### 1. Breadcrumbs
```
CURRENT STATUS: Custom HTML
┌─────────────────────────────────────────┐
│ <div class="breadcrumbs">               │
│   <div><div>                            │
│     <div><a href="...">Home</a></div>   │
│   </div></div>                          │
│   <div><div>                            │
│     <div id="breadcrumb-category">      │
│       All Products                      │
│     </div>                              │
│   </div></div>                          │
│ </div>                                  │
└─────────────────────────────────────────┘

RECOMMENDATION: 🔵 Keep Custom, Enhance with Dropin Data
┌─────────────────────────────────────────┐
│ JavaScript updates:                     │
│                                         │
│ const result = await search({...});    │
│ const breadcrumbs =                     │
│   result.categoryMetadata.breadcrumbs; │
│                                         │
│ // breadcrumbs = [                     │
│ //   { name: "Home", urlKey: "" },     │
│ //   { name: "Structural Materials",   │
│ //     urlKey: "structural-materials" },│
│ //   { name: "Lumber",                 │
│ //     urlKey: "structural.../lumber" }│
│ // ]                                    │
│                                         │
│ renderBreadcrumbs(breadcrumbs);         │
└─────────────────────────────────────────┘

WHY: Custom HTML already styled, just needs data
```

---

### 2. Category Title
```
CURRENT STATUS: Hardcoded or manual mapping
┌─────────────────────────────────────────┐
│ <h1 id="catalog-title">All Products</h1>│
│                                         │
│ // Manual mapping in catalog.html:     │
│ const categoryNames = {                 │
│   'structural_materials':               │
│     'Structural Materials',             │
│   'windows_doors': 'Windows & Doors'    │
│   // ...                                │
│ };                                      │
└─────────────────────────────────────────┘

RECOMMENDATION: 🔵 Keep Custom HTML, Use Dropin Data
┌─────────────────────────────────────────┐
│ const result = await search({...});    │
│                                         │
│ // Use dropin's category metadata:     │
│ document.getElementById('catalog-title')│
│   .textContent =                        │
│     result.categoryMetadata.name ||     │
│     'All Products';                     │
│                                         │
│ // Also available:                      │
│ // - result.categoryMetadata.description│
│ // - result.categoryMetadata.image      │
└─────────────────────────────────────────┘

WHY: Eliminates hardcoded mapping, uses ACO data
```

---

### 3. Search & Sort Controls
```
CURRENT STATUS: Custom HTML + Custom JS
┌───────────────────────────────────────────────────────┐
│ .catalog-controls-wrapper                             │
│   (grid-column: 1 / -1; spans full width)             │
│                                                       │
│ ┌────────────────────────┬────────────────────────┐  │
│ │ .catalog-search        │ .catalog-sort          │  │
│ │ ┌──────────────────┐   │ ┌──────────────────┐  │  │
│ │ │ [🔍] [input]  [×]│   │ │ Sort by: [select]│  │  │
│ │ └──────────────────┘   │ └──────────────────┘  │  │
│ └────────────────────────┴────────────────────────┘  │
│                                                       │
│ // Custom event handling:                            │
│ searchInput.addEventListener('input', (e) => {        │
│   window.dispatchEvent(new CustomEvent(              │
│     'catalogSearch',                                  │
│     { detail: { searchTerm: e.target.value } }        │
│   ));                                                 │
│ });                                                   │
└───────────────────────────────────────────────────────┘

OPTION A: 🟡 Keep Custom (Simplest for demo)
┌───────────────────────────────────────────────────────┐
│ Keep existing HTML + JS                               │
│ Just call dropin search() API when values change:     │
│                                                       │
│ searchInput.addEventListener('input', async (e) => {  │
│   const results = await search({                      │
│     variables: {                                      │
│       phrase: e.target.value,                         │
│       filter: currentFilters                          │
│     }                                                 │
│   });                                                 │
│   // ProductList dropin automatically updates         │
│ });                                                   │
└───────────────────────────────────────────────────────┘

OPTION B: 🟢 Use Dropin Containers (More integrated)
┌───────────────────────────────────────────────────────┐
│ import { SearchBar, SortBy }                          │
│   from '@dropins/storefront-product-discovery';       │
│                                                       │
│ SearchBar.render({                                    │
│   selector: '.catalog-search',                        │
│   slots: {                                            │
│     SearchInput: (ctx) => `                           │
│       <svg>...</svg>                                  │
│       <input type="search"                            │
│              placeholder="Search..."                  │
│              value="${ctx.searchTerm}">               │
│       <button class="search-clear">×</button>         │
│     `                                                 │
│   }                                                   │
│ });                                                   │
│                                                       │
│ SortBy.render({                                       │
│   selector: '.catalog-sort',                          │
│   slots: {                                            │
│     SortDropdown: (ctx) => `                          │
│       <label>Sort by:</label>                         │
│       <select>                                        │
│         <option value="relevance">Best Match</option> │
│         <option value="price_ASC">Price: Low to High</option>│
│       </select>                                       │
│     `                                                 │
│   }                                                   │
│ });                                                   │
│                                                       │
│ // Dropin handles state synchronization automatically │
└───────────────────────────────────────────────────────┘

RECOMMENDATION FOR DEMO: Option A (Keep Custom)
- Faster to implement
- Less to explain in demo
- Focus demo on ProductList + Facets (the main value)
```

---

### 4. Filters Sidebar
```
CURRENT STATUS: Custom Block + Custom JS
┌──────────────────────────────────────────────────────┐
│ blocks/filters-sidebar/filters-sidebar.js (300 lines)│
│                                                      │
│ <aside id="filters-aside">                          │
│   <div class="filters-sidebar">                     │
│     <div><div>                                      │
│                                                      │
│       <!-- STATIC HEADER (keep custom) -->          │
│       <div class="filters-header">                  │
│         <h3>Refine Results</h3>                     │
│         <button class="clear-filters">Clear All</button>│
│       </div>                                        │
│                                                      │
│       <!-- DYNAMIC FACETS (replace with dropin) --> │
│       <div class="dynamic-facets-container">        │
│         <!-- Currently: Custom JS renders:          │
│              renderFacets(facets) {                 │
│                return facets.map(facet => `         │
│                  <div class="filter-section">       │
│                    <button class="filter-toggle">   │
│                      ${facet.title}                 │
│                    </button>                        │
│                    <div class="filter-content">     │
│                      ${renderFacetOptions(facet)}   │
│                    </div>                           │
│                  </div>                             │
│                `).join('');                         │
│              }                                      │
│         -->                                         │
│       </div>                                        │
│                                                      │
│     </div></div>                                    │
│   </div>                                            │
│ </aside>                                            │
└──────────────────────────────────────────────────────┘

RECOMMENDED APPROACH: 🟢 Dropin with Custom Slots
┌──────────────────────────────────────────────────────┐
│ import { Facets }                                    │
│   from '@dropins/storefront-product-discovery';      │
│                                                      │
│ // Keep static header, replace dynamic facets:      │
│ Facets.render({                                      │
│   selector: '.dynamic-facets-container',             │
│                                                      │
│   slots: {                                           │
│     // Match BuildRight's filter-section structure  │
│     FacetGroup: (ctx) => {                           │
│       const { facet, isExpanded } = ctx;             │
│       return `                                       │
│         <div class="filter-section                   │
│                     filter-section--dynamic          │
│                     ${isValidating ?                 │
│                       'filter-section--validating' : ''}│
│              data-facet-key="${facet.key}">          │
│           <button class="filter-toggle"              │
│                   data-filter="${facet.key}"         │
│                   aria-expanded="${isExpanded}"      │
│                   aria-controls="filter-${facet.key}">│
│             <span class="filter-toggle-label">       │
│               ${facet.title}                         │
│             </span>                                  │
│             <svg class="filter-toggle-icon">...</svg>│
│           </button>                                  │
│           <div class="filter-content                 │
│                     ${isExpanded ? 'active' : ''}"   │
│                id="filter-${facet.key}">             │
│             ${renderFacetOptions(facet)}             │
│           </div>                                     │
│         </div>                                       │
│       `;                                             │
│     },                                               │
│                                                      │
│     // Match BuildRight's filter-option structure   │
│     FacetOption: (ctx) => {                          │
│       const { option, isSelected, facet } = ctx;     │
│       return `                                       │
│         <label class="filter-option                  │
│                ${isSelected ?                        │
│                  'filter-option--selected' : ''}">   │
│           <input type="checkbox"                     │
│                  name="${facet.key}"                 │
│                  value="${option.id}"                │
│                  ${isSelected ? 'checked' : ''}>     │
│           <span class="filter-option-checkbox"></span>│
│           <span class="filter-option-label">         │
│             ${option.name}                           │
│           </span>                                    │
│           <span class="filter-count">                │
│             (${option.count})                        │
│           </span>                                    │
│         </label>                                     │
│       `;                                             │
│     }                                                │
│   }                                                  │
│ });                                                  │
│                                                      │
│ // Keep "Clear All" button handler (custom)         │
│ document.querySelector('.clear-filters')             │
│   .addEventListener('click', () => {                 │
│     // Dropin provides clearFilters() API            │
│     Facets.clearAll();                               │
│   });                                                │
└──────────────────────────────────────────────────────┘

WHAT DROPIN HANDLES:
✅ Facet data from ACO (with counts)
✅ Checkbox state management
✅ URL synchronization
✅ Applied filters tracking
✅ Re-fetching when filters change
✅ Validating state (loading spinner during updates)

WHAT YOU PROVIDE:
🎨 Exact HTML structure via slots
🎨 BuildRight CSS classes
🎨 Custom expand/collapse animation
🎨 Custom "Clear All" button behavior

CSS STAYS THE SAME:
blocks/filters-sidebar/filters-sidebar.css (unchanged)
- All .filter-section, .filter-toggle, .filter-option styles work
```

---

### 5. Product Grid
```
CURRENT STATUS: Custom Block + Custom JS
┌──────────────────────────────────────────────────────┐
│ blocks/product-grid/product-grid.js (400+ lines)     │
│                                                      │
│ <div id="product-grid-wrapper">                     │
│   <div class="product-grid">                        │
│     <div><div>                                      │
│                                                      │
│       <!-- KEEP CUSTOM HEADER -->                   │
│       <div class="grid-header">                     │
│         <div class="grid-header-controls">          │
│           <button id="mobile-filter-toggle">        │
│             Filters                                 │
│           </button>                                 │
│         </div>                                      │
│         <div class="product-count">48 products</div>│
│       </div>                                        │
│                                                      │
│       <!-- REPLACE WITH DROPIN -->                  │
│       <div class="products-container">              │
│         <!-- Currently: Custom renderProducts()     │
│              - Manual product tile creation         │
│              - Manual loading states                │
│              - Manual empty states                  │
│              - Manual infinite scroll               │
│         -->                                         │
│       </div>                                        │
│                                                      │
│     </div></div>                                    │
│   </div>                                            │
│ </div>                                              │
└──────────────────────────────────────────────────────┘

RECOMMENDED APPROACH: 🟢 Dropin with Custom ProductCard Slot
┌──────────────────────────────────────────────────────┐
│ import { ProductList }                               │
│   from '@dropins/storefront-product-discovery';      │
│                                                      │
│ ProductList.render({                                 │
│   selector: '.products-container',                   │
│                                                      │
│   slots: {                                           │
│     // 🎨 CRITICAL: Custom ProductCard matches       │
│     //     BuildRight's product-tile structure       │
│     ProductCard: (ctx) => {                          │
│       const { product } = ctx;                       │
│                                                      │
│       // Extract BuildRight custom attributes        │
│       const tier = product.attributes?.find(         │
│         a => a.code === 'br_tier'                    │
│       )?.value;                                      │
│                                                      │
│       const manufacturer = product.attributes?.find( │
│         a => a.code === 'br_manufacturer'            │
│       )?.value;                                      │
│                                                      │
│       const grade = product.attributes?.find(        │
│         a => a.code === 'br_grade'                   │
│       )?.value;                                      │
│                                                      │
│       const inStock = product.inStock;               │
│                                                      │
│       // Return BuildRight's EXACT product-tile HTML │
│       return `                                       │
│         <div class="product-card"                    │
│              data-sku="${product.sku}">              │
│           <!-- IMAGE SECTION -->                     │
│           <div class="product-card-image">           │
│             <img src="${product.image?.url ||        │
│                         '/images/products/placeholder.png'}"│
│                  alt="${product.name}">              │
│                                                      │
│             <!-- INVENTORY STATUS (custom) -->       │
│             <div class="product-card-inventory       │
│                         ${getInventoryClass(inStock)}">│
│               ${getInventoryIcon(inStock)}           │
│               <span>${getInventoryText(inStock)}</span>│
│             </div>                                   │
│                                                      │
│             <!-- TIER BADGE (custom BuildRight) --> │
│             ${tier ? `                               │
│               <div class="tier-badge                 │
│                           tier-badge--${tier.toLowerCase()}">│
│                 <span class="tier-badge-icon">★</span>│
│                 <span class="tier-badge-label">      │
│                   ${tier.toUpperCase()}              │
│                 </span>                              │
│               </div>                                 │
│             ` : ''}                                  │
│           </div>                                     │
│                                                      │
│           <!-- CONTENT SECTION -->                   │
│           <div class="product-card-content">         │
│             <!-- SKU (custom BuildRight display) --> │
│             <p class="product-card-sku">             │
│               SKU: ${product.sku}                    │
│             </p>                                     │
│                                                      │
│             <!-- PRODUCT NAME -->                    │
│             <h4 class="product-card-title">          │
│               ${product.name}                        │
│             </h4>                                    │
│                                                      │
│             <!-- MANUFACTURER (custom) -->           │
│             ${manufacturer ? `                       │
│               <div class="product-card-manufacturer">│
│                 ${manufacturer}                      │
│               </div>                                 │
│             ` : ''}                                  │
│                                                      │
│             <!-- GRADE (custom BuildRight) -->       │
│             ${grade ? `                              │
│               <div class="product-card-grade">       │
│                 ${grade}                             │
│               </div>                                 │
│             ` : ''}                                  │
│                                                      │
│             <!-- PRICE (with tier pricing) -->       │
│             <div class="product-card-price">         │
│               ${renderPrice(product, tier)}          │
│             </div>                                   │
│                                                      │
│             <!-- ADD TO CART -->                     │
│             <button class="btn btn-primary           │
│                            add-to-cart-btn"          │
│                     data-sku="${product.sku}">       │
│               Add to Cart                            │
│             </button>                                │
│           </div>                                     │
│         </div>                                       │
│       `;                                             │
│     },                                               │
│                                                      │
│     // 🎨 Custom Empty State                        │
│     EmptyState: (ctx) => {                           │
│       return `                                       │
│         <div class="product-grid-empty">             │
│           <svg class="empty-icon">...</svg>          │
│           <h3>No products found</h3>                 │
│           <p>Try adjusting your filters</p>          │
│           <button class="btn btn-secondary"          │
│                   onclick="clearAllFilters()">       │
│             Clear All Filters                        │
│           </button>                                  │
│         </div>                                       │
│       `;                                             │
│     },                                               │
│                                                      │
│     // 🎨 Custom Loading State                      │
│     LoadingState: (ctx) => {                         │
│       return `                                       │
│         <div class="product-grid-loading">           │
│           <div class="loading-spinner"></div>        │
│           <p>Loading products...</p>                 │
│         </div>                                       │
│       `;                                             │
│     }                                                │
│   }                                                  │
│ });                                                  │
│                                                      │
│ // Keep product count update (custom)               │
│ // Dropin emits 'productsLoaded' event:             │
│ ProductList.on('productsLoaded', (data) => {         │
│   document.querySelector('.product-count')           │
│     .textContent = `${data.totalCount} products`;    │
│ });                                                  │
└──────────────────────────────────────────────────────┘

WHAT DROPIN HANDLES:
✅ Product data from ACO
✅ Grid layout (CSS grid)
✅ Infinite scroll logic
✅ Loading states
✅ Empty states
✅ Error handling
✅ URL state management
✅ Responsive breakpoints

WHAT YOU PROVIDE:
🎨 Exact product-tile HTML via ProductCard slot
🎨 BuildRight-specific elements (tier, manufacturer, grade)
🎨 Custom price rendering with tier discounts
🎨 Custom inventory status display
🎨 Add to cart button handling

CSS MOSTLY STAYS THE SAME:
blocks/product-grid/product-grid.css
- .products-container { display: grid; ... } ← Keep as-is
- .product-card { ... } ← Keep all styling
- .product-card-image { ... } ← Keep all styling
- .tier-badge { ... } ← Keep all styling
- All hover effects, transitions ← Keep as-is

MINIMAL CSS CHANGES NEEDED:
/* Only if dropin adds wrapper divs */
.products-container > * {
  /* Ensure direct children are grid items */
}
```

---

## Grid Layout CSS (KEEP AS-IS)

```css
/* styles/page-specific.css - NO CHANGES NEEDED */

.catalog-layout {
  display: grid;
  grid-template-columns: 280px 1fr;  /* Sidebar + Content */
  gap: 2rem;
  column-gap: 2rem;
  row-gap: 0;
  position: relative;
  min-height: 600px;
}

/* Controls span full width */
.catalog-controls-wrapper {
  grid-column: 1 / -1;
}

/* blocks/product-grid/product-grid.css - NO CHANGES NEEDED */

.products-container {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: var(--spacing-large);
  min-height: 800px;
  align-items: start;
}

@media (max-width: 1200px) {
  .products-container {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 768px) {
  .catalog-layout {
    grid-template-columns: 1fr;  /* Single column on mobile */
  }
  
  .products-container {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
}
```

---

## Summary: What Changes?

### 🔵 UNCHANGED (Keep Custom)
1. **Header** - blocks/header/header.js
2. **Footer** - blocks/footer/footer.js
3. **Breadcrumbs HTML** - Just enhanced with dropin data
4. **Category Title HTML** - Just enhanced with dropin data
5. **Search/Sort HTML** - Option to keep custom
6. **Grid Layout CSS** - .catalog-layout stays the same
7. **Product Card CSS** - blocks/product-grid/product-grid.css
8. **Filter CSS** - blocks/filters-sidebar/filters-sidebar.css
9. **Grid Header** - .grid-header with mobile filter toggle
10. **Filters Header** - .filters-header with "Clear All"

### 🟢 REPLACED WITH DROPIN (with slots)
1. **Dynamic Facets Container** (.dynamic-facets-container)
   - Replace: `blocks/filters-sidebar/filters-sidebar.js` renderFacets logic
   - With: `Facets.render()` + FacetGroup/FacetOption slots
   
2. **Products Container** (.products-container)
   - Replace: `blocks/product-grid/product-grid.js` renderProducts logic
   - With: `ProductList.render()` + ProductCard slot

### 🟡 OPTIONAL (Could go either way)
1. **Search Input** - Keep custom OR use SearchBar dropin + slot
2. **Sort Dropdown** - Keep custom OR use SortBy dropin + slot
3. **Loading Overlay** - Keep custom OR use dropin's LoadingState

---

## Code Reduction Estimate

### Current (Custom)
- `blocks/filters-sidebar/filters-sidebar.js`: 220 lines
- `blocks/product-grid/product-grid.js`: 400 lines
- `scripts/services/catalog-service.js`: 200 lines
- **Total: ~820 lines**

### After (Dropin + Slots)
- `scripts/dropins/catalog-dropin.js`: 200 lines
  - ProductCard slot render function: ~80 lines
  - FacetGroup slot render function: ~40 lines
  - FacetOption slot render function: ~20 lines
  - Helper functions (getInventoryClass, renderPrice, etc.): ~40 lines
  - Dropin initialization and setup: ~20 lines
- **Total: ~200 lines**

**Code reduction: 75%** (820 → 200 lines)

**Why?**
- ❌ No manual state management
- ❌ No manual loading states
- ❌ No manual empty states
- ❌ No manual error handling
- ❌ No manual infinite scroll
- ❌ No manual URL synchronization
- ❌ No manual facet expand/collapse
- ❌ No manual checkbox state tracking
- ✅ Just slot templates for HTML

---

## Implementation Priority for Demo

### Phase 1: Product Grid (Highest Impact)
```javascript
ProductList.render({
  selector: '.products-container',
  slots: {
    ProductCard: renderBuildRightProductCard
  }
});
```
**Demo value: Shows transformation from generic to custom**

### Phase 2: Facets (Show Filter Power)
```javascript
Facets.render({
  selector: '.dynamic-facets-container',
  slots: {
    FacetGroup: renderBuildRightFilterSection,
    FacetOption: renderBuildRightFilterOption
  }
});
```
**Demo value: Shows filter customization + counts**

### Phase 3: Breadcrumbs + Title (Show Data Integration)
```javascript
const result = await search({...});
updateBreadcrumbs(result.categoryMetadata.breadcrumbs);
updateTitle(result.categoryMetadata.name);
```
**Demo value: Shows ACO data integration**

---

**This wireframe is based on BuildRight's actual implementation and shows exactly where dropins integrate with minimal disruption to existing structure.**


