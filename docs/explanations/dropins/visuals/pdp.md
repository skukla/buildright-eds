# Product Detail Page (PDP) Dropin

**What it does**: Displays detailed product information, images, pricing, and add-to-cart functionality
**Page**: `/pages/product-detail.html?sku={SKU}`

---

## Container/Slot Architecture

The PDP uses a single container with 5 customizable slots:

```
+-------------------------------------------------------------+
| ProductDetails Container                                     |
| +----------------------------------------------------------+ |
| |                                                          | |
| | +-------------------------+  +-------------------------+ | |
| | | Image SLOT              |  | Title SLOT              | | |
| | | (buildright-pdp-        |  | (buildright-pdp-header) | | |
| | | image-wrapper)          |  |                         | | |
| | +-------------------------+  +-------------------------+ | |
| |                                                          | |
| | +-------------------------+  +-------------------------+ | |
| | | Sku SLOT                |  | Price SLOT              | | |
| | | (buildright-pdp-sku)    |  | (buildright-pdp-pricing)| | |
| | +-------------------------+  +-------------------------+ | |
| |                                                          | |
| | +------------------------------------------------------+ | |
| | | Actions SLOT                                         | | |
| | | (buildright-pdp-actions)                             | | |
| | | [Quantity Controls] [Add to Cart Button]             | | |
| | +------------------------------------------------------+ | |
| |                                                          | |
| +----------------------------------------------------------+ |
+-------------------------------------------------------------+
```

### Slot Customization Summary

| Slot | Adobe Default | BuildRight Override | CSS Class |
|------|---------------|---------------------|-----------|
| **Image** | `<img>` tag | Custom wrapper with fallback | `.buildright-pdp-image-wrapper` |
| **Title** | Plain text | H1 with header wrapper | `.buildright-pdp-header` |
| **Sku** | Plain text | Styled div | `.buildright-pdp-sku` |
| **Price** | Complex structure | Simplified currency display | `.buildright-pdp-pricing` |
| **Actions** | Add to cart form | Appended action container | `.buildright-pdp-actions` |

---

## Dropin vs. Custom HTML

The PDP page is a **hybrid** - part dropin, part custom HTML:

| Component | Implementation | Data Source |
|-----------|----------------|-------------|
| **Image, Title, SKU, Price, Actions** | `@dropins/storefront-pdp` dropin | Dropin fetches from ACO via mesh |
| **Product Gallery with thumbnails** | Custom HTML in page | JavaScript populates from product data |
| **Tabs (Description, Specs, etc.)** | Custom HTML `<button>` elements | JavaScript tab switching logic |
| **Description content** | Custom HTML `<p>` tag | `catalogService.getProduct()` |
| **Specifications table** | Custom HTML `<table>` | `catalogService.getProduct()` via mesh |
| **Availability/Inventory** | EDS Block (`inventory-status`) | `catalogService` |
| **Volume Pricing** | Custom HTML `<table>` | Auth context + pricing data |

**Why the hybrid approach?** The PDP dropin handles core commerce functionality (fetching product data, pricing, add-to-cart). The custom HTML adds BuildRight-specific features like the tabbed interface, specifications table with mesh-transformed attributes, and inventory display.

---

## Full Page Layout

```
+-----------------------------------------------------------------------------+
|                    /pages/product-detail.html?sku={SKU}                     |
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
|  || product-detail (EDS Block)                                          ||  |
|  || Uses: @dropins/storefront-pdp (DROPIN)                              ||  |
|  ||=====================================================================||  |
|  ||                                                                     ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||  | ProductDetails (CONTAINER)                                    |  ||  |
|  ||  | +---------------------------+-------------------------------+ |  ||  |
|  ||  | |                           |                               | |  ||  |
|  ||  | |  +---------------------+  |  +-------------------------+  | |  ||  |
|  ||  | |  | Image SLOT          |  |  | Title SLOT              |  | |  ||  |
|  ||  | |  | (55% width)         |  |  | <h1>Product Name</h1>   |  | |  ||  |
|  ||  | |  |                     |  |  +-------------------------+  | |  ||  |
|  ||  | |  |   [Product Image]   |  |                               | |  ||  |
|  ||  | |  |                     |  |  +-------------------------+  | |  ||  |
|  ||  | |  |                     |  |  | Sku SLOT                |  | |  ||  |
|  ||  | |  |                     |  |  | SKU: ABC-123            |  | |  ||  |
|  ||  | |  +---------------------+  |  +-------------------------+  | |  ||  |
|  ||  | |                           |                               | |  ||  |
|  ||  | |  [T1] [T2] [T3] [T4]     |  +-------------------------+   | |  ||  |
|  ||  | |  (Thumbnails)            |  | Price SLOT              |   | |  ||  |
|  ||  | |                           |  | $149.99                 |  | |  ||  |
|  ||  | |                           |  +-------------------------+  | |  ||  |
|  ||  | |                           |                               | |  ||  |
|  ||  | |                           |  +-------------------------+  | |  ||  |
|  ||  | |                           |  | Actions SLOT            |  | |  ||  |
|  ||  | |                           |  | Qty: [-] 1 [+]          |  | |  ||  |
|  ||  | |                           |  | [Add to Cart]           |  | |  ||  |
|  ||  | |                           |  +-------------------------+  | |  ||  |
|  ||  | +---------------------------+-------------------------------+ |  ||  |
|  ||  +---------------------------------------------------------------+  ||  |
|  ||                                                                     ||  |
|  +=======================================================================+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | Product Tabs (Custom HTML - NOT a dropin or EDS block)                |  |
|  | These are plain HTML <button> elements with JS tab switching logic    |  |
|  | [Description] [Specifications] [Availability] [Volume Pricing]        |  |
|  |                                                                       |  |
|  | Tab Panels:                                                           |  |
|  | - Description: Product description text (from catalogService)         |  |
|  | - Specifications: Attribute table (from mesh via catalogService)      |  |
|  | - Availability: Inventory status (from inventory-status block)        |  |
|  | - Volume Pricing: Tier pricing table (visible for logged-in users)    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
|  +-----------------------------------------------------------------------+  |
|  | footer (EDS Block)                                                    |  |
|  +-----------------------------------------------------------------------+  |
|                                                                             |
+-----------------------------------------------------------------------------+
```

---

## Page Layout Detail

The product detail page uses a cookware-inspired layout with image on the left and product info on the right:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          PRODUCT DETAIL PAGE                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ HEADER                                                              │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ BREADCRUMBS: Home > All Products > Product Name                     │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                             │
│  ┌───────────────────────────────────┬─────────────────────────────────┐    │
│  │                                   │                                 │    │
│  │                                   │  PRODUCT NAME                   │    │
│  │        ┌─────────────────┐        │  SKU: ABC-123                   │    │
│  │        │                 │        │                                 │    │
│  │        │                 │        │  ┌─────────────────────────┐    │    │
│  │        │   MAIN IMAGE    │        │  │ $149.99    [Pro Tier]   │    │    │
│  │        │                 │        │  └─────────────────────────┘    │    │
│  │        │     (55%)       │        │                                 │    │
│  │        │                 │        │  Qty: [ - ]  1  [ + ]           │    │
│  │        │                 │        │                                 │    │
│  │        └─────────────────┘        │  [ Add to Cart ]                │    │
│  │                                   │                                 │    │
│  │   ┌────┐ ┌────┐ ┌────┐ ┌────┐     │  ─────────────────────────      │    │
│  │   │ T1 │ │ T2 │ │ T3 │ │ T4 │     │                                 │    │
│  │   └────┘ └────┘ └────┘ └────┘     │  PRODUCT SIDEBAR (45%)          │    │
│  │   (Thumbnails)                    │                                 │    │
│  │                                   │                                 │    │
│  └───────────────────────────────────┴─────────────────────────────────┘    │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │ TABS: [Description] [Specifications] [Availability] [Volume Pricing]│    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │                                                                     │    │
│  │  TAB CONTENT                                                        │    │
│  │                                                                     │    │
│  │  Description tab: Full product description text                     │    │
│  │  Specifications tab: Attribute table (Brand, Quality Tier, etc.)    │    │
│  │  Availability tab: Stock status and inventory information           │    │
│  │  Volume Pricing tab: Tier pricing for bulk purchases                │    │
│  │                                                                     │    │
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

### 1. Product Image Gallery

| Element | Description |
|---------|-------------|
| **Main image** | Large product photo (55% of layout width) |
| **Thumbnails** | Smaller images below main image for alternate views |
| **Zoom button** | Opens lightbox for full-size image viewing |
| **Lightbox** | Full-screen overlay for detailed image inspection |

### 2. Product Sidebar

The right side (45%) contains the purchase information:

| Element | Description |
|---------|-------------|
| **Product name** | Full product title (H1) |
| **SKU** | Product identifier |
| **Price** | Current price (persona-specific) |
| **Tier badge** | Quality tier indicator (Pro, Contractor, DIY) |
| **Quantity controls** | +/- buttons to adjust quantity |
| **Add to Cart button** | Primary action to add item to cart |

### 3. Product Tabs

Detailed information organized into tabs:

| Tab | Content |
|-----|---------|
| **Description** | Full product description with features and benefits |
| **Specifications** | Attribute table with labels and values (Brand, Quality Tier, Material, etc.) |
| **Availability** | Stock status and inventory information |
| **Volume Pricing** | Tier pricing for bulk purchases (visible to logged-in users) |

---

## Data Flow

```
Customer clicks product in catalog
         │
         ▼
URL navigates to /pages/product-detail.html?sku=ABC-123
         │
         ▼
PDP dropin extracts SKU from URL parameters
         │
         ▼
Dropin sends GraphQL query through API Mesh
         │
         ▼
Mesh adapter (dropin-pdp.js) routes to ACO
         │
         ▼
Adobe Commerce Optimizer returns product data
(with persona-specific pricing)
         │
         ▼
Dropin renders product using BuildRight slots
         │
         ▼
Page displays with custom BuildRight styling
```

---

## BuildRight Customizations

What we've customized from the standard Adobe dropin:

| Slot | Customization |
|------|---------------|
| **Image** | BuildRight wrapper with custom styling, placeholder fallback |
| **Title** | H1 with `.buildright-pdp-name` styling |
| **Sku** | Styled SKU display with `.buildright-pdp-sku` class |
| **Price** | Custom price formatting, handles multiple price structures |
| **Actions** | BuildRight-styled action container |

### Container Configuration

```javascript
render.render(ProductDetails, {
  sku,                        // From URL parameter
  hideSku: false,             // Show SKU
  hideQuantity: false,        // Show quantity controls
  hideShortDescription: true, // Hide short description (shown in tabs)
  slots: { ... }              // BuildRight slot customizations
})
```

---

## Error States

### Missing SKU

When no SKU is provided in the URL:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    ⚠️ Product Not Found                       │
│                                                               │
│              No product SKU specified.                        │
│                                                               │
│                  [ Browse Catalog ]                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Product Load Error

When the product fails to load:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│                    ❌ Unable to Load Product                  │
│                                                               │
│         Please try again or browse our catalog.               │
│                                                               │
│                  [ Browse Catalog ]                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

### Dropins Not Enabled

When Commerce Dropins are disabled in config:

```
┌───────────────────────────────────────────────────────────────┐
│                                                               │
│               ⚠️ Commerce Dropins Not Enabled                 │
│                                                               │
│     Please enable Commerce Dropins to view product details.   │
│                                                               │
│                  [ Browse Catalog ]                           │
│                                                               │
└───────────────────────────────────────────────────────────────┘
```

---

## Loading States

| State | What Customer Sees |
|-------|-------------------|
| **Initial load** | Centered spinner with loading overlay |
| **Image loading** | Placeholder until image loads |
| **Price loading** | "$0.00" placeholder, then actual price |

---

## Persona-Aware Pricing

The PDP displays different prices based on the logged-in user's persona:

| Persona | Price Display |
|---------|---------------|
| **Guest** | Retail (US-Retail) price book |
| **Sarah Martinez** | Volume pricing with tier discounts |
| **Marcus Johnson** | Contractor pricing |
| **David Thompson** | DIY/Homeowner pricing |

---

## Add to Cart Flow

```
Customer sets quantity and clicks "Add to Cart"
         │
         ▼
Cart dropin sends addToCart mutation
         │
         ▼
API Mesh routes to Adobe Commerce (Magento)
         │
         ▼
Commerce adds item to cart
         │
         ▼
cart/updated event fires
         │
         ▼
Mini-cart in header updates with new item count
```

---

## Navigation

| From | To | How |
|------|-----|-----|
| Catalog page | PDP | Click product card |
| PDP | Catalog | Click "All Products" in breadcrumbs |
| PDP | Cart | Click cart icon in header after adding |
| PDP | Checkout | Via cart page |

---

## Related Pages

- [Product Discovery](./product-discovery.md) - Catalog page where customers browse products
- [Cart](./cart.md) - What happens after "Add to Cart"
- [Checkout](./checkout.md) - Purchase flow
