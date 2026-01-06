# Product Discovery Dropin

**What it does**: Powers the catalog page - product browsing, filtering, sorting, and search
**Page**: `/catalog`

---

## Container/Slot Architecture

The Product Discovery dropin uses multiple containers, each with customizable slots:

### SearchResults Container

```
+-------------------------------------------------------------+
| SearchResults Container                                      |
| +----------------------------------------------------------+ |
| | ProductCard Slot (repeats for each product)               | |
| | +-------------------+  +--------------------------------+ | |
| | | ProductCardImage  |  | ProductCardPrice               | | |
| | | SLOT              |  | SLOT                           | | |
| | | (buildright-      |  | (buildright-price + tier       | | |
| | | product-image)    |  | badge)                         | | |
| | +-------------------+  +--------------------------------+ | |
| |                                                          | |
| | +-------------------+  +--------------------------------+ | |
| | | ProductCardName   |  | ProductCardActions             | | |
| | | SLOT              |  | SLOT                           | | |
| | | (buildright-      |  | (buildright-add-to-cart)       | | |
| | | product-name)     |  |                                | | |
| | +-------------------+  +--------------------------------+ | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Facets Container

```
+---------------------------+
| Facets Container          |
| +------------------------+ |
| | SelectedFacets SLOT    | |
| | (Clear All button)     | |
| +------------------------+ |
|                           |
| +------------------------+ |
| | FacetBucket SLOT       | |
| | +--------------------+ | |
| | | Category           | | |
| | | [ ] Option 1 (12)  | | |
| | | [ ] Option 2 (8)   | | |
| | +--------------------+ | |
| | +--------------------+ | |
| | | Brand              | | |
| | | [ ] DeWalt (15)    | | |
| | | [ ] Makita (10)    | | |
| | +--------------------+ | |
| +------------------------+ |
+---------------------------+
```

### Slot Customization Summary

| Container | Slot | Adobe Default | BuildRight Override | CSS Class |
|-----------|------|---------------|---------------------|-----------|
| **SearchResults** | ProductCardImage | `<img>` tag | Background image div | `.buildright-product-image` |
| **SearchResults** | ProductCardName | Plain text | SKU + Name layout | `.buildright-product-name` |
| **SearchResults** | ProductCardPrice | Complex price | Simplified + savings | `.buildright-product-price` |
| **SearchResults** | ProductCardActions | Add to cart | View Details button | `.buildright-add-to-cart` |
| **Facets** | SelectedFacets | Chips | Custom clear button | Native styling |
| **Facets** | FacetBucket | Checkboxes | Custom checkbox styling | Native styling |

---

## Full Page Layout

```
+-----------------------------------------------------------------------------+
|                           /catalog (catalog.html)                            |
+-----------------------------------------------------------------------------+
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | header (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | breadcrumbs (EDS Block)                                               |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +=======================================================================+  |
|  || product-list (EDS Block)                                            ||  |
|  || Uses: @dropins/storefront-product-discovery (DROPIN)                ||  |
|  ||=====================================================================||  |
|  ||                                                                     ||  |
|  ||  +-----------------------------+  +-----------------------------+   ||  |
|  ||  | SearchBarInput (CONTAINER)  |  | SortBy (CONTAINER)          |   ||  |
|  ||  +-----------------------------+  +-----------------------------+   ||  |
|  ||                                                                     ||  |
|  ||  +-----------------------+----------------------------------------+ ||  |
|  ||  |                       |                                        | ||  |
|  ||  |  Facets (CONTAINER)   |  SearchResults (CONTAINER)             | ||  |
|  ||  |                       |                                        | ||  |
|  ||  |  +------------------+ |  +----------------------------------+  | ||  |
|  ||  |  | SelectedFacets   | |  | ProductCard (repeats in grid)    |  | ||  |
|  ||  |  | SLOT             | |  | +------------------------------+ |  | ||  |
|  ||  |  +------------------+ |  | | ProductCardImage SLOT        | |  | ||  |
|  ||  |                       |  | | ProductCardName SLOT         | |  | ||  |
|  ||  |  +------------------+ |  | | ProductCardPrice SLOT        | |  | ||  |
|  ||  |  | FacetBucket SLOT | |  | | ProductCardActions SLOT      | |  | ||  |
|  ||  |  | [ ] Option 1 (12)| |  | +------------------------------+ |  | ||  |
|  ||  |  | [ ] Option 2 (8) | |  +----------------------------------+  | ||  |
|  ||  |  +------------------+ |                                        | ||  |
|  ||  |                       |                                        | ||  |
|  ||  +-----------------------+----------------------------------------+ ||  |
|  ||                                                                     ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||  | Pagination (CONTAINER)                                        |  ||  |
|  ||  |  < Prev   1   [2]   3   4   ...   10   Next >                |  ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||                                                                     ||  |
|  +=======================================================================+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | footer (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Page Layout Detail

The catalog page has four main areas, all powered by the Product Discovery dropin:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CATALOG PAGE                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER (with search bar)                                            │    │
│  │ [Logo]                    [🔍 Search products...]          [Cart]   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ BREADCRUMBS: Home > Categories > Power Tools                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌────────────────────────┬────────────────────────────────────────────┐    │
│  │                        │  SORT DROPDOWN                             │    │
│  │                        │  [Sort by: Price Low to High ▼]            │    │
│  │                        ├────────────────────────────────────────────┤    │
│  │  FILTER SIDEBAR        │                                            │    │
│  │                        │  PRODUCT GRID                              │    │
│  │  ☑ Selected Filters    │                                            │    │
│  │  [Clear All]           │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │    │
│  │                        │  │[IMG] │  │[IMG] │  │[IMG] │  │[IMG] │    │    │
│  │  ▼ Category            │  │Name  │  │Name  │  │Name  │  │Name  │    │    │
│  │  ▼ Brand               │  │$99   │  │$149  │  │$79   │  │$199  │    │    │
│  │  ▼ Price Range         │  │[Add] │  │[Add] │  │[Add] │  │[Add] │    │    │
│  │  ▼ Quality Tier        │  └──────┘  └──────┘  └──────┘  └──────┘    │    │
│  │                        │                                            │    │
│  │  Each filter section   │  ┌──────┐  ┌──────┐  ┌──────┐  ┌──────┐    │    │
│  │  expands to show       │  │[IMG] │  │[IMG] │  │[IMG] │  │[IMG] │    │    │
│  │  checkboxes            │  │Name  │  │Name  │  │Name  │  │Name  │    │    │
│  │                        │  │$129  │  │$89   │  │$159  │  │$109  │    │    │
│  │                        │  │[Add] │  │[Add] │  │[Add] │  │[Add] │    │    │
│  │                        │  └──────┘  └──────┘  └──────┘  └──────┘    │    │
│  └────────────────────────┴────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ PAGINATION                                                          │    │
│  │ ◄ Prev    1   [2]   3   4   ...   10    Next ►                      │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ FOOTER                                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Components Explained

### 1. Search Bar (in Header)

| Feature | Description |
|---------|-------------|
| **Search input** | Customer types product name or keyword |
| **Auto-suggestions** | Dropdown shows matching products as they type |
| **Quick results** | Click a suggestion to go directly to that product |

### 2. Filter Sidebar

Lets customers narrow down products by attributes:

| Filter Type | Example | How It Works |
|-------------|---------|--------------|
| **Category** | Power Tools, Hand Tools | Hierarchical - can drill into subcategories |
| **Brand** | DeWalt, Milwaukee, Makita | Multi-select checkboxes |
| **Price Range** | $0-$50, $50-$100, $100+ | Checkbox ranges (not a slider) |
| **Quality Tier** | Professional, Contractor, DIY | Based on product classification |

**Selected Filters**: Shows active filters with a "Clear All" button to reset.

### 3. Sort Dropdown

| Sort Option | Description |
|-------------|-------------|
| Name: A to Z | Alphabetical ascending |
| Name: Z to A | Alphabetical descending |
| Best Match | Relevance to search query |
| Price: Low to High | Cheapest first |
| Price: High to Low | Most expensive first |

### 4. Product Grid

Each product card displays:

| Element | Description |
|---------|-------------|
| **Image** | Product photo |
| **Name** | Product title |
| **Price** | Current price (persona-specific) |
| **Add to Cart** | Button to add item to cart |

The grid is responsive - shows 4 products per row on desktop, fewer on mobile.

### 5. Pagination

Standard page navigation: Previous, numbered pages, Next. Current page is highlighted.

---

## BuildRight Customizations

What we've customized from the standard Adobe dropin:

| Component | Customization |
|-----------|---------------|
| **Product cards** | BuildRight styling, price badge format, button colors |
| **Filter sidebar** | Brand color scheme, checkbox styling |
| **Pagination** | BuildRight blue for active page |
| **Loading states** | Branded spinner animation when filters are updating |

---

## How Filtering Works

When a customer clicks a filter:

```
1. Customer checks "DeWalt" brand filter
              │
              ▼
2. Page shows loading spinner (grid fades slightly)
              │
              ▼
3. System queries for products matching:
   - Current category (e.g., Power Tools)
   - Selected filters (e.g., Brand = DeWalt)
   - Current sort order
              │
              ▼
4. Grid updates with filtered products
   - Filter counts update (e.g., "Milwaukee (0)" if no matches)
   - Pagination updates for new result count
```

**Important**: When browsing a category, selecting filters keeps you within that category. Clicking "DeWalt" in Power Tools shows only DeWalt power tools, not all DeWalt products.

---

## Search Behavior

When a customer uses the search bar:

| Action | Result |
|--------|--------|
| Type "drill" | Suggestions dropdown appears with matching products |
| Click a suggestion | Goes directly to that product page |
| Press Enter | Goes to catalog page filtered by search term |
| Clear search | Returns to browsing all products |

---

## Loading States

Visual feedback when the page is updating:

| State | What Customer Sees |
|-------|-------------------|
| **Initial load** | Skeleton placeholders, then products appear |
| **Filtering** | Grid fades to 35% opacity with centered spinner |
| **Sorting** | Brief fade while results reorder |
| **Pagination** | Scroll to top, new page loads |

---

## Related Pages

- [Cart Dropin](./cart.md) - What happens after "Add to Cart"
- [Checkout Dropin](./checkout.md) - Purchase flow
